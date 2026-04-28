import { createHash } from "node:crypto";
import { WritingProfile } from "@veldica/publishready-schemas";
import { StructuralMetrics, analyzeText } from "./index.js";
import { round, safeDivide } from "./utils/math.js";
import { BUILTIN_TEMPLATES } from "./index.js";
import { getReadabilityBand } from "@veldica/readability";
import type { Targets, Template } from "@veldica/publishready-schemas";

export function buildProfile(texts: string[], name?: string): WritingProfile {
  if (texts.length === 0) {
    throw new Error("At least one text is required to build a writing profile.");
  }

  const allAnalysis = texts.map((t) => analyzeText(t));
  const allStats = allAnalysis.map((a) => a.stats);
  const combinedAnalysis = analyzeText(texts.join("\n\n"));
  const combinedStats = combinedAnalysis.stats;
  const sourceHash = createHash("sha256").update(JSON.stringify(texts)).digest("hex");

  const aggregate = (getter: (s: StructuralMetrics) => number) => {
    return round(allStats.reduce((sum, s) => sum + getter(s), 0) / allStats.length, 2);
  };

  const first = allStats[0];
  const profile: WritingProfile = {
    name,
    timestamp: deterministicTimestamp(sourceHash),
    profile_id: `profile_${sourceHash.slice(0, 16)}`,
    source_sha256: sourceHash,
    source_count: texts.length,
    counts: {
      word_count: Math.round(aggregate((s) => s.counts.word_count)),
      unique_word_count: Math.round(aggregate((s) => s.counts.unique_word_count)),
      sentence_count: Math.round(aggregate((s) => s.counts.sentence_count)),
      paragraph_count: Math.round(aggregate((s) => s.counts.paragraph_count)),
      heading_count: Math.round(aggregate((s) => s.counts.heading_count)),
      list_item_count: Math.round(aggregate((s) => s.counts.list_item_count)),
      character_count: Math.round(aggregate((s) => s.counts.character_count)),
      character_count_no_spaces: Math.round(aggregate((s) => s.counts.character_count_no_spaces)),
      letter_count: Math.round(aggregate((s) => s.counts.letter_count)),
      syllable_count: Math.round(aggregate((s) => s.counts.syllable_count)),
      polysyllable_count: Math.round(aggregate((s) => s.counts.polysyllable_count)),
      complex_word_count: Math.round(aggregate((s) => s.counts.complex_word_count)),
      difficult_word_count: Math.round(aggregate((s) => s.counts.difficult_word_count)),
      long_word_count: Math.round(aggregate((s) => s.counts.long_word_count)),
      reading_time_minutes: aggregate((s) => s.counts.reading_time_minutes),
    },
    sentence_metrics: {
      avg_words_per_sentence: aggregate((s) => s.sentence_metrics.avg_words_per_sentence),
      median_words_per_sentence: aggregate((s) => s.sentence_metrics.median_words_per_sentence),
      min_words_per_sentence: aggregate((s) => s.sentence_metrics.min_words_per_sentence),
      max_words_per_sentence: aggregate((s) => s.sentence_metrics.max_words_per_sentence),
      sentence_length_p90: aggregate((s) => s.sentence_metrics.sentence_length_p90),
      sentence_length_p95: aggregate((s) => s.sentence_metrics.sentence_length_p95),
      sentence_length_stddev: aggregate((s) => s.sentence_metrics.sentence_length_stddev),
      sentences_over_20_words: Math.round(
        aggregate((s) => s.sentence_metrics.sentences_over_20_words)
      ),
      sentences_over_25_words: Math.round(
        aggregate((s) => s.sentence_metrics.sentences_over_25_words)
      ),
      sentences_over_30_words: Math.round(
        aggregate((s) => s.sentence_metrics.sentences_over_30_words)
      ),
      sentences_over_40_words: Math.round(
        aggregate((s) => s.sentence_metrics.sentences_over_40_words)
      ),
      percent_sentences_over_20_words: aggregate(
        (s) => s.sentence_metrics.percent_sentences_over_20_words
      ),
      percent_sentences_over_25_words: aggregate(
        (s) => s.sentence_metrics.percent_sentences_over_25_words
      ),
      percent_sentences_over_30_words: aggregate(
        (s) => s.sentence_metrics.percent_sentences_over_30_words
      ),
      percent_sentences_over_40_words: aggregate(
        (s) => s.sentence_metrics.percent_sentences_over_40_words
      ),
    },
    paragraph_metrics: {
      avg_words_per_paragraph: aggregate((s) => s.paragraph_metrics.avg_words_per_paragraph),
      median_words_per_paragraph: aggregate((s) => s.paragraph_metrics.median_words_per_paragraph),
      min_words_per_paragraph: aggregate((s) => s.paragraph_metrics.min_words_per_paragraph),
      max_words_per_paragraph: aggregate((s) => s.paragraph_metrics.max_words_per_paragraph),
      paragraph_length_p90: aggregate((s) => s.paragraph_metrics.paragraph_length_p90),
      paragraph_length_p95: aggregate((s) => s.paragraph_metrics.paragraph_length_p95),
      paragraph_length_stddev: aggregate((s) => s.paragraph_metrics.paragraph_length_stddev),
      paragraphs_over_75_words: Math.round(
        aggregate((s) => s.paragraph_metrics.paragraphs_over_75_words)
      ),
      paragraphs_over_100_words: Math.round(
        aggregate((s) => s.paragraph_metrics.paragraphs_over_100_words)
      ),
      paragraphs_over_150_words: Math.round(
        aggregate((s) => s.paragraph_metrics.paragraphs_over_150_words)
      ),
      percent_paragraphs_over_75_words: aggregate(
        (s) => s.paragraph_metrics.percent_paragraphs_over_75_words
      ),
      percent_paragraphs_over_100_words: aggregate(
        (s) => s.paragraph_metrics.percent_paragraphs_over_100_words
      ),
      percent_paragraphs_over_150_words: aggregate(
        (s) => s.paragraph_metrics.percent_paragraphs_over_150_words
      ),
      avg_sentences_per_paragraph: aggregate(
        (s) => s.paragraph_metrics.avg_sentences_per_paragraph
      ),
      median_sentences_per_paragraph: aggregate(
        (s) => s.paragraph_metrics.median_sentences_per_paragraph
      ),
      max_sentences_per_paragraph: aggregate(
        (s) => s.paragraph_metrics.max_sentences_per_paragraph
      ),
    },
    lexical_metrics: {
      lexical_diversity_ttr: aggregate((s) => s.lexical.lexical_diversity_ttr),
      lexical_diversity_mattr: aggregate((s) => s.lexical.lexical_diversity_mattr),
      lexical_density: aggregate((s) => s.lexical.lexical_density),
      unique_word_count: Math.round(aggregate((s) => s.lexical.unique_word_count)),
      repetition_ratio: aggregate((s) => s.lexical.repetition_ratio),
      top_repeated_words: combinedStats.lexical.top_repeated_words,
      difficult_word_ratio: aggregate((s) => s.lexical.difficult_word_ratio),
      avg_characters_per_word: aggregate((s) => s.lexical.avg_characters_per_word),
      avg_syllables_per_word: aggregate((s) => s.lexical.avg_syllables_per_word),
      long_word_ratio: aggregate((s) => s.lexical.long_word_ratio),
      complex_word_ratio: aggregate((s) => s.lexical.complex_word_ratio),
    },
    scannability_metrics: {
      heading_density: aggregate((s) => s.scannability.heading_density),
      words_per_heading: nullableAggregate((s) => s.scannability.words_per_heading),
      list_density: aggregate((s) => s.scannability.list_density),
      words_between_breaks: aggregate((s) => s.scannability.words_between_breaks),
      wall_of_text_risk: mostSevereWallOfTextRisk(allStats),
      paragraph_scannability_score: aggregate((s) => s.scannability.paragraph_scannability_score),
      sentence_tail_risk_score: aggregate((s) => s.scannability.sentence_tail_risk_score),
    },
    fiction_metrics: first.fiction
      ? {
          dialogue_ratio: aggregate((s) => s.fiction?.dialogue_ratio || 0),
          avg_dialogue_run_length: aggregate((s) => s.fiction?.avg_dialogue_run_length || 0),
          narration_vs_dialogue_balance: first.fiction.narration_vs_dialogue_balance,
          scene_density_proxy: aggregate((s) => s.fiction?.scene_density_proxy || 0),
          exposition_density_proxy: aggregate((s) => s.fiction?.exposition_density_proxy || 0),
          sensory_term_density: aggregate((s) => s.fiction?.sensory_term_density || 0),
          abstract_word_ratio: aggregate((s) => s.fiction?.abstract_word_ratio || 0),
          paragraph_cadence_variation: aggregate(
            (s) => s.fiction?.paragraph_cadence_variation || 0
          ),
        }
      : undefined,
    consensus_grade: aggregate((s) => {
      const analysis = allAnalysis.find((a) => a.stats === s)?.analysis;
      return analysis?.consensus_grade || 0;
    }),
    readability_band: "Standard",
    summary: "",
  };

  profile.readability_band = getReadabilityBand(profile.consensus_grade);
  profile.summary = generateProfileSummary(profile);
  return profile;

  function nullableAggregate(getter: (s: StructuralMetrics) => number | null): number | null {
    const values = allStats
      .map(getter)
      .filter((value): value is number => typeof value === "number");

    if (values.length === 0) {
      return null;
    }

    return round(values.reduce((sum, value) => sum + value, 0) / values.length, 2);
  }
}

