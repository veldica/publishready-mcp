import { z } from "zod";

export interface TargetValue {
  value: number;
  operator: "at_least" | "at_most";
}

export const TargetValueSchema: z.ZodType<TargetValue> = z
  .object({
    value: z.number().describe("Numeric threshold to compare against."),
    operator: z
      .enum(["at_least", "at_most"])
      .describe("Whether the metric should be at least or at most the threshold."),
  })
  .strict()
  .describe("Single numeric target constraint.");

const makeTargetValueSchema = (valueSchema: z.ZodNumber, description: string) =>
  z
    .object({
      value: valueSchema.describe(description),
      operator: z.enum(["at_least", "at_most"]),
    })
    .strict();

const CountTargetValueSchema = makeTargetValueSchema(
  z.number().int().nonnegative(),
  "Non-negative integer count threshold."
);
const NonNegativeTargetValueSchema = makeTargetValueSchema(
  z.number().nonnegative(),
  "Non-negative numeric threshold."
);
const RatioTargetValueSchema = makeTargetValueSchema(
  z.number().min(0).max(1),
  "Ratio threshold from 0 to 1."
);
const ScoreTargetValueSchema = makeTargetValueSchema(
  z.number().min(0).max(100),
  "Score threshold from 0 to 100."
);

export interface FormulaTargets {
  flesch_reading_ease?: TargetValue;
  flesch_kincaid_grade_level?: TargetValue;
  gunning_fog?: TargetValue;
  smog?: TargetValue;
  coleman_liau?: TargetValue;
  automated_readability_index?: TargetValue;
  dale_chall?: TargetValue;
  linsear_write?: TargetValue;
  type_token_ratio?: TargetValue;
  consensus_grade?: TargetValue;
  [key: string]: TargetValue | undefined;
}

export const FormulaTargetsSchema: z.ZodType<FormulaTargets> = z
  .object({
    flesch_reading_ease: TargetValueSchema.optional(),
    flesch_kincaid_grade_level: TargetValueSchema.optional(),
    gunning_fog: TargetValueSchema.optional(),
    smog: TargetValueSchema.optional(),
    coleman_liau: TargetValueSchema.optional(),
    automated_readability_index: TargetValueSchema.optional(),
    dale_chall: TargetValueSchema.optional(),
    linsear_write: TargetValueSchema.optional(),
    type_token_ratio: TargetValueSchema.optional(),
    consensus_grade: TargetValueSchema.optional(),
  })
  .strict()
  .describe("Explicit supported readability formula and consensus targets.");

