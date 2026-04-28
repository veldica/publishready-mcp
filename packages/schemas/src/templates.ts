import { z } from "zod";
import { TargetSchema } from "./targets.js";
import type { Targets } from "./targets.js";

export interface TemplateMetadata {
  id: string;
  name: string;
  family: "nonfiction" | "fiction";
  audience: string;
  use_case: string;
  description: string;
}

const TemplateMetadataSchemaInternal = z
  .object({
    id: z.string(),
    name: z.string(),
    family: z.enum(["nonfiction", "fiction"]),
    audience: z.string(),
    use_case: z.string(),
    description: z.string(),
  })
  .strict();

export const TemplateMetadataSchema: z.ZodType<TemplateMetadata> = TemplateMetadataSchemaInternal;

export interface Template extends TemplateMetadata {
  targets: Targets;
  hard_fails: Record<string, string>;
  soft_preferences: Record<string, string>;
  signal_interpretations: Record<string, string>;
  revision_priorities: string[];
  tradeoffs: string[];
}

export const TemplateSchema: z.ZodType<Template> = TemplateMetadataSchemaInternal.extend({
  targets: TargetSchema,
  hard_fails: z
    .record(z.string())
    .describe("Target failures that should usually block publication for this profile."),
  soft_preferences: z
    .record(z.string())
    .describe("Signals that shape the intended feel but may be traded off deliberately."),
  signal_interpretations: z
    .record(z.string())
    .describe("Template-specific explanations for the most important metrics."),
  revision_priorities: z
    .array(z.string())
    .min(1)
    .describe("Ordered deterministic levers to try first when the template does not fit."),
  tradeoffs: z
    .array(z.string())
    .min(1)
    .describe("Known style tradeoffs users should consider before optimizing mechanically."),
}).strict();
