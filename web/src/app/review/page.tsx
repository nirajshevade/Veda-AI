"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QuestionList } from "@/components/QuestionList";
import { AnswerSheetViewer } from "@/components/AnswerSheetViewer";
import { GradingSummary } from "@/components/GradingSummary";
import { Header } from "@/components/Header";
import { PipelineResult, Question, AnswerBlock, Mapping, AnswerRegion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { loadPipelineResult } from "@/lib/storage";

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<PipelineResult | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [activeRegionIndex, setActiveRegionIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<"questions" | "answersheet">("questions");

  // Draggable split pane state
  const [splitPercent, setSplitPercent] = useState<number>(42);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await loadPipelineResult();
        if (result) {
          setData(result);
          initSelection(result);
        } else {
          router.push("/upload");
        }
      } catch (e) {
        console.error("Failed to load pipeline results from storage:", e);
        router.push("/upload");
      }
    }
    loadData();
  }, [router]);

  // Handle resizing drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const newPercent = (currentX / rect.width) * 100;
      if (newPercent >= 22 && newPercent <= 72) {
        setSplitPercent(newPercent);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current || e.touches.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.touches[0].clientX - rect.left;
      const newPercent = (currentX / rect.width) * 100;
      if (newPercent >= 22 && newPercent <= 72) {
        setSplitPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  const initSelection = (dataset: PipelineResult) => {
    const initialQ = dataset.questions.find(q => q.id === "2") || dataset.questions[0];
    if (initialQ) {
      selectQuestion(initialQ.id, dataset);
    }
  };

  const selectQuestion = (questionId: string, currentData = data) => {
    if (!currentData) return;
    setSelectedQuestionId(questionId);
    setActiveRegionIndex(0);

    const mapping = currentData.mappings.find(m => m.questionId === questionId);
    if (mapping && mapping.answerId) {
      setSelectedAnswerId(mapping.answerId);
      const ans = currentData.answers.find(a => a.id === mapping.answerId);
      if (ans && ans.regions.length > 0) {
        setCurrentPage(ans.regions[0].page);
      }
    } else {
      setSelectedAnswerId(null);
    }
  };

  const selectUnmatchedAnswer = (answerId: string) => {
    if (!data) return;
    setSelectedQuestionId(null);
    setSelectedAnswerId(answerId);
    setActiveRegionIndex(0);

    const ans = data.answers.find(a => a.id === answerId);
    if (ans && ans.regions.length > 0) {
      setCurrentPage(ans.regions[0].page);
    }
  };

  const handleSelectRegion = (regionIndex: number) => {
    setActiveRegionIndex(regionIndex);
    if (!data || !selectedAnswerId) return;
    const ans = data.answers.find(a => a.id === selectedAnswerId);
    if (ans && ans.regions[regionIndex]) {
      setCurrentPage(ans.regions[regionIndex].page);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#FF5A36] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Active answer regions to highlight
  let activeRegions: AnswerRegion[] = [];
  let highlightLabel: string | undefined = undefined;

  if (selectedAnswerId) {
    const ans = data.answers.find(a => a.id === selectedAnswerId);
    if (ans) {
      activeRegions = ans.regions;
      if (selectedQuestionId) {
        const q = data.questions.find(item => item.id === selectedQuestionId);
        if (q) {
          const raw = q.displayLabel.trim();
          highlightLabel = raw.toUpperCase().startsWith("Q") ? raw : `Q${raw.replace(/[\.\)]/g, '')}`;
        } else {
          highlightLabel = ans.detectedLabel || "Answer";
        }
      } else {
        highlightLabel = ans.detectedLabel || "Unmatched";
      }
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Top Header */}
      <Header showBack={true} backHref="/upload" />

      {/* Mobile Tab Toggle Pills (Matching Figma Phone Layout) */}
      <div className="flex md:hidden items-center justify-center py-2.5 px-4 bg-gray-50 border-b border-gray-100 flex-shrink-0">
        <div className="bg-gray-200/90 p-1 rounded-full flex w-full max-w-xs shadow-inner">
          <button
            onClick={() => setMobileTab("questions")}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-full transition-all text-center",
              mobileTab === "questions"
                ? "bg-[#222222] text-white shadow-md"
                : "text-gray-600 hover:text-black"
            )}
          >
            Questions
          </button>
          <button
            onClick={() => setMobileTab("answersheet")}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-full transition-all text-center",
              mobileTab === "answersheet"
                ? "bg-[#222222] text-white shadow-md"
                : "text-gray-600 hover:text-black"
            )}
          >
            Answer Sheet
          </button>
        </div>
      </div>

      {/* Main Review Workspace with Draggable Middle Splitter */}
      <div className="flex-1 flex overflow-hidden relative" ref={containerRef}>
        {/* Left Pane: Summary + Questions List */}
        <div 
          style={{ width: typeof window !== "undefined" && window.innerWidth >= 768 ? `${splitPercent}%` : undefined }}
          className={cn(
            "w-full md:w-auto flex flex-col h-full overflow-hidden p-4 md:p-5 border-r border-gray-100 bg-[#FCFCFD] flex-shrink-0",
            isDragging && "select-none",
            mobileTab === "questions" ? "flex" : "hidden md:flex"
          )}
        >
          {/* Grading Assessment Summary */}
          <GradingSummary
            questions={data.questions}
            mappings={data.mappings}
          />

          {/* Extracted Questions List */}
          <div className="flex-1 overflow-hidden">
            <QuestionList
              questions={data.questions}
              answers={data.answers}
              mappings={data.mappings}
              selectedQuestionId={selectedQuestionId}
              selectedAnswerId={selectedAnswerId}
              activeRegionIndex={activeRegionIndex}
              onSelectQuestion={(id) => {
                selectQuestion(id);
              }}
              onSelectUnmatchedAnswer={selectUnmatchedAnswer}
              onSelectRegion={handleSelectRegion}
            />
          </div>
        </div>

        {/* Draggable Vertical Splitter Divider with 3 Dots */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onTouchStart={() => setIsDragging(true)}
          className={cn(
            "hidden md:flex items-center justify-center w-4 -mx-2 z-30 cursor-col-resize select-none group relative h-full flex-shrink-0",
            isDragging && "cursor-col-resize"
          )}
          title="Drag left or right to adjust split ratio"
        >
          {/* Center Dividing Line */}
          <div className={cn(
            "w-[2px] h-full transition-colors",
            isDragging ? "bg-[#FF5A36]" : "bg-gray-200 group-hover:bg-[#FF5A36]/60"
          )} />

          {/* Floating Pill Handle with 3 Vertical Dots */}
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-10 bg-white rounded-full shadow-md border flex flex-col items-center justify-center gap-1 transition-all",
            isDragging 
              ? "border-[#FF5A36] shadow-lg scale-105 ring-2 ring-[#FF5A36]/20" 
              : "border-gray-200 group-hover:border-[#FF5A36] group-hover:shadow-md"
          )}>
            <span className={cn("w-1 h-1 rounded-full transition-colors", isDragging ? "bg-[#FF5A36]" : "bg-gray-400 group-hover:bg-[#FF5A36]")} />
            <span className={cn("w-1 h-1 rounded-full transition-colors", isDragging ? "bg-[#FF5A36]" : "bg-gray-400 group-hover:bg-[#FF5A36]")} />
            <span className={cn("w-1 h-1 rounded-full transition-colors", isDragging ? "bg-[#FF5A36]" : "bg-gray-400 group-hover:bg-[#FF5A36]")} />
          </div>
        </div>

        {/* Right Pane: Answer Sheet Viewer */}
        <div className={cn(
          "flex-1 h-full overflow-hidden p-3 md:p-5 bg-[#F5F5F7]",
          mobileTab === "answersheet" ? "flex" : "hidden md:flex"
        )}>
          <AnswerSheetViewer
            pageImages={data.answerPageImages}
            activeRegions={activeRegions}
            activeRegionIndex={activeRegionIndex}
            highlightLabel={highlightLabel}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
