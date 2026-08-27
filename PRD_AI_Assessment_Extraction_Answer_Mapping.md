# PRD: AI Assessment Extraction & Answer Mapping

**Project:** VedaAI Hiring Assignment
**Author:** Niraj
**Stack:** Next.js (App Router) + Tailwind CSS + Gemini API
**Deployment:** Vercel
**Status:** Draft v1

---

## 1. Problem Statement

Teachers manually cross-reference a printed/scanned question paper against a student's handwritten answer sheet to figure out what was answered, where, and how well. This is slow and error-prone, especially with multi-page answers, out-of-order responses, and sub-parted questions (e.g., 11(a), 11(b)).

**Goal:** Let a teacher upload a question paper and one student's answer sheet, and get an automatic, page-accurate mapping between each question and its corresponding answer region — with grading and feedback as a value-add.

---

## 2. Core User Flow

```
Upload (Question Paper + Answer Sheet)
      ↓
Processing (Extracting... progress state)
      ↓
Question Extraction  →  Answer Extraction  →  Answer Mapping
      ↓
Split-screen review UI:
  Left  = Questions list (scores, feedback, expandable)
  Right = Answer Sheet viewer (paginated, highlighted region synced to selected question)
      ↓
Grading Summary (per-question + overall)
```

This matches the two-tab pattern in the Figma (`Questions` / `Answer Sheet` toggle on mobile, split-pane on desktop).

---

## 3. Functional Requirements

### 3.1 Upload
- Accept PDF or images for both Question Paper and Answer Sheet.
- Max file size 10MB each (per Figma copy).
- Show file name, size, page count once uploaded; allow removal (✕) before starting.
- "Start Mapping" disabled until both files are present.
- On submit, show full-screen "Extracting... This may take a while" loading state (per Figma).

### 3.2 Question Extraction
- Extract every question in original printed order.
- Preserve original numbering exactly as printed (e.g., "11", not renumbered).
- Treat labelled sub-parts as **separate entries**: `11(a)` and `11(b)` → two distinct question objects, both tagged with parent `11` for grouping/display but independently mappable and gradable.
- Store: question number/label, full question text, page number, bounding box on the question paper (for future traceability, optional to display).

### 3.3 Answer Extraction
- OCR/transcribe handwritten answer sheet page by page.
- Detect answer boundaries — where one answer ends and the next begins — using visual cues (numbering, spacing, underlines) rather than assuming one answer per page.
- Detect the question label the student wrote next to each answer block, if present.
- Store per answer block: detected label (nullable), transcribed text, page number(s), bounding box(es) (an answer can have multiple bboxes if it spans pages).

### 3.4 Answer Mapping (the core of the assignment)
Matching priority, in order:
1. **Exact label match** — student wrote "Q2" / "2." / "Ans 2" etc. → normalize and match to canonical question label.
2. **Sequential fallback** — if no label detected, assume answers are likely still in roughly printed order; match to the next unmatched question, but mark as **low-confidence**.
3. **No match found** — leave unmapped; do not force a match.

Label normalization handles variants: `Q2`, `Question 2`, `2.`, `2)`, `11 (a)`, `11a`, `11-a` → canonical form (e.g. `11.a`).

Every mapping carries a `confidence: "high" | "low"` flag, surfaced visibly in the UI (not hidden in a tooltip).

### 3.5 Edge Case Handling (explicit, not incidental)
| Case | Behavior |
|---|---|
| Sub-parts (11a/11b) | Each is its own question card, own score, own mapped answer region |
| Answered out of order | Matched by label regardless of position on the answer sheet; UI shows actual page location |
| Unanswered question | Question card shows "Not answered" state, 0 marks, no highlight triggered on click |
| Answer with no matching question | Shown in a separate "Unmatched Answers" list; not silently dropped |
| Answer spans multiple pages | Single answer entry with multiple bounding boxes; clicking the question jumps through / highlights across pages, page indicator updates |
| Ambiguous/duplicate labels | Flagged low-confidence; first-match-wins with a visible warning rather than silent overwrite |
| Poor handwriting / low OCR confidence | Answer text shown with a "low confidence transcription" indicator; does not block grading but is disclosed |

