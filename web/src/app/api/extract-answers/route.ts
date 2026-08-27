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
        { error: "No images provided. Please upload student answer sheet pages." },
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

    const basePrompt = `You are an expert handwriting OCR and document vision AI for handwritten examination answer sheets.
Perform precise, fine-grained answer segmentation, full-text OCR transcription, and accurate tight bounding box localization for EVERY separate answer on the provided page images.

CRITICAL SEGMENTATION & BOUNDING BOX RULES:
1. SEPARATE EVERY INDIVIDUAL ANSWER:
   - When a page contains multiple answers (e.g. Q1, Q2, Q3, Q4, Q5, or Ans 1, Ans 2, Ans 3), you MUST split and output EACH answer as its OWN independent object.
   - NEVER combine multiple questions into a single answer block.
   - NEVER output a giant bounding box covering the whole page if there are multiple answers on that page.

2. TIGHT, PRECISE BOUNDING BOXES:
   - For each answer, the bounding box [x1, y1, x2, y2] (normalized floats from 0.0 to 1.0) MUST tightly wrap ONLY that specific answer's handwritten text.
   - y1 = the top of the question label/first line of this specific answer.
   - y2 = the bottom of the last line of this specific answer (immediately before the next question number starts).
   - Example on a page with 3 answers:
     - Q1 bounding box might be [0.08, 0.08, 0.92, 0.28]
     - Q2 bounding box might be [0.08, 0.32, 0.92, 0.58]
     - Q3 bounding box might be [0.08, 0.62, 0.92, 0.92]

3. DETECTED LABEL:
   - Extract the exact label written by the student (e.g. "1", "Q1", "2.", "Q2", "Ans 3", "11(a)").
   - Clean it so it does not contain duplicate prefixes (e.g. "Q1", "Q2", "Q3", "11(a)").

4. HANDWRITING TRANSCRIPTION:
   - Faithfully transcribe the handwritten text, equations, code snippets, bullet points, and definitions.
   - If handwriting is clear, set transcriptionConfidence to "high". If messy/unclear, set to "low".

5. MULTI-PAGE SPAN:
   - If a single answer continues from the bottom of one page to the top of the next page without a new question number, provide multiple region objects in the 'regions' array with tight bounding boxes on each respective page.

OUTPUT FORMAT:
Return ONLY a valid JSON array of answer block objects:
[
  {
    "id": "ans-1",
    "detectedLabel": "Q1",
    "text": "Data abstraction means hiding the internal implementation details...",
    "regions": [
      {
        "page": 1,
        "bbox": [0.08, 0.06, 0.92, 0.24]
      }
    ],
    "transcriptionConfidence": "high"
  },
  {
    "id": "ans-2",
    "detectedLabel": "Q2",
    "text": "A compiler converts the whole source code into machine code at once...",
    "regions": [
      {
        "page": 1,
        "bbox": [0.08, 0.26, 0.92, 0.46]
      }
    ],
    "transcriptionConfidence": "high"
  }
]`;

    let responseText = "";
    
    try {
      responseText = await generateWithFallback(apiKey, basePrompt, imageParts, { temperature: 0.1, jsonMode: true });
    } catch (e: any) {
      console.error("Gemini API error during answer extraction:", e);
      return NextResponse.json({ error: e.message || "Failed to generate content from Gemini AI model." }, { status: 500 });
    }

    let parsedAnswers;
    try {
      parsedAnswers = extractJsonArray(responseText);
    } catch (parseError) {
      console.warn("First JSON parse failed, retrying with stricter prompt...");
      const retryPrompt = `${basePrompt}\n\nCRITICAL: RETURN ONLY A VALID JSON ARRAY OF SEPARATE ANSWER OBJECTS WITH TIGHT BOUNDING BOXES.`;
      
      try {
        const retryText = await generateWithFallback(apiKey, retryPrompt, imageParts, { temperature: 0.1, jsonMode: true });
        parsedAnswers = extractJsonArray(retryText);
      } catch (retryParseError: any) {
        console.error("Retry JSON parse failed:", retryParseError);
        return NextResponse.json(
          { error: "Failed to parse answer extraction results as JSON: " + retryParseError.message },
          { status: 500 }
        );
      }
    }

    // Sanitize answer blocks
    const sanitizedAnswers = (parsedAnswers || []).map((ans: any, idx: number) => {
      let rawLabel = ans.detectedLabel ? String(ans.detectedLabel).trim() : null;
      // Clean up multiple Q prefixes if present (e.g. QQ1 -> Q1)
      if (rawLabel) {
        rawLabel = rawLabel.replace(/^Q+\s*/i, "Q");
      }

      return {
        id: String(ans.id || `ans-${idx + 1}`),
        detectedLabel: rawLabel,
        text: String(ans.text || ""),
        regions: Array.isArray(ans.regions) && ans.regions.length > 0
          ? ans.regions.map((r: any) => ({
              page: Number(r.page || 1),
              bbox: Array.isArray(r.bbox) && r.bbox.length === 4 ? r.bbox : [0.08, 0.1, 0.92, 0.3]
            }))
          : [{ page: Number(ans.page || 1), bbox: ans.bbox || [0.08, 0.1, 0.92, 0.3] }],
        transcriptionConfidence: ans.transcriptionConfidence === "low" ? "low" : "high"
      };
    });

    return NextResponse.json({ answers: sanitizedAnswers });

  } catch (error: any) {
    console.error("extract-answers API route error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
