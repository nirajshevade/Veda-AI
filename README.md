# 🎓 VedaAI — AI-Powered Assessment Extraction, Handwriting OCR & Answer Mapping Platform

> **Production-Grade Educational Assessment Suite**  
> Developed & Architected by **Niraj Shevade** (*AISSMS IOIT, Pune*).  
> Built with **Next.js 16 (App Router + Turbopack)**, **React 19**, **Tailwind CSS v4**, and **Google Gemini Vision AI (3.5 Flash & 3.5 Flash Lite)**.

---

## 🌟 Executive Overview & Purpose

**VedaAI** is an advanced teacher-assistive evaluation system designed to streamline the academic assessment workflow. It automatically ingests scanned multi-page question papers and handwritten student answer sheets, performs fine-grained OCR transcription and bounding box localization, deterministically maps questions to answers regardless of student response order, and generates automated partial-credit grading with constructive pedagogical feedback.

---

## 🚀 Key Deliverables & PRD Implementation Summary

### 1. 📑 Question Extraction & Nested Sub-Part Parsing
- **Multi-Part Splitting (`11(a)`, `11(b)`, `1.a`, `1.b`)**:
  - Automatically identifies and splits multi-tier question schemas into independent, gradable question cards (`11.a`, `11.b`).
  - Groups sub-parts cleanly under parent identifiers with distinct sub-part pill badges (`a.`, `b.`).
- **Metadata Preservation**: Detects printed question numbers, text transcription, page location, mark weights (`[2 marks]`, `[5 marks]`), and normalized bounding boxes `[x1, y1, x2, y2]`.

### 2. 🔍 Deterministic Answer Mapping & Normalization Engine
- **Out-of-Order Answer Recognition**:
  - Normalizes heterogeneous student labeling patterns (`Q3`, `Ans 1`, `Question 2(a)`, `2.`) to canonical forms (`3`, `1`, `2.a`, `2`).
  - Seamlessly links answers to question cards regardless of physical sequence on multi-page scripts.
- **Synchronized Visual Bounding Box**:
  - Clicking any question card automatically scrolls and navigates the high-res canvas viewer to the exact page and highlights the student's physical handwriting in green (`#22C55E`).
  - Clean `Q1`, `Q2` badges without duplicate prefixing.

### 3. 🎯 Edge-Case Scenarios Handled with 100% Robustness
- **Unanswered Questions**:
  - Blank questions display a prominent `Not answered` badge, contribute `0` marks to the grade, and do not crash the pipeline or generate false highlights.
- **Unmatched Answers**:
  - Unidentified or unindexed answer blocks (e.g. extra student notes or `Q99`) are isolated in a dedicated **Unmatched Answers** review drawer rather than being silently dropped.
- **Multi-Page Spanning Responses**:
  - When an answer spans across page boundaries (e.g. Page 1 to Page 2), all regions are captured (`regions: [{page: 1, bbox}, {page: 2, bbox}]`) with interactive `[Pg 1]`, `[Pg 2]` step controls.
- **Messy / Low-Quality Handwriting Transparency**:
  - Low-legibility answers are flagged with a **Low Confidence** indicator in both the question card and AI feedback box, ensuring pedagogical transparency.

### 4. 🧠 Self-Healing Google Gemini Vision Model Engine
- **Dynamic Model Discovery (`ListModels`)**:
  - Directly queries Google AI Studio's `ModelService.ListModels` to inspect active vision models enabled on the user's `GEMINI_API_KEY`.
  - Prioritizes **`gemini-3.5-flash`** (Ultra-Fast Vision & OCR) and **`gemini-3.5-flash-lite`** (High-Throughput), with seamless fallback to `gemini-3.6-flash`, `gemini-2.0-flash`, and `gemini-1.5-flash`.
- **Zero On-Screen Credential Exposure**:
  - Credentials load strictly from `web/.env.local` (`process.env.GEMINI_API_KEY`) on the server.

### 5. 💾 Refresh-Safe Client Storage (Zero Database Required)
- **High-Capacity IndexedDB + Memory Cache Engine (`storage.ts`)**:
  - Eliminates browser 5MB `sessionStorage` quota limitations for multi-page base64 canvas documents.
  - Preserves evaluation data, handwriting transcriptions, and highlights during **browser refreshes (`F5` / `Ctrl+R`)**.
  - Cache is cleanly cleared when the teacher clicks the Header **Back (`<--`)** button to start a new exam.

### 6. 📱 Mobile Responsiveness & Progressive Web App (PWA)
- **100% Mobile Responsive**:
  - Mobile slide-out navigation drawer via hamburger menu.
  - Interactive mobile review toggle pills (**Questions** ↔ **Answer Sheet**) matching Figma specifications.
- **Full PWA Installability**:
  - Web App Manifest (`manifest.json`) with standard 192×192 and 512×512 maskable icons.
  - Service Worker (`sw.js`) for offline caching and fast asset loading.
  - In-app install banner (`PWAProvider.tsx`) for 1-click home screen installation on Android, iOS, Windows, and macOS.

