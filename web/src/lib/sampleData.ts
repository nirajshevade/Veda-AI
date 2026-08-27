import { PipelineResult, Question, AnswerBlock, Mapping } from "./types";
import { matchQuestionsToAnswers } from "./matching";

// Helper to create simple ruled paper SVG data URL as background
export function createRuledPaperSvg(title: string, textLines: string[]): string {
  const linesSvg = textLines
    .map((line, idx) => `<text x="70" y="${100 + idx * 35}" font-family="sans-serif" font-size="16" fill="#1e293b">${escapeXml(line)}</text>`)
    .join("\n");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100">
      <rect width="800" height="1100" fill="#f8fafc" />
      <!-- Left margin line -->
      <line x1="50" y1="0" x2="50" y2="1100" stroke="#fca5a5" stroke-width="2" />
      <!-- Horizontal ruled lines -->
      ${Array.from({ length: 30 })
        .map((_, i) => `<line x1="0" y1="${80 + i * 35}" x2="800" y2="${80 + i * 35}" stroke="#cbd5e1" stroke-width="1" />`)
        .join("\n")}
      <text x="70" y="50" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0f172a">${escapeXml(title)}</text>
      ${linesSvg}
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// 1. Comprehensive Biology Dataset matching Figma Screenshots
export const BIOLOGY_EXAM_DATASET: PipelineResult = (() => {
  const page1Image = createRuledPaperSvg("Answer Sheet - Page 1", [
    "Q1. Photosynthesis is the process used by green plants and some other",
    "     organisms to convert light energy into chemical energy.",
    "     6CO2 + 6H2O --(Light/Chlorophyll)--> C6H12O6 + 6O2",
    "",
    "",
    "Q2. The process mainly occurs in the chloroplast of the plant cell.",
    "     It has two main stages:",
    "     1. Light reaction - Captures light energy.",
    "     2. Dark reaction - Uses energy to make glucose.",
    "",
    "Q3. Chloroplasts contain chlorophyll a & b pigments that absorb blue/red light.",
    "     Stage 1: Thylakoid light absorption, Stage 2: Stroma carbon fixation."
  ]);

  const page2Image = createRuledPaperSvg("Answer Sheet - Page 2", [
    "Q4. Blood flow: Right Atrium -> Tricuspid valve -> Right Ventricle ->",
    "     Pulmonary valve -> Lungs -> Left Atrium -> Bicuspid valve ->",
    "     Left Ventricle -> Aortic valve -> Aorta.",
    "",
    "Q5. Alveolus diagram: Alveolar sac with single-cell epithelium,",
    "     surrounded by dense capillary network for O2/CO2 diffusion.",
    "",
    "Q6. Digestive system: Stomach (acid & pepsin) -> Small Intestine (duodenum/jejunum/ileum",
    "     with villi & microvilli for maximum nutrient absorption) -> Liver/Pancreas secretes enzymes.",
    "",
    "Q7. Nephron: Bowman's capsule (ultrafiltration) -> PCT -> Loop of Henle -> DCT -> Collecting duct."
  ]);

  const page3Image = createRuledPaperSvg("Answer Sheet - Page 3", [
    "Q8. Palisade mesophyll: tightly packed with high chloroplast density for light capture.",
    "     Spongy mesophyll: loose with large air spaces for efficient gas diffusion.",
    "",
    "Q9. Transpiration: Evaporation of water from mesophyll cell surfaces followed by",
    "     loss through stomata. Environmental factors: High Temperature & High Wind Speed.",
    "",
    "Q10. Xylem vessels: Dead, hollow cells with lignified walls that provide tensile strength",
    "      and prevent collapse under negative pressure during transpiration pull.",
    "",
    "11(a). Plant A has bright light -> high chlorophyll synthesis and healthy broad leaves.",
    "       Plant B in dim light -> etiolated, pale elongated leaves due to lack of light stimulation."
  ]);

  const page4Image = createRuledPaperSvg("Answer Sheet - Page 4", [
    "11(b). Practical measure: Shift Plant B gradually into bright indirect sunlight and maintain",
    "       adequate moisture to restore chlorophyll synthesis.",
    "",
    "Q12. Minute ventilation = Tidal Volume x Respiratory Rate = 0.5 L x 12 = 6.0 L/min.",
    "",
    "Q13. Alveolar ventilation = (Tidal Volume - Dead Space) x Rate",
    "     = (0.5 - 0.15) x 12 = 0.35 x 12 = 4.2 L/min.",
    "",
    "Q99. Extra student note: The experiment was conducted at room temperature (25°C)."
  ]);

  const questions: Question[] = [
    {
      id: "1",
      displayLabel: "1",
      text: "Which blood vessel carries blood away from the heart?",
      page: 1,
      bbox: [0.08, 0.05, 0.92, 0.15],
      maxScore: 2
    },
    {
      id: "2",
      displayLabel: "2",
      text: "Which of the following organelles is primarily involved in photosynthesis?",
      page: 1,
      bbox: [0.08, 0.16, 0.92, 0.28],
      maxScore: 2
    },
    {
      id: "3",
      displayLabel: "3",
      text: "Explain the role of chloroplasts in photosynthesis, naming the main pigments involved and briefly outlining the two major stages of the process.",
      page: 1,
      bbox: [0.08, 0.29, 0.92, 0.42],
      maxScore: 2
    },
    {
      id: "4",
      displayLabel: "4",
      text: "Describe the flow of blood through the human heart starting from the right atrium and ending at the aorta; include the names of valves crossed.",
      page: 1,
      bbox: [0.08, 0.43, 0.92, 0.58],
      maxScore: 2
    },
    {
      id: "5",
      displayLabel: "5",
      text: "Draw a labelled diagram of an alveolus showing capillaries and air space (label alveolar sac, capillary, and direction of gas exchange).",
      page: 1,
      bbox: [0.08, 0.59, 0.92, 0.72],
      maxScore: 2
    },
    {
      id: "6",
      displayLabel: "6",
      text: "Draw a neat labelled diagram of the human digestive system (stomach, small intestine, large intestine, liver, pancreas) and label the site where most absorption occurs.",
      page: 1,
      bbox: [0.08, 0.73, 0.92, 0.88],
      maxScore: 5
    },
    {
      id: "7",
      displayLabel: "7",
      text: "Draw and label a nephron (Bowman's capsule, glomerulus, proximal tubule, loop of Henle, distal tubule, collecting duct).",
      page: 2,
      bbox: [0.08, 0.05, 0.92, 0.18],
      maxScore: 5
    },
    {
      id: "8",
      displayLabel: "8",
      text: "Explain the structural differences between palisade mesophyll and spongy mesophyll and state how each structure aids its function in the leaf.",
      page: 2,
      bbox: [0.08, 0.19, 0.92, 0.32],
      maxScore: 5
    },
    {
      id: "9",
      displayLabel: "9",
      text: "Describe the process of transpiration in plants in two to three sentences and name two environmental factors that increase its rate.",
      page: 2,
      bbox: [0.08, 0.33, 0.92, 0.45],
      maxScore: 5
    },
    {
      id: "10",
      displayLabel: "10",
      text: "Explain how the structure of xylem vessels facilitates water transport in plants (mention one structural feature and its role).",
      page: 2,
      bbox: [0.08, 0.46, 0.92, 0.58],
      maxScore: 5
    },
    {
      id: "11.a",
      parentLabel: "11",
      displayLabel: "11 a.",
      text: "A diagram shows two potted plants — Plant A in bright light with broad green leaves, Plant B kept in dim light with pale, elongated leaves. Explain why.",
      page: 2,
      bbox: [0.08, 0.59, 0.92, 0.72],
      maxScore: 2
    },
    {
      id: "11.b",
      parentLabel: "11",
      displayLabel: "11 b.",
      text: "Suggest one practical measure to help Plant B recover.",
      page: 2,
      bbox: [0.08, 0.73, 0.92, 0.85],
      maxScore: 3
    },
    {
      id: "12",
      displayLabel: "12",
      text: "A resting person has tidal volume (air per breath) of 0.5 L and breathes 12 times per minute. Calculate the pulmonary ventilation.",
      page: 2,
      bbox: [0.08, 0.86, 0.92, 0.95],
      maxScore: 5
    },
    {
      id: "13",
      displayLabel: "13",
      text: "If dead space is 0.15 L per breath, calculate the alveolar ventilation per minute. Show working.",
      page: 2,
      bbox: [0.08, 0.96, 0.92, 0.99],
      maxScore: 5
    },
    {
      id: "14",
      displayLabel: "14",
      text: "Explain how negative feedback mechanisms regulate blood glucose levels after a meal.",
      page: 2,
      bbox: [0.08, 0.01, 0.92, 0.04],
      maxScore: 5
    }
  ];

  const answers: AnswerBlock[] = [
    {
      id: "ans-1",
      detectedLabel: "Q1",
      text: "Photosynthesis is the process used by green plants and some other organisms to convert light energy into chemical energy.",
      regions: [{ page: 1, bbox: [0.07, 0.08, 0.93, 0.22] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-2",
      detectedLabel: "Q2",
      text: "The process mainly occurs in the chloroplast of the plant cell. It has two main stages: 1. Light reaction - Captures light energy. 2. Dark reaction - Uses energy to make glucose.",
      regions: [{ page: 1, bbox: [0.07, 0.24, 0.93, 0.42] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-3",
      detectedLabel: "Q3",
      text: "Chloroplasts contain chlorophyll a & b pigments that absorb blue/red light. Stage 1: Thylakoid light absorption, Stage 2: Stroma carbon fixation.",
      regions: [{ page: 1, bbox: [0.07, 0.44, 0.93, 0.60] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-4",
      detectedLabel: "Q4",
      text: "Blood flow: Right Atrium -> Tricuspid valve -> Right Ventricle -> Pulmonary valve -> Lungs -> Left Atrium -> Bicuspid valve -> Left Ventricle -> Aortic valve -> Aorta.",
      regions: [{ page: 2, bbox: [0.07, 0.08, 0.93, 0.24] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-5",
      detectedLabel: "Q5",
      text: "Alveolus diagram: Alveolar sac with single-cell epithelium, surrounded by dense capillary network for O2/CO2 diffusion.",
      regions: [{ page: 2, bbox: [0.07, 0.26, 0.93, 0.40] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-6",
      detectedLabel: "Q6",
      text: "Digestive system: Stomach (acid & pepsin) -> Small Intestine (duodenum/jejunum/ileum with villi & microvilli for maximum nutrient absorption) -> Liver/Pancreas secretes enzymes.",
      regions: [{ page: 2, bbox: [0.07, 0.42, 0.93, 0.62] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-7",
      detectedLabel: "Q7",
      text: "Nephron: Bowman's capsule (ultrafiltration) -> PCT -> Loop of Henle -> DCT -> Collecting duct.",
      regions: [{ page: 2, bbox: [0.07, 0.64, 0.93, 0.82] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-8",
      detectedLabel: "Q8",
      text: "Palisade mesophyll: tightly packed with high chloroplast density for light capture. Spongy mesophyll: loose with large air spaces for efficient gas diffusion.",
      regions: [{ page: 3, bbox: [0.07, 0.08, 0.93, 0.24] }],
      transcriptionConfidence: "low" // Testing low confidence OCR
    },
    {
      id: "ans-9",
      detectedLabel: "Q9",
      text: "Transpiration: Evaporation of water from mesophyll cell surfaces followed by loss through stomata. Environmental factors: High Temperature & High Wind Speed.",
      regions: [{ page: 3, bbox: [0.07, 0.26, 0.93, 0.44] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-10",
      detectedLabel: "Q10",
      text: "Xylem vessels: Dead, hollow cells with lignified walls that provide tensile strength and prevent collapse under negative pressure during transpiration pull.",
      regions: [{ page: 3, bbox: [0.07, 0.46, 0.93, 0.62] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-11a",
      detectedLabel: "11(a)",
      text: "Plant A has bright light -> high chlorophyll synthesis and healthy broad leaves. Plant B in dim light -> etiolated, pale elongated leaves due to lack of light stimulation.",
      regions: [{ page: 3, bbox: [0.07, 0.64, 0.93, 0.82] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-11b",
      detectedLabel: "11(b)",
      text: "Practical measure: Shift Plant B gradually into bright indirect sunlight and maintain adequate moisture to restore chlorophyll synthesis.",
      regions: [{ page: 4, bbox: [0.07, 0.08, 0.93, 0.22] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-12-13",
      detectedLabel: "Q12",
      text: "Part 1 on Page 4, continues with working across pages.",
      // Multi-page spanning test!
      regions: [
        { page: 4, bbox: [0.07, 0.24, 0.93, 0.38] },
        { page: 4, bbox: [0.07, 0.40, 0.93, 0.56] }
      ],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-13",
      detectedLabel: "Q13",
      text: "Alveolar ventilation = (Tidal Volume - Dead Space) x Rate = (0.5 - 0.15) x 12 = 0.35 x 12 = 4.2 L/min.",
      regions: [{ page: 4, bbox: [0.07, 0.40, 0.93, 0.58] }],
      transcriptionConfidence: "high"
    },
    {
      id: "ans-unmatched",
      detectedLabel: "Q99",
      text: "Extra student note: The experiment was conducted at room temperature (25°C).",
      regions: [{ page: 4, bbox: [0.07, 0.62, 0.93, 0.78] }],
      transcriptionConfidence: "high"
    }
  ];

  const mappings = matchQuestionsToAnswers(questions, answers);

  // Add mock grading feedback and scores
  const feedbackMap: Record<string, { score: number; maxScore: number; feedback: string }> = {
    "1": { score: 2, maxScore: 2, feedback: "Correctly identifies blood vessels carrying blood away from the heart." },
    "2": { score: 2, maxScore: 2, feedback: "Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis. Keep it up!" },
    "3": { score: 2, maxScore: 2, feedback: "Detailed explanation of both light and dark stages with proper pigment naming." },
    "4": { score: 0, maxScore: 2, feedback: "Missing specific valve names and inverted atrial-ventricular sequence." },
    "5": { score: 2, maxScore: 2, feedback: "Accurate diagram description including capillary network and diffusion mechanics." },
    "6": { score: 4, maxScore: 5, feedback: "Good anatomical sequence; minor omission on pancreatic duct entry point." },
    "7": { score: 5, maxScore: 5, feedback: "All major segments of the nephron clearly identified in correct physiological order." },
    "8": { score: 3, maxScore: 5, feedback: "Palisade mesophyll structure well explained, but spongy mesophyll air space role was slightly brief." },
    "9": { score: 2, maxScore: 2, feedback: "Clear definition of transpiration and accurate environmental factors." },
    "10": { score: 4, maxScore: 5, feedback: "Good mention of lignified walls preventing vessel collapse under tension." },
    "11.a": { score: 2, maxScore: 2, feedback: "Correctly relates dim light to etiolation and lack of chlorophyll synthesis." },
    "11.b": { score: 1, maxScore: 3, feedback: "Partial credit: Moving to sunlight is good, but needed explanation of acclimatization." },
    "12": { score: 4, maxScore: 5, feedback: "Correct calculation for minute pulmonary ventilation with proper units." },
    "13": { score: 4, maxScore: 5, feedback: "Correct formula applied: (Tidal Volume - Dead Space) x Rate." },
    "14": { score: 0, maxScore: 5, feedback: "This question was left completely unanswered by the student." }
  };

  for (const m of mappings) {
    if (m.questionId && feedbackMap[m.questionId]) {
      m.score = feedbackMap[m.questionId].score;
      m.maxScore = feedbackMap[m.questionId].maxScore;
      m.feedback = feedbackMap[m.questionId].feedback;
    }
  }

  return {
    questions,
    answers,
    mappings,
    answerPageImages: [page1Image, page2Image, page3Image, page4Image]
  };
})();
