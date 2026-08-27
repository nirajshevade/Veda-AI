"use client";

import React from "react";
import { AlertTriangle, Sparkles, FileText } from "lucide-react";

interface FeedbackCardProps {
  feedback?: string;
  transcribedText?: string;
  isLowConfidence?: boolean;
  confidenceReason?: string;
}

export function FeedbackCard({
  feedback,
  transcribedText,
  isLowConfidence,
  confidenceReason
}: FeedbackCardProps) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2.5">
      {/* Low Confidence warning badge if applicable (Scenario 6) */}
      {isLowConfidence && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
          <span>
            {confidenceReason || "Low confidence transcription / mapping — please verify against handwritten original."}
          </span>
        </div>
      )}

      {/* AI Feedback Box */}
      {feedback && (
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1">
            <Sparkles size={13} className="text-brand-orange" />
            <span>AI Feedback</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{feedback}</p>
        </div>
      )}

      {/* Transcribed Student Text */}
      {transcribedText && (
        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 mb-1">
            <FileText size={12} />
            <span>Transcribed Answer</span>
          </div>
          <p className="text-xs text-gray-700 italic leading-snug line-clamp-3">
            "{transcribedText}"
          </p>
        </div>
      )}
    </div>
  );
}
