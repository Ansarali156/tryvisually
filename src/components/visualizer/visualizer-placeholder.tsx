"use client";

import * as React from "react";
import Link from "next/link";
import type { DSAContent } from "@/config/content-registry";
import { Badge } from "@/components/ui/badge";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { TopicBar } from "./topic-bar";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface VisualizerPlaceholderProps {
  content: DSAContent;
  className?: string;
}

export function VisualizerPlaceholder({ content, className }: VisualizerPlaceholderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-surface-100 dark:bg-surface-950">
      {/* Compact Horizontal Topic Bar */}
      <TopicBar currentSlug={content.slug} />

      {/* Main Content Stage */}
      <div className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto flex flex-col gap-6">
          {/* Main Visualizer Stage Placeholder */}
          <div className="p-8 md:p-12 rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-surface-900 flex flex-col items-center justify-center text-center space-y-5">
            <div className="p-4 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Layers className="h-10 w-10" />
            </div>

            <div className="max-w-xl space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="brand" size="sm">
                  Interactive Visualizer
                </Badge>
                <Badge variant="warning" size="sm">
                  Coming Soon
                </Badge>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {content.title} Visualizer
              </h1>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {content.description}
              </p>
            </div>

            {/* Architecture Status Badge */}
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-950 border border-slate-200 dark:border-slate-800 max-w-lg w-full text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Cpu className="h-4 w-4 text-brand-600" />
                <span>Foundation Architecture Ready</span>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Core Execution Engine &amp; Time Travel
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Visualization State Engine &amp; Stable Identifiers
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Code &amp; Variable Synchronization Layer
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Animation &amp; Step Controller
                </li>
              </ul>
              <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                Dedicated interactive visualizer for {content.title} will be built in the next development phase (Prompt 7+).
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href={content.lessonRoute}>
                <PrimaryButton size="md">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read {content.title} Lesson
                </PrimaryButton>
              </Link>

              <Link href="/visualizer/binary-search">
                <SecondaryButton size="md">
                  <Sparkles className="h-4 w-4 mr-2 text-brand-600" />
                  Try Live Binary Search Demo
                </SecondaryButton>
              </Link>
            </div>
          </div>

          {/* Learning Objectives Preview */}
          {content.learningObjectives && content.learningObjectives.length > 0 && (
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-surface-900 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                What You&apos;ll Learn in {content.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {content.learningObjectives.map((obj, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-surface-50 dark:bg-surface-950 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400"
                  >
                    <span className="font-bold text-brand-600 block mb-1">0{i + 1}.</span>
                    {obj}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
