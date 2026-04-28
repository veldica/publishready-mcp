import { z } from "zod";
import { HotspotSchema, RevisionLeverSchema, ContentIntegrityReportSchema } from "./results.js";
import type { Hotspot, RankedLever, ContentIntegrityReport } from "./results.js";
import { TargetSchema } from "./targets.js";
import type { Targets } from "./targets.js";
import { TemplateMetadataSchema, TemplateSchema } from "./templates.js";
import type { TemplateMetadata, Template } from "./templates.js";
import { WritingProfileSchema } from "./profiles.js";
import type { WritingProfile } from "./profiles.js";

export interface ListTemplatesOutput {
  templates: TemplateMetadata[];
  count: number;
}

export const ListTemplatesOutputSchema: z.ZodType<ListTemplatesOutput> = z
  .object({
    templates: z.array(TemplateMetadataSchema),
    count: z.number().int().nonnegative(),
  })
  .strict();

export const GetTemplateOutputSchema: z.ZodType<Template> = TemplateSchema;

export interface InterpretTargetsOutput {
  implications: string[];
  likely_audience: string[];
  likely_use_cases: string[];
  style_implications: string[];
  nearest_templates: string[];
  coherence_warnings: string[];
  tradeoffs: string[];
}

export const InterpretTargetsOutputSchema: z.ZodType<InterpretTargetsOutput> = z
  .object({
    implications: z.array(z.string()),
    likely_audience: z.array(z.string()),
    likely_use_cases: z.array(z.string()),
    style_implications: z.array(z.string()),
    nearest_templates: z.array(z.string()),
    coherence_warnings: z.array(z.string()),
    tradeoffs: z.array(z.string()),
  })
  .strict();

export const BuildReferenceProfileOutputSchema: z.ZodType<WritingProfile> = WritingProfileSchema;

export interface WritingProfileSummaryOutput {
  profile: WritingProfile;
  summary: string;
  nearest_templates: string[];
  notable_traits: {
    sentence_length: number;
    vocabulary_difficulty: number;
    avg_characters_per_word: number;
    scannability: number;
    consensus_grade: number;
  };
}

export const WritingProfileSummaryOutputSchema: z.ZodType<WritingProfileSummaryOutput> = z
  .object({
    profile: WritingProfileSchema,
    summary: z.string(),
    nearest_templates: z.array(z.string()),
    notable_traits: z
      .object({
        sentence_length: z.number(),
        vocabulary_difficulty: z.number(),
        avg_characters_per_word: z.number(),
        scannability: z.number(),
        consensus_grade: z.number(),
      })
      .strict(),
  })
  .strict();

export interface ProfileComparisonCore {
  alignment_score: number;
  largest_differences: string[];
  strongest_similarities: string[];
}

const ProfileComparisonCoreSchemaInternal = z
  .object({
    alignment_score: z.number().min(0).max(100),
    largest_differences: z.array(z.string()),
    strongest_similarities: z.array(z.string()),
  })
  .strict();

export const ProfileComparisonCoreSchema: z.ZodType<ProfileComparisonCore> =
  ProfileComparisonCoreSchemaInternal;

export interface CompareProfilesOutput extends ProfileComparisonCore {
  profile_a_name: string | null;
  profile_b_name: string | null;
}

export const CompareProfilesOutputSchema: z.ZodType<CompareProfilesOutput> =
  ProfileComparisonCoreSchemaInternal.extend({
    profile_a_name: z.string().nullable(),
    profile_b_name: z.string().nullable(),
  }).strict();

export interface ReferenceMetricSet {
  avg_words_per_sentence: number;
  difficult_word_ratio: number;
  avg_characters_per_word: number;
  scannability_score: number;
  consensus_grade: number;
}

const ReferenceMetricSetSchema = z
  .object({
    avg_words_per_sentence: z.number(),
    difficult_word_ratio: z.number(),
    avg_characters_per_word: z.number(),
    scannability_score: z.number(),
    consensus_grade: z.number(),
  })
  .strict();

export interface CompareToReferenceOutput {
  alignment_score: number;
  reference_name: string;
  candidate_summary?: string;
  reference_summary?: string;
  largest_differences: string[];
  strongest_similarities: string[];
  reference_targets: Targets;
  revision_levers: RankedLever[];
  metrics: {
    candidate: ReferenceMetricSet;
    reference: ReferenceMetricSet;
  };
  recommended_next?: {
    tool: string;
    reason: string;
    required?: boolean;
  };
}