export function generateProfileSummary(profile: WritingProfile): string {
  const parts: string[] = [];

  // Sentence summary
  const wps = profile.sentence_metrics.avg_words_per_sentence;
  if (wps < 14) {
    parts.push("Punchy, direct sentence structure.");
  } else if (wps > 22) {
    parts.push("Elaborate, complex sentence structure.");
  } else {
    parts.push("Balanced sentence structure.");
  }

  // Lexical summary
  const dwr = profile.lexical_metrics.difficult_word_ratio;
  if (dwr < 0.06) {
    parts.push("Highly accessible vocabulary.");
  } else if (dwr > 0.15) {
    parts.push("Specialized or technical vocabulary.");
  }

  // Scannability summary
  const pss = profile.scannability_metrics.paragraph_scannability_score;
  if (pss > 80) {
    parts.push("High visual scannability.");
  } else if (pss < 40) {
    parts.push("Dense wall-of-text sections.");
  }

  // Fiction summary
  if (profile.fiction_metrics) {
    const dr = profile.fiction_metrics.dialogue_ratio;
    if (dr > 0.4) {
      parts.push("Dialogue-driven narrative style.");
    } else if (dr < 0.1) {
      parts.push("Expository narrative style.");
    }
  }

  return parts.join(" ");
}

export function profileFromTemplate(template: Template): WritingProfile {
  return profileFromTargets(template.targets, template.name, template.description);
}

