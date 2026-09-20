import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs text-slate-500 select-none", className)}>
      <ol className="flex items-center gap-1.5 list-none p-0 m-0">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.label}>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <li className="flex items-center">
                {isLast || !item.href ? (
                  <span
                    className="font-medium text-slate-900 dark:text-slate-100"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
