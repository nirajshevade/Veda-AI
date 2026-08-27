"use client";

import React from "react";
import { X, CheckCircle2, ArrowRight } from "lucide-react";

export interface FeatureModalData {
  title: string;
  tag: string;
  icon: React.ReactNode;
  overview: string;
  purpose: string;
  capabilities: string[];
}

interface FeatureModalProps {
  data: FeatureModalData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FeatureModal({ data, isOpen, onClose }: FeatureModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFEBE5] text-[#FF5A36] flex items-center justify-center shadow-2xs flex-shrink-0">
              {data.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-gray-900">{data.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {data.tag}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Facility module & information guide</p>
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
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-gray-600">
          {/* Overview */}
          <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-gray-100">
            <span className="font-bold text-gray-900 block mb-1 text-xs">Module Overview</span>
            <p className="text-gray-500 leading-relaxed text-[11px]">{data.overview}</p>
          </div>

          {/* Purpose & Specific Need */}
          <div className="p-3.5 rounded-2xl bg-[#FFF8F6] border border-[#FFEBE5]">
            <span className="font-bold text-[#FF5A36] block mb-1 text-xs">Specific Pedagogical Need</span>
            <p className="text-gray-600 leading-relaxed text-[11px]">{data.purpose}</p>
          </div>

          {/* Key Capabilities */}
          <div>
            <span className="font-bold text-gray-900 block mb-2 text-xs">Key Facility Capabilities</span>
            <div className="space-y-2">
              {data.capabilities.map((cap, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-gray-50/80 border border-gray-100/80">
                  <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-gray-700 leading-snug">{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-medium">AISSMS IOIT • Faculty Portal</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#222222] hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Got It</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
