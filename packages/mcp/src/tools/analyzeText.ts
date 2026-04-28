import { analyzeText, interpretMetrics, findHotspots } from "@veldica/publishready-core";
import { buildPublicResult } from "../publicResult.js";

export async function handleAnalyzeText(args: {
  text: string;
  options?: {
    include_formula_breakdown?: boolean;
    include_sentence_details?: boolean;
    include_paragraph_details?: boolean;
  };
}) {
  const { stats, analysis, revision_levers, ai_analysis, word_tracking_metrics } = analyzeText(
    args.text
  );
  const interpretations = interpretMetrics(stats);
  const hotspots = findHotspots(stats);

  const result = buildPublicResult({
    requested_tool: "analyze_text",
    text: args.text,
    stats,
    analysis: {
      ...analysis,
      formulas: args.options?.include_formula_breakdown === false ? [] : analysis.formulas,
    },
    revision_levers,
    ai_analysis,
    word_tracking_metrics,
    interpretations,
    hotspots,
    include_sentence_details: args.options?.include_sentence_details,
    include_paragraph_details: args.options?.include_paragraph_details,
    recommended_next: {
      tool: "suggest_revision_levers",
      reason: "Identify specific mechanical adjustments to improve readability.",
    },
  });

  const topFinding = revision_levers[0]
    ? `Main readability drag is ${(revision_levers[0] as any).id.replace(/_/g, " ")}.`
    : "No major readability drags identified.";
  const topLever = revision_levers[0]
    ? `Top lever: ${(revision_levers[0] as any).lever.replace(/_/g, " ")}.`
    : "No revision levers suggested.";
  const highestRiskHotspot = hotspots[0]
    ? `Highest-risk hotspot: ${hotspots[0].type} at index ${hotspots[0].index}.`
    : "No high-risk hotspots identified.";

  return {
    structuredContent: result,
    content: [
      {
        type: "text" as const,
        text: `Top Findings:
- ${topFinding}
- ${topLever}
- ${highestRiskHotspot}
- Recommended next tool: suggest_revision_levers or find_hotspots.`,
      },
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
