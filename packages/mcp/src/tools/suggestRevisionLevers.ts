import { analyzeText } from "@veldica/publishready-core";
import type { Targets } from "@veldica/publishready-schemas";
import { buildPublicResult } from "../publicResult.js";

export async function handleSuggestRevisionLevers(args: {
  text: string;
  targets?: Targets;
  options?: {
    include_formula_breakdown?: boolean;
  };
}) {
  const {
    stats,
    analysis,
    violations,
    fit,
    summary,
    revision_levers,
    ai_analysis,
    word_tracking_metrics,
  } = analyzeText(args.text, args.targets);

  const result = buildPublicResult({
    requested_tool: "suggest_revision_levers",
    text: args.text,
    stats,
    analysis: {
      ...analysis,
      formulas: args.options?.include_formula_breakdown === false ? [] : analysis.formulas,
    },
    targets: args.targets ?? null,
    fit,
    summary,
    violations,
    revision_levers,
    ai_analysis,
    word_tracking_metrics,
    recommended_next: {
      tool: "compare_text_versions",
      reason: "Verify the quality and factual integrity of your revision.",
    },
  });

  const topLever = revision_levers[0]
    ? `Top lever: ${(revision_levers[0] as any).lever.replace(/_/g, " ")} (Signal: ${(revision_levers[0] as any).id.replace(/_/g, " ")}).`
    : "No revision levers suggested.";
  const impact = revision_levers[0]
    ? `Estimated impact: ${(revision_levers[0] as any).score}/100.`
    : "";

  return {
    structuredContent: result,
    content: [
      {
        type: "text" as const,
        text: `Revision Strategy:
- ${topLever}
- ${impact}
- Recommended next tool: compare_text_versions after applying revisions.`,
      },
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