export const CompareToReferenceOutputSchema: z.ZodType<CompareToReferenceOutput> = z
  .object({
    alignment_score: z.number().min(0).max(100),
    reference_name: z.string(),
    candidate_summary: z.string().optional(),
    reference_summary: z.string().optional(),
    largest_differences: z.array(z.string()),
    strongest_similarities: z.array(z.string()),
    reference_targets: TargetSchema,
    revision_levers: z.array(RevisionLeverSchema),
    metrics: z
      .object({
        candidate: ReferenceMetricSetSchema,
        reference: ReferenceMetricSetSchema,
      })
      .strict(),
    recommended_next: z
      .object({
        tool: z.string(),
        reason: z.string(),
        required: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();

export interface FindReferenceDriftOutput {
  drift_detected: boolean;
  alignment_score: number;
  summary: string;
  changing_traits: string[];
  stable_traits: string[];
  impact_areas: string[];
  reference_targets: Targets;
  drift_points: Hotspot[];
  recommended_next?: {
    tool: string;
    reason: string;
    required?: boolean;
  };
}

export const FindReferenceDriftOutputSchema: z.ZodType<FindReferenceDriftOutput> = z
  .object({
    drift_detected: z.boolean(),
    alignment_score: z.number().min(0).max(100),
    summary: z.string(),
    changing_traits: z.array(z.string()),
    stable_traits: z.array(z.string()),
    impact_areas: z.array(z.string()),
    reference_targets: TargetSchema,
    drift_points: z.array(HotspotSchema),
    recommended_next: z
      .object({
        tool: z.string(),
        reason: z.string(),
        required: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();

export interface FitMovement {
  original_fit_score: number;
  revised_fit_score: number;
  delta: number;
  trend: "improving" | "regressing" | "stable";
}

const FitMovementSchema = z
  .object({
    original_fit_score: z.number().min(0).max(100),
    revised_fit_score: z.number().min(0).max(100),
    delta: z.number(),
    trend: z.enum(["improving", "regressing", "stable"]),
  })
  .strict();

export interface QualityGateResult {
  status: "pass" | "warning" | "fail";
  reasons: string[];
  recommended_action: "accept_revision" | "revise_again" | "reject_revision";
}

export const QualityGateResultSchema = z
  .object({
    status: z.enum(["pass", "warning", "fail"]),
    reasons: z.array(z.string()),
    recommended_action: z.enum(["accept_revision", "revise_again", "reject_revision"]),
  })
  .strict();

export interface CompareTextVersionsOutput {
  comparison: ProfileComparisonCore;
  template_fit:
    | (FitMovement & {
        template_id: string;
        over_corrected: boolean;
      })
    | null;
  target_fit: FitMovement | null;
  reference_alignment: {
    reference_name: string;
    original_alignment_score: number;
    revised_alignment_score: number;
    delta: number;
    trend: "improving" | "regressing" | "stable";
    reference_targets: Targets;
  } | null;
  content_integrity: ContentIntegrityReport;
  quality_gate: QualityGateResult;
  metrics_delta: {
    sentence_length: number;
    vocabulary_difficulty: number;
    grade_level: number;
  };
  improvements: string[];
  regressions: string[];
  stable_traits: string[];
  movement: "toward_goal" | "away_from_goal" | "stable" | "no_goal";
  summary: string;
  recommended_next?: {
    tool: string;
    reason: string;
    required?: boolean;
  };
}

export const CompareTextVersionsOutputSchema: z.ZodType<CompareTextVersionsOutput> = z
  .object({
    comparison: ProfileComparisonCoreSchemaInternal,
    template_fit: FitMovementSchema.extend({
      template_id: z.string(),
      over_corrected: z.boolean(),
    })
      .strict()
      .nullable(),
    target_fit: FitMovementSchema.nullable(),
    reference_alignment: z
      .object({
        reference_name: z.string(),
        original_alignment_score: z.number().min(0).max(100),
        revised_alignment_score: z.number().min(0).max(100),
        delta: z.number(),
        trend: z.enum(["improving", "regressing", "stable"]),
        reference_targets: TargetSchema,
      })
      .strict()
      .nullable(),
    content_integrity: ContentIntegrityReportSchema,
    quality_gate: QualityGateResultSchema,
    metrics_delta: z
      .object({
        sentence_length: z.number(),
        vocabulary_difficulty: z.number(),
        grade_level: z.number(),
      })
      .strict(),
    improvements: z.array(z.string()),
    regressions: z.array(z.string()),
    stable_traits: z.array(z.string()),
    movement: z.enum(["toward_goal", "away_from_goal", "stable", "no_goal"]),
    summary: z.string(),
    recommended_next: z
      .object({
        tool: z.string(),
        reason: z.string(),
        required: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();

export interface PlanRevisionWorkflowOutput {
  steps: string[];
  acceptance_gate: Record<string, string>;
  initial_tool: string;
  reason: string;
}

export const PlanRevisionWorkflowOutputSchema: z.ZodType<PlanRevisionWorkflowOutput> = z
  .object({
    steps: z.array(z.string()),
    acceptance_gate: z.record(z.string()),
    initial_tool: z.string(),
    reason: z.string(),
  })
  .strict();
