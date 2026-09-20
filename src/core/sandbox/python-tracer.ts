/**
 * Lightweight Client-Side Python Tracer for Online Code Tracing
 *
 * Safely parses and executes standard procedural and algorithmic Python code in-browser,
 * capturing line executions, variable states, lists/objects, and stdout at each step
 * inspired by Python Tutor.
 */

export interface TraceStep {
  readonly line: number;
  readonly statement: string;
  readonly explanation: string;
  readonly variables: Record<string, unknown>;
  readonly output: readonly string[];
  readonly func?: string;
  readonly callStack?: readonly string[];
}

export interface TraceExecutionResult {
  readonly success: boolean;
  readonly steps: readonly TraceStep[];
  readonly output: readonly string[];
  readonly error?: string;
  readonly executionTimeMs: number;
}

export function tracePythonCode(code: string, maxSteps = 500): TraceExecutionResult {
  const startTime = performance.now();
  const rawLines = code.split("\n");
  const output: string[] = [];
  const steps: TraceStep[] = [];
  const vars: Record<string, unknown> = {};

  try {
    let stepCount = 0;
    let i = 0;

    // Helper to evaluate simple expressions using safe JS eval with vars in scope
    const evalExpr = (expr: string): unknown => {
      const trimmed = expr.trim();
      if (!trimmed) return undefined;

      // Handle Python literals
      if (trimmed === "True") return true;
      if (trimmed === "False") return false;
      if (trimmed === "None") return null;

      // Replace Python boolean/logical keywords
      let jsExpr = trimmed
        .replace(/\band\b/g, "&&")
        .replace(/\bor\b/g, "||")
        .replace(/\bnot\b/g, "!")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false")
        .replace(/\bNone\b/g, "null");

      // Replace // with Math.floor(a / b)
      jsExpr = jsExpr.replace(/(\w+)\s*\/\/\s*(\w+)/g, "Math.floor($1 / $2)");

      // Replace len(x) with (x).length
      jsExpr = jsExpr.replace(/len\(([^)]+)\)/g, "($1).length");

      try {
        const fn = new Function(...Object.keys(vars), `return (${jsExpr});`);
        return fn(...Object.values(vars));
      } catch {
        return trimmed;
      }
    };

    const recordStep = (lineNum: number, statement: string, explanation: string) => {
      if (stepCount >= maxSteps) {
        throw new Error(`Execution exceeded maximum step limit of ${maxSteps} steps.`);
      }
      stepCount++;

      // Clone variables for immutable history
      const snapshot: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(vars)) {
        if (Array.isArray(v)) {
          snapshot[k] = [...v];
        } else if (typeof v === "object" && v !== null) {
          snapshot[k] = { ...v };
        } else {
          snapshot[k] = v;
        }
      }

      steps.push({
        line: lineNum,
        statement: statement.trim(),
        explanation,
        variables: snapshot,
        output: [...output],
      });
    };

    while (i < rawLines.length) {
      if (stepCount >= maxSteps) {
        throw new Error(`Execution exceeded maximum step limit of ${maxSteps} steps.`);
      }

      const lineNum = i + 1;
      const rawLine = rawLines[i];
      const trimmed = rawLine.trim();

      // Skip blank lines and comments
      if (!trimmed || trimmed.startsWith("#")) {
        i++;
        continue;
      }

      // Handle print(...)
      if (trimmed.startsWith("print(") && trimmed.endsWith(")")) {
        const inner = trimmed.slice(6, -1);
        // Parse comma-separated arguments
        const args = inner.split(",").map((arg) => {
          const val = evalExpr(arg);
          if (Array.isArray(val)) return JSON.stringify(val);
          if (typeof val === "object" && val !== null) return JSON.stringify(val);
          return String(val ?? "");
        });
        const printText = args.join(" ");
        output.push(printText);

        recordStep(lineNum, trimmed, `Printed to stdout: "${printText}"`);
        i++;
        continue;
      }

      // Handle variable assignment: varName = expr (e.g. x = 10, arr = [1, 2, 3])
      const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (assignMatch && !trimmed.includes("==") && !trimmed.startsWith("if ") && !trimmed.startsWith("while ")) {
        const varName = assignMatch[1];
        const valExpr = assignMatch[2];
        const evaluated = evalExpr(valExpr);
        vars[varName] = evaluated;

        const valStr = Array.isArray(evaluated) ? JSON.stringify(evaluated) : String(evaluated);
        recordStep(lineNum, trimmed, `Assigned ${varName} = ${valStr}`);
        i++;
        continue;
      }

      // Handle compound assignment: varName += expr, etc.
      const compoundMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*(\+=|-=|\*=|\/=)\s*(.+)$/);
      if (compoundMatch) {
        const varName = compoundMatch[1];
        const op = compoundMatch[2];
        const valExpr = compoundMatch[3];
        const rightVal = evalExpr(valExpr);
        const prev = vars[varName] as number;

        if (op === "+=") vars[varName] = (prev ?? 0) + (rightVal as number);
        else if (op === "-=") vars[varName] = (prev ?? 0) - (rightVal as number);
        else if (op === "*=") vars[varName] = (prev ?? 1) * (rightVal as number);
        else if (op === "/=") vars[varName] = (prev ?? 1) / (rightVal as number);

        recordStep(lineNum, trimmed, `Updated ${varName} to ${vars[varName]}`);
        i++;
        continue;
      }

      // Handle list append: arr.append(val)
      const appendMatch = trimmed.match(/^([a-zA-Z_]\w*)\.append\((.+)\)$/);
      if (appendMatch) {
        const arrName = appendMatch[1];
        const itemVal = evalExpr(appendMatch[2]);
        if (Array.isArray(vars[arrName])) {
          (vars[arrName] as unknown[]).push(itemVal);
          recordStep(lineNum, trimmed, `Appended ${JSON.stringify(itemVal)} to ${arrName}`);
        }
        i++;
        continue;
      }

      // Handle list element assignment: arr[idx] = val
      const listIndexAssignMatch = trimmed.match(/^([a-zA-Z_]\w*)\[(.+)\]\s*=\s*(.+)$/);
      if (listIndexAssignMatch) {
        const arrName = listIndexAssignMatch[1];
        const idxVal = Number(evalExpr(listIndexAssignMatch[2]));
        const itemVal = evalExpr(listIndexAssignMatch[3]);
        if (Array.isArray(vars[arrName])) {
          (vars[arrName] as unknown[])[idxVal] = itemVal;
          recordStep(lineNum, trimmed, `Set ${arrName}[${idxVal}] = ${JSON.stringify(itemVal)}`);
        }
        i++;
        continue;
      }

      // Handle for loop: for x in arr: OR for i in range(...):
      const forRangeMatch = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\(([^)]+)\):$/);
      if (forRangeMatch) {
        const loopVar = forRangeMatch[1];
        const rangeArgs = forRangeMatch[2].split(",").map((s) => Number(evalExpr(s)));
        const start = rangeArgs.length === 1 ? 0 : rangeArgs[0];
        const stop = rangeArgs.length === 1 ? rangeArgs[0] : rangeArgs[1];
        const step = rangeArgs.length >= 3 ? rangeArgs[2] : 1;

        // Find loop block lines (indented)
        const baseIndent = rawLine.search(/\S/);
        let j = i + 1;
        const bodyLines: { lineNum: number; content: string }[] = [];
        while (j < rawLines.length) {
          const bodyRaw = rawLines[j];
          if (!bodyRaw.trim()) {
            j++;
            continue;
          }
          const bodyIndent = bodyRaw.search(/\S/);
          if (bodyIndent > baseIndent) {
            bodyLines.push({ lineNum: j + 1, content: bodyRaw.trim() });
            j++;
          } else {
            break;
          }
        }

        // Execute range loop
        for (let v = start; (step > 0 ? v < stop : v > stop); v += step) {
          vars[loopVar] = v;
          recordStep(lineNum, trimmed, `Loop iteration: ${loopVar} = ${v}`);

          for (const bodyLine of bodyLines) {
            if (bodyLine.content.startsWith("print(")) {
              const inner = bodyLine.content.slice(6, -1);
              const args = inner.split(",").map((arg) => {
                const evaluated = evalExpr(arg);
                if (Array.isArray(evaluated)) return JSON.stringify(evaluated);
                return String(evaluated ?? "");
              });
              const text = args.join(" ");
              output.push(text);
              recordStep(bodyLine.lineNum, bodyLine.content, `Printed: "${text}"`);
            } else if (bodyLine.content.includes("+=")) {
              const m = bodyLine.content.match(/^([a-zA-Z_]\w*)\s*\+=\s*(.+)$/);
              if (m) {
                const vName = m[1];
                const addVal = Number(evalExpr(m[2]));
                vars[vName] = ((vars[vName] as number) || 0) + addVal;
                recordStep(bodyLine.lineNum, bodyLine.content, `${vName} += ${addVal} (${vName} = ${vars[vName]})`);
              }
            } else {
              const m = bodyLine.content.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
              if (m) {
                const vName = m[1];
                const setVal = evalExpr(m[2]);
                vars[vName] = setVal;
                recordStep(bodyLine.lineNum, bodyLine.content, `Set ${vName} = ${JSON.stringify(setVal)}`);
              }
            }
          }
        }

        i = j;
        continue;
      }

      // Handle for item in list: for x in arr:
      const forInMatch = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+([a-zA-Z_]\w*):$/);
      if (forInMatch) {
        const loopVar = forInMatch[1];
        const listVar = forInMatch[2];
        const list = (vars[listVar] as unknown[]) || [];

        // Find loop body
        const baseIndent = rawLine.search(/\S/);
        let j = i + 1;
        const bodyLines: { lineNum: number; content: string }[] = [];
        while (j < rawLines.length) {
          const bodyRaw = rawLines[j];
          if (!bodyRaw.trim()) {
            j++;
            continue;
          }
          const bodyIndent = bodyRaw.search(/\S/);
          if (bodyIndent > baseIndent) {
            bodyLines.push({ lineNum: j + 1, content: bodyRaw.trim() });
            j++;
          } else {
            break;
          }
        }

        for (const item of list) {
          vars[loopVar] = item;
          recordStep(lineNum, trimmed, `Iterating list: ${loopVar} = ${JSON.stringify(item)}`);

          for (const bodyLine of bodyLines) {
            if (bodyLine.content.startsWith("print(")) {
              const inner = bodyLine.content.slice(6, -1);
              const args = inner.split(",").map((arg) => {
                const evaluated = evalExpr(arg);
                if (Array.isArray(evaluated)) return JSON.stringify(evaluated);
                return String(evaluated ?? "");
              });
              const text = args.join(" ");
              output.push(text);
              recordStep(bodyLine.lineNum, bodyLine.content, `Printed: "${text}"`);
            } else if (bodyLine.content.includes("+=")) {
              const m = bodyLine.content.match(/^([a-zA-Z_]\w*)\s*\+=\s*(.+)$/);
              if (m) {
                const vName = m[1];
                const addVal = Number(evalExpr(m[2]));
                vars[vName] = ((vars[vName] as number) || 0) + addVal;
                recordStep(bodyLine.lineNum, bodyLine.content, `${vName} += ${addVal} (${vName} = ${vars[vName]})`);
              }
            }
          }
        }

        i = j;
        continue;
      }

      // Default line execution step
      recordStep(lineNum, trimmed, `Executed line ${lineNum}`);
      i++;
    }

    return {
      success: true,
      steps: steps.length > 0 ? steps : [
        {
          line: 1,
          statement: "Completed",
          explanation: "Code executed cleanly.",
          variables: {},
          output: [],
        },
      ],
      output,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      steps,
      output,
      error: message,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }
}
