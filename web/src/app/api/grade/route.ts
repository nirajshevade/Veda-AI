import { NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { Question, AnswerBlock, Mapping } from "@/lib/types";

function extractJsonObject(text: string): any {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
  }
  return JSON.parse(cleaned);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const body = await req.json();
    const { questions, answers, mappings } = body as {
      questions: Question[];
      answers: AnswerBlock[];
      mappings: Mapping[];
    };

    if (!questions || !mappings) {
      return NextResponse.json(
        { error: "Invalid payload. 'questions' and 'mappings' are required." },
        { status: 400 }
      );
    }

    const questionMap = new Map<string, Question>(questions.map(q => [q.id, q]));
    const answerMap = new Map<string, AnswerBlock>((answers || []).map(a => [a.id, a]));

    const pairsToGrade: { questionId: string; displayLabel: string; questionText: string; answerText: string; maxScore: number }[] = [];

    // Prepare mappings and assign deterministic 0 scores to unanswered questions
    const updatedMappings: Mapping[] = mappings.map(m => {
      if (!m.questionId) {
        return { ...m };
      }

      const q = questionMap.get(m.questionId);
      const maxScore = q?.maxScore || 2;

      if (!m.answerId) {
        // Scenario 3: Unanswered question contributes 0 to score, not crash
        return {
          ...m,
          score: 0,
          maxScore: maxScore,
          feedback: "This question was left completely unanswered by the student."
        };
      }

      const ans = answerMap.get(m.answerId);
      if (ans && q) {
        pairsToGrade.push({
          questionId: q.id,
          displayLabel: q.displayLabel,
          questionText: q.text,
          answerText: ans.text,
          maxScore: maxScore
        });
      }

      return {
        ...m,
        maxScore: maxScore,
        score: m.score ?? maxScore,
        feedback: m.feedback ?? "Pending evaluation."
      };
    });

    if (pairsToGrade.length === 0 || !apiKey) {
      return NextResponse.json({ mappings: updatedMappings });
    }

    const gradingPrompt = `You are an expert academic evaluator and teacher evaluating student handwritten exam responses against the question paper prompts.

EVALUATION CRITERIA:
1. CONCEPTUAL ACCURACY: Award marks based on correctness of scientific facts, formulas, step-wise calculations, and logical explanations.
2. PARTIAL CREDIT: Grant partial marks where appropriate (e.g. 1/2, 3/5, 4/5) if core principles are stated but minor details or units are missing.
3. CONSTRUCTIVE FEEDBACK: Provide concise, encouraging 1-2 sentence feedback explaining what was correct and what could be improved.
4. SCORE BOUNDS: 'score' must be a number between 0 and maxScore.

QUESTION-ANSWER PAIRS TO GRADE:
${JSON.stringify(pairsToGrade, null, 2)}

OUTPUT FORMAT:
Return a JSON object where each key is the 'questionId' and the value contains 'score' and 'feedback':
{
  "1": {
    "score": 2,
    "feedback": "Correctly identified the relevant organelle and stated its primary function."
  }
}`;

    try {
      const responseText = await generateWithFallback(apiKey, gradingPrompt, [], { temperature: 0.2, jsonMode: true });
      const grades = extractJsonObject(responseText);

      for (const m of updatedMappings) {
        if (m.questionId && grades[m.questionId]) {
          const g = grades[m.questionId];
          m.score = typeof g.score === 'number' ? Math.min(Math.max(0, g.score), m.maxScore || 5) : m.score;
          m.feedback = g.feedback || m.feedback;
        }
      }
    } catch (e: any) {
      console.warn("AI grading call notice, applying heuristic fallback scores:", e);
      for (const m of updatedMappings) {
        if (m.questionId && m.answerId && m.score === undefined) {
          const ans = answerMap.get(m.answerId);
          m.score = ans && ans.text.length > 25 ? (m.maxScore || 2) : 1;
          m.feedback = "Answer recorded. (Teacher manual review recommended)";
        }
      }
    }

    return NextResponse.json({ mappings: updatedMappings });

  } catch (error: any) {
    console.error("grade API route error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