export function profileFromTargets(
  targets: Targets,
  name = "Target Profile",
  summary = "Synthetic profile derived from numeric targets."
): WritingProfile {
  const sourceHash = createHash("sha256").update(JSON.stringify({ name, targets })).digest("hex");

  return {
    name,
    timestamp: deterministicTimestamp(sourceHash),
    profile_id: `target_${sourceHash.slice(0, 16)}`,
    source_sha256: sourceHash,
    source_count: 0,
    counts: {
      word_count: targets.counts?.word_count?.value ?? 0,
      unique_word_count: targets.counts?.unique_word_count?.value ?? 0,
      sentence_count: targets.counts?.sentence_count?.value ?? 0,
      paragraph_count: targets.counts?.paragraph_count?.value ?? 0,
      heading_count: targets.counts?.heading_count?.value ?? 0,
      list_item_count: targets.counts?.list_item_count?.value ?? 0,
      character_count: targets.counts?.character_count?.value ?? 0,
      character_count_no_spaces: targets.counts?.character_count_no_spaces?.value ?? 0,
      letter_count: targets.counts?.letter_count?.value ?? 0,
      syllable_count: targets.counts?.syllable_count?.value ?? 0,
      polysyllable_count: targets.counts?.polysyllable_count?.value ?? 0,
      complex_word_count: targets.counts?.complex_word_count?.value ?? 0,
      difficult_word_count: targets.counts?.difficult_word_count?.value ?? 0,
      long_word_count: targets.counts?.long_word_count?.value ?? 0,
      reading_time_minutes: targets.counts?.reading_time_minutes?.value ?? 0,
    },
    sentence_metrics: {
      avg_words_per_sentence: targets.sentence_metrics?.avg_words_per_sentence?.value ?? 0,
      median_words_per_sentence: targets.sentence_metrics?.median_words_per_sentence?.value ?? 0,
      min_words_per_sentence: targets.sentence_metrics?.min_words_per_sentence?.value ?? 0,
      max_words_per_sentence: targets.sentence_metrics?.max_words_per_sentence?.value ?? 0,
      sentence_length_p90: targets.sentence_metrics?.sentence_length_p90?.value ?? 0,
      sentence_length_p95: targets.sentence_metrics?.sentence_length_p95?.value ?? 0,
      sentence_length_stddev: targets.sentence_metrics?.sentence_length_stddev?.value ?? 0,
      sentences_over_20_words: targets.sentence_metrics?.sentences_over_20_words?.value ?? 0,
      sentences_over_25_words: targets.sentence_metrics?.sentences_over_25_words?.value ?? 0,
      sentences_over_30_words: targets.sentence_metrics?.sentences_over_30_words?.value ?? 0,
      sentences_over_40_words: targets.sentence_metrics?.sentences_over_40_words?.value ?? 0,
      percent_sentences_over_20_words:
        targets.sentence_metrics?.percent_sentences_over_20_words?.value ?? 0,
      percent_sentences_over_25_words:
        targets.sentence_metrics?.percent_sentences_over_25_words?.value ?? 0,
      percent_sentences_over_30_words:
        targets.sentence_metrics?.percent_sentences_over_30_words?.value ?? 0,
      percent_sentences_over_40_words:
        targets.sentence_metrics?.percent_sentences_over_40_words?.value ?? 0,
    },
    paragraph_metrics: {
      avg_words_per_paragraph: targets.paragraph_metrics?.avg_words_per_paragraph?.value ?? 0,
      median_words_per_paragraph: targets.paragraph_metrics?.median_words_per_paragraph?.value ?? 0,
      min_words_per_paragraph: targets.paragraph_metrics?.min_words_per_paragraph?.value ?? 0,
      max_words_per_paragraph: targets.paragraph_metrics?.max_words_per_paragraph?.value ?? 0,
      paragraph_length_p90: targets.paragraph_metrics?.paragraph_length_p90?.value ?? 0,
      paragraph_length_p95: targets.paragraph_metrics?.paragraph_length_p95?.value ?? 0,
      paragraph_length_stddev: targets.paragraph_metrics?.paragraph_length_stddev?.value ?? 0,
      paragraphs_over_75_words: targets.paragraph_metrics?.paragraphs_over_75_words?.value ?? 0,
      paragraphs_over_100_words: targets.paragraph_metrics?.paragraphs_over_100_words?.value ?? 0,
      paragraphs_over_150_words: targets.paragraph_metrics?.paragraphs_over_150_words?.value ?? 0,
      percent_paragraphs_over_75_words:
        targets.paragraph_metrics?.percent_paragraphs_over_75_words?.value ?? 0,
      percent_paragraphs_over_100_words:
        targets.paragraph_metrics?.percent_paragraphs_over_100_words?.value ?? 0,
      percent_paragraphs_over_150_words:
        targets.paragraph_metrics?.percent_paragraphs_over_150_words?.value ?? 0,
      avg_sentences_per_paragraph:
        targets.paragraph_metrics?.avg_sentences_per_paragraph?.value ?? 0,
      median_sentences_per_paragraph:
        targets.paragraph_metrics?.median_sentences_per_paragraph?.value ?? 0,
      max_sentences_per_paragraph:
        targets.paragraph_metrics?.max_sentences_per_paragraph?.value ?? 0,
    },
    lexical_metrics: {
      lexical_diversity_ttr: targets.lexical_metrics?.lexical_diversity_ttr?.value ?? 0,
      lexical_diversity_mattr: targets.lexical_metrics?.lexical_diversity_mattr?.value ?? 0,
      lexical_density: targets.lexical_metrics?.lexical_density?.value ?? 0,
      unique_word_count: targets.lexical_metrics?.unique_word_count?.value ?? 0,
      repetition_ratio: targets.lexical_metrics?.repetition_ratio?.value ?? 0,
      top_repeated_words: [],
      avg_characters_per_word: targets.lexical_metrics?.avg_characters_per_word?.value ?? 0,
      avg_syllables_per_word: targets.lexical_metrics?.avg_syllables_per_word?.value ?? 0,
      long_word_ratio: targets.lexical_metrics?.long_word_ratio?.value ?? 0,
      complex_word_ratio: targets.lexical_metrics?.complex_word_ratio?.value ?? 0,
      difficult_word_ratio: targets.lexical_metrics?.difficult_word_ratio?.value ?? 0,
    },
    scannability_metrics: {
      heading_density: targets.scannability_metrics?.heading_density?.value ?? 0,
      words_per_heading: targets.scannability_metrics?.words_per_heading?.value ?? null,
      list_density: targets.scannability_metrics?.list_density?.value ?? 0,
      words_between_breaks: targets.scannability_metrics?.words_between_breaks?.value ?? 0,
      wall_of_text_risk: "low",
      paragraph_scannability_score:
        targets.scannability_metrics?.paragraph_scannability_score?.value ?? 0,
      sentence_tail_risk_score: targets.scannability_metrics?.sentence_tail_risk_score?.value ?? 0,
    },
    fiction_metrics: targets.fiction_metrics
      ? {
          dialogue_ratio: targets.fiction_metrics.dialogue_ratio?.value ?? 0,
          avg_dialogue_run_length: targets.fiction_metrics.avg_dialogue_run_length?.value ?? 0,
          narration_vs_dialogue_balance: "balanced",
          scene_density_proxy: targets.fiction_metrics.scene_density_proxy?.value ?? 0,
          exposition_density_proxy: targets.fiction_metrics.exposition_density_proxy?.value ?? 0,
          sensory_term_density: targets.fiction_metrics.sensory_term_density?.value ?? 0,
          abstract_word_ratio: targets.fiction_metrics.abstract_word_ratio?.value ?? 0,
          paragraph_cadence_variation:
            targets.fiction_metrics.paragraph_cadence_variation?.value ?? 0,
        }
      : undefined,
    consensus_grade: targets.formulas?.consensus_grade?.value ?? 0,
    readability_band: getReadabilityBand(targets.formulas?.consensus_grade?.value ?? 0),
    summary,
  };
}

