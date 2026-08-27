"use client";

import React from "react";
import { X, CheckCircle2, FileText, Sparkles, Layers, AlertCircle, HelpCircle } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFEBE5] text-[#FF5A36] flex items-center justify-center">
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">How VedaAI Works</h3>
              <p className="text-xs text-gray-400">Teacher's guide to automated assessment mapping</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 text-xs text-gray-600">
          <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-gray-100 flex items-start gap-3">
            <CheckCircle2 size={16} className="text-[#FF5A36] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 block mb-0.5">1. Upload Question Paper & Answer Sheet</span>
              <p className="text-gray-500 leading-relaxed">
                Accepts multi-page PDFs or scanned images. VedaAI extracts printed questions and transcribes handwritten student responses.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-gray-100 flex items-start gap-3">
            <Layers size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 block mb-0.5">2. Page-Accurate Synchronized Highlighting</span>
              <p className="text-gray-500 leading-relaxed">
                Click any question card on the left to immediately jump to the exact answer sheet page and highlight the green bounding box region.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-gray-100 flex items-start gap-3">
            <Sparkles size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 block mb-0.5">3. Multi-Parts, Multi-Page, and Out-of-Order Support</span>
              <p className="text-gray-500 leading-relaxed">
                Sub-parts like 11(a)/11(b) are separated into individual cards. Multi-page answers can be stepped through with region buttons.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-gray-100 flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 block mb-0.5">4. Unanswered & Unmatched Disclosures</span>
              <p className="text-gray-500 leading-relaxed">
                Blank questions show "Not answered" with 0 marks. Extra student answers appear in the Unmatched Answers section.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#222222] hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
