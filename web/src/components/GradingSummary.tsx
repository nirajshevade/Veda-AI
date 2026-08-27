"use client";

import React from "react";
import { Mapping, Question } from "@/lib/types";
import { CheckCircle2, AlertCircle, HelpCircle, Bookmark } from "lucide-react";

interface GradingSummaryProps {
  questions: Question[];
  mappings: Mapping[];
}

export function GradingSummary({ questions, mappings }: GradingSummaryProps) {
  let totalScore = 0;
  let totalMaxScore = 0;
  let answeredCount = 0;
  let unansweredCount = 0;
  let unmatchedCount = 0;

  for (const m of mappings) {
    if (m.questionId) {
      const q = questions.find(item => item.id === m.questionId);
      const maxScore = m.maxScore || q?.maxScore || 2;
      totalMaxScore += maxScore;

      if (m.answerId) {
        answeredCount++;
        totalScore += (m.score ?? 0);
      } else {
        unansweredCount++;
      }
    } else if (m.answerId) {
      unmatchedCount++;
    }
  }

  const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl p-4 md:p-5 border border-gray-200/80 shadow-2xs mb-4 flex-shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Score & Progress */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#FFEBE5] text-[#FF5A36] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Bookmark size={22} className="fill-[#FF5A36]/20" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                {totalScore} <span className="text-sm font-semibold text-gray-400">/ {totalMaxScore}</span>
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                {percentage}%
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Overall Assessment Score</p>
          </div>
        </div>

        {/* Breakdown Stats Badges */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-800 bg-[#E8F8F0] px-3 py-1.5 rounded-2xl border border-emerald-200/60 shadow-2xs">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>{answeredCount} Answered</span>
          </div>

          {unansweredCount > 0 && (
            <div className="flex items-center gap-1.5 text-rose-800 bg-[#FEECEC] px-3 py-1.5 rounded-2xl border border-rose-200/60 shadow-2xs">
              <AlertCircle size={13} className="text-rose-600" />
              <span>{unansweredCount} Unanswered</span>
            </div>
          )}

          {unmatchedCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-800 bg-[#FEF6E8] px-3 py-1.5 rounded-2xl border border-amber-200/60 shadow-2xs">
              <HelpCircle size={13} className="text-amber-600" />
              <span>{unmatchedCount} Unmatched</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
