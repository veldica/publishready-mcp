import { z } from "zod";
import { TargetSchema } from "./targets.js";
import type { Targets } from "./targets.js";

export interface Metadata {
  package_name: string;
  package_version: string;
  schema_version: number;
  analysis_profile: "deterministic_english_v1";
  language: "en";
  requested_tool:
    | "analyze_text"
    | "analyze_against_targets"
    | "suggest_revision_levers"
    | "analyze_against_template"
    | "summarize_writing_profile"
    | "compare_to_reference"
    | "find_reference_drift"
    | "compare_text_versions"
    | "find_hotspots"
    | "audit_ai_sounding_prose";
  input_sha256: string;
}

export const MetadataSchema: z.ZodType<Metadata> = z
  .object({
    package_name: z.string(),
    package_version: z.string(),
    schema_version: z.number().int().positive(),
    analysis_profile: z.literal("deterministic_english_v1"),
    language: z.literal("en"),
    requested_tool: z.enum([
      "analyze_text",
      "analyze_against_targets",
      "suggest_revision_levers",
      "analyze_against_template",
      "summarize_writing_profile",
      "compare_to_reference",
      "find_reference_drift",
      "compare_text_versions",
      "find_hotspots",
      "audit_ai_sounding_prose",
    ]),
    input_sha256: z.string().length(64),
  })
  .strict();

export interface Counts {
  word_count: number;
  unique_word_count: number;
  sentence_count: number;
  paragraph_count: number;
  heading_count: number;
  list_item_count: number;
  character_count: number;
  character_count_no_spaces: number;
  letter_count: number;
  syllable_count: number;
  polysyllable_count: number;
  complex_word_count: number;
  difficult_word_count: number;
  long_word_count: number;
  reading_time_minutes: number;
  blockquote_count?: number;
  [key: string]: any;
}

export const CountsSchema: z.ZodType<Counts> = z
  .object({
    word_count: z.number().int().nonnegative(),
    unique_word_count: z.number().int().nonnegative(),
    sentence_count: z.number().int().nonnegative(),
    paragraph_count: z.number().int().nonnegative(),
    heading_count: z.number().int().nonnegative(),
    list_item_count: z.number().int().nonnegative(),
    character_count: z.number().int().nonnegative(),
    character_count_no_spaces: z.number().int().nonnegative(),
    letter_count: z.number().int().nonnegative(),
    syllable_count: z.number().int().nonnegative(),
    polysyllable_count: z.number().int().nonnegative(),
    complex_word_count: z.number().int().nonnegative(),
    difficult_word_count: z.number().int().nonnegative(),
    long_word_count: z.number().int().nonnegative(),
    reading_time_minutes: z.number().nonnegative(),
    blockquote_count: z.number().int().nonnegative().optional(),
  })
  .passthrough();

export interface SentenceMetrics {
  avg_words_per_sentence: number;
  median_words_per_sentence: number;
  min_words_per_sentence: number;
  max_words_per_sentence: number;
  sentence_length_p90: number;
  sentence_length_p95: number;
  sentence_length_stddev: number;
  sentences_over_20_words: number;
  sentences_over_25_words: number;
  sentences_over_30_words: number;
  sentences_over_40_words: number;
  percent_sentences_over_20_words: number;
  percent_sentences_over_25_words: number;
  percent_sentences_over_30_words: number;
  percent_sentences_over_40_words: number;
  [key: string]: any;
}

