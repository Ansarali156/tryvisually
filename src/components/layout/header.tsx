"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Moon,
  Sun,
  Zap,
  LayoutGrid,
  BookOpen,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { GlobalSearch } from "@/components/search/global-search";

export interface NavItem {
  label: string;
  shortLabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (path: string) => boolean;
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    label: "Trace Written Code",
    shortLabel: "Trace",
    href: "/trace",
    icon: Zap,
    match: (path: string) => path.startsWith("/trace"),
  },
  {
    label: "Visualise & Learn",
    shortLabel: "Visualise",
    href: "/visualise",
    icon: LayoutGrid,
    match: (path: string) =>
      path === "/" || path.startsWith("/visualise") || path.startsWith("/visualizer"),
  },
  {
    label: "Learn DSA Theory",
    shortLabel: "Theory",
    href: "/theory",
    icon: BookOpen,
    match: (path: string) =>
      path.startsWith("/theory") ||
      path.startsWith("/learn") ||
      path.startsWith("/data-structures") ||
      path.startsWith("/algorithms") ||
      path.startsWith("/lesson") ||
      path.startsWith("/problems") ||
      path.startsWith("/practice") ||
      path.startsWith("/quizzes") ||
      path.startsWith("/progress"),
  },
];

const NAV_COLLAPSED_STORAGE_KEY = "tryvisually_nav_collapsed";

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(true);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Derive active navigation item
  const activeItem =
    PRIMARY_NAV_ITEMS.find((item) => item.match(pathname)) || PRIMARY_NAV_ITEMS[1];
  const ActiveIcon = activeItem.icon;

  // Initialize theme and nav collapse state from localStorage
  React.useEffect(() => {
    const isDarkMode =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") !== "light";
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }

    try {
      const storedCollapse = localStorage.getItem(NAV_COLLAPSED_STORAGE_KEY);
      if (storedCollapse !== null) {
        setIsCollapsed(storedCollapse === "true");
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(NAV_COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch {
        // ignore storage errors
      }
    } else {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("theme", "light");
      } catch {
        // ignore storage errors
      }
    }
  };

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#060913]/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-[#060913]/85 text-slate-900 dark:text-slate-100 select-none px-4 sm:px-6 lg:px-8 transition-colors flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 min-w-[140px] sm:min-w-[200px]">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group transition-transform active:scale-95"
            aria-label="TRY VISUALLY Home"
          >
            <div className="h-8.5 w-8.5 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:border-cyan-500 transition-colors shadow-2xs">
              <Eye className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="font-bold tracking-tight text-xs sm:text-base uppercase text-slate-900 dark:text-white">
                TRY VISUALLY
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/80 text-[10px] font-mono font-bold tracking-wider">
                STUDIO
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Dynamic Collapsible Navigation Bar with Generous Vertical Room */}
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-[#0a0f1d] p-1 gap-1 shadow-2xs transition-all duration-200">
            {isCollapsed ? (
              /* Collapsed Focus Mode: Active Feature Badge + Expand Trigger */
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-mono font-bold transition-all flex items-center gap-2 rounded-lg bg-white dark:bg-[#0f172a] text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-xs cursor-pointer"
                  title="Click to expand all navigation options"
                  aria-label={`Current feature: ${activeItem.shortLabel}. Click to expand options.`}
                >
                  <ActiveIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <span>{activeItem.shortLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="px-2.5 py-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Show all navigation options (Expand)"
                  aria-label="Show all navigation options (Expand)"
                >
                  <span className="hidden sm:inline">Options</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              /* Full Mode: All 3 Options + Collapse Trigger */
              <nav aria-label="Primary navigation" className="flex items-center gap-1">
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const isActive = item.match(pathname);
                  const IconComponent = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-mono font-bold transition-all flex items-center gap-2 rounded-lg",
                        isActive
                          ? "bg-white dark:bg-[#0f172a] text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 border border-transparent"
                      )}
                    >
                      <IconComponent
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 dark:text-slate-500"
                        )}
                      />
                      <span>{item.shortLabel}</span>
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  );
                })}

                {/* Hide / Collapse Trigger */}
                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="h-7 w-7 ml-0.5 rounded-lg border border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  title="Hide navigation options (Collapse)"
                  aria-label="Hide navigation options (Collapse)"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              </nav>
            )}
          </div>
        </div>

        {/* Right: Uniform Utility Controls (Theme Toggle) */}
        <div className="flex items-center justify-end gap-2 min-w-[140px] sm:min-w-[200px]">
          <button
            onClick={toggleTheme}
            className="h-8.5 sm:h-9 w-8.5 sm:w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0c1220] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Global Search Modal via Cmd+K / Ctrl+K */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
