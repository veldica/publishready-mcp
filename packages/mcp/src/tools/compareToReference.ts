import { buildProfile, buildReferenceTargets, compareProfiles } from "@veldica/publishready-core";
import { analyzeText } from "@veldica/publishready-core";
import { WritingProfile } from "@veldica/publishready-schemas";

export async function handleCompareToReference(args: {
  candidate_text: string;
  reference_text?: string;
  reference_profile?: WritingProfile;
}): Promise<any> {
  const currentProfile = buildProfile([args.candidate_text]);
  const reference =
    args.reference_profile || (args.reference_text ? buildProfile([args.reference_text]) : null);

  if (!reference) {
    throw new Error("Either reference_text or reference_profile must be provided.");
  }

  const comparison = compareProfiles(currentProfile, reference);
  const referenceTargets = buildReferenceTargets(currentProfile, reference);

  const { revision_levers } = analyzeText(args.candidate_text, referenceTargets);

  const result = {
    alignment_score: comparison.alignment_score,
    reference_name: reference.name || "Provided Reference",
    candidate_summary: currentProfile.summary,
    reference_summary: reference.summary,
    largest_differences: comparison.largest_differences,
    strongest_similarities: comparison.strongest_similarities,
    reference_targets: referenceTargets,
    revision_levers: revision_levers.slice(0, 6),
    metrics: {
      candidate: {
        avg_words_per_sentence: currentProfile.sentence_metrics.avg_words_per_sentence,
        difficult_word_ratio: currentProfile.lexical_metrics.difficult_word_ratio,
        avg_characters_per_word: currentProfile.lexical_metrics.avg_characters_per_word,
        scannability_score: currentProfile.scannability_metrics.paragraph_scannability_score,
        consensus_grade: currentProfile.consensus_grade,
      },
      reference: {
        avg_words_per_sentence: reference.sentence_metrics.avg_words_per_sentence,
        difficult_word_ratio: reference.lexical_metrics.difficult_word_ratio,
        avg_characters_per_word: reference.lexical_metrics.avg_characters_per_word,
        scannability_score: reference.scannability_metrics.paragraph_scannability_score,
        consensus_grade: reference.consensus_grade,
      },
    },
    recommended_next: {
      tool: "compare_text_versions",
      reason: "Verify movement toward reference style and factual integrity after revision.",
    },
  };

  return {
    structuredContent: result,
    content: [
      {
        type: "text" as const,
        text: `Comparison Result: ${comparison.alignment_score}/100 alignment with reference.\n\nLargest Differences: ${comparison.largest_differences.join(", ") || "none"}`,
      },
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