export const SentenceMetricsSchema: z.ZodType<SentenceMetrics> = z
  .object({
    avg_words_per_sentence: z.number().nonnegative(),
    median_words_per_sentence: z.number().nonnegative(),
    min_words_per_sentence: z.number().nonnegative(),
    max_words_per_sentence: z.number().nonnegative(),
    sentence_length_p90: z.number().nonnegative(),
    sentence_length_p95: z.number().nonnegative(),
    sentence_length_stddev: z.number().nonnegative(),
    sentences_over_20_words: z.number().int().nonnegative(),
    sentences_over_25_words: z.number().int().nonnegative(),
    sentences_over_30_words: z.number().int().nonnegative(),
    sentences_over_40_words: z.number().int().nonnegative(),
    percent_sentences_over_20_words: z.number().nonnegative(),
    percent_sentences_over_25_words: z.number().nonnegative(),
    percent_sentences_over_30_words: z.number().nonnegative(),
    percent_sentences_over_40_words: z.number().nonnegative(),
  })
  .passthrough();

export interface ParagraphMetrics {
  avg_words_per_paragraph: number;
  median_words_per_paragraph: number;
  min_words_per_paragraph: number;
  max_words_per_paragraph: number;
  paragraph_length_p90: number;
  paragraph_length_p95: number;
  paragraph_length_stddev: number;
  paragraphs_over_75_words: number;
  paragraphs_over_100_words: number;
  paragraphs_over_150_words: number;
  percent_paragraphs_over_75_words: number;
  percent_paragraphs_over_100_words: number;
  percent_paragraphs_over_150_words: number;
  avg_sentences_per_paragraph: number;
  median_sentences_per_paragraph: number;
  max_sentences_per_paragraph: number;
  [key: string]: any;
}

export const ParagraphMetricsSchema: z.ZodType<ParagraphMetrics> = z
  .object({
    avg_words_per_paragraph: z.number().nonnegative(),
    median_words_per_paragraph: z.number().nonnegative(),
    min_words_per_paragraph: z.number().nonnegative(),
    max_words_per_paragraph: z.number().nonnegative(),
    paragraph_length_p90: z.number().nonnegative(),
    paragraph_length_p95: z.number().nonnegative(),
    paragraph_length_stddev: z.number().nonnegative(),
    paragraphs_over_75_words: z.number().int().nonnegative(),
    paragraphs_over_100_words: z.number().int().nonnegative(),
    paragraphs_over_150_words: z.number().int().nonnegative(),
    percent_paragraphs_over_75_words: z.number().nonnegative(),
    percent_paragraphs_over_100_words: z.number().nonnegative(),
    percent_paragraphs_over_150_words: z.number().nonnegative(),
    avg_sentences_per_paragraph: z.number().nonnegative(),
    median_sentences_per_paragraph: z.number().nonnegative(),
    max_sentences_per_paragraph: z.number().nonnegative(),
  })
  .passthrough();

export interface LexicalMetrics {
  lexical_diversity_ttr: number;
  lexical_diversity_mattr: number;
  lexical_density: number;
  unique_word_count: number;
  repetition_ratio: number;
  top_repeated_words: Array<{
    word: string;
    count: number;
    ratio: number;
  }>;
  avg_characters_per_word: number;
  avg_syllables_per_word: number;
  long_word_ratio: number;
  complex_word_ratio: number;
  difficult_word_ratio: number;
  [key: string]: any;
}

export const LexicalMetricsSchema: z.ZodType<LexicalMetrics> = z
  .object({
    lexical_diversity_ttr: z.number().nonnegative(),
    lexical_diversity_mattr: z.number().nonnegative(),
    lexical_density: z.number().nonnegative(),
    unique_word_count: z.number().int().nonnegative(),
    repetition_ratio: z.number().nonnegative(),
    top_repeated_words: z.array(
      z.object({
        word: z.string(),
        count: z.number().int().nonnegative(),
        ratio: z.number().nonnegative(),
      })
    ),
    avg_characters_per_word: z.number().nonnegative(),
    avg_syllables_per_word: z.number().nonnegative(),
    long_word_ratio: z.number().nonnegative(),
    complex_word_ratio: z.number().nonnegative(),
    difficult_word_ratio: z.number().nonnegative(),
  })
  .passthrough();

