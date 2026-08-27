import { describe, it, expect } from "vitest";
import { matchQuestionsToAnswers } from "../matching";
import { Question, AnswerBlock, Mapping } from "../types";
import { BIOLOGY_EXAM_DATASET } from "../sampleData";

describe("7 Core Assessment Pipeline Scenarios", () => {
  // Scenario 1
  it("Scenario 1: Multi-part questions (11(a)/11(b)) appear as separate cards, correctly ordered and grouped", () => {
    const questions: Question[] = [
      {
        id: "10",
        displayLabel: "10",
        text: "Explain xylem vessels.",
        page: 2,
        bbox: [0.1, 0.1, 0.9, 0.2],
        maxScore: 5
      },
      {
        id: "11.a",
        parentLabel: "11",
        displayLabel: "11 a.",
        text: "Plant A vs Plant B light conditions.",
        page: 2,
        bbox: [0.1, 0.25, 0.9, 0.4],
        maxScore: 2
      },
      {
        id: "11.b",
        parentLabel: "11",
        displayLabel: "11 b.",
        text: "Practical measure for Plant B.",
        page: 2,
        bbox: [0.1, 0.45, 0.9, 0.6],
        maxScore: 3
      },
      {
        id: "12",
        displayLabel: "12",
        text: "Tidal volume calculation.",
        page: 2,
        bbox: [0.1, 0.65, 0.9, 0.8],
        maxScore: 5
      }
    ];

    const answers: AnswerBlock[] = [
      {
        id: "ans-10",
        detectedLabel: "10.",
        text: "Xylem vessels are lignified.",
        regions: [{ page: 2, bbox: [0.1, 0.1, 0.9, 0.2] }],
        transcriptionConfidence: "high"
      },
      {
        id: "ans-11a",
        detectedLabel: "11(a)",
        text: "Plant A is healthy, Plant B is etiolated.",
        regions: [{ page: 3, bbox: [0.1, 0.1, 0.9, 0.2] }],
        transcriptionConfidence: "high"
      },
      {
        id: "ans-11b",
        detectedLabel: "11(b)",
        text: "Move Plant B to sunlight.",
        regions: [{ page: 3, bbox: [0.1, 0.25, 0.9, 0.4] }],
        transcriptionConfidence: "high"
      },
      {
        id: "ans-12",
        detectedLabel: "Q12",
        text: "Pulmonary ventilation = 6.0 L/min.",
        regions: [{ page: 3, bbox: [0.1, 0.45, 0.9, 0.6] }],
        transcriptionConfidence: "high"
      }
    ];

    const mappings = matchQuestionsToAnswers(questions, answers);

    // Assert both sub-parts are matched independently with high confidence
    const map11a = mappings.find(m => m.questionId === "11.a");
    const map11b = mappings.find(m => m.questionId === "11.b");

    expect(map11a).toBeDefined();
    expect(map11a?.answerId).toBe("ans-11a");
    expect(map11a?.matchConfidence).toBe("high");

    expect(map11b).toBeDefined();
    expect(map11b?.answerId).toBe("ans-11b");
    expect(map11b?.matchConfidence).toBe("high");

    // Parent labels are preserved for UI grouping
    expect(questions.find(q => q.id === "11.a")?.parentLabel).toBe("11");
    expect(questions.find(q => q.id === "11.b")?.parentLabel).toBe("11");
  });

  // Scenario 2
  it("Scenario 2: Out of printed order answers correctly map to the question card regardless of physical placement", () => {
    const questions: Question[] = [
      { id: "1", displayLabel: "1", text: "Question 1 text", page: 1, bbox: [0.1, 0.1, 0.9, 0.2] },
      { id: "2", displayLabel: "2", text: "Question 2 text", page: 1, bbox: [0.1, 0.3, 0.9, 0.4] },
      { id: "3", displayLabel: "3", text: "Question 3 text", page: 1, bbox: [0.1, 0.5, 0.9, 0.6] }
    ];

    // Student wrote answer for Q3 on Page 1, Q1 on Page 2, and Q2 on Page 3
    const answers: AnswerBlock[] = [
      {
        id: "ans-for-q3",
        detectedLabel: "Ans 3",
        text: "Answer for Q3",
        regions: [{ page: 1, bbox: [0.1, 0.1, 0.9, 0.3] }],
        transcriptionConfidence: "high"
      },
      {
        id: "ans-for-q1",
        detectedLabel: "1.",
        text: "Answer for Q1",
        regions: [{ page: 2, bbox: [0.1, 0.1, 0.9, 0.3] }],
        transcriptionConfidence: "high"
      },
      {
        id: "ans-for-q2",
        detectedLabel: "Q2",
        text: "Answer for Q2",
        regions: [{ page: 3, bbox: [0.1, 0.1, 0.9, 0.3] }],
        transcriptionConfidence: "high"
      }
    ];

    const mappings = matchQuestionsToAnswers(questions, answers);

    const map1 = mappings.find(m => m.questionId === "1");
    const map2 = mappings.find(m => m.questionId === "2");
    const map3 = mappings.find(m => m.questionId === "3");

    expect(map1?.answerId).toBe("ans-for-q1");
    expect(map2?.answerId).toBe("ans-for-q2");
    expect(map3?.answerId).toBe("ans-for-q3");

    // Verify regions map to respective target pages
    const ans1 = answers.find(a => a.id === map1?.answerId);
    expect(ans1?.regions[0].page).toBe(2);

    const ans3 = answers.find(a => a.id === map3?.answerId);
    expect(ans3?.regions[0].page).toBe(1);
  });

  // Scenario 3
  it("Scenario 3: Question left completely unanswered shows Not answered state and contributes 0 marks without crashing", () => {
    const questions: Question[] = [
      { id: "1", displayLabel: "1", text: "Answered question", page: 1, bbox: [0.1, 0.1, 0.9, 0.2], maxScore: 5 },
      { id: "2", displayLabel: "2", text: "Unanswered question", page: 1, bbox: [0.1, 0.3, 0.9, 0.4], maxScore: 5 }
    ];

    const answers: AnswerBlock[] = [
      {
        id: "ans-1",
        detectedLabel: "1",
        text: "Answer for Q1",
        regions: [{ page: 1, bbox: [0.1, 0.1, 0.9, 0.3] }],
        transcriptionConfidence: "high"
      }
    ];

    const mappings = matchQuestionsToAnswers(questions, answers);

    const map2 = mappings.find(m => m.questionId === "2");
    expect(map2).toBeDefined();
    expect(map2?.answerId).toBeNull();
    expect(map2?.matchConfidence).toBe("none");
    expect(map2?.score).toBe(0);
    expect(map2?.maxScore).toBe(5);
    expect(map2?.feedback).toContain("unanswered");
  });

  // Scenario 4
  it("Scenario 4: Answer block with no matching question appears in Unmatched Answers and is not silently dropped", () => {
    const questions: Question[] = [
      { id: "1", displayLabel: "1", text: "Question 1", page: 1, bbox: [0.1, 0.1, 0.9, 0.2] }
    ];

    const answers: AnswerBlock[] = [
      {
        id: "ans-1",
        detectedLabel: "1",
        text: "Answer for Q1",
        regions: [{ page: 1, bbox: [0.1, 0.1, 0.9, 0.3] }],
        transcriptionConfidence: "high"
      },
      {
        id: "ans-extra",
        detectedLabel: "Q99",
        text: "Extra answer from student for unknown question",
        regions: [{ page: 2, bbox: [0.1, 0.5, 0.9, 0.7] }],
        transcriptionConfidence: "high"
      }
    ];

    const mappings = matchQuestionsToAnswers(questions, answers);

    // Q1 is matched
    const map1 = mappings.find(m => m.questionId === "1");
    expect(map1?.answerId).toBe("ans-1");

    // Extra answer is NOT dropped; exists as unmatched mapping
    const unmatched = mappings.find(m => m.answerId === "ans-extra");
    expect(unmatched).toBeDefined();
    expect(unmatched?.questionId).toBeNull();
    expect(unmatched?.matchConfidence).toBe("none");
    expect(unmatched?.confidenceReason).toContain("Q99");
  });

  // Scenario 5
  it("Scenario 5: Multi-page spanning answer captures both page regions and enables stepping through", () => {
    const questions: Question[] = [
      { id: "1", displayLabel: "1", text: "Long question", page: 1, bbox: [0.1, 0.1, 0.9, 0.2] }
    ];

    const answers: AnswerBlock[] = [
      {
        id: "ans-multi",
        detectedLabel: "1",
        text: "Long answer spanning two pages.",
        regions: [
          { page: 1, bbox: [0.1, 0.6, 0.9, 0.95] },
          { page: 2, bbox: [0.1, 0.05, 0.9, 0.4] }
        ],
        transcriptionConfidence: "high"
      }
    ];

    const mappings = matchQuestionsToAnswers(questions, answers);
    expect(mappings).toHaveLength(1);
    expect(mappings[0].answerId).toBe("ans-multi");

    const matchedAns = answers.find(a => a.id === mappings[0].answerId);
    expect(matchedAns?.regions).toHaveLength(2);
    expect(matchedAns?.regions[0].page).toBe(1);
    expect(matchedAns?.regions[1].page).toBe(2);
  });

  // Scenario 6
  it("Scenario 6: Blurry or messy handwriting flagged with low confidence indicator", () => {
    const questions: Question[] = [
      { id: "1", displayLabel: "1", text: "Enzyme kinetics question", page: 1, bbox: [0.1, 0.1, 0.9, 0.2] }
    ];

    const answers: AnswerBlock[] = [
      {
        id: "ans-blurry",
        detectedLabel: "1",
        text: "V_max and K_m messy scribbles...",
        regions: [{ page: 1, bbox: [0.1, 0.1, 0.9, 0.4] }],
        transcriptionConfidence: "low"
      }
    ];

    const mappings = matchQuestionsToAnswers(questions, answers);
    expect(mappings[0].matchConfidence).toBe("low");
    expect(mappings[0].confidenceReason).toContain("Low OCR transcription confidence");
  });

  // Scenario 7 (Full dataset integration)
  it("Full Biology Dataset satisfies all edge cases simultaneously", () => {
    expect(BIOLOGY_EXAM_DATASET.questions.length).toBeGreaterThanOrEqual(13);
    expect(BIOLOGY_EXAM_DATASET.answers.length).toBeGreaterThanOrEqual(13);
    expect(BIOLOGY_EXAM_DATASET.mappings.length).toBeGreaterThanOrEqual(13);
    expect(BIOLOGY_EXAM_DATASET.answerPageImages.length).toBe(4);

    // Multi-part questions check
    expect(BIOLOGY_EXAM_DATASET.questions.find(q => q.id === "11.a")).toBeDefined();
    expect(BIOLOGY_EXAM_DATASET.questions.find(q => q.id === "11.b")).toBeDefined();

    // Unanswered question check
    const q14Mapping = BIOLOGY_EXAM_DATASET.mappings.find(m => m.questionId === "14");
    expect(q14Mapping?.answerId).toBeNull();
    expect(q14Mapping?.score).toBe(0);

    // Unmatched answer check
    const unmatchedAns = BIOLOGY_EXAM_DATASET.mappings.find(m => m.questionId === null);
    expect(unmatchedAns?.answerId).toBe("ans-unmatched");
  });
});
