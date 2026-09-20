import { redirect } from "next/navigation";
import { getAllContentSlugs } from "@/config/content-registry";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllContentSlugs();
  const allSlugs = Array.from(new Set([...slugs, "graph", "graphs"]));
  return allSlugs.map((slug) => ({ slug }));
}

export default async function VisualizerSlugPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/visualise/${slug}`);
}
