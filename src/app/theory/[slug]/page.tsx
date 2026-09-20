import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getContentBySlug, getAllContentSlugs } from "@/config/content-registry";
import { getTheoryBySlug } from "@/core/theory/theory-content";
import { TopicBar } from "@/components/visualizer/topic-bar";
import {
  Eye,
  Clock,
  BookOpen,
  CheckCircle2,
  Layers,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllContentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const content = getContentBySlug(slug);
  if (!content) {
    return { title: "Theory | Try Visually" };
  }
  return {
    title: `${content.title} Theory & Complexity | Try Visually`,
    description: `Understand the theoretical foundations, memory representation, and asymptotic complexity of ${content.title}.`,
  };
}

export default async function TheorySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const content = getContentBySlug(slug);

  if (!content) {
    notFound();
  }

  const detailedTheory = getTheoryBySlug(slug);

  return (
    <AppShell>
      {/* Compact Topic Navigation Area */}
      <TopicBar currentSlug={slug} basePath="/theory" />

      {/* Main Theory Reader Content */}
      <div className="w-full bg-surface-50 dark:bg-surface-950 flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Framed Container Box matching TRY VISUALLY visual design language */}
          <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-900 shadow-sm p-5 sm:p-7 lg:p-8 space-y-6">
            
            {/* Header: Title, Category Badge, and Visualizer Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    {content.category}
                  </span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {content.difficulty} Difficulty
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {content.title} <span className="text-brand-600 dark:text-brand-400 font-sans text-xl sm:text-2xl font-bold">Theory &amp; Complexity</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {detailedTheory?.summary || content.description}
                </p>
              </div>

              <Link
                href={`/visualise/${content.slug}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-xs transition-all shrink-0 active:scale-95"
              >
                <Eye className="h-4 w-4" />
                <span>Visualise {content.title}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Asymptotic Complexity Table */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-surface-50/70 dark:bg-surface-950/50 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Asymptotic Complexity Bounds
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="py-2 pr-4">Operation</th>
                      <th className="py-2 px-4">Best Case</th>
                      <th className="py-2 px-4">Average Case</th>
                      <th className="py-2 px-4">Worst Case</th>
                      <th className="py-2 pl-4">Space Complexity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="text-slate-800 dark:text-slate-200">
                      <td className="py-2.5 pr-4 font-bold font-sans">Primary Mechanics</td>
                      <td className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {detailedTheory?.complexities.timeBest || content.timeComplexity || "O(1)"}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-brand-600 dark:text-brand-400">
                        {detailedTheory?.complexities.timeAvg || content.timeComplexity || "O(n)"}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-amber-600 dark:text-amber-400">
                        {detailedTheory?.complexities.timeWorst || content.timeComplexity || "O(n)"}
                      </td>
                      <td className="py-2.5 pl-4 font-semibold text-slate-700 dark:text-slate-300">
                        {detailedTheory?.complexities.space || content.spaceComplexity || "O(n)"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Core Invariants & Objectives */}
            {content.learningObjectives && content.learningObjectives.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Core Invariants &amp; Rules
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {content.learningObjectives.map((obj, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                    >
                      <span className="font-bold text-brand-600 dark:text-brand-400 block mb-1 font-mono text-[11px]">
                        0{i + 1}. Invariant
                      </span>
                      {obj}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Detailed Theory Curriculum Sections */}
            {detailedTheory && detailedTheory.sections.length > 0 && (
              <div className="space-y-4 pt-2">
                {detailedTheory.sections.map((section, idx) => (
                  <section
                    key={idx}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-surface-50/40 dark:bg-surface-950/40 p-4 sm:p-5 space-y-2"
                  >
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>{section.title}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-5 font-sans">
                      {section.content}
                    </p>
                  </section>
                ))}
              </div>
            )}

            {/* Visualizer Call to Action Footer */}
            <div className="p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-surface-100/70 dark:bg-surface-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ready to see {content.title} in action?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Watch execution step-by-step, inspect variables, and synchronize with code.
                </p>
              </div>
              <Link
                href={`/visualise/${content.slug}`}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shrink-0 shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Launch Visualizer</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
