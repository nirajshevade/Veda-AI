"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Menu, X, ChevronDown, ClipboardList, HelpCircle, Sparkles, Settings, ChevronsRight, Building2, Shield, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProfileDropdown } from "./ProfileDropdown";
import { SettingsModal } from "./SettingsModal";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { FeatureModal, FeatureModalData } from "./FeatureModal";
import { clearPipelineResult } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
}

export function Header({ showBack = true, backHref = "/upload" }: HeaderProps) {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [featureModalData, setFeatureModalData] = useState<FeatureModalData | null>(null);

  const handleBack = async () => {
    await clearPipelineResult();
    router.push(backHref);
  };

  const openHelpGuide = () => {
    setFeatureModalData({
      title: "Help & User Guide",
      tag: "Support",
      icon: <HelpCircle size={20} />,
      overview: "Comprehensive faculty guide on automated OCR assessment extraction, handwriting transcription, and bounding box synchronization.",
      purpose: "Enables educators to rapidly resolve edge-case handwriting, multi-page continuations, and out-of-order student responses with zero manual cross-referencing.",
      capabilities: [
        "Upload multi-page question papers and student handwriting in PDF, PNG, or JPEG.",
        "Automatic separation of nested sub-questions like 11(a) and 11(b) into distinct cards.",
        "Page-accurate bounding box overlays mapped directly over the student's physical ink.",
        "Zero score assignment for completely blank questions without pipeline crashing."
      ]
    });
  };

  const openAiGuide = () => {
    setFeatureModalData({
      title: "AI Assessment Engine",
      tag: "Vision AI",
      icon: <Sparkles size={20} />,
      overview: "Powered by Google Gemini 3.5 Flash vision heuristics for academic handwriting OCR and pedagogical marking.",
      purpose: "Automates the tedious task of locating handwritten answers across multi-page scripts while providing constructive grading feedback.",
      capabilities: [
        "High-fidelity handwriting recognition across messy, cursive, and technical scientific text.",
        "Deterministic sub-part normalization and out-of-sequence answer matching.",
        "Automated partial-credit scoring aligned with standard pedagogical marking rubrics."
      ]
    });
  };

  const openFacility = (type: string) => {
    setShowMobileMenu(false);
    if (type === "Home") {
      setFeatureModalData({
        title: "Home Dashboard",
        tag: "Overview",
        icon: <Image src="/Icon.png" alt="Home" width={22} height={22} className="object-contain" />,
        overview: "Centralized faculty dashboard summarizing recent examinations, evaluation turnaround times, and classroom mastery scores.",
        purpose: "Provides faculty with high-level academic intelligence on batch performance trends across academic units.",
        capabilities: [
          "Real-time evaluation statistics and average question scores across sections.",
          "Quick access to recently processed answer sheets and pending evaluations.",
          "One-click export of batch gradebooks to institutional LMS."
        ]
      });
    } else if (type === "Classroom") {
      setFeatureModalData({
        title: "My Classroom Management",
        tag: "Classes",
        icon: <Image src="/Vector.png" alt="My Classroom" width={22} height={22} className="object-contain" />,
        overview: "Student roster, division management, and performance tracking across enrolled batches at AISSMS IOIT.",
        purpose: "Maintains structured student registries for seamless mapping of student roll numbers to evaluated answer sheets.",
        capabilities: [
          "Manage student rosters for IT and AI & Data Science divisions.",
          "Individual student progress portfolios with historical question-wise breakdown.",
          "Automated attendance integration with exam submission logs."
        ]
      });
    } else if (type === "Assignments") {
      setFeatureModalData({
        title: "Continuous Assessment & Assignments",
        tag: "Coursework",
        icon: <Image src="/file-text.png" alt="Assignments" width={22} height={22} className="object-contain" />,
        overview: "Continuous evaluation module for lab assignments, mini-projects, and periodic homework submissions.",
        purpose: "Enables rubric-based marking of formative student work with detailed stepwise feedback.",
        capabilities: [
          "Create custom rubric schemas with custom mark weights per problem statement.",
          "Batch scan student assignment sheets with automated formula verification.",
          "Generate pedagogical correction notes for student review."
        ]
      });
    } else if (type === "Library") {
      setFeatureModalData({
        title: "Question Bank & Syllabus Library",
        tag: "Repository",
        icon: <Image src="/Icon (2).png" alt="My Library" width={22} height={22} className="object-contain" />,
        overview: "Archived repository of Bloom's taxonomy mapped question banks, past university exam papers, and standardized marking schemes.",
        purpose: "Allows teachers to quickly cross-reference standardized questions and reuse verified rubrics across semesters.",
        capabilities: [
          "Searchable archive of SPPU and departmental question papers.",
          "Tagged by topic, difficulty, and cognitive level (Recall, Application, Analysis).",
          "Pre-built model answers for instant baseline matching."
        ]
      });
    } else if (type === "Toolkit") {
      setFeatureModalData({
        title: "AI Teacher's Toolkit",
        tag: "AI Suite",
        icon: <Image src="/Frame 18.png" alt="AI Toolkit" width={22} height={22} className="object-contain" />,
        overview: "Specialized suite of assistive AI tools engineered to accelerate exam drafting, rubric creation, and answer key generation.",
        purpose: "Eliminates administrative overhead so teachers can focus on personalized student mentoring and pedagogical guidance.",
        capabilities: [
          "Automated Question Paper Builder aligned to course outcome matrices.",
          "Stepwise Rubric Generator with partial-credit criteria.",
          "Answer Key Extractor from reference textbook pages."
        ]
      });
    } else if (type === "School") {
      setFeatureModalData({
        title: "AISSMS IOIT, Pune",
        tag: "Institution",
        icon: <Image src="/Frame 39959.png" alt="AISSMS IOIT Emblem" width={24} height={24} className="object-contain" />,
        overview: "All India Shri Shivaji Memorial Society's Institute of Information Technology, Pune. Affiliated to Savitribai Phule Pune University (SPPU), NAAC 'A' Grade accredited.",
        purpose: "Departmental portal for continuous internal evaluation and academic assessment management.",
        capabilities: [
          "Faculty In-charge: Niraj Shevade (Department of IT / AI & DS).",
          "Campus: Kennedy Road, Near RTO, Pune - 411001.",
          "Academic Year: 2025-2026 (Semester Evaluation)."
        ]
      });
    }
  };

  const openCertification = () => {
    setFeatureModalData({
      title: "Teacher Certification & Profile",
      tag: "Faculty Profile",
      icon: (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-2xs">
          <Image src="/Niraj-Photo.png" alt="Niraj Shevade" width={32} height={32} className="object-cover object-top w-full h-full scale-110" />
        </div>
      ),
      overview: "Faculty and Lead Architect of VedaAI Assessment Intelligence platform.",
      purpose: "Official academic and institutional profile for Niraj Shevade at AISSMS IOIT, Pune.",
      capabilities: [
        "Faculty In-charge: Niraj Shevade.",
        "Institution: AISSMS IOIT, Pune (All India Shri Shivaji Memorial Society's Institute of Information Technology).",
        "Department: Department of Information Technology / AI & Data Science.",
        "Affiliation: Savitribai Phule Pune University (SPPU).",
        "Academic Year: 2025-2026."
      ]
    });
  };

  const openPrivacyPolicy = () => {
    setFeatureModalData({
      title: "Privacy & Evaluation Security Policy",
      tag: "Policies",
      icon: <Shield size={22} className="text-[#FF5A36]" />,
      overview: "Guidelines and data protection standards governing student answer sheet evaluation on VedaAI.",
      purpose: "Ensures compliance with institutional student data privacy, zero-retention principles, and AI grading transparency.",
      capabilities: [
        "1. Zero Remote Data Retention: Assessment sheets are processed in client-side memory and temporary browser IndexedDB. No student work is permanently retained on remote databases.",
        "2. Encrypted AI Vision Processing: All OCR and grading payloads are encrypted in-transit over HTTPS directly to Google Gemini API.",
        "3. Pedagogical AI Transparency: AI-suggested marks are advisory aids. Human faculty evaluators retain ultimate authority over final score entry.",
        "4. Academic Confidentiality: Evaluators must only upload authorized student examination scripts adhering to institutional FERPA and academic privacy standards."
      ]
    });
  };

  const openSignOutNotice = () => {
    setFeatureModalData({
      title: "Authentication & Session Notice",
      tag: "Session Info",
      icon: <LogOut size={22} className="text-rose-500" />,
      overview: "No Authentication Required.",
      purpose: "VedaAI is designed for friction-free faculty evaluation with zero-login, client-side session processing per PRD specifications.",
      capabilities: [
        "No user login or authentication service is enabled on this instance.",
        "Active evaluation state is maintained locally in your browser memory and IndexedDB.",
        "To reset your active workspace, click the Back (<--) arrow in the header or clear your browser cache."
      ]
    });
  };

  return (
    <>
      <header className="flex items-center justify-between w-full h-14 md:h-16 px-3.5 md:px-8 border-b border-gray-100 flex-shrink-0 bg-white relative">
        {/* Left: Mobile Menu / Back + Logo */}
        <div className="flex items-center gap-2 text-gray-700">
          {/* Mobile Back Button */}
          {showBack ? (
            <button
              onClick={handleBack}
              className="p-1.5 text-gray-700 hover:text-black transition-colors rounded-full hover:bg-gray-100 cursor-pointer flex items-center gap-1.5"
              title="Go back"
            >
              <ArrowLeft size={18} />
              <div className="flex md:hidden items-center gap-1.5">
                <Image src="/Frame 1618872393.png" alt="VedaAI" width={22} height={22} className="rounded object-contain" />
                <span className="font-bold text-gray-900 text-sm">VedaAI</span>
              </div>
            </button>
          ) : (
            <div className="flex md:hidden items-center gap-1.5">
              <Image src="/Frame 1618872393.png" alt="VedaAI" width={22} height={22} className="rounded object-contain" />
              <span className="font-bold text-gray-900 text-sm">VedaAI</span>
            </div>
          )}

          {/* Desktop Breadcrumb */}
          <Link href="/upload" className="hidden md:flex items-center gap-1.5 font-medium text-xs md:text-sm text-gray-600 hover:text-black transition-colors">
            <ClipboardList size={16} className="text-gray-400" />
            <span>Exams</span>
          </Link>
        </div>

        {/* Right User & Tools Menu */}
        <div className="flex items-center gap-2 sm:gap-3.5 relative">
          {/* Help Button */}
          <button 
            onClick={openHelpGuide}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            title="Help & User Guide"
          >
            <Image src="/Frame 1984077296.png" alt="Help" width={18} height={18} className="opacity-80" />
          </button>

          {/* Bell Icon with Empty Notifications State */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Image src="/Icon (3).png" alt="Notifications" width={17} height={17} className="object-contain opacity-75" />
            </button>

            <NotificationsDropdown 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
            />
          </div>

          {/* Sparkles Icon */}
          <button 
            onClick={openAiGuide}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            title="AI Vision Features"
          >
            <Image src="/Frame 1984077963.png" alt="Sparkles" width={16} height={16} className="opacity-80" />
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <div 
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 pl-1 sm:pl-2 cursor-pointer hover:bg-gray-50 py-1 px-1.5 sm:px-2 rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200/90 shadow-2xs relative">
                <Image 
                  src="/Niraj-Photo.png" 
                  alt="Niraj Shevade" 
                  width={36} 
                  height={36} 
                  className="object-cover object-top w-full h-full scale-110" 
                />
              </div>
              <span className="text-xs font-bold text-gray-900 hidden sm:inline">Niraj Shevade</span>
              <ChevronDown size={14} className="text-gray-400 hidden sm:inline" />
            </div>

            <ProfileDropdown 
              isOpen={showProfile} 
              onClose={() => setShowProfile(false)} 
              onOpenSettings={() => setShowSettings(true)}
              onOpenCertification={openCertification}
              onOpenPrivacy={openPrivacyPolicy}
              onSignOut={openSignOutNotice}
            />
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex md:hidden p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Navigation */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-72 bg-white h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <Image src="/Frame 1984077293.png" alt="VedaAI" width={100} height={28} className="object-contain" />
                <button 
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* AI Toolkit Button */}
              <button 
                onClick={() => openFacility("Toolkit")}
                className="flex items-center gap-2.5 w-full bg-[#2A2A2A] text-white py-2 px-3 rounded-full border border-[#FF5A36] text-xs font-semibold"
              >
                <Image src="/Frame 18.png" alt="Sparkles" width={18} height={18} className="object-contain" />
                <span>AI Teacher's Toolkit</span>
              </button>

              {/* Navigation list */}
              <div className="space-y-1 pt-1">
                <button 
                  onClick={() => openFacility("Home")}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Image src="/Icon.png" alt="Home" width={16} height={16} className="object-contain opacity-70" />
                  <span>Home</span>
                </button>

                <button 
                  onClick={() => openFacility("Classroom")}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Image src="/Vector.png" alt="My Classroom" width={16} height={16} className="object-contain opacity-70" />
                  <span>My Classroom</span>
                </button>

                <button 
                  onClick={() => openFacility("Assignments")}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Image src="/file-text.png" alt="Assignments" width={16} height={16} className="object-contain opacity-70" />
                  <span>Assignments</span>
                </button>

                <Link
                  href="/upload"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-black bg-[#F4F4F6]"
                >
                  <Image src="/Icon (1).png" alt="Exams" width={16} height={16} className="object-contain" />
                  <span>Exams</span>
                </Link>

                <button 
                  onClick={() => openFacility("Library")}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Image src="/Icon (2).png" alt="My Library" width={16} height={16} className="object-contain opacity-70" />
                  <span>My Library</span>
                </button>
              </div>
            </div>

            {/* Bottom section */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <button 
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowSettings(true);
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-xl"
              >
                <Settings size={16} className="text-gray-400" />
                <span>Settings</span>
              </button>

              <div 
                onClick={() => openFacility("School")}
                className="flex items-center gap-2.5 bg-[#F8F8FA] p-2 rounded-2xl border border-gray-100 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs flex-shrink-0 p-1 border border-gray-100 overflow-hidden">
                  <Image src="/Frame 39959.png" alt="AISSMS IOIT" width={22} height={22} className="object-contain" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold text-gray-900 truncate">AISSMS IOIT, Pune</span>
                  <span className="text-[10px] text-gray-400 truncate">Pune, Maharashtra</span>
                </div>
                <ChevronsRight size={14} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <FeatureModal 
        data={featureModalData} 
        isOpen={Boolean(featureModalData)} 
        onClose={() => setFeatureModalData(null)} 
      />
    </>
  );
}
