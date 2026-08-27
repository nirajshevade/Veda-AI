export type Question = {
  id: string;            // canonical label e.g. "11.a" or "2"
  parentLabel?: string | null; // e.g. "11" for 11(a)
  displayLabel: string;  // e.g. "11 (a)" or "2."
  text: string;
  page: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] normalized 0..1
  maxScore?: number;
};

export type AnswerRegion = {
  page: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] normalized 0..1
};

export type AnswerBlock = {
  id: string;
  detectedLabel: string | null;
  text: string;
  regions: AnswerRegion[];
  transcriptionConfidence: "high" | "low";
};

export type Mapping = {
  questionId: string | null;   // null = unmatched answer
  answerId: string | null;     // null = unanswered question
  matchConfidence: "high" | "low" | "none";
  score?: number;
  maxScore?: number;
  feedback?: string;
  confidenceReason?: string;
};

export type PipelineResult = {
  questions: Question[];
  answers: AnswerBlock[];
  mappings: Mapping[];
  answerPageImages: string[]; // base64 / URLs of answer sheet pages
  questionPageImages?: string[];
};
