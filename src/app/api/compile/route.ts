import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import * as fs from "fs";
import { validateExecutionSecurity } from "@/core/sandbox/security";

// Detect local python executable
function getPythonCommand(): string {
  if (process.platform === "win32") {
    if (fs.existsSync("C:\\Python313\\python.exe")) return "C:\\Python313\\python.exe";
    if (fs.existsSync("C:\\Python312\\python.exe")) return "C:\\Python312\\python.exe";
    return "python";
  }
  return "python3";
}

const PYTHON_TRACER_SCRIPT = `import sys, json, io, os, builtins

user_code = sys.stdin.read()
lines = user_code.splitlines()

# Setup user stdin for input() calls
user_stdin = os.environ.get('USER_STDIN', '')
stdin_io = io.StringIO(user_stdin)
sys.stdin = stdin_io

steps = []
stdout_buf = io.StringIO()
old_stdout = sys.stdout
sys.stdout = stdout_buf

# Custom input function that mimics a real interactive terminal:
# Echoes prompt and typed input with newline into stdout
def terminal_input(prompt=''):
    if prompt:
        stdout_buf.write(str(prompt))
        stdout_buf.flush()
    line = stdin_io.readline()
    if not line:
        raise EOFError("EOF when reading a line")
    clean = line.rstrip('\\r\\n')
    stdout_buf.write(clean + '\\n')
    stdout_buf.flush()
    return clean

builtins.input = terminal_input

def trace_func(frame, event, arg):
    if event in ('line', 'return') and frame.f_code.co_filename == '<user_code>':
        lineno = frame.f_lineno
        if 1 <= lineno <= len(lines):
            clean_vars = {}
            for k, v in frame.f_locals.items():
                if not k.startswith('__') and not callable(v):
                    try:
                        json.dumps(v)
                        clean_vars[k] = v
                    except:
                        clean_vars[k] = str(v)
            stmt = lines[lineno - 1].strip()
            func_name = frame.f_code.co_name
            explanation = f"Executing line {lineno}: {stmt}"
            if func_name != '<module>':
                explanation = f"In {func_name}(): {stmt}"
            
            # Extract real call stack
            curr = frame
            stack = []
            while curr:
                if curr.f_code.co_filename == '<user_code>':
                    fn = curr.f_code.co_name
                    stack.append('main' if fn == '<module>' else f"{fn}()")
                curr = curr.f_back
            call_stack = list(reversed(stack))

            steps.append({
                'line': lineno,
                'statement': stmt,
                'func': func_name,
                'variables': clean_vars,
                'explanation': explanation,
                'callStack': call_stack,
                'output': [l for l in stdout_buf.getvalue().splitlines() if l]
            })
    return trace_func

sys.settrace(trace_func)
err_msg = None
needs_input = False
prompt_text = ""

try:
    compiled = compile(user_code, '<user_code>', 'exec')
    exec(compiled, {'__name__': '__main__'})
except EOFError:
    needs_input = True
    buf_val = stdout_buf.getvalue()
    lines_buf = buf_val.splitlines()
    prompt_text = lines_buf[-1] if lines_buf else buf_val
except Exception as e:
    err_msg = str(e)
finally:
    sys.settrace(None)
    sys.stdout = old_stdout

print(json.dumps({
    'steps': steps,
    'output': [l for l in stdout_buf.getvalue().splitlines() if l],
    'error': err_msg,
    'needsInput': needs_input,
    'prompt': prompt_text
}))
`;

