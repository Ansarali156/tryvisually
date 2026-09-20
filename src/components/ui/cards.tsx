import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Clock, PlaySquare } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./buttons";
import { DataStructureInfo, AlgorithmInfo, DifficultyLevel } from "@/config/dsa";

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: DifficultyLevel;
  className?: string;
}) {
  const styles = {
    Easy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    Hard: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border select-none",
        styles[difficulty] || styles.Easy,
        className
      )}
    >
      {difficulty}
    </span>
  );
}

export function CompletionBadge({
  status,
  className,
}: {
  status: "Completed" | "In Progress" | "Not Started";
  className?: string;
}) {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300",
    "In Progress": "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300",
    "Not Started": "bg-slate-100 text-slate-600 border-slate-200 dark:bg-surface-800 dark:text-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border select-none",
        styles[status],
        className
      )}
    >
      {status === "Completed" && <CheckCircle2 className="h-3 w-3" />}
      {status === "In Progress" && <Clock className="h-3 w-3" />}
      <span>{status}</span>
    </span>
  );
}

export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono font-medium tracking-wider bg-surface-100 text-slate-600 dark:bg-surface-800 dark:text-slate-400",
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Clean SVG Visual Previews for Data Structures
 */
export function DataStructureVisualPreview({
  type,
}: {
  type: DataStructureInfo["visualType"];
}) {
  return (
    <div className="w-full h-24 rounded-lg bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800 overflow-hidden select-none">
      {type === "array" && (
        <div className="flex gap-1.5 font-mono text-xs">
          {[10, 20, 30, 40].map((num, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded border border-slate-300 bg-white flex items-center justify-center font-bold text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-surface-900 dark:text-slate-200"
            >
              {num}
            </div>
          ))}
        </div>
      )}

      {type === "linked-list" && (
        <div className="flex items-center gap-1 font-mono text-xs">
          {[10, 20, 30].map((num, i) => (
            <React.Fragment key={i}>
              <div className="w-8 h-8 rounded border border-brand-300 bg-brand-50/50 flex items-center justify-center font-bold text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
                {num}
              </div>
              {i < 2 && <ArrowRight className="h-3 w-3 text-slate-400" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {type === "stack" && (
        <div className="flex flex-col-reverse gap-1 font-mono text-[11px] w-20">
          {[10, 20, 30].map((num, i) => (
            <div
              key={i}
              className={cn(
                "h-5 rounded border text-center font-bold",
                i === 2
                  ? "border-brand-500 bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200"
                  : "border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-surface-900 dark:text-slate-300"
              )}
            >
              {num} {i === 2 ? "← Top" : ""}
            </div>
          ))}
        </div>
      )}

      {type === "queue" && (
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <span className="text-[9px] text-slate-400">Front</span>
          {[10, 20, 30].map((num, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded border border-slate-300 bg-white flex items-center justify-center font-bold text-slate-700 dark:border-slate-700 dark:bg-surface-900 dark:text-slate-200"
            >
              {num}
            </div>
          ))}
          <span className="text-[9px] text-slate-400">Rear</span>
        </div>
      )}

      {type === "tree" && (
        <svg viewBox="0 0 120 70" className="w-28 h-16 stroke-current text-slate-400">
          <line x1="60" y1="16" x2="30" y2="48" strokeWidth="1.5" />
          <line x1="60" y1="16" x2="90" y2="48" strokeWidth="1.5" />
          <circle cx="60" cy="16" r="10" className="fill-brand-100 stroke-brand-500 stroke-2 dark:fill-brand-950" />
          <text x="60" y="19" fontSize="9" textAnchor="middle" fill="#4f46e5" fontWeight="bold">20</text>
          <circle cx="30" cy="48" r="9" className="fill-white stroke-slate-400 stroke-2 dark:fill-surface-900" />
          <text x="30" y="51" fontSize="8" textAnchor="middle" fill="#64748b" fontWeight="bold">10</text>
          <circle cx="90" cy="48" r="9" className="fill-white stroke-slate-400 stroke-2 dark:fill-surface-900" />
          <text x="90" y="51" fontSize="8" textAnchor="middle" fill="#64748b" fontWeight="bold">30</text>
        </svg>
      )}

      {type === "graph" && (
        <svg viewBox="0 0 110 70" className="w-24 h-16 stroke-current text-slate-300 dark:text-slate-700">
          <line x1="25" y1="20" x2="85" y2="20" strokeWidth="1.5" />
          <line x1="25" y1="50" x2="85" y2="50" strokeWidth="1.5" />
          <line x1="25" y1="20" x2="25" y2="50" strokeWidth="1.5" />
          <line x1="85" y1="20" x2="85" y2="50" strokeWidth="1.5" />
          <circle cx="25" cy="20" r="7" className="fill-brand-600 stroke-none" />
          <circle cx="85" cy="20" r="7" className="fill-emerald-600 stroke-none" />
          <circle cx="25" cy="50" r="7" className="fill-sky-600 stroke-none" />
          <circle cx="85" cy="50" r="7" className="fill-amber-600 stroke-none" />
        </svg>
      )}

      {type === "hash-table" && (
        <div className="space-y-1 font-mono text-[10px] w-28">
          <div className="flex items-center justify-between px-2 py-0.5 rounded border border-slate-300 bg-white dark:border-slate-700 dark:bg-surface-900">
            <span className="text-slate-400">#0</span>
            <span className="font-bold text-brand-600">&quot;apple&quot;</span>
          </div>
          <div className="flex items-center justify-between px-2 py-0.5 rounded border border-slate-300 bg-white dark:border-slate-700 dark:bg-surface-900">
            <span className="text-slate-400">#1</span>
            <span className="font-bold text-brand-600">&quot;banana&quot;</span>
          </div>
        </div>
      )}

      {type === "heap" && (
        <div className="flex flex-col items-center gap-1 font-mono text-[10px]">
          <div className="w-6 h-6 rounded-full border-2 border-brand-500 bg-brand-50 text-brand-700 flex items-center justify-center font-bold dark:bg-brand-950 dark:text-brand-300">
            4
          </div>
          <div className="flex gap-4">
            <div className="w-5 h-5 rounded-full border border-slate-300 bg-white text-slate-700 flex items-center justify-center dark:border-slate-700 dark:bg-surface-900 dark:text-slate-300">
              10
            </div>
            <div className="w-5 h-5 rounded-full border border-slate-300 bg-white text-slate-700 flex items-center justify-center dark:border-slate-700 dark:bg-surface-900 dark:text-slate-300">
              12
            </div>
          </div>
        </div>
      )}

      {type === "trie" && (
        <div className="font-mono text-xs text-slate-600 dark:text-slate-300 text-center">
          <span className="font-bold text-brand-600">r</span> → o → o → <span className="text-emerald-600 font-bold">t*</span>
        </div>
      )}
    </div>
  );
}

export function TopicCard({ topic }: { topic: DataStructureInfo }) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-card hover:border-brand-300 dark:border-slate-800 dark:bg-surface-900 dark:hover:border-brand-700 transition-all overflow-hidden group">
      <div className="p-4 pb-2">
        <DataStructureVisualPreview type={topic.visualType} />
      </div>

      <div className="p-4 pt-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {topic.name}
            </h4>
            <DifficultyBadge difficulty={topic.difficulty} />
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {topic.description}
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1 py-1.5 px-2 rounded-lg bg-surface-50 dark:bg-surface-950 text-[10px] text-center font-mono border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block">Access</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{topic.accessTime}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Search</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{topic.searchTime}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Insert</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{topic.insertTime}</span>
            </div>
          </div>

          <Link href={`/visualizer/${topic.slug}`} className="block">
            <SecondaryButton size="sm" className="w-full justify-center">
              Explore
              <ArrowRight className="h-3 w-3 ml-1.5" />
            </SecondaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AlgorithmCard({ algorithm }: { algorithm: AlgorithmInfo }) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-card hover:border-brand-300 dark:border-slate-800 dark:bg-surface-900 dark:hover:border-brand-700 transition-all p-4 justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <Tag>{algorithm.category}</Tag>
          <DifficultyBadge difficulty={algorithm.difficulty} />
        </div>

        <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1">
          {algorithm.name}
        </h4>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {algorithm.description}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-50 dark:bg-surface-950 border border-slate-100 dark:border-slate-800 text-xs font-mono">
          <span className="text-slate-500">Complexity:</span>
          <span className="font-bold text-brand-600 dark:text-brand-400">
            {algorithm.timeComplexity}
          </span>
        </div>

        <Link href={`/visualizer/${algorithm.slug}`} className="block">
          <PrimaryButton size="sm" className="w-full justify-center">
            <PlaySquare className="h-3.5 w-3.5 mr-1.5" />
            Visualize
          </PrimaryButton>
        </Link>
      </div>
    </div>
  );
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-card transition-all dark:border-slate-800 dark:bg-surface-900 flex flex-col items-start">
      <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/70 dark:text-brand-400 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
