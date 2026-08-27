"use client";

import React from "react";
import { X, Sparkles, BookOpen, Wand2, FileSpreadsheet, Bot, CheckCircle } from "lucide-react";

interface ToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToolkitModal({ isOpen, onClose }: ToolkitModalProps) {
  if (!isOpen) return null;

  const tools = [
    {
      icon: <Sparkles className="text-[#FF5A36]" size={20} />,
      title: "AI Assessment & Answer Mapping",
      desc: "Automatically map question papers to student handwriting with page-accurate bbox highlights.",
      status: "Active",
      active: true
    },
    {
      icon: <Wand2 className="text-purple-600" size={20} />,
      title: "Question Paper Generator",
      desc: "Create Bloom's Taxonomy aligned test papers with blueprint schemas in seconds.",
      status: "Ready",
      active: false
    },
    {
      icon: <BookOpen className="text-blue-600" size={20} />,
      title: "Automated Rubric Builder",
      desc: "Generate stepwise marking criteria and partial-credit guidelines for complex essay questions.",
      status: "Ready",
      active: false
    },
    {
      icon: <FileSpreadsheet className="text-emerald-600" size={20} />,
      title: "Batch Class Gradebook Sync",
      desc: "Export grade sheets and question-wise mastery reports directly to Excel or Google Sheets.",
      status: "Ready",
      active: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2A2A2A] text-white flex items-center justify-center border border-[#FF5A36]">
              <Sparkles size={16} className="text-[#FF5A36]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">AI Teacher's Toolkit</h3>
              <p className="text-xs text-gray-400">Intelligent teaching and evaluation modules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tools Grid */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {tools.map((tool, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                tool.active 
                  ? "bg-[#FFEBE5]/30 border-[#FF5A36]/40 shadow-xs" 
                  : "bg-[#F8F8FA] border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white shadow-2xs flex-shrink-0 border border-gray-100">
                  {tool.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-gray-900">{tool.title}</span>
                    {tool.active && (
                      <span className="bg-[#FF5A36] text-white text-[10px] font-extrabold px-2 py-0.2 rounded-full">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
                </div>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                tool.active ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"
              }`}>
                {tool.status}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#222222] hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
