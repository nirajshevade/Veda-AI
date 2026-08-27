"use client";

import React, { useRef, useEffect } from "react";
import { Bell, BellOff, X, CheckCheck } from "lucide-react";

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={ref}
      className="absolute right-0 top-11 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#FF5A36]" />
          <span className="font-bold text-xs text-gray-900">Notifications</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Empty State - No Notifications */}
      <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-3">
          <BellOff size={22} className="opacity-70" />
        </div>
        <h4 className="font-bold text-xs text-gray-800 mb-1">No New Notifications</h4>
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-[200px]">
          You are all caught up! Real-time grading progress and system alerts will appear here.
        </p>
      </div>

      <div className="pt-2.5 border-t border-gray-100 flex items-center justify-center">
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <CheckCheck size={13} className="text-emerald-500" />
          Status: Active & Connected
        </span>
      </div>
    </div>
  );
}
