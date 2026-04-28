import {
  inventoryMarkers,
  REVISION_LEVER_CATALOG,
  rankRevisionLevers,
  calculateFit,
  checkViolations,
  summarizeCompliance,
  compareIntegrity,
  type StyleProfile,
} from "@veldica/prose-linter";
import { runAllFormulas } from "@veldica/readability";
import { tokenizeProse, type TokenizedDocument } from "@veldica/prose-tokenizer";
import { analyzeProse } from "@veldica/prose-analyzer";
import * as stats from "./utils/math.js";
import {
  isDifficultWord,
  buildSentenceDetails,
  buildParagraphDetails,
  analyzeAdvancedLexical,
} from "./lexicalExt.js";
import { analyzeScannability } from "./scannability.js";

import type {
  StructuralMetrics,
  SentenceDetail,
  ParagraphDetail,
  RankedLever,
  FormulaResult,
  Violation,
  ComplianceSummary,
  Targets,
  PublicAnalysisResult,
  AIAnalysis,
  Fit,
  ScannabilityMetrics,
  FictionMetrics,
  LexicalMetrics,
} from "@veldica/publishready-schemas";

import {
  buildPublicResult,
  createStructuredToolResult,
  type BuildPublicResultOptions,
  type RequestedTool,
} from "./utils/publicResult.js";

import { logger } from "./utils/logging.js";

// Legacy exports
export {
  rankRevisionLevers,
  calculateFit,
  checkViolations,
  summarizeCompliance,
  compareIntegrity,
  buildPublicResult,
  createStructuredToolResult,
  logger,
  REVISION_LEVER_CATALOG,
  isDifficultWord,
};

export type {
  RankedLever,
  StructuralMetrics,
  SentenceDetail,
  ParagraphDetail,
  FormulaResult,
  Violation,
  ComplianceSummary,
  Targets,
  Fit,
  BuildPublicResultOptions,
  RequestedTool,
  PublicAnalysisResult,
  AIAnalysis,
};

export * from "./profiles.js";
export * from "./interpret.js";
export * from "./hotspots.js";
export * from "./catalog/templates.js";
export * from "./catalog/signals.js";
export * from "./prompts.js";
export * from "./packageInfo.js";

export interface AnalysisOutput {
  stats: StructuralMetrics;
  analysis: {
    formulas: FormulaResult[];
    consensus_grade: number;
    readability_band: string;
    consensus_sources: string[];
    excluded_formulas: string[];
  };
  revision_levers: RankedLever[];
  fit?: Fit;
  summary?: ComplianceSummary;
  violations?: Violation[];
  ai_analysis?: AIAnalysis;
  word_tracking_metrics?: Record<string, number>;
}

export function analyzeText(text: string, targets?: Targets): AnalysisOutput {
  const tokenized = tokenizeProse(text);
  const fullStats = analyzeTokenizedStructure(tokenized);
  const formulaResults = runAllFormulas(fullStats);

  const track_words = targets?.word_tracking_metrics
    ? Object.keys(targets.word_tracking_metrics)
    : [];

  const profile: StyleProfile = {
    targets: (targets as any) || {},
    track_ai_patterns: targets?.track_ai_patterns ?? true,
    track_words,
  };

  const ai_analysis = inventoryMarkers(text, {
    track_ai_patterns: profile.track_ai_patterns,
    track_words: profile.track_words,
    fiction: fullStats.fiction,
    tokenized,
  });
  (fullStats as any).word_tracking = ai_analysis.word_tracking_metrics;

  const violations = checkViolations(fullStats, formulaResults.formulas, profile);
  const fit = calculateFit(fullStats, formulaResults.formulas, profile);
  const summary = summarizeCompliance(profile, violations, fit.score);
  const revision_levers = rankRevisionLevers(fullStats, formulaResults.formulas, violations);

  return {
    stats: fullStats,
    analysis: formulaResults as any,
    revision_levers: revision_levers as unknown as RankedLever[],
    fit: fit as unknown as Fit,
    summary: summary as unknown as ComplianceSummary,
    violations: violations as unknown as Violation[],
    ai_analysis: ai_analysis as unknown as AIAnalysis,
    word_tracking_metrics: ai_analysis.word_tracking_metrics,
  };
}

