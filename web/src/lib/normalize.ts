export function normalizeLabel(raw: string | null | undefined): string {
  if (!raw) return "";

  let str = raw.toLowerCase().trim();

  // Remove common prefixes
  // e.g., "Question 2" -> "2", "Ans 2" -> "2", "Q2" -> "2", "Q. 2" -> "2", "No. 2" -> "2", "Q11(a)" -> "11(a)"
  str = str.replace(/^(?:question|q|answer|ans|no|num)\s*[\.\:\-\#]?\s*/i, "");

  // Convert sub-part formats: "11 (a)", "11a", "11-a", "11.a", "11 a", "11.(a)", "11 (b)" -> "11.a"
  str = str.replace(/^(\d+)\s*[\(\.\-\_]?\s*\(?([a-z])\)?$/i, "$1.$2");

  // Clean up trailing punctuation or leading/trailing parentheses for pure numbers or letters
  // e.g., "2." -> "2", "2)" -> "2", "(a)" -> "a"
  str = str.replace(/^\(+/, "");
  str = str.replace(/[\.\)\:\-]+$/, "");

  return str.trim();
}
