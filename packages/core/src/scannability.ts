import * as stats from "./utils/math.js";

export interface ScannabilityMetricsResult {
  heading_density: number;
  words_per_heading: number | null;
  list_density: number;
  words_between_breaks: number;
  wall_of_text_risk: "low" | "medium" | "high";
  paragraph_scannability_score: number;
  sentence_tail_risk_score: number;
}

export function analyzeScannability(
  wordCount: number,
  headingCount: number,
  paragraphCount: number,
  listItemCount: number,
  paragraphWordCounts: number[],
  sentenceWordCounts: number[]
): ScannabilityMetricsResult {
  const headingDensity = headingCount / (wordCount / 100 || 1);
  const listDensity = listItemCount / (wordCount / 100 || 1);

  const wordsPerHeading = headingCount > 0 ? wordCount / headingCount : null;
  const wordsBetweenBreaks = wordCount / (headingCount + paragraphCount || 1);

  let wallOfTextRisk: "low" | "medium" | "high" = "low";
  if (wordsBetweenBreaks > 300 || paragraphWordCounts.some((c) => c > 200)) {
    wallOfTextRisk = "high";
  } else if (wordsBetweenBreaks > 150 || paragraphWordCounts.some((c) => c > 120)) {
    wallOfTextRisk = "medium";
  }

  const longParagraphs = paragraphWordCounts.filter((c) => c > 100).length;
  const pScannabilityScore =
    paragraphCount > 0 ? 100 - (longParagraphs / paragraphCount) * 100 : 100;

  const longSentences = sentenceWordCounts.filter((c) => c > 30).length;
  const sTailRiskScore =
    sentenceWordCounts.length > 0 ? (longSentences / sentenceWordCounts.length) * 100 : 0;

  return {
    heading_density: stats.round(headingDensity, 4),
    words_per_heading: wordsPerHeading ? stats.round(wordsPerHeading, 1) : null,
    list_density: stats.round(listDensity, 4),
    words_between_breaks: stats.round(wordsBetweenBreaks, 1),
    wall_of_text_risk: wallOfTextRisk,
    paragraph_scannability_score: stats.round(pScannabilityScore, 1),
    sentence_tail_risk_score: stats.round(sTailRiskScore, 1),
  };
}
