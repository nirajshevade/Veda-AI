"use client";

import Image from "next/image";
import { AlertCircle, RotateCw } from "lucide-react";

interface LoadingStateProps {
  error?: string | null;
  onRetry?: () => void;
}

export function LoadingState({ error, onRetry }: LoadingStateProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full px-4">
        <div className="flex flex-col items-center max-w-md text-center p-6 md:p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Extraction Failed</h2>
          <p className="text-gray-500 text-xs md:text-sm mb-6">{error}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="flex items-center gap-2 bg-[#222222] hover:bg-black text-white px-8 py-2.5 rounded-full font-semibold text-xs md:text-sm transition-colors shadow-md cursor-pointer active:scale-98"
            >
              <RotateCw size={16} />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full px-4">
      <div className="flex flex-col items-center justify-center animate-fade-pulse">
        <Image 
          src="/AnalysingLoader.png" 
          alt="Extracting... This may take a while" 
          width={177} 
          height={222} 
          className="w-auto h-auto max-h-[220px] max-w-[180px] object-contain select-none pointer-events-none"
          priority
        />
      </div>
    </div>
  );
}
