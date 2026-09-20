/**
 * Sandbox Execution Security Validator
 *
 * Inspects source code before spawning server-side processes to block
 * malicious OS calls, file-system manipulation, process spawning, and network exfiltration.
 */

export interface SecurityCheckResult {
  readonly safe: boolean;
  readonly reason?: string;
}

const MAX_CODE_BYTES = 65_536; // 64 KB limit

// Forbidden Python modules and attributes
const PYTHON_BLOCKED_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /\bimport\s+(os|subprocess|sys|shutil|pty|commands|ctypes|socket|urllib|requests|http|multiprocessing|threading|signal|resource)\b/,
    message: "Importing system, network, or process control modules is restricted.",
  },
  {
    pattern: /\bfrom\s+(os|subprocess|sys|shutil|pty|commands|ctypes|socket|urllib|requests|http|multiprocessing|threading|signal|resource)\b/,
    message: "Importing system, network, or process control modules is restricted.",
  },
  {
    pattern: /__import__\s*\(/,
    message: "Dynamic import function '__import__' is restricted.",
  },
  {
    pattern: /\beval\s*\(|\bexec\s*\(/,
    message: "Dynamic code evaluation (eval / exec) is restricted in sandbox.",
  },
  {
    pattern: /\bopen\s*\(/,
    message: "Direct file system access (open) is disabled in the interactive browser sandbox.",
  },
  {
    pattern: /__subclasses__|__bases__|__mro__|__globals__/,
    message: "Python introspection sandbox escapes are prohibited.",
  },
];

export function validateExecutionSecurity(
  code: string,
  language: string
): SecurityCheckResult {
  if (!code || typeof code !== "string") {
    return { safe: false, reason: "No code provided for execution." };
  }

  if (code.length > MAX_CODE_BYTES) {
    return {
      safe: false,
      reason: `Code size exceeds maximum permitted limit (${MAX_CODE_BYTES} characters).`,
    };
  }

  if (language === "python") {
    for (const rule of PYTHON_BLOCKED_PATTERNS) {
      if (rule.pattern.test(code)) {
        return {
          safe: false,
          reason: rule.message,
        };
      }
    }
  }

  return { safe: true };
}
