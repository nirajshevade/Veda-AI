"use client";

import React, { useState } from "react";
import { X, Settings, Key, Sliders, CheckCircle2 } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [model, setModel] = useState("gemini-2.5-flash");
  const [strictness, setStrictness] = useState("Balanced");
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Settings & Preferences</h3>
              <p className="text-xs text-gray-400">Configure AI model engine & evaluation heuristics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-gray-700">
          {/* AI Model Selection */}
          <div>
            <label className="font-bold text-gray-900 block mb-1.5 flex items-center gap-1.5">
              <Key size={14} className="text-[#FF5A36]" />
              Vision & OCR AI Engine
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-[#F8F8FA] text-xs font-semibold focus:outline-none focus:border-[#FF5A36]"
            >
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Recommended - Ultra-Fast Vision & OCR)</option>
              <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Lightweight & Low Latency)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            </select>
          </div>

          {/* Grading Strictness */}
          <div>
            <label className="font-bold text-gray-900 block mb-1.5 flex items-center gap-1.5">
              <Sliders size={14} className="text-[#FF5A36]" />
              Marking Strictness
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Lenient", "Balanced", "Strict"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setStrictness(level)}
                  className={`py-2 px-3 rounded-xl font-bold transition-all text-xs cursor-pointer border ${
                    strictness === level
                      ? "bg-[#222222] text-white border-[#222222] shadow-xs"
                      : "bg-[#F8F8FA] text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Detail */}
          <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-gray-100">
            <span className="font-bold text-gray-900 block mb-1">Environment Config</span>
            <p className="text-gray-500 leading-relaxed text-[11px]">
              API credentials are automatically loaded from <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-800">web/.env.local</code> on the backend server.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          {showSavedToast ? (
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold animate-in fade-in">
              <CheckCircle2 size={14} /> Saved!
            </span>
          ) : (
            <div></div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-gray-500 hover:text-gray-800 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-full bg-[#222222] hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
