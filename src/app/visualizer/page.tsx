import { redirect } from "next/navigation";

export const metadata = {
  title: "Visualizer | Visually",
  description: "Interactive visual execution environment for Data Structures and Algorithms.",
};

export default function VisualizerPage() {
  redirect("/visualise");
}
