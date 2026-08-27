"use client";

import React from "react";

interface HighlightOverlayProps {
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] normalized 0..1
  label?: string;
}

export function HighlightOverlay({ bbox, label }: HighlightOverlayProps) {
  if (!bbox || bbox.length < 4) return null;

  const [x1, y1, x2, y2] = bbox;

  // Normalized percentages
  const left = Math.min(x1, x2) * 100;
  const top = Math.min(y1, y2) * 100;
  const width = Math.abs(x2 - x1) * 100;
  const height = Math.abs(y2 - y1) * 100;

  return (
    <div
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
      className="absolute border-2 border-[#22C55E] bg-[#22C55E]/12 rounded-2xl pointer-events-none transition-all duration-300 z-20 shadow-xs"
    >
      {/* Label Badge on top-left of highlight border (Matching Figma Q2 badge) */}
      {label && (
        <div className="absolute -top-3.5 left-3 bg-[#16A34A] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-md tracking-wide">
          {label}
        </div>
      )}
    </div>
  );
}
