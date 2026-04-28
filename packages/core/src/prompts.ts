import { z } from "zod";

export const REVISE_PROSE_PROMPT = {
  name: "revise_prose",
  description:
    "Run a final publish-ready revision pass using deterministic metrics, explicit revision levers, and post-revision verification.",
  argsSchema: {
    text: z.string().describe("The draft text to analyze and revise."),
    goals: z
      .string()
      .optional()
      .describe("Optional description of the desired target profile or readability band."),
  },
};

export const CHECK_COMPLIANCE_PROMPT = {
  name: "check_compliance",
  description:
    "Check whether a draft satisfies explicit numeric writing targets and identify the smallest high-impact changes needed to comply.",
  argsSchema: {
    text: z.string().describe("The draft text to evaluate."),
    targets_json: z
      .string()
      .optional()
      .describe("Optional JSON string representing the targets object."),
  },
};

export const REVISE_WITHOUT_LOSING_FACTS_PROMPT = {
  name: "revise_without_losing_facts",
  description:
    "Improve style while preserving facts, claims, named entities, technical terminology, and the author's intended voice.",
  argsSchema: {
    text: z.string().describe("The draft text to revise."),
    goals: z.string().optional().describe("Stylistic goals."),
  },
};

export const MATCH_REFERENCE_STYLE_PROMPT = {
  name: "match_reference_style",
  description:
    "Analyze a reference text and revise a draft toward its stylistic fingerprint without blindly copying wording or losing meaning.",
  argsSchema: {
    draft: z.string().describe("The draft text to revise."),
    reference: z.string().describe("High-quality reference text to match."),
  },
};

export const REVISE_TO_TEMPLATE_PROMPT = {
  name: "revise_to_template",
  description:
    "Revise a draft to comply with a built-in writing template while preserving factual meaning and intentional tone where possible.",
  argsSchema: {
    text: z.string().describe("The draft text to revise."),
    template_id: z.string().describe("ID of the target template (e.g., 'technical_docs')."),
  },
};

export const FIND_AND_FIX_HOTSPOTS_PROMPT = {
  name: "find_and_fix_hotspots",
  description:
    "Locate the exact sentences or paragraphs dragging down readability and apply surgical fixes instead of broad rewrites.",
  argsSchema: {
    text: z.string().describe("The text to audit for hotspots."),
  },
};

export const COMPARE_REVISION_QUALITY_PROMPT = {
  name: "compare_revision_quality",
  description:
    "Compare an original and revised draft to verify mechanical improvement, preserved meaning, and reduced regression risk.",
  argsSchema: {
    original: z.string().describe("The original draft."),
    revised: z.string().describe("The revised version."),
  },
};

export const BUILD_STYLE_PROFILE_PROMPT = {
  name: "build_style_profile",
  description:
    "Create a reusable stylistic fingerprint from one or more reference samples for future matching, drift checks, and revision planning.",
  argsSchema: {
    texts: z.array(z.string()).describe("One or more high-quality reference texts."),
  },
};

export const AUDIT_AI_SOUNDING_PROSE_PROMPT = {
  name: "audit_ai_sounding_prose",
  description:
    "Detect patterns that make prose sound generic, over-polished, or AI-generated and suggest revisions that retain substance and voice.",
  argsSchema: {
    text: z.string().describe("The text to audit."),
  },
};

export const FICTION_PACING_REVIEW_PROMPT = {
  name: "fiction_pacing_review",
  description:
    "Analyze dialogue balance, scene density, and exposition load to improve fiction pacing without flattening the narrative voice.",
  argsSchema: {
    text: z.string().describe("The scene or chapter to analyze."),
  },
};

export const LANDING_PAGE_COPY_REVIEW_PROMPT = {
  name: "landing_page_copy_review",
  description:
    "Audit landing page copy for scannability, clarity, and conversion friction while preserving the intended offer and positioning.",
  argsSchema: {
    text: z.string().describe("The landing page copy."),
  },
};

export const TECHNICAL_DOCS_REVIEW_PROMPT = {
  name: "technical_docs_review",
  description:
    "Verify technical documentation against clarity, accessibility, and instructional usefulness without stripping necessary precision.",
  argsSchema: {
    text: z.string().describe("The technical document."),
  },
};