function executePython(code: string, isVisualise: boolean, stdin?: string): Promise<{
  success: boolean;
  output: string[];
  error?: string;
  steps: unknown[];
  needsInput?: boolean;
  prompt?: string;
  executionTimeMs: number;
}> {
  return new Promise((resolve) => {
    const start = performance.now();
    const pyCmd = getPythonCommand();
    const MAX_OUTPUT_CHARS = 50_000;

    // Isolate environment to prevent exposing server env variables
    const safeEnv: NodeJS.ProcessEnv = {
      SYSTEMROOT: process.env.SYSTEMROOT || "C:\\Windows",
      PATH: process.env.PATH || "",
      TEMP: process.env.TEMP || "C:\\Temp",
      TMP: process.env.TMP || "C:\\Temp",
      USER_STDIN: stdin || "",
      PYTHONIOENCODING: "utf-8",
      PYTHONUNBUFFERED: "1",
      NODE_ENV: process.env.NODE_ENV || "production",
    };

    if (isVisualise) {
      const child = spawn(pyCmd, ["-c", PYTHON_TRACER_SCRIPT], {
        env: safeEnv,
      });
      let stdout = "";
      let stderr = "";

      const timeout = setTimeout(() => {
        child.kill();
        resolve({
          success: false,
          output: [],
          error: "Execution timed out (3.5s limit). Check for infinite loops or deep recursion.",
          steps: [],
          executionTimeMs: Math.round(performance.now() - start),
        });
      }, 3500);

      child.stdout.on("data", (d) => {
        if (stdout.length < MAX_OUTPUT_CHARS) stdout += d.toString();
      });
      child.stderr.on("data", (d) => {
        if (stderr.length < MAX_OUTPUT_CHARS) stderr += d.toString();
      });
      child.stdin.write(code);
      child.stdin.end();

      child.on("close", (exitCode) => {
        clearTimeout(timeout);
        const timeMs = Math.round(performance.now() - start);
        try {
          const parsed = JSON.parse(stdout);
          resolve({
            success: (exitCode === 0 || parsed.needsInput) && !parsed.error,
            output: parsed.output || [],
            error: parsed.error || (exitCode !== 0 && !parsed.needsInput ? stderr.trim() : undefined),
            steps: parsed.steps || [],
            needsInput: parsed.needsInput,
            prompt: parsed.prompt,
            executionTimeMs: timeMs,
          });
        } catch {
          const isEOF = stderr.includes("EOFError: EOF when reading a line") || stderr.includes("EOFError");
          const lines = (stdout + (isEOF ? "" : stderr)).split(/\r?\n/).filter((l) => l.trim().length > 0);
          resolve({
            success: exitCode === 0 || isEOF,
            output: lines,
            error: isEOF ? undefined : stderr.trim(),
            steps: [],
            needsInput: isEOF,
            prompt: stdout.trim(),
            executionTimeMs: timeMs,
          });
        }
      });
    } else {
      // Direct fast execution with stdin support & EOFError detection
      const prelude = `import sys, io, os, builtins
user_stdin = os.environ.get('USER_STDIN', '')
stdin_io = io.StringIO(user_stdin)
sys.stdin = stdin_io
def terminal_input(prompt=''):
    if prompt:
        sys.stdout.write(str(prompt))
        sys.stdout.flush()
    line = stdin_io.readline()
    if not line:
        raise EOFError("EOF when reading a line")
    clean = line.rstrip('\\r\\n')
    sys.stdout.write(clean + '\\n')
    sys.stdout.flush()
    return clean
builtins.input = terminal_input
`;
      const child = spawn(pyCmd, ["-c", prelude + code], {
        env: safeEnv,
      });
      let stdout = "";
      let stderr = "";

      const timeout = setTimeout(() => {
        child.kill();
        resolve({
          success: false,
          output: [],
          error: "Execution timed out (3.5s limit). Check for infinite loops or waiting inputs.",
          steps: [],
          executionTimeMs: Math.round(performance.now() - start),
        });
      }, 3500);

      child.stdout.on("data", (d) => {
        if (stdout.length < MAX_OUTPUT_CHARS) stdout += d.toString();
      });
      child.stderr.on("data", (d) => {
        if (stderr.length < MAX_OUTPUT_CHARS) stderr += d.toString();
      });

      if (stdin) {
        child.stdin.write(stdin);
      }
      child.stdin.end();

      child.on("close", (exitCode) => {
        clearTimeout(timeout);
        const timeMs = Math.round(performance.now() - start);

        // Check if program ended because it needs input (EOFError)
        const isEOF = stderr.includes("EOFError: EOF when reading a line") || stderr.includes("EOFError");
        const outLines = stdout.split(/\r?\n/).filter((l) => l.length > 0);

        if (isEOF) {
          // Program is asking for input! Not an error.
          resolve({
            success: true,
            output: outLines.length > 0 ? outLines : [stdout],
            needsInput: true,
            prompt: stdout.trim() || "Enter input:",
            steps: [],
            executionTimeMs: timeMs,
          });
        } else {
          resolve({
            success: exitCode === 0,
            output: outLines,
            error: exitCode !== 0 ? stderr.trim() || "Execution failed" : undefined,
            steps: [],
            executionTimeMs: timeMs,
          });
        }
      });
    }
  });
}

