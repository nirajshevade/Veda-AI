"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadDropzone, FileData } from "@/components/UploadDropzone";
import { LoadingState } from "@/components/LoadingState";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";
import { convertFileToPageImages } from "@/lib/pdfToImages";
import { matchQuestionsToAnswers } from "@/lib/matching";
import { savePipelineResult } from "@/lib/storage";
import { PipelineResult, Question, AnswerBlock } from "@/lib/types";

export default function UploadPage() {
  const [questionData, setQuestionData] = useState<FileData | null>(null);
  const [answerData, setAnswerData] = useState<FileData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const router = useRouter();

  const handleStartMapping = async () => {
    if (!questionData || !answerData) return;
    setIsProcessing(true);
    setProcessingError(null);

    try {
      // 1. Convert user's uploaded files to page images
      const questionImages = await convertFileToPageImages(questionData.file);
      const answerImages = await convertFileToPageImages(answerData.file);

      if (questionImages.length === 0 || answerImages.length === 0) {
        throw new Error("Could not extract pages from the uploaded documents. Please ensure files are valid PDFs or images.");
      }

      const extractInBatches = async (endpoint: string, images: string[], batchSize: number) => {
        let allResults: any[] = [];
        for (let i = 0; i < images.length; i += batchSize) {
          const chunk = images.slice(i, i + batchSize);
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: chunk }),
          });
          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.error || `Extraction failed with status ${res.status}`);
          }
          const data = await res.json();
          const items = data.questions || data.answers || [];
          
          // Adjust page numbers based on batch offset
          items.forEach((item: any) => {
            if (item.page !== undefined) {
              item.page += i;
            }
            if (item.regions && Array.isArray(item.regions)) {
              item.regions.forEach((r: any) => {
                if (r.page !== undefined) r.page += i;
              });
            }
          });
          allResults = allResults.concat(items);
        }
        return allResults;
      };

      // 2. Extract questions from question paper
      const questions: Question[] = await extractInBatches("/api/extract-questions", questionImages, 3);

      if (questions.length === 0) {
        throw new Error("No questions could be detected from the uploaded question paper. Please verify the file is legible.");
      }

      // 3. Extract answers and transcribe handwriting from student answer sheet
      const answers: AnswerBlock[] = await extractInBatches("/api/extract-answers", answerImages, 3);

      // 4. Deterministic mapping algorithm on user's actual extracted content
      const initialMappings = matchQuestionsToAnswers(questions, answers);

      // 5. Automated AI grading & feedback
      let finalMappings = initialMappings;
      try {
        const gRes = await fetch("/api/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions, answers, mappings: initialMappings }),
        });
        if (gRes.ok) {
          const gData = await gRes.json();
          finalMappings = gData.mappings || initialMappings;
        }
      } catch (gradeErr) {
        console.warn("Grading service notice:", gradeErr);
      }

      // 6. Assemble pipeline result strictly using the user's uploaded page images and extracted items
      const pipelineResult: PipelineResult = {
        questions,
        answers,
        mappings: finalMappings,
        answerPageImages: answerImages,
        questionPageImages: questionImages,
      };

      // Save to high-capacity storage (IndexedDB + memoryCache)
      await savePipelineResult(pipelineResult);
      router.push("/review");
    } catch (error: any) {
      console.error("Extraction pipeline failed:", error);
      setIsProcessing(false);
      setProcessingError(error.message || "Failed to process documents. Please check your network and .env.local file.");
    }
  };

  if (isProcessing) {
    return <LoadingState error={processingError} onRetry={() => handleStartMapping()} />;
  }

  const isFilesReady = Boolean(questionData && answerData);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Top Header */}
      <Header showBack={false} />

      {/* Main Content Area - Mobile Optimized Scrolling without Top Clipping */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-4 pb-36 md:py-8 flex flex-col items-center justify-start md:justify-center">
        <div className="w-full max-w-4xl flex flex-col items-center md:my-auto">
          {/* Header Title with Light Orange Pill Badge */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-center text-gray-900 tracking-tight flex items-center justify-center flex-wrap gap-2">
            <span>Upload</span>
            <span className="bg-[#FFEBE5] text-[#FF5A36] px-3.5 py-1 rounded-full font-bold inline-block">
              Question Paper & Answer Sheets
            </span>
          </h1>
          <p className="text-gray-500 mt-2 text-xs sm:text-sm md:text-base font-normal text-center max-w-xl">
            Upload your question paper and student handwritten answer sheet to begin live OCR extraction & mapping
          </p>

          {/* Teacher Illustration */}
          <div className="my-6 relative flex items-center justify-center">
            <Image 
              src="/Frame 1618872259.png" 
              alt="Teacher illustration" 
              width={140} 
              height={140} 
              className="object-contain select-none" 
              priority 
            />
          </div>

          {/* Error Banner if any */}
          {processingError && (
            <div className="w-full max-w-lg mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Extraction Error</span>
                <span>{processingError}</span>
              </div>
              <button 
                onClick={() => setProcessingError(null)} 
                className="text-rose-400 hover:text-rose-600 cursor-pointer p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Two Upload Dropzones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            <UploadDropzone 
              label="Question Paper"
              fileData={questionData}
              onFileChange={setQuestionData}
              onRemove={() => setQuestionData(null)}
            />
            <UploadDropzone 
              label="Answer Sheet"
              fileData={answerData}
              onFileChange={setAnswerData}
              onRemove={() => setAnswerData(null)}
            />
          </div>

          {/* Start Mapping Button */}
          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={() => handleStartMapping()}
              disabled={!isFilesReady}
              className={cn(
                "flex items-center gap-2 px-8 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200",
                isFilesReady
                  ? "bg-[#222222] hover:bg-black text-white shadow-md cursor-pointer group active:scale-98"
                  : "bg-[#9E9E9E] text-white/90 cursor-not-allowed"
              )}
            >
              <span>Start Mapping</span>
              <ArrowRight size={15} className={cn(isFilesReady ? "group-hover:translate-x-1 transition-transform" : "")} />
            </button>
            <p className="text-xs text-gray-400 mt-2.5 text-center font-normal">
              Once both files are uploaded, Gemini Vision OCR extracts questions and maps handwritten answers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
