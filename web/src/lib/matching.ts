import { normalizeLabel } from './normalize';
import { Question, AnswerBlock, Mapping } from './types';

export function matchQuestionsToAnswers(questions: Question[], answerBlocks: AnswerBlock[]): Mapping[] {
  const mappings: Mapping[] = [];
  
  const matchedQuestionIds = new Set<string>();
  const matchedAnswerIds = new Set<string>();

  const normalizedQuestionMap = new Map<string, Question>();
  for (const q of questions) {
    const normId = normalizeLabel(q.id);
    const normDisplay = normalizeLabel(q.displayLabel);
    
    if (normId && !normalizedQuestionMap.has(normId)) {
      normalizedQuestionMap.set(normId, q);
    }
    if (normDisplay && !normalizedQuestionMap.has(normDisplay)) {
      normalizedQuestionMap.set(normDisplay, q);
    }
  }

  // Step 1: Exact label matches (handles out-of-order answers and multi-part sub-questions)
  for (const ans of answerBlocks) {
    if (ans.detectedLabel) {
      const normAnsLabel = normalizeLabel(ans.detectedLabel);
      if (normAnsLabel) {
        const matchedQuestion = normalizedQuestionMap.get(normAnsLabel);
        if (matchedQuestion && !matchedQuestionIds.has(matchedQuestion.id)) {
          const isLowOCR = ans.transcriptionConfidence === "low";
          mappings.push({
            questionId: matchedQuestion.id,
            answerId: ans.id,
            matchConfidence: isLowOCR ? "low" : "high",
            confidenceReason: isLowOCR ? "Low OCR transcription confidence" : undefined
          });
          matchedQuestionIds.add(matchedQuestion.id);
          matchedAnswerIds.add(ans.id);
        }
      }
    }
  }

  // Step 2: Sequential fallback (ONLY for unlabeled answers)
  // Answers with explicit unmatched labels (e.g. Q99) must NOT be force-matched here.
  const remainingQuestions = questions.filter(q => !matchedQuestionIds.has(q.id));
  const unlabeledRemainingAnswers = answerBlocks.filter(
    a => !matchedAnswerIds.has(a.id) && (!a.detectedLabel || a.detectedLabel.trim() === "")
  );

  const matchCount = Math.min(remainingQuestions.length, unlabeledRemainingAnswers.length);
  for (let i = 0; i < matchCount; i++) {
    const q = remainingQuestions[i];
    const a = unlabeledRemainingAnswers[i];
    
    mappings.push({
      questionId: q.id,
      answerId: a.id,
      matchConfidence: "low",
      confidenceReason: "Matched sequentially because student answer had no label"
    });
    
    matchedQuestionIds.add(q.id);
    matchedAnswerIds.add(a.id);
  }

  // Step 3: Unanswered questions (never crash, show 0 marks)
  for (const q of questions) {
    if (!matchedQuestionIds.has(q.id)) {
      mappings.push({
        questionId: q.id,
        answerId: null,
        matchConfidence: "none",
        score: 0,
        maxScore: q.maxScore || 2,
        feedback: "This question was left completely unanswered by the student."
      });
    }
  }

  // Step 4: Unmatched answers (explicit label mismatch or extra answers)
  for (const a of answerBlocks) {
    if (!matchedAnswerIds.has(a.id)) {
      mappings.push({
        questionId: null,
        answerId: a.id,
        matchConfidence: "none",
        confidenceReason: a.detectedLabel 
          ? `Label '${a.detectedLabel}' does not match any question on the question paper`
          : "Unlabeled extra answer block"
      });
    }
  }

  return mappings;
}