export interface ScannabilityMetrics {
  heading_density: number;
  words_per_heading: number | null;
  list_density: number;
  words_between_breaks: number;
  wall_of_text_risk: "low" | "medium" | "high";
  paragraph_scannability_score: number;
  sentence_tail_risk_score: number;
  [key: string]: any;
}

export const ScannabilityMetricsSchema: z.ZodType<ScannabilityMetrics> = z
  .object({
    heading_density: z.number().nonnegative(),
    words_per_heading: z.number().nonnegative().nullable(),
    list_density: z.number().nonnegative(),
    words_between_breaks: z.number().nonnegative(),
    wall_of_text_risk: z.enum(["low", "medium", "high"]),
    paragraph_scannability_score: z.number().nonnegative(),
    sentence_tail_risk_score: z.number().nonnegative(),
  })
  .passthrough();

export interface FictionMetrics {
  dialogue_ratio: number;
  avg_dialogue_run_length: number;
  narration_vs_dialogue_balance: "narration_heavy" | "balanced" | "dialogue_heavy";
  scene_density_proxy: number;
  exposition_density_proxy: number;
  sensory_term_density: number;
  abstract_word_ratio: number;
  paragraph_cadence_variation: number;
  [key: string]: any;
}

export const FictionMetricsSchema: z.ZodType<FictionMetrics> = z
  .object({
    dialogue_ratio: z.number().nonnegative(),
    avg_dialogue_run_length: z.number().nonnegative(),
    narration_vs_dialogue_balance: z.enum(["narration_heavy", "balanced", "dialogue_heavy"]),
    scene_density_proxy: z.number().nonnegative(),
    exposition_density_proxy: z.number().nonnegative(),
    sensory_term_density: z.number().nonnegative(),
    abstract_word_ratio: z.number().nonnegative(),
    paragraph_cadence_variation: z.number().nonnegative(),
  })
  .passthrough();

export interface FormulaResult {
  metric: string;
  label?: string;
  name?: string;
  score: number;
  interpretation: string;
  inputs: Record<string, number>;
  [key: string]: any;
}

export const FormulaResultSchema: z.ZodType<FormulaResult> = z
  .object({
    metric: z.string(),
    label: z.string().optional(),
    name: z.string().optional(),
    score: z.number(),
    interpretation: z.string(),
    inputs: z.record(z.number()),
  })
  .passthrough();

export type RevisionLeverId =
  | "add_more_content"
  | "trim_excess_content"
  | "shorten_long_sentences"
  | "split_oversized_paragraphs"
  | "replace_difficult_words"
  | "reduce_complex_word_density"
  | "reduce_repetition"
  | "add_breaks_to_dense_sections"
  | "break_sentence_tails"
  | "increase_heading_frequency"
  | "introduce_lists_for_scannability"
  | "reduce_abstract_wording"
  | "improve_dialogue_balance"
  | "tighten_scene_pacing"
  | "ground_with_sensory_details"
  | "reduce_targeted_word_usage";

export const RevisionLeverIdSchema: z.ZodType<RevisionLeverId> = z.enum([
  "add_more_content",
  "trim_excess_content",
  "shorten_long_sentences",
  "split_oversized_paragraphs",
  "replace_difficult_words",
  "reduce_complex_word_density",
  "reduce_repetition",
  "add_breaks_to_dense_sections",
  "break_sentence_tails",
  "increase_heading_frequency",
  "introduce_lists_for_scannability",
  "reduce_abstract_wording",
  "improve_dialogue_balance",
  "tighten_scene_pacing",
  "ground_with_sensory_details",
  "reduce_targeted_word_usage",
]);

export interface RankedLever {
  id: string;
  lever: string;
  label: string;
  rank: number;
  score: number;
  priority: "low" | "medium" | "high";
  explanation: string;
  evidence: string[];
  affected_metrics: string[];
  affected_formulas: string[];
  impact_scope: "localized" | "distributed" | "global";
  effort?: string;
  [key: string]: any;
}

