// src/lib/gemini.ts - Self-healing Google Gemini Vision AI model resolver with 3.5 Flash & 3.5 Flash Lite prioritization

import { GoogleGenerativeAI } from "@google/generative-ai";

let cachedAvailableModels: string[] | null = null;

async function getAvailableModels(apiKey: string): Promise<string[]> {
  if (cachedAvailableModels && cachedAvailableModels.length > 0) {
    return cachedAvailableModels;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      const models: { name: string; supportedGenerationMethods?: string[] }[] = data.models || [];
      
      const valid = models
        .filter(m => !m.supportedGenerationMethods || m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace(/^models\//, ""));

      if (valid.length > 0) {
        // Priority ordering: 3.5 Flash, 3.5 Flash Lite, 3.6 Flash, 2.0 Flash, 1.5 Flash
        const priorityPatterns = [
          /^gemini-3\.5-flash-lite/,
          /^gemini-3\.5-flash/,
          /^gemini-3\.6-flash/,
          /^gemini-3\.0-flash/,
          /^gemini-2\.0-flash/,
          /^gemini-2\.0/,
          /^gemini-1\.5-flash-latest/,
          /^gemini-1\.5-flash/,
          /^gemini-flash/,
          /^gemini-1\.5-pro/
        ];

        const sorted = [...valid].sort((a, b) => {
          const aIndex = priorityPatterns.findIndex(p => p.test(a));
          const bIndex = priorityPatterns.findIndex(p => p.test(b));
          const aRank = aIndex === -1 ? 99 : aIndex;
          const bRank = bIndex === -1 ? 99 : bIndex;
          return aRank - bRank;
        });

        cachedAvailableModels = sorted;
        return sorted;
      }
    }
  } catch (e) {
    console.warn("Could not dynamically query ModelService.ListModels, using default candidate list:", e);
  }

  const staticFallback = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro"
  ];
  cachedAvailableModels = staticFallback;
  return staticFallback;
}

export async function generateWithFallback(
  apiKey: string,
  prompt: string,
  imageParts: any[] = [],
  options: { temperature?: number; jsonMode?: boolean } = { temperature: 0.1, jsonMode: true }
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = await getAvailableModels(apiKey);

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: options.jsonMode ? "application/json" : "text/plain",
          temperature: options.temperature ?? 0.1,
        },
      });

      const contents = imageParts.length > 0 ? [prompt, ...imageParts] : [prompt];
      const result = await model.generateContent(contents);
      const text = result.response.text();
      
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      console.warn(`Model '${modelName}' attempted failed (${err.status || err.message}). Trying next candidate...`);
      lastError = err;
    }
  }

  throw lastError || new Error("None of the available Gemini models succeeded for this API key.");
}