export function buildReferenceTargets(
  candidate: WritingProfile,
  reference: WritingProfile
): Targets {
  const targets: Targets = {
    sentence_metrics: {},
    paragraph_metrics: {},
    lexical_metrics: {},
    scannability_metrics: {},
    fiction_metrics: candidate.fiction_metrics && reference.fiction_metrics ? {} : undefined,
    formulas: {},
  };

  addDirectionalTarget(
    targets.sentence_metrics!,
    "avg_words_per_sentence",
    candidate.sentence_metrics.avg_words_per_sentence,
    reference.sentence_metrics.avg_words_per_sentence,
    0.12
  );
  addDirectionalTarget(
    targets.sentence_metrics!,
    "sentence_length_p95",
    candidate.sentence_metrics.sentence_length_p95,
    reference.sentence_metrics.sentence_length_p95,
    0.18
  );
  addDirectionalTarget(
    targets.paragraph_metrics!,
    "avg_words_per_paragraph",
    candidate.paragraph_metrics.avg_words_per_paragraph,
    reference.paragraph_metrics.avg_words_per_paragraph,
    0.18
  );
  addDirectionalTarget(
    targets.lexical_metrics!,
    "difficult_word_ratio",
    candidate.lexical_metrics.difficult_word_ratio,
    reference.lexical_metrics.difficult_word_ratio,
    0.2
  );
  addDirectionalTarget(
    targets.lexical_metrics!,
    "avg_characters_per_word",
    candidate.lexical_metrics.avg_characters_per_word,
    reference.lexical_metrics.avg_characters_per_word,
    0.08
  );
  addDirectionalTarget(
    targets.lexical_metrics!,
    "lexical_diversity_mattr",
    candidate.lexical_metrics.lexical_diversity_mattr,
    reference.lexical_metrics.lexical_diversity_mattr,
    0.15
  );
  addDirectionalTarget(
    targets.scannability_metrics!,
    "paragraph_scannability_score",
    candidate.scannability_metrics.paragraph_scannability_score,
    reference.scannability_metrics.paragraph_scannability_score,
    0.15
  );
  addDirectionalTarget(
    targets.formulas!,
    "consensus_grade",
    candidate.consensus_grade,
    reference.consensus_grade,
    0.12
  );

  if (candidate.fiction_metrics && reference.fiction_metrics && targets.fiction_metrics) {
    addDirectionalTarget(
      targets.fiction_metrics,
      "dialogue_ratio",
      candidate.fiction_metrics.dialogue_ratio,
      reference.fiction_metrics.dialogue_ratio,
      0.2
    );
    addDirectionalTarget(
      targets.fiction_metrics,
      "scene_density_proxy",
      candidate.fiction_metrics.scene_density_proxy,
      reference.fiction_metrics.scene_density_proxy,
      0.2
    );
    addDirectionalTarget(
      targets.fiction_metrics,
      "sensory_term_density",
      candidate.fiction_metrics.sensory_term_density,
      reference.fiction_metrics.sensory_term_density,
      0.25
    );
  }

  return removeEmptyTargetGroups(targets);
}

