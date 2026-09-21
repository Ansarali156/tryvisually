"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Move } from "lucide-react";

export interface ZoomableCanvasProps {
  children: React.ReactNode;
  className?: string;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  step?: number;
  showControls?: boolean;
}

export function ZoomableCanvas({
  children,
  className,
  initialScale = 1,
  minScale = 0.3,
  maxScale = 3,
  step = 0.15,
  showControls = true,
}: ZoomableCanvasProps) {
  const [scale, setScale] = React.useState<number>(initialScale);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const dragStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle Zoom In
  const handleZoomIn = React.useCallback(() => {
    setScale((prev) => Math.min(maxScale, Number((prev + step).toFixed(2))));
  }, [maxScale, step]);

  // Handle Zoom Out
  const handleZoomOut = React.useCallback(() => {
    setScale((prev) => Math.max(minScale, Number((prev - step).toFixed(2))));
  }, [minScale, step]);

  // Handle Reset to 100%
  const handleReset = React.useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Handle Fit to Screen
  const handleFit = React.useCallback(() => {
    setScale(0.85);
    setPan({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  const handleWheel = React.useCallback(
    (e: React.WheelEvent) => {
      // Prevent default browser zoom if ctrlKey or handle gentle trackpad / wheel zoom
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 20) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        setScale((prev) => {
          const next = Number((prev + delta).toFixed(2));
          return Math.min(maxScale, Math.max(minScale, next));
        });
      }
    },
    [maxScale, minScale]
  );

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan on left click and when not clicking on interactive buttons or inputs
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("a")
    ) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      className={cn(
        "relative w-full h-full overflow-hidden flex items-center justify-center select-none pb-24",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
    >
      {/* Zoomable / Pannable Stage */}
      <div
        className="transition-transform duration-75 ease-out flex items-center justify-center min-w-max"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>

      {/* Floating Zoom & Pan Controls */}
      {showControls && (
        <div
          role="toolbar"
          className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/90 dark:bg-[#0c1220]/90 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs font-mono"
          aria-label="Canvas zoom controls"
        >
          <button
            onClick={handleZoomOut}
            disabled={scale <= minScale}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset to 100%"
            aria-label="Reset zoom to 100%"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            disabled={scale >= maxScale}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

          <button
            onClick={handleFit}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fit to Screen"
            aria-label="Fit to Screen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Pan and Zoom"
            aria-label="Reset Pan and Zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
