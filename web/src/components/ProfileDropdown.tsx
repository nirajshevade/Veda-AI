"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Award, Shield, LogOut, ChevronRight, Settings } from "lucide-react";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenCertification: () => void;
  onOpenPrivacy: () => void;
  onSignOut: () => void;
}

export function ProfileDropdown({ 
  isOpen, 
  onClose, 
  onOpenSettings,
  onOpenCertification,
  onOpenPrivacy,
  onSignOut
}: ProfileDropdownProps) {
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
      className="absolute right-0 top-12 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Profile Header */}
      <div 
        onClick={() => { onClose(); onOpenCertification(); }}
        className="flex items-center gap-3 p-2.5 bg-[#F8F8FA] hover:bg-gray-100/80 rounded-2xl border border-gray-100 mb-2 cursor-pointer transition-colors"
        title="View Teacher Profile"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200/90 shadow-2xs flex-shrink-0 relative">
          <Image 
            src="/Niraj-Photo.png" 
            alt="Niraj Shevade" 
            width={48} 
            height={48} 
            className="object-cover object-top w-full h-full scale-110" 
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-xs text-gray-900 truncate">Niraj Shevade</span>
          <span className="text-[10px] text-gray-500 truncate">Faculty & Developer</span>
          <span className="text-[10px] text-[#FF5A36] font-semibold truncate">AISSMS IOIT, Pune</span>
        </div>
      </div>

      {/* Menu Options */}
      <div className="flex flex-col gap-0.5 text-xs text-gray-700">
        <button 
          onClick={() => { onClose(); onOpenSettings(); }}
          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Settings size={15} className="text-gray-400" />
            <span>Grading Preferences</span>
          </div>
          <ChevronRight size={14} className="text-gray-400" />
        </button>

        <button 
          onClick={() => { onClose(); onOpenCertification(); }}
          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Award size={15} className="text-gray-400" />
            <span>Teacher Certification</span>
          </div>
          <ChevronRight size={14} className="text-gray-400" />
        </button>

        <button 
          onClick={() => { onClose(); onOpenPrivacy(); }}
          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Shield size={15} className="text-gray-400" />
            <span>Privacy & Security</span>
          </div>
          <ChevronRight size={14} className="text-gray-400" />
        </button>
      </div>

      <div className="pt-2 mt-1 border-t border-gray-100">
        <button 
          onClick={() => { onClose(); onSignOut(); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold cursor-pointer"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
