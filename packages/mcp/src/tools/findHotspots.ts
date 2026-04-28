import {
  analyzeText,
  findHotspots,
  BUILTIN_TEMPLATES,
  interpretMetrics,
} from "@veldica/publishready-core";
import { buildPublicResult } from "../publicResult.js";

export async function handleFindHotspots(args: { text: string; template_id?: string }) {
  const template = args.template_id
    ? BUILTIN_TEMPLATES.find((t) => t.id === args.template_id)
    : null;
  if (args.template_id && !template) {
    throw new Error(`Template not found: ${args.template_id}`);
  }

  const {
    stats,
    analysis,
    violations,
    fit,
    summary,
    revision_levers,
    ai_analysis,
    word_tracking_metrics,
  } = analyzeText(args.text, template?.targets);
  const hotspots = findHotspots(stats, template?.targets);
  const interpretations = interpretMetrics(stats, template ?? undefined);

  const result = buildPublicResult({
    requested_tool: "find_hotspots",
    text: args.text,
    stats,
    analysis,
    targets: template?.targets ?? null,
    hotspots,
    template_info: template
      ? { id: template.id, name: template.name, family: template.family }
      : undefined,
    fit,
    violations,
    summary,
    revision_levers,
    ai_analysis,
    word_tracking_metrics,
    interpretations,
    recommended_next: {
      tool: "compare_text_versions",
      reason: "Verify that surgical edits improved scannability without factual loss.",
    },
  });

  const hotspotsSummary =
    hotspots.length > 0
      ? `Found ${hotspots.length} hotspots impacting readability.`
      : "No major hotspots identified.";
  const highestRisk = hotspots[0]
    ? `Highest-risk segment: ${hotspots[0].type} at index ${hotspots[0].index} (${hotspots[0].score}/100 risk).`
    : "";

  return {
    structuredContent: result,
    content: [
      {
        type: "text" as const,
        text: `Hotspot Analysis:
- ${hotspotsSummary}
- ${highestRisk}
- Recommended next tool: compare_text_versions after surgical revision.`,
      },
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
