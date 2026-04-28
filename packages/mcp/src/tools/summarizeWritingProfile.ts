import { buildProfile, findNearestTemplates } from "@veldica/publishready-core";

export async function handleSummarizeWritingProfile(args: { text: string }) {
  const profile = buildProfile([args.text]);
  const nearest = findNearestTemplates(profile);

  const result = {
    profile,
    summary: profile.summary,
    nearest_templates: nearest,
    notable_traits: {
      sentence_length: profile.sentence_metrics.avg_words_per_sentence,
      vocabulary_difficulty: profile.lexical_metrics.difficult_word_ratio,
      avg_characters_per_word: profile.lexical_metrics.avg_characters_per_word,
      scannability: profile.scannability_metrics.paragraph_scannability_score,
      consensus_grade: profile.consensus_grade,
    },
  };

  return {
    structuredContent: result as unknown as Record<string, unknown>,
    content: [
      {
        type: "text" as const,
        text: `Writing Profile Summary:\n${profile.summary}\n\nNearest Templates: ${nearest.join(", ") || "none"}`,
      },
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
