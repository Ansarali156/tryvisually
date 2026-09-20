"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SIDEBAR_SECTIONS,
  SidebarSection,
  SidebarSubItem,
} from "@/config/navigation";
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import { IconButton } from "@/components/ui/buttons";

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
  className?: string;
}

export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-surface-900 border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Learning Index
            </span>
          </div>
        )}

        {onToggleCollapse && (
          <IconButton
            size="sm"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:inline-flex"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </IconButton>
        )}

        {/* Mobile close button */}
        {onCloseMobileDrawer && (
          <IconButton
            size="sm"
            onClick={onCloseMobileDrawer}
            aria-label="Close sidebar drawer"
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </IconButton>
        )}
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {SIDEBAR_SECTIONS.map((section: SidebarSection) => (
          <div key={section.sectionTitle} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.sectionTitle}
              </div>
            )}

            {section.groups.map((group) => {
              const isGroupCollapsed = collapsedGroups[group.title];

              return (
                <div key={group.title} className="space-y-0.5">
                  {!isCollapsed ? (
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-surface-800 transition-colors"
                    >
                      <span>{group.title}</span>
                      {isGroupCollapsed ? (
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-slate-400" />
                      )}
                    </button>
                  ) : null}

                  {(!isGroupCollapsed || isCollapsed) && (
                    <div className={cn("space-y-0.5", !isCollapsed && "pl-2 border-l border-slate-100 dark:border-slate-800 ml-2")}>
                      {group.items.map((item: SidebarSubItem) => {
                        const isActive = pathname === item.href || (item.href.startsWith("/data-structures") && pathname === "/data-structures");

                        return (
                          <Link
                            key={item.slug}
                            href={item.href}
                            onClick={onCloseMobileDrawer}
                            title={item.name}
                            className={cn(
                              "flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                              isActive
                                ? "bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950/70 dark:text-brand-300"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-surface-800 dark:hover:text-white"
                            )}
                          >
                            <span className="truncate">{item.name}</span>
                            {item.status === "coming-soon" && !isCollapsed && (
                              <span className="text-[9px] font-mono text-slate-400 uppercase">
                                Soon
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden lg:block h-full transition-all duration-200 shrink-0",
          isCollapsed ? "w-14" : "w-64",
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobileDrawer}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
