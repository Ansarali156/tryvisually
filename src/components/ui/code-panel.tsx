import * as React from "react";
import { cn } from "@/lib/utils";
import { Code2, Copy, Check } from "lucide-react";

export interface CodePanelProps {
  code: string;
  language?: string;
  activeLines?: number[]; // 1-indexed line numbers
  title?: string;
  className?: string;
}

export function CodePanel({
  code,
  language = "typescript",
  activeLines = [],
  title = "Algorithm Implementation",
  className,
}: CodePanelProps) {
  const [copied, setCopied] = React.useState(false);

  const lines = React.useMemo(() => code.split("\n"), [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-xl border border-slate-200 bg-surface-950 text-slate-100 shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-900 border-b border-surface-800 select-none">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-semibold text-slate-200">{title}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-medium tracking-wider bg-surface-800 text-slate-400">
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors p-1 rounded hover:bg-surface-800"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content with Line Numbers & Highlights */}
      <div className="flex-1 overflow-auto p-3 font-mono text-xs leading-5">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNumber = idx + 1;
              const isActive = activeLines.includes(lineNumber);

              return (
                <tr
                  key={lineNumber}
                  className={cn(
                    "transition-colors duration-150 rounded",
                    isActive
                      ? "bg-brand-600/30 text-white font-medium border-l-2 border-brand-400"
                      : "hover:bg-surface-900/50 text-slate-300"
                  )}
                >
                  <td className="w-8 py-0.5 pl-2 pr-3 text-right text-slate-600 select-none text-[11px]">
                    {lineNumber}
                  </td>
                  <td className="py-0.5 pl-2 pr-4 whitespace-pre">
                    {line || " "}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
