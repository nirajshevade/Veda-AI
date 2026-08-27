import { describe, it, expect } from 'vitest';
import { matchQuestionsToAnswers } from '../matching';
import { Question, AnswerBlock } from '../types';

describe('matchQuestionsToAnswers', () => {
  const createQ = (id: string, displayLabel: string = id, maxScore: number = 2): Question => ({
    id,
    displayLabel,
    parentLabel: id.includes('.') ? id.split('.')[0] : null,
    text: `Question ${id} text`,
    page: 1,
    bbox: [0.1, 0.1, 0.9, 0.3],
    maxScore
  });

  const createA = (
    id: string, 
    detectedLabel: string | null = null, 
    confidence: "high" | "low" = "high",
    regions = [{ page: 1, bbox: [0.1, 0.1, 0.9, 0.3] as [number, number, number, number] }]
  ): AnswerBlock => ({
    id,
    detectedLabel,
    text: `Transcribed answer for ${id}`,
    regions,
    transcriptionConfidence: confidence
  });

  // Scenario 1: Multi-part questions (e.g. 11(a)/11(b))
  it('Scenario 1: correctly maps multi-part sub-questions as separate high-confidence cards', () => {
    const questions = [
      createQ('11.a', '11 (a)', 2),
      createQ('11.b', '11 (b)', 3)
    ];
    const answers = [
      createA('a1', '11(a)'),
      createA('a2', '11 (b)')
    ];

    const result = matchQuestionsToAnswers(questions, answers);
    
    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ questionId: '11.a', answerId: 'a1', matchConfidence: 'high' }),
      expect.objectContaining({ questionId: '11.b', answerId: 'a2', matchConfidence: 'high' }),
    ]));
  });

  // Scenario 2: Out of printed order
  it('Scenario 2: matches answers written out-of-order by label to the correct question', () => {
    const questions = [createQ('1'), createQ('2'), createQ('3')];
    // Student answered Q3 first, then Q1, then Q2
    const answers = [
      createA('ans_for_3', 'Q3'),
      createA('ans_for_1', '1.'),
      createA('ans_for_2', 'Ans 2')
    ];

    const result = matchQuestionsToAnswers(questions, answers);
    
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ questionId: '1', answerId: 'ans_for_1', matchConfidence: 'high' }),
      expect.objectContaining({ questionId: '2', answerId: 'ans_for_2', matchConfidence: 'high' }),
      expect.objectContaining({ questionId: '3', answerId: 'ans_for_3', matchConfidence: 'high' }),
    ]));
  });

  // Scenario 3: Unanswered question
  it('Scenario 3: marks unanswered questions with score 0, matchConfidence none, and does not crash', () => {
    const questions = [createQ('1'), createQ('2', '2', 5)];
    const answers = [createA('a1', '1')]; // Q2 unanswered

    const result = matchQuestionsToAnswers(questions, answers);
    
    expect(result).toHaveLength(2);
    const q2Mapping = result.find(m => m.questionId === '2');
    expect(q2Mapping).toBeDefined();
    expect(q2Mapping).toEqual(expect.objectContaining({
      questionId: '2',
      answerId: null,
      matchConfidence: 'none',
      score: 0,
      maxScore: 5
    }));
  });

  // Scenario 4: Unmatched answers with unrecognized labels
  it('Scenario 4: keeps answer blocks with non-matching labels in Unmatched Answers and does not sequentially force-match them', () => {
    const questions = [createQ('1'), createQ('2')];
    // a1 matches Q1. a2 has label "99" (doesn't exist on paper). Q2 has no answer.
    const answers = [createA('a1', '1'), createA('a2', 'Q99')];

    const result = matchQuestionsToAnswers(questions, answers);
    
    expect(result).toHaveLength(3);
    // Q1 matched to a1
    expect(result.find(m => m.questionId === '1' && m.answerId === 'a1')).toBeDefined();
    // Q2 remains unanswered (NOT matched to a2!)
    expect(result.find(m => m.questionId === '2' && m.answerId === null)).toBeDefined();
    // a2 remains unmatched answer
    expect(result.find(m => m.questionId === null && m.answerId === 'a2')).toBeDefined();
  });

  // Scenario 5: Multi-page spanning answer
  it('Scenario 5: preserves all multi-page regions for spanning answers', () => {
    const questions = [createQ('1')];
    const multiPageAnswer = createA('a1', '1', 'high', [
      { page: 1, bbox: [0, 0.6, 1, 1] },
      { page: 2, bbox: [0, 0, 1, 0.4] }
    ]);
    const answers = [multiPageAnswer];

    const result = matchQuestionsToAnswers(questions, answers);
    
    expect(result).toHaveLength(1);
    expect(result[0].questionId).toBe('1');
    expect(result[0].answerId).toBe('a1');
    expect(answers[0].regions).toHaveLength(2);
    expect(answers[0].regions[0].page).toBe(1);
    expect(answers[0].regions[1].page).toBe(2);
  });

  // Scenario 6: Low-quality scan / messy handwriting (low confidence flag)
  it('Scenario 6: flags low OCR transcription confidence in mapping', () => {
    const questions = [createQ('1')];
    const messyAnswer = createA('a1', '1', 'low');
    const answers = [messyAnswer];

    const result = matchQuestionsToAnswers(questions, answers);
    
    expect(result).toHaveLength(1);
    expect(result[0].matchConfidence).toBe('low');
    expect(result[0].confidenceReason).toContain('Low OCR');
  });

  // Sequential fallback for truly unlabeled answers
  it('falls back to sequential matching only for unlabeled answers', () => {
    const questions = [createQ('1'), createQ('2')];
    const answers = [createA('a1', '1'), createA('a2', null)]; // a2 has no label

    const result = matchQuestionsToAnswers(questions, answers);
    
    expect(result).toHaveLength(2);
    expect(result.find(m => m.questionId === '1')?.matchConfidence).toBe('high');
    expect(result.find(m => m.questionId === '2')?.matchConfidence).toBe('low');
    expect(result.find(m => m.questionId === '2')?.answerId).toBe('a2');
  });
});
