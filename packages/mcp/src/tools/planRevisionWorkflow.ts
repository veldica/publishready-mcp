export async function handlePlanRevisionWorkflow(args: {
  task:
    | "fact_preserving_revision"
    | "template_revision"
    | "reference_match"
    | "hotspot_fix"
    | "ai_sounding_audit";
  text: string;
  template_id?: string;
  reference_text?: string;
}) {
  const workflows = {
    fact_preserving_revision: {
      steps: ["analyze_text", "suggest_revision_levers", "revise", "compare_text_versions"],
      acceptance_gate: {
        integrity_score: ">= 85",
        polarity_shift_count: "0",
        anchor_recall: ">= 0.85",
      },
      initial_tool: "analyze_text",
      reason: "Establish a mechanical baseline before revision.",
    },
    template_revision: {
      steps: ["get_template", "analyze_against_template", "revise", "compare_text_versions"],
      acceptance_gate: {
        fit_score: "improvement required",
        integrity_score: ">= 85",
      },
      initial_tool: "analyze_against_template",
      reason: "Identify specific violations against the chosen template.",
    },
    reference_match: {
      steps: ["build_reference_profile", "compare_to_reference", "revise", "compare_text_versions"],
      acceptance_gate: {
        alignment_score: "improvement required",
        integrity_score: ">= 85",
      },
      initial_tool: "build_reference_profile",
      reason: "Extract the stylistic fingerprint of the reference text.",
    },
    hotspot_fix: {
      steps: ["find_hotspots", "surgical_edit", "compare_text_versions"],
      acceptance_gate: {
        hotspot_risk: "reduced",
        integrity_score: ">= 95",
      },
      initial_tool: "find_hotspots",
      reason: "Identify specific high-risk sentences or paragraphs.",
    },
    ai_sounding_audit: {
      steps: ["audit_ai_sounding_prose", "find_hotspots", "humanize", "compare_text_versions"],
      acceptance_gate: {
        ai_style_band: "lower preferred",
        marker_density_per_1000_words: "lower preferred",
        sentence_length_stddev: "increase preferred",
        lexical_diversity_mattr: "increase preferred",
      },
      initial_tool: "audit_ai_sounding_prose",
      reason: "Check Veldica AI-marker density, categories, exact matches, and rhythm signals.",
    },
  };

  const plan = workflows[args.task];

  return {
    structuredContent: plan,
    content: [
      {
        type: "text" as const,
        text: `Revision Plan for ${args.task.replace(/_/g, " ")}:
1. Recommended Workflow: ${plan.steps.join(" -> ")}
2. Quality Gate: ${JSON.stringify(plan.acceptance_gate)}
3. Next Action: Call '${plan.initial_tool}' (${plan.reason})`,
      },
    ],
  };
}
