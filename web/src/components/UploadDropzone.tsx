"use client";

import { useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPdfPageCount } from "@/lib/pdfToImages";

export interface FileData {
  file: File;
  pageCount: number;
}

interface UploadDropzoneProps {
  label: string;
  fileData: FileData | null;
  onFileChange: (data: FileData) => void;
  onRemove: () => void;
}

export function UploadDropzone({ label, fileData, onFileChange, onRemove }: UploadDropzoneProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (selectedFile: File) => {
    setIsProcessing(true);
    try {
      let pages = 1;
      if (selectedFile.type === "application/pdf") {
        pages = await getPdfPageCount(selectedFile);
      }
      onFileChange({ file: selectedFile, pageCount: pages });
    } catch (error) {
      console.error("Error processing file:", error);
      onFileChange({ file: selectedFile, pageCount: 1 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-40 md:h-44 rounded-3xl border-2 border-dashed transition-all",
        fileData 
          ? "border-gray-200 bg-white" 
          : "border-gray-300/90 bg-white hover:bg-gray-50/60 hover:border-gray-400"
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {fileData ? (
        <div className="flex items-center gap-3.5 px-4 py-3 bg-[#F4F4F6] rounded-2xl border border-gray-200/50 shadow-2xs relative w-[88%] max-w-sm">
          {/* PDF / File Type Badge */}
          <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-extrabold text-[10px] flex-shrink-0 shadow-2xs">
            {fileData.file.type === "application/pdf" ? "PDF" : "IMG"}
          </div>

          {/* File Details */}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-xs text-gray-900 truncate">
              {fileData.file.name}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5">
              {(fileData.file.size / 1024 / 1024).toFixed(1)}MB • {fileData.pageCount} Page{fileData.pageCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Close Remove Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute -top-2.5 -right-2.5 bg-[#4A4A4A] hover:bg-black text-white p-1 rounded-full shadow-md z-10 w-5 h-5 flex items-center justify-center transition-colors cursor-pointer"
            title="Remove file"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <label className="absolute inset-0 w-full h-full cursor-pointer flex flex-col items-center justify-center p-4">
          <input 
            type="file" 
            className="hidden" 
            accept="application/pdf,image/jpeg,image/png"
            onChange={handleChange}
            disabled={isProcessing}
          />
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 border-3 border-[#FF5A36] border-t-transparent rounded-full animate-spin mb-2"></div>
              <div className="text-xs text-gray-500 font-medium">Processing pages...</div>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 bg-[#F4F4F6] rounded-xl flex items-center justify-center mb-2.5 text-gray-600">
                <Upload size={18} />
              </div>
              <div className="text-sm font-semibold text-gray-800">
                Upload <span className="text-[#FF5A36] font-bold">{label}</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5 font-medium">Max 10MB</div>
            </>
          )}
        </label>
      )}
    </div>
  );
}
