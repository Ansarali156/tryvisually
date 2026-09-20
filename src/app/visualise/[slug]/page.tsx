import { getContentBySlug, getAllContentSlugs } from "@/config/content-registry";
import { VisualizerShell } from "@/components/visualizer/visualizer-shell";
import { ArrayVisualizerShell } from "@/components/visualizer/array";
import { LinkedListVisualizerShell } from "@/components/visualizer/linked-list";
import { StackVisualizerShell } from "@/components/visualizer/stack";
import { QueueVisualizerShell } from "@/components/visualizer/queue";
import { HashTableVisualizerShell } from "@/components/visualizer/hash-table";
import {
  BinaryTreeVisualizerShell,
  BstVisualizerShell,
} from "@/components/visualizer/tree";
import {
  HeapVisualizerShell,
  MaxHeapVisualizerShell,
  PriorityQueueVisualizerShell,
} from "@/components/visualizer/heap";
import { GraphVisualizerShell } from "@/components/visualizer/graph";
import { GraphAlgorithmVisualizerShell } from "@/components/visualizer/graph-algorithms";
import type { GraphAlgorithmType } from "@/core/graph-algorithms/types";
import { SearchingVisualizerShell } from "@/components/visualizer/searching";
import { SortingVisualizerShell } from "@/components/visualizer/sorting";
import { RecursionVisualizerShell } from "@/components/visualizer/recursion";
import { DpVisualizerShell } from "@/components/visualizer/dp";
import { VisualizerPlaceholder } from "@/components/visualizer/visualizer-placeholder";
import { VisualizerNotFound } from "@/components/visualizer/visualizer-not-found";

import { AppShell } from "@/components/layout/app-shell";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllContentSlugs();
  const allSlugs = Array.from(new Set([...slugs, "graph", "graphs"]));
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const content = getContentBySlug(slug);

  if (!content) {
    return {
      title: "Topic Not Found | Try Visually",
      description: "Requested visualizer topic was not found.",
    };
  }

  return {
    title: `${content.title} Visualizer | Try Visually`,
    description: content.description,
  };
}

export default async function VisualiseSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const content = getContentBySlug(slug);

  // 1. Invalid / unknown slug -> show 404 VisualizerNotFound (never fall back to Binary Search)
  if (!content) {
    return <VisualizerNotFound slug={slug} />;
  }

  let shellNode: React.ReactNode;

  // 2. Data Structures
  if (content.slug === "arrays") {
    shellNode = <ArrayVisualizerShell />;
  } else if (content.slug === "linked-lists") {
    shellNode = <LinkedListVisualizerShell />;
  } else if (content.slug === "stack") {
    shellNode = <StackVisualizerShell />;
  } else if (content.slug === "queue") {
    shellNode = <QueueVisualizerShell />;
  } else if (content.slug === "hash-table") {
    shellNode = <HashTableVisualizerShell />;
  } else if (content.slug === "binary-tree" || content.slug === "trees") {
    shellNode = <BinaryTreeVisualizerShell />;
  } else if (content.slug === "bst") {
    shellNode = <BstVisualizerShell />;
  } else if (content.slug === "heap") {
    if (slug === "max-heap") {
      shellNode = <MaxHeapVisualizerShell />;
    } else {
      shellNode = <HeapVisualizerShell />;
    }
  } else if (content.slug === "priority-queue") {
    shellNode = <PriorityQueueVisualizerShell />;
  } else if (content.slug === "graphs" || slug === "graph" || slug === "graphs") {
    shellNode = <GraphVisualizerShell />;
  } else if (content.slug === "linear-search") {
    shellNode = <SearchingVisualizerShell initialAlgorithm="linear-search" />;
  } else if (content.slug === "binary-search") {
    shellNode = <SearchingVisualizerShell initialAlgorithm="binary-search" />;
  } else if (content.slug === "bubble-sort") {
    shellNode = <SortingVisualizerShell initialAlgorithm="bubble-sort" />;
  } else if (content.slug === "selection-sort") {
    shellNode = <SortingVisualizerShell initialAlgorithm="selection-sort" />;
  } else if (content.slug === "insertion-sort") {
    shellNode = <SortingVisualizerShell initialAlgorithm="insertion-sort" />;
  } else if (content.slug === "merge-sort") {
    shellNode = <SortingVisualizerShell initialAlgorithm="merge-sort" />;
  } else if (content.slug === "quick-sort") {
    shellNode = <SortingVisualizerShell initialAlgorithm="quick-sort" />;
  } else if (
    content.slug === "bfs" ||
    content.slug === "dfs" ||
    content.slug === "dijkstra" ||
    content.slug === "bellman-ford" ||
    content.slug === "prim" ||
    content.slug === "kruskal" ||
    content.slug === "topological-sort"
  ) {
    shellNode = <GraphAlgorithmVisualizerShell initialAlgorithm={content.slug as GraphAlgorithmType} />;
  } else if (content.slug === "recursion") {
    shellNode = <RecursionVisualizerShell />;
  } else if (content.slug === "dp") {
    shellNode = <DpVisualizerShell />;
  } else if (content.visualizerAvailable) {
    shellNode = <VisualizerShell selectedTopicId={content.slug} />;
  } else {
    shellNode = <VisualizerPlaceholder content={content} />;
  }

  return <AppShell hideFooter>{shellNode}</AppShell>;
}
