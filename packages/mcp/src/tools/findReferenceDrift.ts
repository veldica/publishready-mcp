import {
  buildProfile,
  buildReferenceTargets,
  compareProfiles,
  analyzeText,
} from "@veldica/publishready-core";
import { findHotspots } from "@veldica/publishready-core";
import { WritingProfile } from "@veldica/publishready-schemas";

export async function handleFindReferenceDrift(args: {
  candidate_text: string;
  reference_text?: string;
  reference_profile?: WritingProfile;
}) {
  const currentProfile = buildProfile([args.candidate_text]);
  const reference =
    args.reference_profile || (args.reference_text ? buildProfile([args.reference_text]) : null);

  if (!reference) {
    throw new Error("Either reference_text or reference_profile must be provided.");
  }

  const comparison = compareProfiles(currentProfile, reference);
  const driftDetected = comparison.alignment_score < 75;
  const referenceTargets = buildReferenceTargets(currentProfile, reference);
  const { stats } = analyzeText(args.candidate_text, referenceTargets);
  const driftPoints = findHotspots(stats, referenceTargets).slice(0, 8);

  const result = {
    drift_detected: driftDetected,
    alignment_score: comparison.alignment_score,
    summary: driftDetected
      ? "Significant drift detected from the reference style."
      : "Writing remains largely aligned with the reference style.",
    changing_traits: comparison.largest_differences,
    stable_traits: comparison.strongest_similarities,
    impact_areas: comparison.largest_differences.map((d) => d.split(" ")[0]),
    reference_targets: referenceTargets,
    drift_points: driftPoints,
    recommended_next: {
      tool: "compare_text_versions",
      reason: "Verify movement back toward the reference fingerprint after correcting drift.",
    },
  };

  return {
    structuredContent: result,
    content: [
      {
        type: "text" as const,
        text: `Reference Drift Analysis:\n${result.summary}\n\nTop Drift Areas: ${comparison.largest_differences.join(", ") || "none"}`,
      },
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
