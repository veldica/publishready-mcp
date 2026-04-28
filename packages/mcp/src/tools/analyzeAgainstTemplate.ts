import { analyzeText, BUILTIN_TEMPLATES, interpretMetrics } from "@veldica/publishready-core";
import { buildPublicResult } from "../publicResult.js";

export async function handleAnalyzeAgainstTemplate(args: {
  text: string;
  template_id: string;
  options?: {
    include_formula_breakdown?: boolean;
    include_sentence_details?: boolean;
    include_paragraph_details?: boolean;
  };
}) {
  const template = BUILTIN_TEMPLATES.find((t) => t.id === args.template_id);
  if (!template) {
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
  } = analyzeText(args.text, template.targets);
  const interpretations = interpretMetrics(stats, template);

  const result = buildPublicResult({
    requested_tool: "analyze_against_template",
    text: args.text,
    stats,
    analysis: {
      ...analysis,
      formulas: args.options?.include_formula_breakdown === false ? [] : analysis.formulas,
    },
    targets: template.targets,
    template_info: { id: template.id, name: template.name, family: template.family },
    fit,
    violations,
    summary,
    revision_levers: revision_levers,
    ai_analysis,
    word_tracking_metrics,
    interpretations,
    include_sentence_details: args.options?.include_sentence_details,
    include_paragraph_details: args.options?.include_paragraph_details,
    recommended_next: {
      tool: "compare_text_versions",
      reason: "Verify movement toward template targets and factual integrity after revision.",
    },
  });

  const topViolation =
    violations && violations[0]
      ? `Top violation: ${violations[0].metric} is ${violations[0].current_value} (target ${violations[0].operator} ${violations[0].target_value}).`
      : "No violations found.";
  const topLever = revision_levers[0]
    ? `Top lever: ${(revision_levers[0] as any).lever.replace(/_/g, " ")}.`
    : "No revision levers suggested.";

  return {
    structuredContent: result,
    content: [
      {
        type: "text" as const,
        text: `Template Comparison (${template.name}):
- Fit Score: ${fit?.score}/100
- ${topViolation}
- ${topLever}
- Recommended next tool: suggest_revision_levers or compare_text_versions after revision.`,
      },
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
