import {
  buildProfile,
  buildReferenceTargets,
  compareProfiles,
  compareIntegrity,
} from "@veldica/publishready-core";
import { BUILTIN_TEMPLATES } from "@veldica/publishready-core";
import { analyzeText } from "@veldica/publishready-core";
import type { Targets } from "@veldica/publishready-schemas";
import type { WritingProfile } from "@veldica/publishready-schemas";

type Trend = "improving" | "regressing" | "stable";

interface FitMovement {
  original_fit_score: number;
  revised_fit_score: number;
  delta: number;
  trend: Trend;
}

interface TemplateFitMovement extends FitMovement {
  template_id: string;
  over_corrected: boolean;
}

interface ReferenceAlignmentMovement {
  reference_name: string;
  original_alignment_score: number;
  revised_alignment_score: number;
  delta: number;
  trend: Trend;
  reference_targets: Targets;
}

export async function handleCompareTextVersions(args: {
  original_text: string;
  revised_text: string;
  template_id?: string;
  targets?: Targets;
  reference_text?: string;
  reference_profile?: WritingProfile;
}) {
  const profileA = buildProfile([args.original_text]);
  const profileB = buildProfile([args.revised_text]);
  const comparison = compareProfiles(profileB, profileA); // B vs A

  const template = args.template_id
    ? BUILTIN_TEMPLATES.find((t) => t.id === args.template_id)
    : null;

  if (args.template_id && !template) {
    throw new Error(`Template not found: ${args.template_id}`);
  }

  const analysisA = analyzeText(args.original_text, template?.targets || args.targets);
  const analysisB = analyzeText(args.revised_text, template?.targets || args.targets);

  const revisedStats = analysisB.stats;

  let templateFitInfo: TemplateFitMovement | null = null;
  if (args.template_id && template) {
    const fitA = analysisA.fit!;
    const fitB = analysisB.fit!;

    const delta = fitB.score - fitA.score;
    let overCorrected = false;

    // Over-correction proxy: very high score with very low sentence length vs target
    if (
      fitB.score > 95 &&
      revisedStats.sentence_metrics.avg_words_per_sentence <
        (template.targets.sentence_metrics?.avg_words_per_sentence?.value || 10) * 0.6
    ) {
      overCorrected = true;
    }

    templateFitInfo = {
      template_id: args.template_id,
      original_fit_score: fitA.score,
      revised_fit_score: fitB.score,
      delta,
      trend: trendFromDelta(delta),
      over_corrected: overCorrected,
    };
  }

  let targetFitInfo: FitMovement | null = null;
  if (args.targets) {
    const fitA = analysisA.fit!;
    const fitB = analysisB.fit!;
    const delta = fitB.score - fitA.score;
    targetFitInfo = {
      original_fit_score: fitA.score,
      revised_fit_score: fitB.score,
      delta,
      trend: trendFromDelta(delta),
    };
  }

  const reference =
    args.reference_profile || (args.reference_text ? buildProfile([args.reference_text]) : null);
  let referenceAlignment: ReferenceAlignmentMovement | null = null;
  if (reference) {
    const originalComparison = compareProfiles(profileA, reference);
    const revisedComparison = compareProfiles(profileB, reference);
    const referenceTargets = buildReferenceTargets(profileB, reference);
    const delta = revisedComparison.alignment_score - originalComparison.alignment_score;
    referenceAlignment = {
      reference_name: reference.name ?? "Provided Reference",
      original_alignment_score: originalComparison.alignment_score,
      revised_alignment_score: revisedComparison.alignment_score,
      delta,
      trend: trendFromDelta(delta),
      reference_targets: referenceTargets,
    };
  }

  const goalDeltas = [
    templateFitInfo?.delta,
    targetFitInfo?.delta,
    referenceAlignment?.delta,
  ].filter((delta): delta is number => typeof delta === "number");
  const averageGoalDelta =
    goalDeltas.length > 0
      ? goalDeltas.reduce((sum, delta) => sum + delta, 0) / goalDeltas.length
      : 0;

  const integrity = compareIntegrity(args.original_text, args.revised_text);

  const quality_gate = {
    status: "pass" as "pass" | "warning" | "fail",
    reasons: [] as string[],
    recommended_action: "accept_revision" as "accept_revision" | "revise_again" | "reject_revision",
  };

  if (integrity.polarity_shift_count > 0) {
    quality_gate.status = "fail";
    quality_gate.reasons.push("Polarity shift detected; meaning may have been reversed.");
    quality_gate.recommended_action = "reject_revision";
  }

  if (integrity.integrity_score < 85) {
    if (quality_gate.status !== "fail") quality_gate.status = "warning";
    quality_gate.reasons.push(`Low integrity score (${integrity.integrity_score}/100).`);
  }

  if (integrity.anchor_recall < 0.85) {
    if (quality_gate.status !== "fail") quality_gate.status = "warning";
    quality_gate.reasons.push(`Low anchor recall (${Math.round(integrity.anchor_recall * 100)}%).`);
  }

  const goalDeltasExist = goalDeltas.length > 0;
  if (goalDeltasExist && averageGoalDelta < -1) {
    if (quality_gate.status !== "fail") quality_gate.status = "warning";
    quality_gate.reasons.push("Prose metrics are moving away from the goal.");
  }

  if (quality_gate.status === "warning") {
    quality_gate.recommended_action = "revise_again";
  }

  const result = {
    comparison,
    template_fit: templateFitInfo,
    target_fit: targetFitInfo,
    reference_alignment: referenceAlignment,
    content_integrity: integrity,
    quality_gate,
    metrics_delta: {
      sentence_length: round(
        profileB.sentence_metrics.avg_words_per_sentence -
          profileA.sentence_metrics.avg_words_per_sentence,
        2
      ),
      vocabulary_difficulty: round(
        profileB.lexical_metrics.difficult_word_ratio -
          profileA.lexical_metrics.difficult_word_ratio,
        4
      ),
      grade_level: round(profileB.consensus_grade - profileA.consensus_grade, 1),
    },
    improvements: buildImprovements(profileA, profileB),
    regressions: buildRegressions(profileA, profileB),
    stable_traits: comparison.strongest_similarities,
    movement:
      goalDeltas.length === 0
        ? "no_goal"
        : averageGoalDelta > 1
          ? "toward_goal"
          : averageGoalDelta < -1
            ? "away_from_goal"
            : "stable",
    summary: summarizeVersionMovement(
      args.template_id,
      templateFitInfo,
      targetFitInfo,
      referenceAlignment
    ),
    recommended_next:
      quality_gate.status === "pass"
        ? undefined
        : {
            tool: "suggest_revision_levers",
            reason: "Quality gate did not pass. Identify further levers to improve the revision.",
          },
  };

  function round(val: number, precision: number) {
    return Number(val.toFixed(precision));
  }

  return {
    structuredContent: result,
    content: [
      {
        type: "text" as const,
        text: `Version Comparison:
${result.summary}

Quality Gate: ${result.quality_gate.status.toUpperCase()} (${result.quality_gate.recommended_action})
${
  result.quality_gate.reasons.length > 0
    ? result.quality_gate.reasons.map((r) => `- ${r}`).join("\n")
    : "- Meets all quality thresholds."
}

Content Integrity Score: ${result.content_integrity.integrity_score}/100
Anchor Recall: ${result.content_integrity.anchor_recall * 100}%
Polarity Shifts: ${result.content_integrity.polarity_shift_count}

Movement: ${result.movement}
Changed traits: ${comparison.largest_differences.join(", ") || "none"}`,
      },
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

function trendFromDelta(delta: number): Trend {
  if (delta > 0) return "improving";
  if (delta < 0) return "regressing";
  return "stable";
}

function buildImprovements(original: WritingProfile, revised: WritingProfile): string[] {
  const improvements: string[] = [];
  if (
    revised.sentence_metrics.avg_words_per_sentence <
    original.sentence_metrics.avg_words_per_sentence
  ) {
    improvements.push("Average sentence length decreased.");
  }
  if (
    revised.lexical_metrics.difficult_word_ratio < original.lexical_metrics.difficult_word_ratio
  ) {
    improvements.push("Difficult-word ratio decreased.");
  }
  if (revised.consensus_grade < original.consensus_grade) {
    improvements.push("Consensus grade moved lower.");
  }
  if (
    revised.scannability_metrics.paragraph_scannability_score >
    original.scannability_metrics.paragraph_scannability_score
  ) {
    improvements.push("Paragraph scannability improved.");
  }

  return improvements;
}

function buildRegressions(original: WritingProfile, revised: WritingProfile): string[] {
  const regressions: string[] = [];
  if (
    revised.sentence_metrics.avg_words_per_sentence >
    original.sentence_metrics.avg_words_per_sentence
  ) {
    regressions.push("Average sentence length increased.");
  }
  if (
    revised.lexical_metrics.difficult_word_ratio > original.lexical_metrics.difficult_word_ratio
  ) {
    regressions.push("Difficult-word ratio increased.");
  }
  if (revised.consensus_grade > original.consensus_grade) {
    regressions.push("Consensus grade moved higher.");
  }
  if (
    revised.scannability_metrics.paragraph_scannability_score <
    original.scannability_metrics.paragraph_scannability_score
  ) {
    regressions.push("Paragraph scannability declined.");
  }

  return regressions;
}

function summarizeVersionMovement(
  templateId: string | undefined,
  templateFit: TemplateFitMovement | null,
  targetFit: FitMovement | null,
  referenceAlignment: ReferenceAlignmentMovement | null
): string {
  if (templateFit) {
    return `Revision is ${templateFit.trend} relative to ${templateId} profile. (Fit: ${templateFit.original_fit_score} -> ${templateFit.revised_fit_score})`;
  }
  if (targetFit) {
    return `Revision is ${targetFit.trend} relative to explicit targets. (Fit: ${targetFit.original_fit_score} -> ${targetFit.revised_fit_score})`;
  }
  if (referenceAlignment) {
    return `Revision is ${referenceAlignment.trend} relative to the reference. (Alignment: ${referenceAlignment.original_alignment_score} -> ${referenceAlignment.revised_alignment_score})`;
  }

  return "Prose evolution analysis completed without an explicit target, template, or reference goal.";
}
