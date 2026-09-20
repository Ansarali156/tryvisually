import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "./badge";

export interface VisualizationPanelProps {
  title?: string;
  statusText?: string;
  onResetZoom?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function VisualizationPanel({
  title = "Interactive Visualization Canvas",
  statusText = "Ready",
  onResetZoom,
  onZoomIn,
  onZoomOut,
  children,
  className,
}: VisualizationPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-surface-900",
        className
      )}
    >
      {/* Viewport Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-50 border-b border-slate-200 dark:bg-surface-950 dark:border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {title}
          </span>
          <Badge variant="brand" size="sm">
            {statusText}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          )}
          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          )}
          {onResetZoom && (
            <button
              onClick={onResetZoom}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors"
              title="Reset Viewport"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Visualization Canvas Body */}
      <div className="relative flex-1 flex items-center justify-center p-6 bg-slate-50/50 dark:bg-surface-950/40 overflow-hidden select-none">
        {children}
      </div>
    </div>
  );
}
