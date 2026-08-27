"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings, ChevronsRight, ChevronsLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsModal } from "./SettingsModal";
import { FeatureModal, FeatureModalData } from "./FeatureModal";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeItem, setActiveItem] = useState("Exams");
  const [modalData, setModalData] = useState<FeatureModalData | null>(null);

  const openHomeModal = () => {
    setActiveItem("Home");
    setModalData({
      title: "Home Dashboard",
      tag: "Overview",
      icon: <Image src="/Icon.png" alt="Home" width={24} height={24} className="object-contain" />,
      overview: "Centralized faculty dashboard summarizing recent examinations, evaluation turnaround times, and classroom mastery scores.",
      purpose: "Provides faculty with high-level academic intelligence on batch performance trends across academic units.",
      capabilities: [
        "Real-time evaluation statistics and average question scores across sections.",
        "Quick access to recently processed answer sheets and pending evaluations.",
        "One-click export of batch gradebooks to institutional LMS."
      ]
    });
  };

  const openClassroomModal = () => {
    setActiveItem("My Classroom");
    setModalData({
      title: "My Classroom Management",
      tag: "Classes",
      icon: <Image src="/Vector.png" alt="My Classroom" width={24} height={24} className="object-contain" />,
      overview: "Student roster, division management, and performance tracking across enrolled batches at AISSMS IOIT.",
      purpose: "Maintains structured student registries for seamless mapping of student roll numbers to evaluated answer sheets.",
      capabilities: [
        "Manage student rosters for IT and AI & Data Science divisions.",
        "Individual student progress portfolios with historical question-wise breakdown.",
        "Automated attendance integration with exam submission logs."
      ]
    });
  };

  const openAssignmentsModal = () => {
    setActiveItem("Assignments");
    setModalData({
      title: "Continuous Assessment & Assignments",
      tag: "Coursework",
      icon: <Image src="/file-text.png" alt="Assignments" width={24} height={24} className="object-contain" />,
      overview: "Continuous evaluation module for lab assignments, mini-projects, and periodic homework submissions.",
      purpose: "Enables rubric-based marking of formative student work with detailed stepwise feedback.",
      capabilities: [
        "Create custom rubric schemas with custom mark weights per problem statement.",
        "Batch scan student assignment sheets with automated formula verification.",
        "Generate pedagogical correction notes for student review."
      ]
    });
  };

  const openLibraryModal = () => {
    setActiveItem("My Library");
    setModalData({
      title: "Question Bank & Syllabus Library",
      tag: "Repository",
      icon: <Image src="/Icon (2).png" alt="My Library" width={24} height={24} className="object-contain" />,
      overview: "Archived repository of Bloom's taxonomy mapped question banks, past university exam papers, and standardized marking schemes.",
      purpose: "Allows teachers to quickly cross-reference standardized questions and reuse verified rubrics across semesters.",
      capabilities: [
        "Searchable archive of SPPU and departmental question papers.",
        "Tagged by topic, difficulty, and cognitive level (Recall, Application, Analysis).",
        "Pre-built model answers for instant baseline matching."
      ]
    });
  };

  const openToolkitModal = () => {
    setModalData({
      title: "AI Teacher's Toolkit",
      tag: "AI Suite",
      icon: <Image src="/toolkit-icon.png" alt="AI Toolkit" width={26} height={26} className="object-contain rounded-full" />,
      overview: "Specialized suite of assistive AI tools engineered to accelerate exam drafting, rubric creation, and answer key generation.",
      purpose: "Eliminates administrative overhead so teachers can focus on personalized student mentoring and pedagogical guidance.",
      capabilities: [
        "Automated Question Paper Builder aligned to course outcome matrices.",
        "Stepwise Rubric Generator with partial-credit criteria.",
        "Answer Key Extractor from reference textbook pages."
      ]
    });
  };

  const openSchoolModal = () => {
    setModalData({
      title: "AISSMS IOIT, Pune",
      tag: "Institution",
      icon: <Image src="/Frame 39959.png" alt="AISSMS IOIT Emblem" width={26} height={26} className="object-contain" />,
      overview: "All India Shri Shivaji Memorial Society's Institute of Information Technology, Pune. Affiliated to Savitribai Phule Pune University (SPPU), NAAC 'A' Grade accredited.",
      purpose: "Departmental portal for continuous internal evaluation and academic assessment management.",
      capabilities: [
        "Faculty In-charge: Niraj Shevade (Department of IT / AI & DS).",
        "Campus: Kennedy Road, Near RTO, Pune - 411001.",
        "Academic Year: 2025-2026 (Semester Evaluation)."
      ]
    });
  };

  return (
    <>
      <aside 
        className={cn(
          "hidden md:flex flex-col h-[calc(100vh-24px)] bg-white rounded-[28px] my-3 ml-3 shadow-sm border border-gray-100 flex-shrink-0 justify-between transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16 lg:w-[68px] p-2.5 items-center" : "w-56 lg:w-60 p-4"
        )}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-4 w-full">
          {/* Logo Header & Toggle Button */}
          <div className={cn("flex items-center pt-1", isCollapsed ? "justify-center" : "justify-between px-2")}>
            <Link href="/upload" className="flex items-center gap-2" title="VedaAI">
              {isCollapsed ? (
                <Image 
                  src="/Frame 1618872393.png" 
                  alt="VedaAI Logo" 
                  width={30} 
                  height={30} 
                  className="rounded-lg object-contain" 
                  priority
                />
              ) : (
                <Image 
                  src="/Frame 1984077293.png" 
                  alt="VedaAI Logo" 
                  width={105} 
                  height={28} 
                  className="object-contain" 
                  priority
                />
              )}
            </Link>
            {!isCollapsed && (
              <button 
                onClick={() => setIsCollapsed(true)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition-colors"
                title="Collapse sidebar"
              >
                <Image src="/sidebar-toggle.svg" alt="Toggle sidebar" width={16} height={16} className="opacity-70 hover:opacity-100" />
              </button>
            )}
          </div>

          {/* AI Teacher's Toolkit Button */}
          <div className="pt-1 flex justify-center w-full">
            {isCollapsed ? (
              <button 
                onClick={openToolkitModal}
                className="w-10 h-10 rounded-full flex items-center justify-center p-0.5 bg-[#2A2A2A] hover:bg-[#383838] border border-[#FF5A36] shadow-sm transition-all cursor-pointer active:scale-95"
                title="AI Teacher's Toolkit"
              >
                <Image 
                  src="/toolkit-icon.png" 
                  alt="AI Sparkles" 
                  width={28} 
                  height={28} 
                  className="object-contain rounded-full" 
                />
              </button>
            ) : (
              <button 
                onClick={openToolkitModal}
                className="flex items-center justify-start gap-2.5 w-full bg-[#2A2A2A] hover:bg-[#383838] text-white py-2 px-3 rounded-full border border-[#FF5A36] shadow-sm transition-all text-xs font-semibold cursor-pointer active:scale-98"
              >
                <Image 
                  src="/toolkit-icon.png" 
                  alt="AI Sparkles" 
                  width={22} 
                  height={22} 
                  className="object-contain rounded-full flex-shrink-0" 
                />
                <span className="truncate">AI Teacher's Toolkit</span>
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5 mt-2 w-full">
            {/* Home */}
            <button 
              onClick={openHomeModal}
              title="Home"
              className={cn(
                "flex items-center rounded-xl text-xs font-medium transition-colors cursor-pointer",
                isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3.5 py-2.5 text-left w-full",
                activeItem === "Home" ? "bg-[#F4F4F6] text-black font-semibold shadow-2xs" : "text-gray-500 hover:bg-[#F9F9FA] hover:text-gray-900"
              )}
            >
              <Image src="/Icon.png" alt="Home" width={17} height={17} className="object-contain opacity-75" />
              {!isCollapsed && <span>Home</span>}
            </button>

            {/* My Classroom */}
            <button 
              onClick={openClassroomModal}
              title="My Classroom"
              className={cn(
                "flex items-center rounded-xl text-xs font-medium transition-colors cursor-pointer",
                isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3.5 py-2.5 text-left w-full",
                activeItem === "My Classroom" ? "bg-[#F4F4F6] text-black font-semibold shadow-2xs" : "text-gray-500 hover:bg-[#F9F9FA] hover:text-gray-900"
              )}
            >
              <Image src="/Vector.png" alt="My Classroom" width={17} height={17} className="object-contain opacity-75" />
              {!isCollapsed && <span>My Classroom</span>}
            </button>

            {/* Assignments */}
            <button 
              onClick={openAssignmentsModal}
              title="Assignments"
              className={cn(
                "flex items-center rounded-xl text-xs font-medium transition-colors cursor-pointer",
                isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3.5 py-2.5 text-left w-full",
                activeItem === "Assignments" ? "bg-[#F4F4F6] text-black font-semibold shadow-2xs" : "text-gray-500 hover:bg-[#F9F9FA] hover:text-gray-900"
              )}
            >
              <Image src="/file-text.png" alt="Assignments" width={17} height={17} className="object-contain opacity-75" />
              {!isCollapsed && <span>Assignments</span>}
            </button>

            {/* Exams */}
            <Link
              href="/upload"
              onClick={() => setActiveItem("Exams")}
              title="Exams"
              className={cn(
                "flex items-center rounded-xl text-xs font-medium transition-colors cursor-pointer",
                isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3.5 py-2.5 text-left w-full",
                activeItem === "Exams" ? "bg-[#F4F4F6] text-black font-semibold shadow-2xs" : "text-gray-500 hover:bg-[#F9F9FA] hover:text-gray-900"
              )}
            >
              <Image src="/Icon (1).png" alt="Exams" width={17} height={17} className="object-contain" />
              {!isCollapsed && <span>Exams</span>}
            </Link>

            {/* My Library */}
            <button 
              onClick={openLibraryModal}
              title="My Library"
              className={cn(
                "flex items-center rounded-xl text-xs font-medium transition-colors cursor-pointer",
                isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3.5 py-2.5 text-left w-full",
                activeItem === "My Library" ? "bg-[#F4F4F6] text-black font-semibold shadow-2xs" : "text-gray-500 hover:bg-[#F9F9FA] hover:text-gray-900"
              )}
            >
              <Image src="/Icon (2).png" alt="My Library" width={17} height={17} className="object-contain opacity-75" />
              {!isCollapsed && <span>My Library</span>}
            </button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 w-full items-center">
          {!isCollapsed && (
            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-gray-500 hover:bg-[#F9F9FA] hover:text-gray-900 text-left w-full cursor-pointer"
            >
              <Settings size={16} className="text-gray-400" />
              <span>Settings</span>
            </button>
          )}

          {/* School/College Profile Pill Card (Matching Figma Collapsed and Expanded States) */}
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2 w-full pt-1">
              <button 
                onClick={openSchoolModal}
                className="w-10 h-10 rounded-2xl bg-[#F8F8FA] hover:bg-gray-100 flex items-center justify-center p-1 border border-gray-100 shadow-2xs transition-colors cursor-pointer"
                title="AISSMS IOIT, Pune"
              >
                <Image src="/Frame 39959.png" alt="AISSMS IOIT" width={24} height={24} className="object-contain" />
              </button>
              <button 
                onClick={() => setIsCollapsed(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer mt-1"
                title="Expand sidebar"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          ) : (
            <div 
              onClick={openSchoolModal}
              className="flex items-center gap-2.5 bg-[#F8F8FA] hover:bg-gray-100 p-2 rounded-2xl border border-gray-100 transition-colors cursor-pointer w-full"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs flex-shrink-0 p-1 border border-gray-100 overflow-hidden">
                <Image src="/Frame 39959.png" alt="AISSMS IOIT" width={22} height={22} className="object-contain" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-gray-900 truncate">AISSMS IOIT, Pune</span>
                <span className="text-[10px] text-gray-400 truncate">Pune, Maharashtra</span>
              </div>
              <ChevronsRight size={14} className="text-gray-400 flex-shrink-0" />
            </div>
          )}
        </div>
      </aside>

      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <FeatureModal 
        data={modalData} 
        isOpen={Boolean(modalData)} 
        onClose={() => setModalData(null)} 
      />
    </>
  );
}
