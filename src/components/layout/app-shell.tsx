import * as React from "react";
import { Header } from "./header";
import { Footer } from "./footer";

export interface AppShellProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export function AppShell({ children, hideFooter = false }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