// Wandbox compiler names
const WANDBOX_COMPILERS: Record<string, string> = {
  cpp: "gcc-head",
  c: "gcc-head-c",
  rust: "rust-head",
  go: "go-head",
  java: "openjdk-head",
};

async function executeViaWandbox(language: string, code: string, stdin?: string): Promise<{
  success: boolean;
  output: string[];
  error?: string;
  needsInput?: boolean;
  prompt?: string;
  executionTimeMs: number;
}> {
  const start = performance.now();
  const compiler = WANDBOX_COMPILERS[language];
  if (!compiler) {
    throw new Error(`Unsupported Wandbox language: ${language}`);
  }

  // Check if C++/Java/C has cin/scanf/Scanner and no stdin was passed
  const expectsInput =
    (!stdin || stdin.trim().length === 0) &&
    (code.includes("cin >>") || code.includes("scanf(") || code.includes("Scanner") || code.includes("fmt.Scan"));

  if (expectsInput) {
    return {
      success: true,
      output: [],
      needsInput: true,
      prompt: "Enter input for program:",
      executionTimeMs: 0,
    };
  }

  const res = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      compiler,
      stdin: stdin || "",
    }),
  });

  const data = await res.json();
  const timeMs = Math.round(performance.now() - start);

  const progOut = (data.program_output || "").split(/\r?\n/).filter((l: string) => l.length > 0);
  const compErr = data.compiler_error || data.compiler_message || "";
  const progErr = data.program_error || "";
  const err = compErr || progErr || (data.status !== "0" ? "Execution exited with non-zero status" : undefined);

  return {
    success: data.status === "0" && !compErr,
    output: progOut,
    error: err ? err.trim() : undefined,
    executionTimeMs: timeMs,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { language, code, action, stdin } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const security = validateExecutionSecurity(code, language);
    if (!security.safe) {
      return NextResponse.json({
        success: false,
        output: [],
        error: security.reason || "Execution blocked: security policy violation.",
        steps: [],
        executionTimeMs: 0,
      });
    }

    const isVisualise = action === "visualise";

    // 1. Python (Local high-fidelity execution & tracing with dynamic input detection)
    if (language === "python") {
      const result = await executePython(code, isVisualise, stdin);
      return NextResponse.json(result);
    }

    // 2. C++, C, Rust, Go, Java
    if (WANDBOX_COMPILERS[language]) {
      try {
        const wandboxRes = await executeViaWandbox(language, code, stdin);
        return NextResponse.json({
          ...wandboxRes,
          steps: [],
        });
      } catch (err: unknown) {
        return NextResponse.json({
          fallback: true,
          error: err instanceof Error ? err.message : "Remote compiler unavailable",
        });
      }
    }

    // 3. Fallback for others
    return NextResponse.json({
      fallback: true,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Compilation request failed" },
      { status: 500 }
    );
  }
}