export function findNearestTemplates(profile: WritingProfile, count: number = 3): string[] {
  return BUILTIN_TEMPLATES.map((t: { targets: Targets; id: string }) => {
    let score = 0;
    if (t.targets.sentence_metrics?.avg_words_per_sentence?.value) {
      score += Math.abs(
        t.targets.sentence_metrics.avg_words_per_sentence.value -
          profile.sentence_metrics.avg_words_per_sentence
      );
    }
    if (t.targets.lexical_metrics?.difficult_word_ratio?.value) {
      score +=
        Math.abs(
          t.targets.lexical_metrics.difficult_word_ratio.value -
            profile.lexical_metrics.difficult_word_ratio
        ) * 100;
    }
    return { id: t.id, score };
  })
    .sort((a: { score: number }, b: { score: number }) => a.score - b.score)
    .slice(0, count)
    .map((t: { id: string }) => t.id);
}

export function compareProfiles(candidate: WritingProfile, reference: WritingProfile) {
  const metricsToCompare = [
    {
      key: "avg_words_per_sentence",
      path: (p: WritingProfile) => p.sentence_metrics.avg_words_per_sentence,
      weight: 1.0,
    },
    {
      key: "difficult_word_ratio",
      path: (p: WritingProfile) => p.lexical_metrics.difficult_word_ratio,
      weight: 1.0,
    },
    {
      key: "avg_characters_per_word",
      path: (p: WritingProfile) => p.lexical_metrics.avg_characters_per_word,
      weight: 0.8,
    },
    {
      key: "lexical_diversity_mattr",
      path: (p: WritingProfile) => p.lexical_metrics.lexical_diversity_mattr,
      weight: 0.7,
    },
    {
      key: "avg_words_per_paragraph",
      path: (p: WritingProfile) => p.paragraph_metrics.avg_words_per_paragraph,
      weight: 0.6,
    },
  ];

  if (candidate.fiction_metrics && reference.fiction_metrics) {
    metricsToCompare.push(
      {
        key: "dialogue_ratio",
        path: (p: WritingProfile) => p.fiction_metrics?.dialogue_ratio || 0,
        weight: 0.9,
      },
      {
        key: "scene_density_proxy",
        path: (p: WritingProfile) => p.fiction_metrics?.scene_density_proxy || 0,
        weight: 0.8,
      }
    );
  }

  let totalScore = 0;
  let totalWeight = 0;
  const diffs: { metric: string; delta: number; severity: "low" | "medium" | "high" }[] = [];
  const comparedMetrics = new Set<string>();

  for (const m of metricsToCompare) {
    const cVal = m.path(candidate);
    const rVal = m.path(reference);
    if (shouldSkipSyntheticZero(candidate, cVal) || shouldSkipSyntheticZero(reference, rVal)) {
      continue;
    }

    comparedMetrics.add(m.key);
    const delta = Math.abs(cVal - rVal);
    const normalizedDelta = safeDivide(delta, Math.max(rVal, 0.0001));

    const score = Math.max(0, 100 - normalizedDelta * 100);
    totalScore += score * m.weight;
    totalWeight += m.weight;

    if (normalizedDelta > 0.15) {
      diffs.push({
        metric: m.key,
        delta: round(delta, 2),
        severity: normalizedDelta > 0.4 ? "high" : normalizedDelta > 0.25 ? "medium" : "low",
      });
    }
  }

  const alignmentScore = round(safeDivide(totalScore, totalWeight), 2);

  return {
    alignment_score: alignmentScore,
    largest_differences: diffs
      .sort((a, b) => b.delta - a.delta)
      .map((d) => `${d.metric} (${d.delta})`),
    strongest_similarities: metricsToCompare
      .filter((m) => comparedMetrics.has(m.key) && !diffs.some((d) => d.metric === m.key))
      .map((m) => m.key),
  };
}

