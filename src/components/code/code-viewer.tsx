"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { SourceCode, SupportedLanguage } from "@/core/synchronization/types";
import { Code2, Copy, Check } from "lucide-react";

export interface CodeViewerProps {
  /** Structured source code object */
  sourceCode?: SourceCode;

  /** Fallback raw code string if sourceCode is not provided */
  rawCode?: string;

  /** Active line numbers (1-indexed) */
  activeLines?: readonly number[];

  /** Primary focal line (1-indexed) */
  primaryLine?: number;

  /** Current language */
  language?: SupportedLanguage;

  /** Optional callback when user changes language */
  onLanguageChange?: (lang: SupportedLanguage) => void;

  /** Available languages to switch between */
  availableLanguages?: readonly SupportedLanguage[];

  /** Optional panel title */
  title?: string;

  /** Whether to auto-scroll to the active line */
  autoScroll?: boolean;

  /** Custom CSS classes */
  className?: string;
}

export function CodeViewer({
  sourceCode,
  rawCode,
  activeLines = [],
  primaryLine,
  language = "python",
  onLanguageChange,
  availableLanguages = ["python", "typescript", "java", "cpp"],
  title = "Source Implementation",
  autoScroll = true,
  className,
}: CodeViewerProps) {
  const [copied, setCopied] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const lineRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

  // Derive lines from either sourceCode or rawCode
  const lines = React.useMemo(() => {
    if (sourceCode) {
      return sourceCode.lines;
    }
    if (rawCode) {
      return rawCode.split("\n").map((content, idx) => ({
        lineNumber: idx + 1,
        content,
      }));
    }
    return [];
  }, [sourceCode, rawCode]);

  const effectivePrimaryLine = primaryLine ?? (activeLines.length > 0 ? activeLines[0] : undefined);

  // Auto-scroll to active line smoothly if out of view
  React.useEffect(() => {
    if (!autoScroll || !effectivePrimaryLine) return;

    const lineElem = lineRefs.current.get(effectivePrimaryLine);
    const container = scrollContainerRef.current;
    if (!lineElem || !container) return;

    const containerRect = container.getBoundingClientRect();
    const lineRect = lineElem.getBoundingClientRect();

    // Check if line is outside container's visible viewport
    const isAbove = lineRect.top < containerRect.top;
    const isBelow = lineRect.bottom > containerRect.bottom;

    if (isAbove || isBelow) {
      lineElem.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [effectivePrimaryLine, autoScroll]);

  const handleCopy = () => {
    const textToCopy = sourceCode?.code ?? rawCode ?? "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-2xl border border-slate-200 bg-slate-950 text-slate-100 shadow-card overflow-hidden select-none font-mono text-xs",
        className
      )}
      role="region"
      aria-label="Algorithm Source Code Viewer"
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-semibold text-slate-200">{title}</span>

          {/* Language Selector */}
          {onLanguageChange && availableLanguages.length > 1 ? (
            <div className="flex items-center gap-1 ml-2 bg-slate-800 p-0.5 rounded-lg">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-mono transition-colors",
                    language === lang
                      ? "bg-brand-600 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  )}
                  aria-label={`Switch to ${lang}`}
                  aria-pressed={language === lang}
                >
                  {lang}
                </button>
              ))}
            </div>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold tracking-wider bg-slate-800 text-brand-400 border border-slate-700">
              {language}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          aria-label={copied ? "Code copied to clipboard" : "Copy code"}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded-md hover:bg-slate-800 border border-transparent hover:border-slate-700"
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

      {/* Code Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto py-2 font-mono text-xs leading-relaxed"
        tabIndex={0}
        aria-label="Code lines"
      >
        {lines.length === 0 ? (
          <div className="p-4 text-slate-500 italic text-center">
            No source code available for this algorithm.
          </div>
        ) : (
          lines.map(({ lineNumber, content }) => {
            const isActive = activeLines.includes(lineNumber);
            const isPrimary = lineNumber === effectivePrimaryLine;

            return (
              <div
                key={lineNumber}
                ref={(el) => {
                  if (el) {
                    lineRefs.current.set(lineNumber, el);
                  } else {
                    lineRefs.current.delete(lineNumber);
                  }
                }}
                aria-current={isActive ? "true" : undefined}
                data-line-number={lineNumber}
                className={cn(
                  "group flex items-center px-3 py-0.5 transition-colors duration-150 relative",
                  isActive
                    ? "bg-brand-500/20 text-brand-50 font-medium"
                    : "hover:bg-slate-900/60 text-slate-300"
                )}
              >
                {/* Active Line Left Indicator Bar */}
                {isActive && (
                  <span
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1",
                      isPrimary ? "bg-brand-400" : "bg-brand-600"
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Line Number Gutter */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-8 pr-3 text-right select-none text-[11px] font-mono",
                    isActive
                      ? "text-brand-300 font-bold"
                      : "text-slate-600 group-hover:text-slate-500"
                  )}
                >
                  {lineNumber}
                </span>

                {/* Line Content */}
                <span className="whitespace-pre flex-1 pl-1">
                  {content || " "}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