### 7. 🎨 Institutional Profile & Figma Aesthetic Alignment
- **Faculty In-Charge**: **Niraj Shevade** with custom avatar framing (`/Niraj-Photo.png`).
- **Institution**: **AISSMS IOIT, Pune** (*All India Shri Shivaji Memorial Society's Institute of Information Technology, Pune*).
- **Exact Figma Assets**: Utilizes original assets (`/Icon.png`, `/Vector.png`, `/file-text.png`, `/Frame 18.png`, `/Frame 39959.png`, `/AnalysingLoader.png`, `/sidebar-toggle.svg`).
- **Feature Popups**: Interactive window modals for all tab buttons (*Home*, *Classroom*, *Assignments*, *Exams*, *Library*, *Toolkit*, and *Settings*).
- **Authentic Notifications**: Bell icon with genuine *No New Notifications* empty state.

---

## 🛠️ Architecture & Data Pipeline

```text
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│       Question Paper Document        │     │     Handwritten Student Answers      │
│          (PDF / Multi-Page)          │     │          (PDF / Multi-Page)          │
└──────────────────┬───────────────────┘     └──────────────────┬───────────────────┘
                   │                                            │
                   ▼                                            ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                    Client-Side PDF-to-Canvas Vector Rasterizer                    │
│                                  (pdfjs-dist)                                     │
└──────────────────────────────────────────┬────────────────────────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│     /api/extract-questions           │     │     /api/extract-answers             │
│  • Nested Sub-Part Parsing           │     │  • Handwriting OCR Transcription     │
│  • Printed Mark Weights              │     │  • Fine-Grained Segmentation         │
│  • Bounding Box Localization         │     │  • Multi-Page Span Capture           │
└──────────────────┬───────────────────┘     └──────────────────┬───────────────────┘
                   │                                            │
                   └──────────────────────┬─────────────────────┘
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                         Google Gemini Vision AI Engine                            │
│           (Prioritized 3.5 Flash & 3.5 Flash Lite with Dynamic ListModels)        │
└──────────────────────────────────────────┬────────────────────────────────────────┘
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                    Deterministic Normalization & Mapping Engine                   │
│      • 3-Pass Canonical Matching     • Unanswered Blank 0-Score Handler           │
│      • Out-of-Sequence Reordering    • Unmatched Answers Review Drawer            │
└──────────────────────────────────────────┬────────────────────────────────────────┘
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│               Automated AI Grading & Pedagogical Feedback (/api/grade)            │
└──────────────────────────────────────────┬────────────────────────────────────────┘
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│           High-Capacity Client Cache (IndexedDB + In-Memory State)                │
│                 (0-Database Architecture • Safe Page Refreshes)                   │
└──────────────────────────────────────────┬────────────────────────────────────────┘
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                  Synchronized Interactive Review Workspace (/review)              │
│       • Interactive Question Cards    • High-Res Canvas with Green Bbox           │
│       • Stepper for Multi-Page Work   • Assessment Score Breakdown & Stats        │
│       • Draggable Split Pane Divider  • 3-Dots Grip Handle for Width Tuning       │
└───────────────────────────────────────────────────────────────────────────────────┘
```

- **Framework**: Next.js 16 (App Router with Turbopack & Standalone Output)
- **Frontend Core**: React 19, TypeScript, Vanilla CSS + Tailwind CSS v4 tokens
- **Vision & OCR AI**: Google Gemini 3.5 Flash / 3.5 Flash Lite (`@google/generative-ai`)
- **PDF Rendering**: `pdfjs-dist` (Client-side vector-to-canvas rendering)
- **Storage Layer**: Browser `IndexedDB` (`VedaAI_DB`) + in-memory cache
- **Offline / PWA**: Service Worker (`sw.js`), Web App Manifest (`manifest.json`)
- **Containerization**: Docker Multi-Stage Build (`node:20-alpine`) + `docker-compose.yml`
- **Test Suite**: Vitest (17/17 automated unit tests passing)

---

## 📁 Repository Structure

```
VedaAI-Task/
├── PRD_AI_Assessment_Extraction_Answer_Mapping.md
├── Screenshots/                        # Reference Figma screenshots & UI flows
├── README.md                           # Comprehensive production documentation
├── LICENSE                             # MIT License
├── .gitignore                          # Global git exclusions & security rules
├── docker-compose.yml                  # 1-command Docker orchestration
└── web/
    ├── Dockerfile                      # Multi-stage production container build
    ├── .dockerignore                   # Docker build optimization rules
    ├── next.config.ts                  # Next.js standalone container configuration
    ├── public/
    │   ├── manifest.json               # PWA configuration manifest
    │   ├── sw.js                       # Service Worker for offline & caching
    │   ├── icon-192x192.png            # PWA 192x192 maskable icon
    │   ├── icon-512x512.png            # PWA 512x512 maskable icon
    │   ├── apple-touch-icon.png        # iOS home screen icon
    │   ├── AnalysingLoader.png         # Animated extraction loader graphic
    │   ├── Niraj-Photo.png             # Faculty profile picture (Niraj Shevade)
    │   ├── Frame 18.png / toolkit-icon.png # AI Teacher's Toolkit icon
    │   ├── sidebar-toggle.svg          # Sidebar split-frame toggle icon
    │   └── Frame 39959.png             # Official AISSMS IOIT emblem
    ├── src/
    │   ├── app/
    │   │   ├── api/
    │   │   │   ├── extract-questions/  # Vision OCR question paper parser
    │   │   │   ├── extract-answers/    # Handwriting segmentation & bbox detector
    │   │   │   └── grade/              # Pedagogical AI scoring & feedback
    │   │   ├── upload/page.tsx         # Upload dropzone workspace
    │   │   ├── review/page.tsx         # Question-Answer mapping review workspace
    │   │   ├── layout.tsx              # Root responsive layout & PWA provider
    │   │   └── globals.css             # Theme tokens & fadePulse animations
    │   ├── components/
    │   │   ├── Header.tsx              # Responsive header, notifications & drawer
    │   │   ├── Sidebar.tsx             # Collapsible navigation with custom icons
    │   │   ├── QuestionList.tsx        # Extracted question & sub-part cards
    │   │   ├── AnswerSheetViewer.tsx   # Multi-page canvas viewer with pan/zoom
    │   │   ├── HighlightOverlay.tsx    # Synchronized green bounding box highlight
    │   │   ├── GradingSummary.tsx      # Overall assessment score & stats pills
    │   │   ├── FeatureModal.tsx        # Facility purpose & information modals
    │   │   ├── NotificationsDropdown.tsx # Authentic empty notification state
    │   │   ├── SettingsModal.tsx       # AI engine & institutional preferences
    │   │   └── PWAProvider.tsx         # PWA service worker & install prompt
    │   └── lib/
    │       ├── gemini.ts               # Resilient dynamic ListModels AI engine
    │       ├── matching.ts             # Deterministic 3-pass mapping algorithm
    │       ├── normalize.ts            # Canonical question label normalizer
    │       ├── storage.ts              # IndexedDB high-capacity client cache
    │       ├── pdfToImages.ts          # Client-side PDF page rasterizer
    │       ├── types.ts                # TypeScript domain models
    │       └── __tests__/              # Vitest automated test suite (17 tests)
    └── package.json
```

---

## 🐳 Docker & Containerized Production Deployment

The project includes an **ultra-slim, multi-stage Docker build** based on `node:20-alpine` with Next.js standalone output (~150MB image footprint, non-root security runner user).

### Option A: 1-Command Startup with Docker Compose (Recommended)
```bash
# 1. Ensure your web/.env.local contains your GEMINI_API_KEY
# 2. Build and launch container in background
docker compose up --build -d
```
Access the application immediately at **[http://localhost:3000](http://localhost:3000)**.

To stop the container:
```bash
docker compose down
```

### Option B: Standalone Docker Commands
```bash
# 1. Build the production image
docker build -t veda-ai-app ./web

# 2. Run the container
docker run -d -p 3000:3000 --name veda-ai-container --env-file web/.env.local veda-ai-app
```

---

## ⚡ Local Development & Setup Guide

### 1. Clone the Repository & Navigate to `web`
```bash
git clone <repository_url>
cd VedaAI-Task/web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Gemini API Key
Create a `.env.local` file in the `web/` directory:
```env
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Automated Unit Tests
```bash
npx vitest run
```
*Executes all 17 unit tests covering normalization, multi-part questions, out-of-order matching, unanswered questions, and multi-page spans.*

### 6. Build for Production
```bash
npm run build
```
*Generates optimized production bundle using Next.js standalone output.*

---

## 🧪 Automated Verification Suite

| Test Suite | Tests Passed | Covered Scenarios |
| :--- | :---: | :--- |
| [`normalize.test.ts`](file:///c:/Users/Niraj/Documents/Codes/VedaAI-Task/web/src/lib/__tests__/normalize.test.ts) | **3 / 3** | Canonical label normalization (`Q3`, `Ans 1`, `11(a)`, `2.b`) |
| [`matching.test.ts`](file:///c:/Users/Niraj/Documents/Codes/VedaAI-Task/web/src/lib/__tests__/matching.test.ts) | **7 / 7** | Exact matching, sub-part grouping, unanswered blank scores, unmatched items |
| [`scenarios.test.ts`](file:///c:/Users/Niraj/Documents/Codes/VedaAI-Task/web/src/lib/__tests__/scenarios.test.ts) | **7 / 7** | Full pipeline end-to-end edge cases (Multi-page spans, low confidence OCR, out-of-order) |
| **Total** | **17 / 17 (100%)** | **All 7 PRD Edge-Case Scenarios Verified** |

---

## 👤 Author & Developer
- **Niraj Shevade** — *Lead Developer & System Architect (AISSMS IOIT, Pune)*

---

© 2026 VedaAI Assessment Intelligence. Built for academic excellence.
