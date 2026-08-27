"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score?: number;
  maxScore?: number;
  isUnanswered?: boolean;
}

export function ScoreBadge({ score, maxScore = 2, isUnanswered }: ScoreBadgeProps) {
  if (isUnanswered || score === undefined) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
        Not answered
      </span>
    );
  }

  const ratio = maxScore > 0 ? score / maxScore : 0;

  // High / Full score: green
  if (ratio >= 0.8) {
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
        "bg-[#EBF7EE] text-[#16A34A] border border-[#D1F2D9]"
      )}>
        {score}/{maxScore}
      </span>
    );
  }

  // Zero score: red
  if (ratio === 0) {
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
        "bg-[#FEECEB] text-[#E11D48] border border-[#FCD9D7]"
      )}>
        {score}/{maxScore}
      </span>
    );
  }

  // Partial score: amber/orange
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
      "bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]"
    )}>
      {score}/{maxScore}
    </span>
  );
}