export interface Targets {
  counts?: {
    word_count?: TargetValue;
    unique_word_count?: TargetValue;
    sentence_count?: TargetValue;
    paragraph_count?: TargetValue;
    heading_count?: TargetValue;
    list_item_count?: TargetValue;
    character_count?: TargetValue;
    character_count_no_spaces?: TargetValue;
    letter_count?: TargetValue;
    syllable_count?: TargetValue;
    polysyllable_count?: TargetValue;
    complex_word_count?: TargetValue;
    difficult_word_count?: TargetValue;
    long_word_count?: TargetValue;
    reading_time_minutes?: TargetValue;
  };
  sentence_metrics?: {
    avg_words_per_sentence?: TargetValue;
    median_words_per_sentence?: TargetValue;
    min_words_per_sentence?: TargetValue;
    max_words_per_sentence?: TargetValue;
    sentence_length_p90?: TargetValue;
    sentence_length_p95?: TargetValue;
    sentence_length_stddev?: TargetValue;
    sentences_over_20_words?: TargetValue;
    sentences_over_25_words?: TargetValue;
    sentences_over_30_words?: TargetValue;
    sentences_over_40_words?: TargetValue;
    percent_sentences_over_20_words?: TargetValue;
    percent_sentences_over_25_words?: TargetValue;
    percent_sentences_over_30_words?: TargetValue;
    percent_sentences_over_40_words?: TargetValue;
  };
  paragraph_metrics?: {
    avg_words_per_paragraph?: TargetValue;
    median_words_per_paragraph?: TargetValue;
    min_words_per_paragraph?: TargetValue;
    max_words_per_paragraph?: TargetValue;
    paragraph_length_p90?: TargetValue;
    paragraph_length_p95?: TargetValue;
    paragraph_length_stddev?: TargetValue;
    paragraphs_over_75_words?: TargetValue;
    paragraphs_over_100_words?: TargetValue;
    paragraphs_over_150_words?: TargetValue;
    percent_paragraphs_over_75_words?: TargetValue;
    percent_paragraphs_over_100_words?: TargetValue;
    percent_paragraphs_over_150_words?: TargetValue;
    avg_sentences_per_paragraph?: TargetValue;
    median_sentences_per_paragraph?: TargetValue;
    max_sentences_per_paragraph?: TargetValue;
  };
  lexical_metrics?: {
    lexical_diversity_ttr?: TargetValue;
    lexical_diversity_mattr?: TargetValue;
    lexical_density?: TargetValue;
    unique_word_count?: TargetValue;
    repetition_ratio?: TargetValue;
    avg_characters_per_word?: TargetValue;
    avg_syllables_per_word?: TargetValue;
    long_word_ratio?: TargetValue;
    complex_word_ratio?: TargetValue;
    difficult_word_ratio?: TargetValue;
  };
  scannability_metrics?: {
    heading_density?: TargetValue;
    words_per_heading?: TargetValue;
    list_density?: TargetValue;
    words_between_breaks?: TargetValue;
    paragraph_scannability_score?: TargetValue;
    sentence_tail_risk_score?: TargetValue;
  };
  fiction_metrics?: {
    dialogue_ratio?: TargetValue;
    avg_dialogue_run_length?: TargetValue;
    scene_density_proxy?: TargetValue;
    exposition_density_proxy?: TargetValue;
    sensory_term_density?: TargetValue;
    abstract_word_ratio?: TargetValue;
    paragraph_cadence_variation?: TargetValue;
  };
  word_tracking_metrics?: Record<string, TargetValue>;
  track_ai_patterns?: boolean;
  formulas?: FormulaTargets;
}