function deterministicTimestamp(hash: string): string {
  const seconds = Number.parseInt(hash.slice(0, 8), 16) % (20 * 365 * 24 * 60 * 60);
  return new Date(Date.UTC(2020, 0, 1) + seconds * 1000).toISOString();
}

function shouldSkipSyntheticZero(profile: WritingProfile, value: number): boolean {
  return profile.source_count === 0 && value === 0;
}

function mostSevereWallOfTextRisk(stats: StructuralMetrics[]): "low" | "medium" | "high" {
  const rank = { low: 0, medium: 1, high: 2 } as const;

  return stats
    .map((item) => item.scannability.wall_of_text_risk)
    .sort((left, right) => rank[right] - rank[left])[0];
}

function addDirectionalTarget(
  group: Record<string, { value: number; operator: "at_least" | "at_most" } | undefined>,
  metric: string,
  candidateValue: number,
  referenceValue: number,
  toleranceRatio: number
) {
  if (referenceValue === 0 && candidateValue === 0) {
    return;
  }

  const tolerance = Math.max(Math.abs(referenceValue) * toleranceRatio, 0.01);
  if (candidateValue > referenceValue + tolerance) {
    group[metric] = {
      value: round(referenceValue + tolerance, 4),
      operator: "at_most",
    };
  } else if (candidateValue < referenceValue - tolerance) {
    group[metric] = {
      value: round(Math.max(0, referenceValue - tolerance), 4),
      operator: "at_least",
    };
  }
}

function removeEmptyTargetGroups(targets: Targets): Targets {
  const cleaned: Targets = { ...targets };

  for (const key of Object.keys(cleaned) as Array<keyof Targets>) {
    const group = cleaned[key];
    if (group && typeof group === "object" && Object.keys(group).length === 0) {
      delete cleaned[key];
    }
  }

  return cleaned;
}
