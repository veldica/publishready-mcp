import { METRIC_SIGNALS } from "./catalog/signals.js";
import { BUILTIN_TEMPLATES } from "@veldica/publishready-core";
import type { Template, Targets } from "@veldica/publishready-schemas";
import type { StructuralMetrics } from "@veldica/publishready-schemas";

export function interpretMetrics(
  stats: StructuralMetrics,
  template?: Template
): Record<string, string> {
  const interpretations: Record<string, string> = {};
  const family = template?.family || "nonfiction";

  // Character per word
  const cpw = stats.lexical.avg_characters_per_word;
  if (cpw > 5.2) {
    interpretations["avg_characters_per_word"] =
      family === "fiction"
        ? "Vocabulary is elevated and potentially dense for narrative prose."
        : METRIC_SIGNALS["avg_characters_per_word"].high_meaning;
  } else if (cpw < 4.2) {
    interpretations["avg_characters_per_word"] =
      METRIC_SIGNALS["avg_characters_per_word"].low_meaning;
  }

  // Words per sentence
  const wps = stats.sentence_metrics.avg_words_per_sentence;
  if (wps > 22) {
    interpretations["avg_words_per_sentence"] =
      family === "fiction"
        ? "Elaborate narrative pacing; risk of slowing down action scenes."
        : METRIC_SIGNALS["avg_words_per_sentence"].high_meaning;
  } else if (wps < 12) {
    interpretations["avg_words_per_sentence"] =
      family === "nonfiction"
        ? "Highly punchy, suitable for conversion copy or mobile reading."
        : "Fast-paced, staccato narrative rhythm.";
  }

  // Lexical diversity
  if (stats.lexical.lexical_diversity_mattr > 0.8) {
    interpretations["lexical_diversity_mattr"] =
      METRIC_SIGNALS["lexical_diversity_mattr"].high_meaning;
  } else if (stats.lexical.lexical_diversity_mattr < 0.5) {
    interpretations["lexical_diversity_mattr"] =
      METRIC_SIGNALS["lexical_diversity_mattr"].low_meaning;
  }

  // Scannability
  if (stats.scannability.wall_of_text_risk === "high") {
    interpretations["wall_of_text_risk"] =
      family === "fiction"
        ? "Long narrative blocks may benefit from more frequent scene breaks or dialogue."
        : METRIC_SIGNALS["wall_of_text_risk"].high_meaning;
  }

  // Sentence tail risk
  if (stats.scannability.sentence_tail_risk_score > 60) {
    interpretations["sentence_tail_risk_score"] =
      METRIC_SIGNALS["sentence_tail_risk_score"].high_meaning;
  }

  // Fiction specific
  if (stats.fiction) {
    if (stats.fiction.dialogue_ratio > 0.4) {
      interpretations["dialogue_ratio"] = METRIC_SIGNALS["dialogue_ratio"].high_meaning;
    } else if (stats.fiction.dialogue_ratio < 0.1 && family === "fiction") {
      interpretations["dialogue_ratio"] = "Low dialogue ratio; the scene is heavily expository.";
    }

    if (stats.fiction.scene_density_proxy > 0.7) {
      interpretations["scene_density_proxy"] = METRIC_SIGNALS["scene_density_proxy"].high_meaning;
    } else if (stats.fiction.scene_density_proxy < 0.3) {
      interpretations["scene_density_proxy"] = METRIC_SIGNALS["scene_density_proxy"].low_meaning;
    }

    if (stats.fiction.sensory_term_density > 0.04) {
      interpretations["sensory_term_density"] = METRIC_SIGNALS["sensory_term_density"].high_meaning;
    } else if (stats.fiction.sensory_term_density < 0.01 && family === "fiction") {
      interpretations["sensory_term_density"] = METRIC_SIGNALS["sensory_term_density"].low_meaning;
    }

    if (stats.fiction.abstract_word_ratio > 0.05) {
      interpretations["abstract_word_ratio"] = METRIC_SIGNALS["abstract_word_ratio"].high_meaning;
    }
  }

  return interpretations;
}