### 3.6 Highlighting
- Clicking a question in the left panel scrolls/jumps the answer sheet viewer to the relevant page and draws a highlight box over the exact answer region (green border, per Figma `Q2` example).
- Highlight uses actual bounding box coordinates returned by the model, rendered as an absolutely-positioned overlay on the page image — not a hardcoded/generic region.
- If the answer spans multiple pages, all regions are highlighted in sequence as the teacher navigates.

### 3.7 Grading & Feedback (in scope per assignment)
- Per-question score (e.g., `2/2`, `4/5`) — color-coded (green = full/high, amber = partial, red = zero), matching Figma.
- Per-question AI feedback text, expandable via chevron (per Figma "AI Feedback" card).
- Overall summary: total score, count of unanswered/unmatched, and a short overall comment.
- Since no answer key is uploaded, grading is model-judgment based — this is explicitly disclosed to the user and in the README as a limitation, not presented as authoritative.

### 3.8 Views
- **Questions tab**: list of extracted questions with scores + expandable feedback (mobile: toggle button; desktop: split pane, per Figma).
- **Answer Sheet tab**: paginated viewer with page controls (`Page 1 of 4`, zoom %, prev/next), synced highlight.
- Responsive: mobile uses tab toggle (`Questions` / `Answer Sheet`); desktop uses fixed split-pane layout — both shown in Figma.

---

## 4. Non-Functional Requirements
- Fully client-uploaded, in-memory/session processing — no DB, no auth, per assignment constraints.
- Reasonable processing time communicated via loading state; no silent hangs.
- Deployed on Vercel with a public live URL.
- Gracefully handle AI API failures (timeout/error) with a retry option, not a blank screen.

---

## 5. Technical Approach

### 5.1 Stack
- **Framework**: Next.js (App Router), API routes for AI calls.
- **Styling**: Tailwind CSS, matched to Figma tokens (dark pill nav, orange accent `#F97316`-ish, rounded cards).
- **File handling**: PDFs rendered to page images client-side (`pdfjs-dist`) for both extraction input and highlight overlay rendering.
- **AI Model**: Gemini 2.0/2.5 Flash (free tier) — chosen for strong handwriting OCR and native structured JSON output support.
- **State**: In-memory (React state / session), no persistence required.

### 5.2 AI Pipeline
1. **Question extraction call**: page images of question paper → structured JSON array of `{label, text, page, bbox}`.
2. **Answer extraction call**: page images of answer sheet → structured JSON array of `{detected_label | null, text, page, bbox, confidence}`.
3. **Mapping**: deterministic normalization + matching logic (see 3.4) run in application code, not left to the model — matching must be inspectable/debuggable, not a black box.
4. **Grading call**: per matched question+answer pair → `{score, max_score, feedback}`.

### 5.3 Data Shape (in-memory)
```ts
type Question = {
  id: string;            // canonical label e.g. "11.a"
  displayLabel: string;  // "11 (a)"
  text: string;
  page: number;
  bbox: [number, number, number, number];
};

type AnswerBlock = {
  id: string;
  detectedLabel: string | null;
  text: string;
  regions: { page: number; bbox: [number, number, number, number] }[];
  transcriptionConfidence: "high" | "low";
};

type Mapping = {
  questionId: string | null;   // null = unmatched answer
  answerId: string | null;     // null = unanswered question
  matchConfidence: "high" | "low" | "none";
  score?: number;
  maxScore?: number;
  feedback?: string;
};
```

---

## 6. Out of Scope
- Multi-student batch grading (assignment specifies one answer sheet).
- Authentication, persistence, answer-key upload.
- Editing/correcting AI extraction manually (nice-to-have, not required).

---

## 7. Success Criteria (mapped to evaluation rubric)
- Question order and numbering exactly preserved, sub-parts split correctly.
- Highlight boxes are genuinely derived from model bounding boxes, verified on messy/rotated scans.
- Every edge case in §3.5 has a visible, intentional UI state — nothing fails silently.
- README clearly states model used, matching logic, and known limitations.

---

## 8. Assumptions & Known Limitations
- OCR accuracy depends on handwriting legibility; low-confidence transcriptions are flagged, not hidden.
- Grading has no ground-truth answer key — scores reflect model judgment and should be framed as a starting point for teacher review, not final authority.
- Sequential fallback matching (§3.4, step 2) is a best-effort heuristic and is always visibly marked low-confidence.