export const RevisionLeverSchema: z.ZodType<RankedLever> = z
  .object({
    id: z.string(),
    lever: z.string(),
    label: z.string(),
    rank: z.number().int().positive(),
    score: z.number().nonnegative(),
    priority: z.enum(["low", "medium", "high"]),
    explanation: z.string(),
    evidence: z.array(z.string()),
    affected_metrics: z.array(z.string()),
    affected_formulas: z.array(z.string()),
    impact_scope: z.enum(["localized", "distributed", "global"]),
    effort: z.string().optional(),
  })
  .passthrough();

export interface SentenceDetail {
  index: number;
  text: string;
  word_count: number;
  syllable_count: number;
  complex_word_count: number;
  difficult_word_count: number;
  [key: string]: any;
}

export const SentenceDetailSchema: z.ZodType<SentenceDetail> = z
  .object({
    index: z.number().int().nonnegative(),
    text: z.string(),
    word_count: z.number().int().nonnegative(),
    syllable_count: z.number().int().nonnegative(),
    complex_word_count: z.number().int().nonnegative(),
    difficult_word_count: z.number().int().nonnegative(),
  })
  .passthrough();

export interface ParagraphDetail {
  index: number;
  text: string;
  word_count: number;
  sentence_count: number;
  [key: string]: any;
}

export const ParagraphDetailSchema: z.ZodType<ParagraphDetail> = z
  .object({
    index: z.number().int().nonnegative(),
    text: z.string(),
    word_count: z.number().int().nonnegative(),
    sentence_count: z.number().int().nonnegative(),
  })
  .passthrough();

export interface Hotspot {
  hotspot_id: string;
  type: "sentence" | "paragraph";
  index: number;
  text: string;
  score: number;
  explanation?: string;
  reason?: string;
  revision_instruction?: string;
  affected_metrics: string[];
  affected_formulas: string[];
  suggested_levers: string[];
  [key: string]: any;
}

export const HotspotSchema: z.ZodType<Hotspot> = z
  .object({
    hotspot_id: z.string(),
    type: z.enum(["sentence", "paragraph"]),
    index: z.number().int().nonnegative(),
    text: z.string(),
    score: z.number().nonnegative(),
    explanation: z.string().optional(),
    reason: z.string().optional(),
    revision_instruction: z.string().optional(),
    affected_metrics: z.array(z.string()),
    affected_formulas: z.array(z.string()),
    suggested_levers: z.array(z.string()),
  })
  .passthrough();

export interface ComplianceSummary {
  overall_pass: boolean;
  fit_score?: number;
  score?: number;
  total_checks?: number;
  checks_run?: number;
  passed_checks: number;
  failed_checks?: number;
  skipped_checks?: number;
  violation_count?: number;
  [key: string]: any;
}

export const ComplianceSummarySchema: z.ZodType<ComplianceSummary> = z
  .object({
    overall_pass: z.boolean(),
    fit_score: z.number().min(0).max(100).optional(),
    score: z.number().min(0).max(100).optional(),
    total_checks: z.number().int().nonnegative().optional(),
    checks_run: z.number().int().nonnegative().optional(),
    passed_checks: z.number().int().nonnegative(),
    failed_checks: z.number().int().nonnegative().optional(),
    skipped_checks: z.number().int().nonnegative().optional(),
    violation_count: z.number().int().nonnegative().optional(),
  })
  .passthrough();

export interface Violation {
  metric: string;
  metric_group: string;
  current_value: number;
  target_value: number;
  pass: boolean;
  severity: "low" | "medium" | "high";
  explanation?: string;
  reason?: string;
  message?: string;
  revision_levers?: string[];
  normalized_gap?: number;
  affected_formulas?: string[];
  impact_scope?: "localized" | "distributed" | "global";
  rank_score?: number;
  ruleId?: string;
  status?: string;
  label?: string;
  operator?: "at_least" | "at_most";
  [key: string]: any;
}

