import { NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";

function extractJsonArray(text: string): any[] {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
  }
  return JSON.parse(cleaned);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        { 
          error: "GEMINI_API_KEY is missing from .env.local. Please add your GEMINI_API_KEY in web/.env.local."
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { images } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided. Please upload question paper pages." },
        { status: 400 }
      );
    }

    const imageParts = images.map((base64Str: string) => {
      const base64Data = base64Str.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      let mimeType = "image/jpeg";
      if (base64Str.startsWith("data:image/png")) mimeType = "image/png";
      else if (base64Str.startsWith("data:image/webp")) mimeType = "image/webp";

      return {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };
    });

    const basePrompt = `You are a high-precision OCR and document analysis engine for examination question papers.
Analyze the provided scanned question paper page images with complete accuracy.

RULES:
1. ORDER: Extract every single question in the exact physical reading order it appears on the paper.
2. PRESERVE NUMBERING: Preserve the exact printed numbering (e.g., "1", "2.", "Q3", "11(a)"). Do not renumber or omit numbers.
3. SUB-PARTS SPLITTING: For multi-part questions (e.g., "11(a)" and "11(b)" or "1.a", "1.b"), you MUST extract each sub-part as a DISTINCT, INDEPENDENT question entry.
   - Set 'id' to the canonical dot notation (e.g. "11.a", "11.b").
   - Set 'parentLabel' to the parent question identifier (e.g. "11").
   - If a question has no sub-parts, set 'parentLabel' to null.
4. TEXT ACCURACY: Transcribe the full question text faithfully, including technical terms, equations, and punctuation.
5. PAGE NUMBERING: Use 1-indexed page numbering ('page': 1 for the first image, 2 for the second, etc.).
6. BOUNDING BOX: Provide a normalized bounding box [x1, y1, x2, y2] as floats from 0.0 to 1.0 (where x1=left, y1=top, x2=right, y2=bottom).
7. MARKS / MAX SCORE: Detect printed mark allocations (e.g., "[2 marks]", "(5)", "3 M"). Default to 2 or 5 if not explicitly printed.

OUTPUT FORMAT:
Return a JSON array of question objects where each object has:
{
  "id": "11.a",
  "parentLabel": "11",
  "displayLabel": "11 (a)",
  "text": "Full question text...",
  "page": 1,
  "bbox": [0.08, 0.15, 0.92, 0.28],
  "maxScore": 2
}`;

    let responseText = "";
    
    try {
      responseText = await generateWithFallback(apiKey, basePrompt, imageParts, { temperature: 0.1, jsonMode: true });
    } catch (e: any) {
      console.error("Gemini API error during question extraction:", e);
      return NextResponse.json({ error: e.message || "Failed to generate content from Gemini AI model." }, { status: 500 });
    }

    let parsedQuestions;
    try {
      parsedQuestions = extractJsonArray(responseText);
    } catch (parseError) {
      console.warn("First JSON parse failed, retrying with stricter prompt...");
      const retryPrompt = `${basePrompt}\n\nCRITICAL: RETURN ONLY A VALID JSON ARRAY OF QUESTION OBJECTS.`;
      
      try {
        const retryText = await generateWithFallback(apiKey, retryPrompt, imageParts, { temperature: 0.1, jsonMode: true });
        parsedQuestions = extractJsonArray(retryText);
      } catch (retryParseError: any) {
        console.error("Retry JSON parse failed:", retryParseError);
        return NextResponse.json(
          { error: "Failed to parse question extraction results as JSON: " + retryParseError.message },
          { status: 500 }
        );
      }
    }

    // Sanitize question data
    const sanitizedQuestions = (parsedQuestions || []).map((q: any, idx: number) => ({
      id: String(q.id || idx + 1),
      parentLabel: q.parentLabel ? String(q.parentLabel) : null,
      displayLabel: String(q.displayLabel || q.id || idx + 1),
      text: String(q.text || ""),
      page: Number(q.page || 1),
      bbox: Array.isArray(q.bbox) && q.bbox.length === 4 ? q.bbox : [0.08, 0.1 + (idx * 0.1), 0.92, 0.2 + (idx * 0.1)],
      maxScore: Number(q.maxScore || 2)
    }));

    return NextResponse.json({ questions: sanitizedQuestions });

  } catch (error: any) {
    console.error("extract-questions API route error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
