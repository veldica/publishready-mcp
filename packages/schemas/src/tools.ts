import { z } from "zod";
import { WritingProfileSchema } from "./profiles.js";
import { NonEmptyTargetSchema } from "./targets.js";
import type { WritingProfile } from "./profiles.js";
import type { Targets } from "./targets.js";

const ProfileOrTemplateIdSchema = z
  .union([WritingProfileSchema, NonEmptyTargetSchema, z.string()])
  .describe(
    "A full writing profile object, explicit numeric target profile, or built-in template ID string."
  );

export interface DetailOptions {
  include_formula_breakdown: boolean;
  include_sentence_details: boolean;
  include_paragraph_details: boolean;
}

const DetailOptionsSchema = z
  .object({
    include_formula_breakdown: z
      .boolean()
      .default(true)
      .describe(
        "Include formula inputs, contributors, and linked revision levers in the response."
      ),
    include_sentence_details: z
      .boolean()
      .default(false)
      .describe("Include per-sentence structural details in the `details.sentences` array."),
    include_paragraph_details: z
      .boolean()
      .default(false)
      .describe("Include per-paragraph structural details in the `details.paragraphs` array."),
  })
  .strict()
  .describe("Optional flags for expanding the structured response.");

export interface AnalyzeTextArguments {
  text: string;
  options?: Partial<DetailOptions>;
}

export const AnalyzeTextArguments: z.ZodType<AnalyzeTextArguments> = z
  .object({
    text: z
      .string()
      .describe(
        "English prose or markdown-ish content to analyze. Blank input is accepted and returns zeroed metrics."
      ),
    options: DetailOptionsSchema.optional(),
  })
  .strict()
  .describe(
    "Returns a deterministic writing analysis with structural counts, lexical metrics, readability formulas, and ranked revision levers."
  );

export interface AuditAISoundingProseArguments {
  text: string;
  track_words?: string[];
  include_matches?: boolean;
  include_formula_breakdown?: boolean;
}

export const AuditAISoundingProseArguments: z.ZodType<AuditAISoundingProseArguments> = z
  .object({
    text: z.string().describe("English prose or markdown-ish content to audit."),
    track_words: z
      .array(z.string().min(1))
      .optional()
      .describe(
        "Optional extra words or phrases to count alongside the built-in AI marker catalog."
      ),
    include_matches: z
      .boolean()
      .default(true)
      .describe("Include individual marker matches with line/column positions."),
    include_formula_breakdown: z
      .boolean()
      .default(false)
      .describe("Include readability formula detail objects in the response."),
  })
  .strict()
  .describe(
    "Runs the Veldica AI-sounding prose inventory and returns marker density, categories, matches, and supporting writing metrics."
  );

export interface AnalyzeAgainstTargetsArguments {
  text: string;
  targets: Targets;
  options?: Partial<DetailOptions>;
}