export const ViolationSchema: z.ZodType<Violation> = z
  .object({
    metric: z.string(),
    metric_group: z.string(),
    current_value: z.number(),
    target_value: z.number(),
    pass: z.boolean(),
    severity: z.enum(["low", "medium", "high"]),
    explanation: z.string().optional(),
    reason: z.string().optional(),
    message: z.string().optional(),
    revision_levers: z.array(z.string()).optional(),
    normalized_gap: z.number().nonnegative().optional(),
    affected_formulas: z.array(z.string()).optional(),
    impact_scope: z.enum(["localized", "distributed", "global"]).optional(),
    rank_score: z.number().nonnegative().optional(),
    ruleId: z.string().optional(),
    status: z.string().optional(),
    label: z.string().optional(),
    operator: z.enum(["at_least", "at_most"]).optional(),
  })
  .passthrough();

export interface Fit {
  score: number;
  label: "very_low" | "low" | "fair" | "good" | "excellent";
  strongest_alignments: string[];
  strongest_mismatches: string[];
  interpretation: string;
  [key: string]: any;
}

export const FitSchema: z.ZodType<Fit> = z
  .object({
    score: z.number().min(0).max(100),
    label: z.enum(["very_low", "low", "fair", "good", "excellent"]),
    strongest_alignments: z.array(z.string()),
    strongest_mismatches: z.array(z.string()),
    interpretation: z.string(),
  })
  .passthrough();

export interface Details {
  sentences: SentenceDetail[] | null;
  paragraphs: ParagraphDetail[] | null;
  hotspots?: Hotspot[];
  [key: string]: any;
}

export const DetailsSchema: z.ZodType<Details> = z
  .object({
    sentences: z.array(SentenceDetailSchema).nullable(),
    paragraphs: z.array(ParagraphDetailSchema).nullable(),
    hotspots: z.array(HotspotSchema).optional(),
  })
  .passthrough();

export interface AIMarkerMatch {
  pattern: string;
  matched_text: string;
  category: string;
  severity: "low" | "medium" | "high";
  scope: "document" | "localized" | "distributed" | "global";
  offset?: number | null;
  line?: number | null;
  column?: number | null;
  [key: string]: any;
}

export const AIMarkerMatchSchema: z.ZodType<AIMarkerMatch> = z
  .object({
    pattern: z.string(),
    matched_text: z.string(),
    category: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    scope: z.enum(["document", "localized", "distributed", "global"]),
    offset: z.number().nullable().optional(),
    line: z.number().nullable().optional(),
    column: z.number().nullable().optional(),
  })
  .passthrough();

export interface AIAnalysis {
  marker_count: number;
  unique_marker_types: number;
  marker_density_per_1000_words: number;
  score: number;
  style_band: "low" | "moderate" | "high" | "very_high";
  categories: Record<string, number>;
  matches: AIMarkerMatch[];
  [key: string]: any;
}

export const AIAnalysisSchema: z.ZodType<AIAnalysis> = z
  .object({
    marker_count: z.number().int().nonnegative(),
    unique_marker_types: z.number().int().nonnegative(),
    marker_density_per_1000_words: z.number().nonnegative(),
    score: z.number().min(0),
    style_band: z.enum(["low", "moderate", "high", "very_high"]),
    categories: z.record(z.number().int().nonnegative()),
    matches: z.array(AIMarkerMatchSchema),
  })
  .passthrough();

export interface StructuralMetrics {
  counts: Counts;
  sentence_metrics: SentenceMetrics;
  paragraph_metrics: ParagraphMetrics;
  lexical: LexicalMetrics;
  scannability: ScannabilityMetrics;
  fiction?: FictionMetrics;
  sentences: SentenceDetail[];
  paragraphs: ParagraphDetail[];
}