export const TargetSchema: z.ZodType<Targets> = z
  .object({
    counts: z
      .object({
        word_count: CountTargetValueSchema.optional(),
        unique_word_count: CountTargetValueSchema.optional(),
        sentence_count: CountTargetValueSchema.optional(),
        paragraph_count: CountTargetValueSchema.optional(),
        heading_count: CountTargetValueSchema.optional(),
        list_item_count: CountTargetValueSchema.optional(),
        character_count: CountTargetValueSchema.optional(),
        character_count_no_spaces: CountTargetValueSchema.optional(),
        letter_count: CountTargetValueSchema.optional(),
        syllable_count: CountTargetValueSchema.optional(),
        polysyllable_count: CountTargetValueSchema.optional(),
        complex_word_count: CountTargetValueSchema.optional(),
        difficult_word_count: CountTargetValueSchema.optional(),
        long_word_count: CountTargetValueSchema.optional(),
        reading_time_minutes: NonNegativeTargetValueSchema.optional(),
      })
      .strict()
      .optional(),
    sentence_metrics: z
      .object({
        avg_words_per_sentence: NonNegativeTargetValueSchema.optional(),
        median_words_per_sentence: NonNegativeTargetValueSchema.optional(),
        min_words_per_sentence: NonNegativeTargetValueSchema.optional(),
        max_words_per_sentence: NonNegativeTargetValueSchema.optional(),
        sentence_length_p90: NonNegativeTargetValueSchema.optional(),
        sentence_length_p95: NonNegativeTargetValueSchema.optional(),
        sentence_length_stddev: NonNegativeTargetValueSchema.optional(),
        sentences_over_20_words: CountTargetValueSchema.optional(),
        sentences_over_25_words: CountTargetValueSchema.optional(),
        sentences_over_30_words: CountTargetValueSchema.optional(),
        sentences_over_40_words: CountTargetValueSchema.optional(),
        percent_sentences_over_20_words: RatioTargetValueSchema.optional(),
        percent_sentences_over_25_words: RatioTargetValueSchema.optional(),
        percent_sentences_over_30_words: RatioTargetValueSchema.optional(),
        percent_sentences_over_40_words: RatioTargetValueSchema.optional(),
      })
      .strict()
      .optional(),
    paragraph_metrics: z
      .object({
        avg_words_per_paragraph: NonNegativeTargetValueSchema.optional(),
        median_words_per_paragraph: NonNegativeTargetValueSchema.optional(),
        min_words_per_paragraph: NonNegativeTargetValueSchema.optional(),
        max_words_per_paragraph: NonNegativeTargetValueSchema.optional(),
        paragraph_length_p90: NonNegativeTargetValueSchema.optional(),
        paragraph_length_p95: NonNegativeTargetValueSchema.optional(),
        paragraph_length_stddev: NonNegativeTargetValueSchema.optional(),
        paragraphs_over_75_words: CountTargetValueSchema.optional(),
        paragraphs_over_100_words: CountTargetValueSchema.optional(),
        paragraphs_over_150_words: CountTargetValueSchema.optional(),
        percent_paragraphs_over_75_words: RatioTargetValueSchema.optional(),
        percent_paragraphs_over_100_words: RatioTargetValueSchema.optional(),
        percent_paragraphs_over_150_words: RatioTargetValueSchema.optional(),
        avg_sentences_per_paragraph: NonNegativeTargetValueSchema.optional(),
        median_sentences_per_paragraph: NonNegativeTargetValueSchema.optional(),
        max_sentences_per_paragraph: NonNegativeTargetValueSchema.optional(),
      })
      .strict()
      .optional(),
    lexical_metrics: z
      .object({
        lexical_diversity_ttr: RatioTargetValueSchema.optional(),
        lexical_diversity_mattr: RatioTargetValueSchema.optional(),
        lexical_density: RatioTargetValueSchema.optional(),
        unique_word_count: CountTargetValueSchema.optional(),
        repetition_ratio: RatioTargetValueSchema.optional(),
        avg_characters_per_word: NonNegativeTargetValueSchema.optional(),
        avg_syllables_per_word: NonNegativeTargetValueSchema.optional(),
        long_word_ratio: RatioTargetValueSchema.optional(),
        complex_word_ratio: RatioTargetValueSchema.optional(),
        difficult_word_ratio: RatioTargetValueSchema.optional(),
      })
      .strict()
      .optional(),
    scannability_metrics: z
      .object({
        heading_density: NonNegativeTargetValueSchema.optional(),
        words_per_heading: NonNegativeTargetValueSchema.optional(),
        list_density: NonNegativeTargetValueSchema.optional(),
        words_between_breaks: NonNegativeTargetValueSchema.optional(),
        paragraph_scannability_score: ScoreTargetValueSchema.optional(),
        sentence_tail_risk_score: ScoreTargetValueSchema.optional(),
      })
      .strict()
      .optional(),
    fiction_metrics: z
      .object({
        dialogue_ratio: RatioTargetValueSchema.optional(),
        avg_dialogue_run_length: NonNegativeTargetValueSchema.optional(),
        scene_density_proxy: RatioTargetValueSchema.optional(),
        exposition_density_proxy: RatioTargetValueSchema.optional(),
        sensory_term_density: RatioTargetValueSchema.optional(),
        abstract_word_ratio: RatioTargetValueSchema.optional(),
        paragraph_cadence_variation: NonNegativeTargetValueSchema.optional(),
      })
      .strict()
      .optional(),
    word_tracking_metrics: z.record(TargetValueSchema).optional(),
    track_ai_patterns: z.boolean().optional(),
    formulas: FormulaTargetsSchema.optional(),
  })
  .strict()
  .describe("Nested numeric target profile for deterministic writing checks.");

export function hasAnyTargetConstraint(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  if ("value" in value && "operator" in value) {
    return true;
  }

  return Object.values(value).some(hasAnyTargetConstraint);
}

export const NonEmptyTargetSchema: z.ZodType<Targets> = TargetSchema.refine(
  (targets) => hasAnyTargetConstraint(targets),
  "Provide at least one target metric group."
);