export function interpretTargets(targets: Targets) {
  const implications: string[] = [];
  const audience: string[] = [];
  const useCases: string[] = [];
  const styleImplications: string[] = [];
  const coherenceWarnings: string[] = [];

  const wps = targets.sentence_metrics?.avg_words_per_sentence?.value;
  const dwr = targets.lexical_metrics?.difficult_word_ratio?.value;
  const cpw = targets.lexical_metrics?.avg_characters_per_word?.value;
  const mattr = targets.lexical_metrics?.lexical_diversity_mattr?.value;
  const grade = targets.formulas?.consensus_grade?.value;
  const scannabilityScore = targets.scannability_metrics?.paragraph_scannability_score?.value;

  if (wps && wps < 15) {
    implications.push("Implies a punchy, direct, and fast-paced style.");
    styleImplications.push("Short sentences will create forward motion and low parsing load.");
    audience.push("General public, mobile readers, or low-literacy audiences.");
    useCases.push("Landing pages", "Emails", "Support content", "Fast-paced scenes");
  } else if (wps && wps > 25) {
    implications.push("Implies complex, academic, or formal prose.");
    styleImplications.push("Longer sentences can carry nuance but increase working-memory load.");
    audience.push("Expert or academic readers.");
    useCases.push("Academic abstracts", "Policy analysis", "Literary essays");
  }

  if (dwr && dwr > 0.15) {
    implications.push("Allows for specialized, technical, or academic vocabulary.");
    styleImplications.push(
      "Specialized diction is acceptable, but glossary support may be needed."
    );
    audience.push("Experts, specialists, or academic peers.");
  } else if (dwr && dwr < 0.05) {
    implications.push("Implies highly accessible, plain English vocabulary.");
    styleImplications.push("Vocabulary should favor familiar words and concrete phrasing.");
  }

  if (cpw && cpw > 5.2) {
    implications.push("Signals elevated word length or jargon density.");
    styleImplications.push("Average characters per word will push ARI and Coleman-Liau upward.");
  } else if (cpw && cpw < 4.3) {
    implications.push("Signals very simple word shape.");
    styleImplications.push(
      "Short words improve accessibility but may feel blunt if over-optimized."
    );
  }

  if (mattr && mattr > 0.78) {
    implications.push("Calls for high local vocabulary variety.");
    styleImplications.push(
      "Strong MATTR supports voice richness but can reduce terminology consistency."
    );
  } else if (mattr && mattr < 0.5) {
    implications.push("Allows repeated terminology or deliberately constrained vocabulary.");
    styleImplications.push("Low MATTR can suit reference docs, but may sound repetitive in prose.");
  }

  // Coherence checking
  if (wps && grade && wps < 12 && grade > 12) {
    coherenceWarnings.push(
      "Contradictory targets: Short sentences usually correlate with lower grade levels."
    );
  }
  if (dwr && grade && dwr < 0.05 && grade > 10) {
    coherenceWarnings.push(
      "Contradictory targets: Simple vocabulary usually correlates with lower grade levels."
    );
  }
  if (cpw && dwr && cpw > 5.5 && dwr < 0.05) {
    coherenceWarnings.push(
      "Potentially conflicting targets: long average words rarely coexist with very low difficult-word ratios."
    );
  }

  if (
    targets.scannability_metrics?.heading_density?.value &&
    targets.scannability_metrics.heading_density.value > 0.03
  ) {
    implications.push("Suggests a highly structured, reference-style document.");
    useCases.push("Technical docs", "Support articles", "SEO explainers");
  }
  if (scannabilityScore && scannabilityScore > 80) {
    implications.push("Prioritizes fast skimming and short visual blocks.");
    styleImplications.push("Dense paragraphs will be the main source of target drift.");
  }

  if (
    targets.fiction_metrics?.dialogue_ratio?.value &&
    targets.fiction_metrics.dialogue_ratio.value > 0.4
  ) {
    implications.push("Suggests character-driven, conversational narrative.");
    useCases.push("Dialogue-heavy scenes", "Commercial fiction", "Romance scenes");
  }
  if (
    targets.fiction_metrics?.scene_density_proxy?.value &&
    targets.fiction_metrics.scene_density_proxy.value > 0.55
  ) {
    implications.push("Suggests active, immediate scene work with limited static exposition.");
    styleImplications.push("Short sentence bursts and concrete actions matter more than summary.");
  }

  // Find nearest templates
  const nearestTemplates = BUILTIN_TEMPLATES.map((t: { targets: Targets; id: string }) => {
    let score = 0;
    // Compare avg words per sentence
    if (
      t.targets.sentence_metrics?.avg_words_per_sentence?.value &&
      targets.sentence_metrics?.avg_words_per_sentence?.value
    ) {
      score += Math.abs(
        t.targets.sentence_metrics.avg_words_per_sentence.value -
          targets.sentence_metrics.avg_words_per_sentence.value
      );
    }
    // Compare difficult word ratio
    if (
      t.targets.lexical_metrics?.difficult_word_ratio?.value &&
      targets.lexical_metrics?.difficult_word_ratio?.value
    ) {
      score +=
        Math.abs(
          t.targets.lexical_metrics.difficult_word_ratio.value -
            targets.lexical_metrics.difficult_word_ratio.value
        ) * 100;
    }
    if (
      t.targets.lexical_metrics?.avg_characters_per_word?.value &&
      targets.lexical_metrics?.avg_characters_per_word?.value
    ) {
      score += Math.abs(
        t.targets.lexical_metrics.avg_characters_per_word.value -
          targets.lexical_metrics.avg_characters_per_word.value
      );
    }
    return { id: t.id, score };
  })
    .sort((a: { score: number }, b: { score: number }) => a.score - b.score)
    .slice(0, 3);

  return {
    implications,
    likely_audience: [...new Set(audience)],
    likely_use_cases: [...new Set(useCases)],
    style_implications: styleImplications,
    nearest_templates: nearestTemplates.map((t) => t.id),
    coherence_warnings: coherenceWarnings,
    tradeoffs: [
      "Lowering sentence length increases clarity but may feel repetitive.",
      "Increasing lexical diversity adds richness but may alienate non-experts.",
      "High scannability helps skimming but may reduce narrative immersion.",
      "High dialogue ratio increases pace but may limit internal character depth.",
    ],
  };
}