export function analyzeStructure(text: string): StructuralMetrics {
  return analyzeTokenizedStructure(tokenizeProse(text));
}

function analyzeTokenizedStructure(tokenized: TokenizedDocument): StructuralMetrics {
  const wordsRaw = tokenized.words;
  const sentencesRaw = tokenized.sentences;

  const advancedLexical = analyzeAdvancedLexical(wordsRaw);
  const sentences = buildSentenceDetails(sentencesRaw);
  const paragraphs = buildParagraphDetails(tokenized.blocks);

  const sentenceWordCounts = sentences.map((s) => s.word_count);
  const paragraphWordCounts = paragraphs.map((p) => p.word_count);
  const paragraphSentenceCounts = paragraphs.map((p) => p.sentence_count);

  const { lexical, narrative } = analyzeProse(
    sentencesRaw,
    wordsRaw,
    sentenceWordCounts,
    paragraphWordCounts
  );

  const wordCount = tokenized.counts.word_count;
  const scannability = analyzeScannability(
    wordCount,
    tokenized.counts.heading_count,
    tokenized.counts.paragraph_count,
    tokenized.counts.list_item_count,
    paragraphWordCounts,
    sentenceWordCounts
  );

  const fiction = (narrative as unknown as FictionMetrics) || {};
  const sanitizedFiction: FictionMetrics = {
    dialogue_ratio: stats.round(fiction.dialogue_ratio || 0),
    avg_dialogue_run_length: stats.round(fiction.avg_dialogue_run_length || 0),
    narration_vs_dialogue_balance: fiction.narration_vs_dialogue_balance || "balanced",
    scene_density_proxy: stats.round(fiction.scene_density_proxy || 0),
    exposition_density_proxy: stats.round(fiction.exposition_density_proxy || 0),
    sensory_term_density: stats.round(fiction.sensory_term_density || 0),
    abstract_word_ratio: stats.round(fiction.abstract_word_ratio || 0),
    paragraph_cadence_variation: stats.round(fiction.paragraph_cadence_variation || 0),
  };

  return {
    counts: {
      ...tokenized.counts,
      unique_word_count: lexical.unique_word_count,
      syllable_count: advancedLexical.totalSyllables,
      polysyllable_count: advancedLexical.polysyllables,
      complex_word_count: advancedLexical.complexWords,
      difficult_word_count: advancedLexical.difficultWords,
      long_word_count: advancedLexical.longWords,
      reading_time_minutes: stats.round(stats.safeDivide(wordCount, 225), 3),
    },
    sentence_metrics: {
      avg_words_per_sentence: stats.round(stats.mean(sentenceWordCounts)),
      median_words_per_sentence: stats.round(stats.median(sentenceWordCounts)),
      min_words_per_sentence: stats.min(sentenceWordCounts),
      max_words_per_sentence: stats.max(sentenceWordCounts),
      sentence_length_p90: stats.round(stats.percentile(sentenceWordCounts, 90)),
      sentence_length_p95: stats.round(stats.percentile(sentenceWordCounts, 95)),
      sentence_length_stddev: stats.round(stats.standardDeviation(sentenceWordCounts)),
      sentences_over_20_words: stats.countGreater(sentenceWordCounts, 20),
      sentences_over_25_words: stats.countGreater(sentenceWordCounts, 25),
      sentences_over_30_words: stats.countGreater(sentenceWordCounts, 30),
      sentences_over_40_words: stats.countGreater(sentenceWordCounts, 40),
      percent_sentences_over_20_words: stats.round(
        stats.safeDivide(
          stats.countGreater(sentenceWordCounts, 20),
          tokenized.counts.sentence_count
        )
      ),
      percent_sentences_over_25_words: stats.round(
        stats.safeDivide(
          stats.countGreater(sentenceWordCounts, 25),
          tokenized.counts.sentence_count
        )
      ),
      percent_sentences_over_30_words: stats.round(
        stats.safeDivide(
          stats.countGreater(sentenceWordCounts, 30),
          tokenized.counts.sentence_count
        )
      ),
      percent_sentences_over_40_words: stats.round(
        stats.safeDivide(
          stats.countGreater(sentenceWordCounts, 40),
          tokenized.counts.sentence_count
        )
      ),
    },
    paragraph_metrics: {
      avg_words_per_paragraph: stats.round(stats.mean(paragraphWordCounts)),
      median_words_per_paragraph: stats.round(stats.median(paragraphWordCounts)),
      min_words_per_paragraph: stats.min(paragraphWordCounts),
      max_words_per_paragraph: stats.max(paragraphWordCounts),
      paragraph_length_p90: stats.round(stats.percentile(paragraphWordCounts, 90)),
      paragraph_length_p95: stats.round(stats.percentile(paragraphWordCounts, 95)),
      paragraph_length_stddev: stats.round(stats.standardDeviation(paragraphWordCounts)),
      paragraphs_over_75_words: stats.countGreater(paragraphWordCounts, 75),
      paragraphs_over_100_words: stats.countGreater(paragraphWordCounts, 100),
      paragraphs_over_150_words: stats.countGreater(paragraphWordCounts, 150),
      percent_paragraphs_over_75_words: stats.round(
        stats.safeDivide(
          stats.countGreater(paragraphWordCounts, 75),
          tokenized.counts.paragraph_count
        )
      ),
      percent_paragraphs_over_100_words: stats.round(
        stats.safeDivide(
          stats.countGreater(paragraphWordCounts, 100),
          tokenized.counts.paragraph_count
        )
      ),
      percent_paragraphs_over_150_words: stats.round(
        stats.safeDivide(
          stats.countGreater(paragraphWordCounts, 150),
          tokenized.counts.paragraph_count
        )
      ),
      avg_sentences_per_paragraph: stats.round(stats.mean(paragraphSentenceCounts)),
      median_sentences_per_paragraph: stats.round(stats.median(paragraphSentenceCounts)),
      max_sentences_per_paragraph: stats.max(paragraphSentenceCounts),
    },
    lexical: {
      ...lexical,
      avg_characters_per_word: stats.round(
        stats.safeDivide(advancedLexical.totalWordCharacters, wordCount)
      ),
      avg_syllables_per_word: stats.round(
        stats.safeDivide(advancedLexical.totalSyllables, wordCount)
      ),
      long_word_ratio: stats.round(stats.safeDivide(advancedLexical.longWords, wordCount)),
      complex_word_ratio: stats.round(stats.safeDivide(advancedLexical.complexWords, wordCount)),
      difficult_word_ratio: stats.round(
        stats.safeDivide(advancedLexical.difficultWords, wordCount)
      ),
    } as LexicalMetrics,
    scannability: scannability as unknown as ScannabilityMetrics,
    fiction: sanitizedFiction,
    sentences,
    paragraphs,
  };
}

export function calculateFitFromTemplate(
  stats: StructuralMetrics,
  formulas: FormulaResult[],
  template: any
): any {
  return calculateFit(stats, formulas, {
    targets: template.targets,
    name: template.name,
    description: template.description,
  });
}

export function applyTargetsToFormulas(
  formulas: FormulaResult[],
  targets: Targets
): FormulaResult[] {
  const targetGroup = targets.formulas;
  if (!targetGroup) return formulas;

  return formulas.map((f) => {
    const target = (targetGroup as any)[f.metric];
    if (!target) return f;

    const pass = target.operator === "at_least" ? f.score >= target.value : f.score <= target.value;
    return {
      ...f,
      target: { value: target.value, operator: target.operator },
      pass,
    };
  });
}
