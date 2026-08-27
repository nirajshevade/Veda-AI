"use client";

import React from "react";
import { ChevronDown, ChevronUp, Layers, AlertCircle } from "lucide-react";
import { Question, AnswerBlock, Mapping } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";
import { FeedbackCard } from "./FeedbackCard";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  mapping?: Mapping;
  answerBlock?: AnswerBlock;
  isSelected: boolean;
  isExpanded: boolean;
  activeRegionIndex: number;
  onSelect: () => void;
  onToggleExpand: () => void;
  onSelectRegion?: (regionIndex: number) => void;
}

export function QuestionCard({
  question,
  mapping,
  answerBlock,
  isSelected,
  isExpanded,
  activeRegionIndex,
  onSelect,
  onToggleExpand,
  onSelectRegion
}: QuestionCardProps) {
  const isUnanswered = !mapping?.answerId;
  const isLowConfidence = 
    mapping?.matchConfidence === "low" || 
    answerBlock?.transcriptionConfidence === "low";

  const regionsCount = answerBlock?.regions?.length || 0;
  const isMultiRegion = regionsCount > 1;

  // Render question number / sub-part badge
  const renderNumberBadge = () => {
    if (question.parentLabel) {
      // Sub-part e.g. 11 a.
      const subLabel = question.displayLabel.replace(new RegExp(`^${question.parentLabel}\\s*[\(\.\-]?\\s*`, 'i'), '').replace(/[\)\.]/g, '');
      return (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors",
            isSelected ? "bg-brand-orange text-white" : "bg-[#4B5563] text-white"
          )}>
            {question.parentLabel}
          </div>
          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md">
            {subLabel || question.displayLabel}.
          </span>
        </div>
      );
    }

    return (
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors",
        isSelected ? "bg-brand-orange text-white" : "bg-[#4B5563] text-white"
      )}>
        {question.displayLabel.replace(/[\.\)]+$/, '')}
      </div>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border bg-white shadow-xs",
        isSelected
          ? "border-brand-orange ring-1 ring-brand-orange/30 shadow-md"
          : "border-gray-200/80 hover:border-gray-300 hover:shadow-xs"
      )}
    >
      {/* Header Row: Number + Text + Score + Chevron */}
      <div className="flex items-start gap-3">
        {renderNumberBadge()}

        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs md:text-sm font-medium text-gray-800 leading-snug">
            {question.text}
          </p>

          {/* Sub-tags: Multi-page region badge or unanswered indicator */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {isUnanswered && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                <AlertCircle size={11} />
                Unanswered in script
              </span>
            )}

            {isMultiRegion && (
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md"
                   onClick={(e) => e.stopPropagation()}>
                <Layers size={11} />
                <span>Spans {regionsCount} regions:</span>
                {answerBlock?.regions?.map((reg, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect();
                      onSelectRegion?.(idx);
                    }}
                    className={cn(
                      "px-1.5 py-0.2 rounded text-[10px] font-bold transition-colors",
                      activeRegionIndex === idx && isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                    )}
                  >
                    Pg {reg.page}
                  </button>
                ))}
              </div>
            )}

            {isLowConfidence && !isUnanswered && (
              <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                Low Confidence
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ScoreBadge
            score={mapping?.score}
            maxScore={mapping?.maxScore || question.maxScore || 2}
            isUnanswered={isUnanswered}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable Feedback / Details */}
      {isExpanded && (
        <FeedbackCard
          feedback={mapping?.feedback}
          transcribedText={answerBlock?.text}
          isLowConfidence={isLowConfidence}
          confidenceReason={mapping?.confidenceReason}
        />
      )}
    </div>
  );
}
