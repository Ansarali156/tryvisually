import Link from "next/link";
import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-surface-900/80 py-6 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-600 text-white">
            <Compass className="h-3.5 w-3.5" />
          </div>
          <span className="font-black tracking-tight text-slate-900 dark:text-white uppercase">
            TRY <span className="text-brand-600 dark:text-brand-400">VISUALLY</span>
          </span>
          <span className="text-slate-400 dark:text-slate-600">|</span>
          <span>Interactive Data Structures & Algorithms</span>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <Link href="/visualise" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Visualise & Learn
          </Link>
          <Link href="/trace" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Trace Written Code
          </Link>
          <Link href="/theory" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Learn DSA Theory
          </Link>
        </div>
      </div>
    </footer>
  );
}
