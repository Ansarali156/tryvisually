"use client";

import * as React from "react";
import Link from "next/link";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { HelpCircle, ArrowLeft, Home, Search } from "lucide-react";

export function VisualizerNotFound({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center select-none space-y-4">
      <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
        <HelpCircle className="h-10 w-10" />
      </div>

      <div className="max-w-md space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          404 · Unknown Topic
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Visualizer Not Found
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          No topic matching slug <code className="font-mono bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200 font-bold">&quot;{slug}&quot;</code> exists in the catalog.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <Link href="/data-structures">
          <PrimaryButton size="sm">
            <Search className="h-3.5 w-3.5 mr-1.5" />
            Explore Data Structures
          </PrimaryButton>
        </Link>
        <Link href="/algorithms">
          <SecondaryButton size="sm">
            Explore Algorithms
          </SecondaryButton>
        </Link>
        <Link href="/">
          <SecondaryButton size="sm">
            <Home className="h-3.5 w-3.5 mr-1.5" />
            Home
          </SecondaryButton>
        </Link>
      </div>
    </div>
  );
}
