import { z } from "zod";

export const REVISE_PROSE_PROMPT = {
  name: "revise_prose",
  description:
    "Plan and verify a revision using deterministic writing metrics and explicit revision levers.",
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
    "Measure text against specific numeric targets and identify the most critical deterministic revision levers.",
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
  description: "Improve style while ensuring factual anchors and core meaning are preserved.",
  argsSchema: {
    text: z.string().describe("The draft text to revise."),
    goals: z.string().optional().describe("Stylistic goals."),
  },
};

export const MATCH_REFERENCE_STYLE_PROMPT = {
  name: "match_reference_style",
  description: "Analyze a reference text and revise a draft to match its stylistic fingerprint.",
  argsSchema: {
    draft: z.string().describe("The draft text to revise."),
    reference: z.string().describe("High-quality reference text to match."),
  },
};

export const REVISE_TO_TEMPLATE_PROMPT = {
  name: "revise_to_template",
  description: "Revise a draft to comply with a specific built-in writing template.",
  argsSchema: {
    text: z.string().describe("The draft text to revise."),
    template_id: z.string().describe("ID of the target template (e.g., 'technical_docs')."),
  },
};

export const FIND_AND_FIX_HOTSPOTS_PROMPT = {
  name: "find_and_fix_hotspots",
  description: "Locate specific readability drags and apply surgical fixes.",
  argsSchema: {
    text: z.string().describe("The text to audit for hotspots."),
  },
};

export const COMPARE_REVISION_QUALITY_PROMPT = {
  name: "compare_revision_quality",
  description: "Exhaustively compare two versions of text to verify improvement and integrity.",
  argsSchema: {
    original: z.string().describe("The original draft."),
    revised: z.string().describe("The revised version."),
  },
};

export const BUILD_STYLE_PROFILE_PROMPT = {
  name: "build_style_profile",
  description: "Create a reusable stylistic fingerprint from one or more reference samples.",
  argsSchema: {
    texts: z.array(z.string()).describe("One or more high-quality reference texts."),
  },
};

export const AUDIT_AI_SOUNDING_PROSE_PROMPT = {
  name: "audit_ai_sounding_prose",
  description: "Detect patterns common in AI-generated text and suggest humanizing revisions.",
  argsSchema: {
    text: z.string().describe("The text to audit."),
  },
};

export const FICTION_PACING_REVIEW_PROMPT = {
  name: "fiction_pacing_review",
  description: "Analyze narrative metrics (dialogue, scene density) to optimize fiction pacing.",
  argsSchema: {
    text: z.string().describe("The scene or chapter to analyze."),
  },
};

export const LANDING_PAGE_COPY_REVIEW_PROMPT = {
  name: "landing_page_copy_review",
  description: "Audit scannability and impact for marketing or landing page copy.",
  argsSchema: {
    text: z.string().describe("The landing page copy."),
  },
};

export const TECHNICAL_DOCS_REVIEW_PROMPT = {
  name: "technical_docs_review",
  description: "Verify technical documentation against accessibility and clarity standards.",
  argsSchema: {
    text: z.string().describe("The technical document."),
  },
};
