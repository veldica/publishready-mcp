import { analyzeText, findHotspots } from "@veldica/publishready-core";
import type { Targets } from "@veldica/publishready-schemas";
import { buildPublicResult } from "../publicResult.js";

export async function handleAuditAISoundingProse(args: {
  text: string;
  track_words?: string[];
  include_matches?: boolean;
  include_formula_breakdown?: boolean;
}) {
  const targets: Targets = {
    track_ai_patterns: true,
    word_tracking_metrics: Object.fromEntries(
      (args.track_words ?? []).map((word) => [word, { value: 0, operator: "at_least" as const }])
    ),
  };

  const { stats, analysis, revision_levers, ai_analysis, word_tracking_metrics } = analyzeText(
    args.text,
    targets
  );
  const hotspots = findHotspots(stats);
  const markerCategories = Object.entries(ai_analysis?.categories ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([category, count]) => `${category}: ${count}`);

  const result = buildPublicResult({
    requested_tool: "audit_ai_sounding_prose",
    text: args.text,
    stats,
    analysis: {
      ...analysis,
      formulas: args.include_formula_breakdown ? analysis.formulas : [],
    },
    revision_levers,
    ai_analysis: ai_analysis
      ? {
          ...ai_analysis,
          matches: args.include_matches === false ? [] : ai_analysis.matches,
        }
      : undefined,
    word_tracking_metrics,
    hotspots,
    recommended_next: {
      tool: "find_hotspots",
      reason: "Inspect the specific sentences and paragraphs most likely to need humanizing edits.",
    },
  });

  return {
    structuredContent: result,
    content: [
      {
        type: "text" as const,
        text: `AI-Sounding Prose Audit:
- Style band: ${ai_analysis?.style_band ?? "unknown"}.
- Marker density: ${ai_analysis?.marker_density_per_1000_words ?? 0} per 1000 words.
- Marker count: ${ai_analysis?.marker_count ?? 0}.
- Top categories: ${markerCategories.slice(0, 5).join(", ") || "none"}.
- Recommended next tool: find_hotspots for localized revision targets.`,
      },
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
