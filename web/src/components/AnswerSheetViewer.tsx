"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, FileQuestion } from "lucide-react";
import { HighlightOverlay } from "./HighlightOverlay";
import { AnswerRegion } from "@/lib/types";

interface AnswerSheetViewerProps {
  pageImages: string[];
  activeRegions?: AnswerRegion[];
  activeRegionIndex?: number;
  highlightLabel?: string;
  currentPage: number;
  onPageChange: (newPage: number) => void;
}

export function AnswerSheetViewer({
  pageImages,
  activeRegions = [],
  activeRegionIndex = 0,
  highlightLabel,
  currentPage,
  onPageChange
}: AnswerSheetViewerProps) {
  const [zoom, setZoom] = useState<number>(100);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(pageImages.length, 1);
  const currentImage = pageImages[currentPage - 1];

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoom(100);

  // Filter regions that belong to the current page
  const currentRegions = activeRegions.filter(r => r.page === currentPage);

  // Auto-scroll highlight into view when page/region changes
  useEffect(() => {
    if (currentRegions.length > 0 && containerRef.current) {
      const targetRegion = currentRegions[0];
      const scrollY = (targetRegion.bbox[1] * containerRef.current.scrollHeight) - 100;
      containerRef.current.scrollTo({
        top: Math.max(0, scrollY),
        behavior: "smooth"
      });
    }
  }, [currentPage, activeRegionIndex, currentRegions.length]);

  return (
    <div className="flex flex-col h-full bg-[#1E293B] rounded-3xl overflow-hidden shadow-sm">
      {/* Dark Toolbar Header (Matching Figma Phone & Desktop Layouts) */}
      <div className="flex items-center justify-between px-3.5 md:px-6 py-2.5 md:py-3.5 bg-[#18202F] text-white border-b border-slate-700/50 flex-shrink-0">
        <span className="hidden sm:inline font-semibold text-sm tracking-wide text-slate-200">Answer Sheet</span>

        <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800/90 rounded-full px-2.5 sm:px-3 py-1 border border-slate-700 text-xs font-medium gap-1.5 sm:gap-2 shadow-xs">
            <button
              onClick={handleZoomOut}
              className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="min-w-[36px] sm:min-w-[40px] text-center font-bold text-[11px] sm:text-xs">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Page Pagination Controls */}
          <div className="flex items-center bg-slate-800/90 rounded-full px-2.5 sm:px-3 py-1 border border-slate-700 text-xs font-medium gap-1.5 sm:gap-2 shadow-xs">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage <= 1}
              className="text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-[11px] sm:text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Answer Sheet Image Viewport */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex justify-center items-start bg-[#0F172A]"
      >
        {currentImage ? (
          <div
            style={{
              width: `${zoom}%`,
              maxWidth: zoom <= 100 ? "800px" : "none",
              transition: "width 0.15s ease-out",
            }}
            className="relative bg-white shadow-2xl rounded-lg overflow-hidden flex-shrink-0"
          >
            {/* Page image */}
            <img
              src={currentImage}
              alt={`Answer Sheet Page ${currentPage}`}
              className="w-full h-auto block select-none"
            />

            {/* Overlaid Highlight Boxes for this page */}
            {currentRegions.map((region, idx) => (
              <HighlightOverlay
                key={idx}
                bbox={region.bbox}
                label={highlightLabel}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <FileQuestion size={40} className="text-slate-500" />
            <p className="text-sm">No page image available for page {currentPage}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
