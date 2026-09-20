import type { Metadata } from "next";
import "./globals.css";
import { TraceSessionProvider } from "@/core/trace/trace-session-context";

export const metadata: Metadata = {
  title: "Try Visually — Learn DSA Visually",
  description:
    "Master Data Structures and Algorithms with interactive execution visualization. See every step, track variable state, and understand code in motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased flex flex-col font-sans">
        <TraceSessionProvider>{children}</TraceSessionProvider>
      </body>
    </html>
  );
}