export interface PublicAnalysisResult {
  metadata: Metadata;
  counts: Counts;
  sentence_metrics: SentenceMetrics;
  paragraph_metrics: ParagraphMetrics;
  lexical_metrics: LexicalMetrics;
  scannability_metrics: ScannabilityMetrics;
  fiction_metrics?: FictionMetrics;
  word_tracking_metrics?: Record<string, number>;
  ai_analysis?: AIAnalysis;
  formulas: FormulaResult[];
  readability_band: string;
  consensus_grade: number;
  consensus_sources: string[];
  excluded_formulas: string[];
  targets: Targets | null;
  template_info?: {
    id: string;
    name: string;
    family: string;
  };
  fit?: Fit;
  summary: ComplianceSummary | null;
  violations: Violation[];
  revision_levers: RankedLever[];
  interpretations?: Record<string, string>;
  details: Details;
  recommended_next?: {
    tool: string;
    reason: string;
    required?: boolean;
  };
  [key: string]: any;
}

export const PublicAnalysisResultSchema: z.ZodType<PublicAnalysisResult> = z
  .object({
    metadata: MetadataSchema,
    counts: CountsSchema,
    sentence_metrics: SentenceMetricsSchema,
    paragraph_metrics: ParagraphMetricsSchema,
    lexical_metrics: LexicalMetricsSchema,
    scannability_metrics: ScannabilityMetricsSchema,
    fiction_metrics: FictionMetricsSchema.optional(),
    word_tracking_metrics: z.record(z.number().int().nonnegative()).optional(),
    ai_analysis: AIAnalysisSchema.optional(),
    formulas: z.array(FormulaResultSchema),
    readability_band: z.string(),
    consensus_grade: z.number().nonnegative(),
    consensus_sources: z.array(z.string()),
    excluded_formulas: z.array(z.string()),
    targets: TargetSchema.nullable(),
    template_info: z
      .object({
        id: z.string(),
        name: z.string(),
        family: z.string(),
      })
      .optional(),
    fit: FitSchema.optional(),
    summary: ComplianceSummarySchema.nullable(),
    violations: z.array(ViolationSchema),
    revision_levers: z.array(RevisionLeverSchema),
    interpretations: z.record(z.string()).optional(),
    details: DetailsSchema,
    recommended_next: z
      .object({
        tool: z.string(),
        reason: z.string(),
        required: z.boolean().optional(),
      })
      .optional(),
  })
  .passthrough();

export interface AnchorComparison {
  text: string;
  category: string;
  original_count: number;
  revised_count: number;
  status: "preserved" | "dropped" | "added" | "changed" | "polarity_shift";
  weight: number;
  original_contexts: string[];
  revised_contexts: string[];
  [key: string]: any;
}

export const AnchorComparisonSchema: z.ZodType<AnchorComparison> = z
  .object({
    text: z.string(),
    category: z.string(),
    original_count: z.number().int().nonnegative(),
    revised_count: z.number().int().nonnegative(),
    status: z.enum(["preserved", "dropped", "added", "changed", "polarity_shift"]),
    weight: z.number().nonnegative(),
    original_contexts: z.array(z.string()),
    revised_contexts: z.array(z.string()),
  })
  .passthrough();

export interface ContentIntegrityReport {
  integrity_score: number;
  anchor_recall: number;
  weighted_anchor_recall: number;
  new_anchor_rate: number;
  polarity_shift_count: number;
  anchors: AnchorComparison[];
  [key: string]: any;
}

export const ContentIntegrityReportSchema: z.ZodType<ContentIntegrityReport> = z
  .object({
    integrity_score: z.number().min(0).max(100),
    anchor_recall: z.number().min(0).max(1),
    weighted_anchor_recall: z.number().min(0).max(1),
    new_anchor_rate: z.number().min(0).max(1),
    polarity_shift_count: z.number().int().nonnegative(),
    anchors: z.array(AnchorComparisonSchema),
  })
  .passthrough();