export const AnalyzeAgainstTargetsArguments: z.ZodType<AnalyzeAgainstTargetsArguments> = z
  .object({
    text: z.string().describe("English prose or markdown-ish content to evaluate."),
    targets: NonEmptyTargetSchema.describe(
      "Numeric constraints to check against the analyzed text."
    ),
    options: DetailOptionsSchema.partial()
      .extend({
        include_formula_breakdown: z
          .boolean()
          .default(true)
          .describe("Keep formula detail objects in the response."),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe(
    "Evaluates text against an explicit target profile. Returns normalized violations, a compliance summary, and ranked revision levers."
  );

export interface SuggestRevisionLeversArguments {
  text: string;
  targets?: Targets;
  options?: {
    include_formula_breakdown?: boolean;
  };
}

export const SuggestRevisionLeversArguments: z.ZodType<SuggestRevisionLeversArguments> = z
  .object({
    text: z
      .string()
      .describe("English prose or markdown-ish content to analyze for ranked revision leverage."),
    targets: NonEmptyTargetSchema.optional().describe(
      "Optional numeric targets that should influence lever ranking."
    ),
    options: z
      .object({
        include_formula_breakdown: z
          .boolean()
          .default(true)
          .describe("Include formula detail objects in the response."),
      })
      .strict()
      .optional()
      .describe("Optional ranking output flags."),
  })
  .strict()
  .describe(
    "Ranks deterministic revision levers using target violations, formula pressure, and structural hotspots."
  );

export interface AnalyzeAgainstTemplateArguments {
  text: string;
  template_id: string;
  options?: Partial<DetailOptions>;
}

export const AnalyzeAgainstTemplateArguments: z.ZodType<AnalyzeAgainstTemplateArguments> = z
  .object({
    text: z.string().describe("English prose or markdown-ish content to evaluate."),
    template_id: z.string().describe("ID of the built-in template to check against."),
    options: DetailOptionsSchema.optional(),
  })
  .strict()
  .describe("Evaluates text against a built-in writing template.");

export interface ListTemplatesArguments {
  family?: "nonfiction" | "fiction";
  audience?: string;
  use_case?: string;
  query?: string;
}

export const ListTemplatesArguments: z.ZodType<ListTemplatesArguments> = z
  .object({
    family: z.enum(["nonfiction", "fiction"]).optional().describe("Filter templates by family."),
    audience: z
      .string()
      .optional()
      .describe("Case-insensitive substring filter for template audience."),
    use_case: z
      .string()
      .optional()
      .describe("Case-insensitive substring filter for template use case."),
    query: z
      .string()
      .optional()
      .describe("Case-insensitive search across ID, name, description, audience, and use case."),
  })
  .strict()
  .describe("Returns a list of available built-in writing templates.");

export interface GetTemplateArguments {
  template_id: string;
}

export const GetTemplateArguments: z.ZodType<GetTemplateArguments> = z
  .object({
    template_id: z.string().describe("ID of the template to retrieve."),
  })
  .strict()
  .describe("Returns the full definition of a specific template.");

export interface InterpretTargetsArguments {
  targets: Targets;
}

export const InterpretTargetsArguments: z.ZodType<InterpretTargetsArguments> = z
  .object({
    targets: NonEmptyTargetSchema.describe("Numeric targets to interpret."),
  })
  .strict()
  .describe("Explains what a set of writing targets implies in human terms.");

export interface SummarizeWritingProfileArguments {
  text: string;
}

export const SummarizeWritingProfileArguments: z.ZodType<SummarizeWritingProfileArguments> = z
  .object({
    text: z.string().describe("English prose to summarize into a writing profile."),
  })
  .strict()
  .describe("Describes the current text's overall writing shape in human terms.");

export interface BuildReferenceProfileArguments {
  texts: string[];
  profile_name?: string;
}

export const BuildReferenceProfileArguments: z.ZodType<BuildReferenceProfileArguments> = z
  .object({
    texts: z.array(z.string()).min(1).describe("One or more reference texts to aggregate."),
    profile_name: z.string().optional().describe("Optional name for the reference profile."),
  })
  .strict()
  .describe("Creates a reusable writing profile from reference samples.");

export interface CompareToReferenceArguments {
  candidate_text: string;
  reference_text?: string;
  reference_profile?: WritingProfile;
}

export const CompareToReferenceInputShape = {
  candidate_text: z.string().describe("The text to evaluate."),
  reference_text: z.string().optional().describe("Reference text to compare against."),
  reference_profile: WritingProfileSchema.optional().describe(
    "Previously built reference profile to compare against."
  ),
};

export const CompareToReferenceArguments: z.ZodType<CompareToReferenceArguments> = z
  .object(CompareToReferenceInputShape)
  .strict()
  .refine((args) => Boolean(args.reference_text || args.reference_profile), {
    message: "Provide either reference_text or reference_profile.",
  })
  .describe("Compares candidate writing to a reference sample or profile.");

export type ProfileOrTemplateId = WritingProfile | Targets | string;

export interface CompareProfilesArguments {
  profile_a: ProfileOrTemplateId;
  profile_b: ProfileOrTemplateId;
}

export const CompareProfilesArguments: z.ZodType<CompareProfilesArguments> = z
  .object({
    profile_a: ProfileOrTemplateIdSchema.describe("First profile or template ID."),
    profile_b: ProfileOrTemplateIdSchema.describe("Second profile or template ID."),
  })
  .strict()
  .describe("Compares two writing profiles or templates for alignment.");

export interface FindReferenceDriftArguments {
  candidate_text: string;
  reference_text?: string;
  reference_profile?: WritingProfile;
}

export const FindReferenceDriftInputShape = {
  candidate_text: z.string().describe("The text to evaluate for drift."),
  reference_text: z.string().optional().describe("Reference text to compare against."),
  reference_profile: WritingProfileSchema.optional().describe(
    "Reference profile to compare against."
  ),
};

export const FindReferenceDriftArguments: z.ZodType<FindReferenceDriftArguments> = z
  .object(FindReferenceDriftInputShape)
  .strict()
  .refine((args) => Boolean(args.reference_text || args.reference_profile), {
    message: "Provide either reference_text or reference_profile.",
  })
  .describe("Identifies where candidate writing drifts from a reference.");

export interface CompareTextVersionsArguments {
  original_text: string;
  revised_text: string;
  template_id?: string;
  targets?: Targets;
  reference_text?: string;
  reference_profile?: WritingProfile;
}

export const CompareTextVersionsArguments: z.ZodType<CompareTextVersionsArguments> = z
  .object({
    original_text: z.string().describe("The original draft."),
    revised_text: z.string().describe("The revised draft."),
    template_id: z.string().optional().describe("Optional template to check improvement against."),
    targets: NonEmptyTargetSchema.optional().describe(
      "Optional numeric target profile to compare movement against."
    ),
    reference_text: z
      .string()
      .optional()
      .describe("Optional reference sample to compare both versions against."),
    reference_profile: WritingProfileSchema.optional().describe(
      "Optional reusable reference profile to compare both versions against."
    ),
  })
  .strict()
  .describe("Compares original and revised drafts for improvement or regression.");

export interface FindHotspotsArguments {
  text: string;
  template_id?: string;
}

export const FindHotspotsArguments: z.ZodType<FindHotspotsArguments> = z
  .object({
    text: z.string().describe("Text to analyze for structural or lexical hotspots."),
    template_id: z
      .string()
      .optional()
      .describe("Optional template to influence hotspot detection."),
  })
  .strict()
  .describe("Identifies the most problematic sentences and paragraphs in a text.");

export interface PlanRevisionWorkflowArguments {
  task:
    | "fact_preserving_revision"
    | "template_revision"
    | "reference_match"
    | "hotspot_fix"
    | "ai_sounding_audit";
  text: string;
  template_id?: string;
  reference_text?: string;
}

export const PlanRevisionWorkflowArguments: z.ZodType<PlanRevisionWorkflowArguments> = z
  .object({
    task: z.enum([
      "fact_preserving_revision",
      "template_revision",
      "reference_match",
      "hotspot_fix",
      "ai_sounding_audit",
    ]),
    text: z.string().describe("The text to be revised."),
    template_id: z.string().optional().describe("Template ID for template_revision."),
    reference_text: z.string().optional().describe("Reference text for reference_match."),
  })
  .strict()
  .describe("Plans a sequence of tool calls for a specific revision task.");
