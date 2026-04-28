import type { StructuralMetrics } from "@veldica/publishready-schemas";
import { Targets } from "@veldica/publishready-schemas";

export interface Hotspot {
  hotspot_id: string;
  type: "sentence" | "paragraph";
  index: number;
  text: string;
  score: number;
  explanation: string;
  reason?: string;
  revision_instruction?: string;
  affected_metrics: string[];
  affected_formulas: string[];
  suggested_levers: string[];
}

export function findHotspots(stats: StructuralMetrics, targets?: Targets): Hotspot[] {
  const hotspots: Hotspot[] = [];

  // 1. Structural Hotspots (Always check)
  (stats.sentences || []).forEach((s: any, i: number) => {
    let score = 0;
    const reasons: string[] = [];
    const metrics: string[] = [];
    let revision_instruction = "Try to simplify this sentence.";

    if (s.word_count >= 30) {
      score += (s.word_count - 25) * 2;
      reasons.push("Excessive length.");
      metrics.push("avg_words_per_sentence");
      revision_instruction = "Split this long sentence into two or more shorter ones.";
    }

    if (s.complex_word_count >= 5) {
      score += s.complex_word_count * 3;
      reasons.push("High complex-word density.");
      metrics.push("complex_word_ratio");
      revision_instruction = "Replace complex words with simpler synonyms.";
    }

    if (s.difficult_word_count >= 4) {
      score += s.difficult_word_count * 2;
      reasons.push("High difficult-word concentration.");
      metrics.push("difficult_word_ratio");
      if (revision_instruction === "Try to simplify this sentence.") {
        revision_instruction = "Use more common vocabulary in this sentence.";
      }
    }

    // 2. Target-driven hotspots
    if (targets?.sentence_metrics?.avg_words_per_sentence) {
      const t = targets.sentence_metrics.avg_words_per_sentence;
      const pass = t.operator === "at_most" ? s.word_count <= t.value : s.word_count >= t.value;
      if (!pass) {
        score += Math.abs(s.word_count - t.value);
        reasons.push("Violates sentence-length target.");
        metrics.push("avg_words_per_sentence");
      }
    }

    if (targets?.sentence_metrics?.sentence_length_p95) {
      const t = targets.sentence_metrics.sentence_length_p95;
      const pass = t.operator === "at_most" ? s.word_count <= t.value : s.word_count >= t.value;
      if (!pass) {
        score += Math.abs(s.word_count - t.value) * 1.2;
        reasons.push("Contributes to sentence-tail target drift.");
        metrics.push("sentence_length_p95");
      }
    }

    if (targets?.lexical_metrics?.complex_word_ratio && s.word_count > 0) {
      const t = targets.lexical_metrics.complex_word_ratio;
      const current = s.complex_word_count / s.word_count;
      const pass = t.operator === "at_most" ? current <= t.value : current >= t.value;
      if (!pass) {
        score += Math.abs(current - t.value) * 100;
        reasons.push("Local complex-word density misses target.");
        metrics.push("complex_word_ratio");
      }
    }

    if (targets?.lexical_metrics?.difficult_word_ratio && s.word_count > 0) {
      const t = targets.lexical_metrics.difficult_word_ratio;
      const current = s.difficult_word_count / s.word_count;
      const pass = t.operator === "at_most" ? current <= t.value : current >= t.value;
      if (!pass) {
        score += Math.abs(current - t.value) * 100;
        reasons.push("Local difficult-word density misses target.");
        metrics.push("difficult_word_ratio");
      }
    }

    if (score > 10) {
      const explanation = reasons.join(" ");
      hotspots.push({
        hotspot_id: `sentence_${i}`,
        type: "sentence",
        index: i,
        text: s.text,
        score: score,
        explanation,
        reason: explanation,
        revision_instruction,
        affected_metrics: [...new Set(metrics)],
        affected_formulas: ["flesch_kincaid_grade_level", "gunning_fog", "smog"],
        suggested_levers: ["shorten_long_sentences", "reduce_complex_word_density"],
      });
    }
  });

  (stats.paragraphs || []).forEach((p: any, i: number) => {
    let score = 0;
    const reasons: string[] = [];
    let revision_instruction = "Consider breaking up this paragraph.";

    if (p.word_count > 100) {
      score += (p.word_count - 80) * 0.5;
      reasons.push("High word count.");
      revision_instruction = "Split this long paragraph into smaller logical blocks.";
    }

    if (p.sentence_count === 1 && p.word_count > 40) {
      score += 20;
      reasons.push("Single long sentence in a paragraph.");
      revision_instruction = "Break this single-sentence paragraph into multiple sentences.";
    }

    if (targets?.paragraph_metrics?.avg_words_per_paragraph) {
      const t = targets.paragraph_metrics.avg_words_per_paragraph;
      const pass = t.operator === "at_most" ? p.word_count <= t.value : p.word_count >= t.value;
      if (!pass) {
        score += Math.abs(p.word_count - t.value) * 0.2;
        reasons.push("Violates paragraph-length target.");
      }
    }

    if (targets?.paragraph_metrics?.paragraph_length_p95) {
      const t = targets.paragraph_metrics.paragraph_length_p95;
      const pass = t.operator === "at_most" ? p.word_count <= t.value : p.word_count >= t.value;
      if (!pass) {
        score += Math.abs(p.word_count - t.value) * 0.25;
        reasons.push("Contributes to paragraph-tail target drift.");
      }
    }

    if (
      targets?.scannability_metrics?.paragraph_scannability_score?.operator === "at_least" &&
      p.word_count > 75
    ) {
      score += Math.min(30, (p.word_count - 75) * 0.3);
      reasons.push("Dense block works against paragraph scannability target.");
    }

    if (score > 15) {
      const explanation = reasons.join(" ");
      hotspots.push({
        hotspot_id: `paragraph_${i}`,
        type: "paragraph",
        index: i,
        text: p.text,
        score: score,
        explanation,
        reason: explanation,
        revision_instruction,
        affected_metrics: ["avg_words_per_paragraph", "wall_of_text_risk"],
        affected_formulas: [],
        suggested_levers: ["split_oversized_paragraphs", "add_breaks_to_dense_sections"],
      });
    }
  });

  return hotspots.sort((a: any, b: any) => b.score - a.score).slice(0, 10);
}
