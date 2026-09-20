import Link from "next/link";
import { getContentBySlug, getAllContentSlugs } from "@/config/content-registry";
import { AppShell } from "@/components/layout/app-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import {
  BookOpen,
  PlaySquare,
  Clock,
  Database,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Search,
} from "lucide-react";

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllContentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: LessonPageProps) {
  const { slug } = await params;
  const content = getContentBySlug(slug);

  if (!content) {
    return {
      title: "Lesson Not Found | Visually",
      description: "Requested DSA lesson was not found.",
    };
  }

  return {
    title: `${content.title} Lesson | Visually`,
    description: `Learn ${content.title} with concept breakdown, memory models, and interactive execution previews.`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const content = getContentBySlug(slug);

  if (!content) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 inline-block">
            <HelpCircle className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lesson Not Found</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No lesson matching slug &quot;{slug}&quot; was found.
          </p>
          <div className="pt-4">
            <Link href="/learn">
              <PrimaryButton size="sm">
                <Search className="h-3.5 w-3.5 mr-1.5" />
                Browse Curriculum Tracks
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: "Learn", href: "/learn" },
            {
              label: content.type === "data-structure" ? "Data Structures" : "Algorithms",
              href: content.type === "data-structure" ? "/data-structures" : "/algorithms",
            },
            { label: `${content.title} Lesson` },
          ]}
        />

        {/* Lesson Hero Header */}
        <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-surface-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm">
                {content.category}
              </Badge>
              <Badge
                variant={
                  content.difficulty === "Easy"
                    ? "success"
                    : content.difficulty === "Medium"
                    ? "brand"
                    : "warning"
                }
                size="sm"
              >
                {content.difficulty}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
              {content.timeComplexity && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Time: {content.timeComplexity}</span>
                </div>
              )}
              {content.spaceComplexity && (
                <div className="flex items-center gap-1">
                  <Database className="h-3.5 w-3.5 text-slate-400" />
                  <span>Space: {content.spaceComplexity}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {content.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              {content.description}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href={content.visualizerRoute}>
              <PrimaryButton size="md">
                <PlaySquare className="h-4 w-4 mr-2" />
                Open {content.title} Visualizer
              </PrimaryButton>
            </Link>
            <Link href={content.practiceRoute || "/practice"}>
              <SecondaryButton size="md">
                Practice Problems
                <ArrowRight className="h-4 w-4 ml-2" />
              </SecondaryButton>
            </Link>
          </div>
        </div>

        {/* Learning Objectives */}
        {content.learningObjectives && (
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-surface-900 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <BookOpen className="h-4 w-4 text-brand-600" />
              <h2>Learning Objectives</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {content.learningObjectives.map((objective, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-surface-50 dark:bg-surface-950 border border-slate-100 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-brand-600 font-bold text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Key Outcome 0{idx + 1}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {objective}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conceptual Invariant Summary */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-surface-900 space-y-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Algorithmic Invariant &amp; Mechanics
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every step of {content.title} operates on deterministic state transitions.
            When you explore this in the visualizer, the execution engine steps through the exact algorithmic invariants, synchronized code lines, and memory snapshot changes.
          </p>
          <div className="pt-2">
            <Link href={content.visualizerRoute} className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
              <span>Launch interactive visualization for {content.title}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
