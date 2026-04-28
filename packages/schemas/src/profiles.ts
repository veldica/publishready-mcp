import { z } from "zod";
import {
  CountsSchema,
  FictionMetricsSchema,
  LexicalMetricsSchema,
  ParagraphMetricsSchema,
  ScannabilityMetricsSchema,
  SentenceMetricsSchema,
} from "./results.js";

export const WritingProfileSchema = z
  .object({
    name: z.string().optional(),
    timestamp: z
      .string()
      .describe("Stable content-derived timestamp used to keep profile outputs deterministic."),
    profile_id: z.string().optional(),
    source_sha256: z.string().length(64).optional(),
    source_count: z.number().int().nonnegative().optional(),
    counts: CountsSchema,
    sentence_metrics: SentenceMetricsSchema,
    paragraph_metrics: ParagraphMetricsSchema,
    lexical_metrics: LexicalMetricsSchema,
    scannability_metrics: ScannabilityMetricsSchema,
    fiction_metrics: FictionMetricsSchema.optional(),
    consensus_grade: z.number(),
    readability_band: z.string(),
    summary: z.string().optional(),
  })
  .strict();

export type WritingProfile = z.infer<typeof WritingProfileSchema>;
