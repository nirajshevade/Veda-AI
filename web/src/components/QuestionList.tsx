"use client";

import React, { useState } from "react";
import { Question, AnswerBlock, Mapping } from "@/lib/types";
import { QuestionCard } from "./QuestionCard";
import { HelpCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionListProps {
  questions: Question[];
  answers: AnswerBlock[];
  mappings: Mapping[];
  selectedQuestionId: string | null;
  selectedAnswerId: string | null;
  activeRegionIndex: number;
  onSelectQuestion: (questionId: string) => void;
  onSelectUnmatchedAnswer: (answerId: string) => void;
  onSelectRegion: (regionIndex: number) => void;
}

export function QuestionList({
  questions,
  answers,
  mappings,
  selectedQuestionId,
  selectedAnswerId,
  activeRegionIndex,
  onSelectQuestion,
  onSelectUnmatchedAnswer,
  onSelectRegion
}: QuestionListProps) {
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  const answerMap = new Map<string, AnswerBlock>(answers.map(a => [a.id, a]));
  const mappingByQuestionId = new Map<string, Mapping>(
    mappings.filter(m => m.questionId !== null).map(m => [m.questionId!, m])
  );

  const unmatchedMappings = mappings.filter(m => m.questionId === null && m.answerId !== null);

  const allExpanded = questions.length > 0 && expandedCardIds.size === questions.length;

  const handleToggleExpandAll = () => {
    if (allExpanded) {
      setExpandedCardIds(new Set());
    } else {
      setExpandedCardIds(new Set(questions.map(q => q.id)));
    }
  };

  const handleToggleCard = (id: string) => {
    setExpandedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFBFC] rounded-3xl p-4 md:p-6 overflow-y-auto">
      {/* List Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-gray-100 flex-shrink-0">
        <div>
          <h2 className="text-base md:text-lg font-bold text-gray-900">
            Extracted Questions <span className="text-gray-400 font-normal text-xs md:text-sm">(from question paper)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {questions.length} Questions extracted • {mappings.filter(m => m.answerId && m.questionId).length} Matched
          </p>
        </div>

        <button
          onClick={handleToggleExpandAll}
          className="text-xs font-semibold text-gray-600 hover:text-black bg-white hover:bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 transition-colors shadow-2xs"
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Questions Stack */}
      <div className="flex flex-col gap-3 flex-1 pb-6">
        {questions.map((question) => {
          const mapping = mappingByQuestionId.get(question.id);
          const answerBlock = mapping?.answerId ? answerMap.get(mapping.answerId) : undefined;
          const isSelected = selectedQuestionId === question.id;
          const isExpanded = expandedCardIds.has(question.id) || isSelected;

          return (
            <QuestionCard
              key={question.id}
              question={question}
              mapping={mapping}
              answerBlock={answerBlock}
              isSelected={isSelected}
              isExpanded={isExpanded}
              activeRegionIndex={activeRegionIndex}
              onSelect={() => onSelectQuestion(question.id)}
              onToggleExpand={() => handleToggleCard(question.id)}
              onSelectRegion={onSelectRegion}
            />
          );
        })}

        {/* Scenario 4: Unmatched Answers Section */}
        {unmatchedMappings.length > 0 && (
          <div className="mt-6 pt-4 border-t-2 border-dashed border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-amber-600" />
              <h3 className="text-xs md:text-sm font-bold text-gray-900">
                Unmatched Answers <span className="text-amber-600 font-normal">({unmatchedMappings.length})</span>
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              These answer blocks were found on the student's answer sheet but did not match any printed question label.
            </p>

            <div className="flex flex-col gap-2.5">
              {unmatchedMappings.map((m) => {
                const ans = answerMap.get(m.answerId!);
                if (!ans) return null;
                const isSelected = selectedAnswerId === ans.id && !selectedQuestionId;

                return (
                  <div
                    key={ans.id}
                    onClick={() => onSelectUnmatchedAnswer(ans.id)}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all cursor-pointer bg-white shadow-2xs",
                      isSelected
                        ? "border-amber-500 ring-1 ring-amber-400/40 bg-amber-50/20"
                        : "border-amber-100 hover:border-amber-300"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        {ans.detectedLabel || "Unlabeled Block"}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Pg {ans.regions[0]?.page || 1}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 italic line-clamp-2">
                      "{ans.text}"
                    </p>
                    <p className="text-[11px] text-amber-600 mt-2 font-medium">
                      {m.confidenceReason || "No matching question on paper"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
