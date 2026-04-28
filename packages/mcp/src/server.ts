import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { handleAnalyzeAgainstTargets } from "./tools/analyzeAgainstTargets.js";
import { handleAnalyzeText } from "./tools/analyzeText.js";
import { handleSuggestRevisionLevers } from "./tools/suggestRevisionLevers.js";
import { handleAnalyzeAgainstTemplate } from "./tools/analyzeAgainstTemplate.js";
import { handleListTemplates } from "./tools/listTemplates.js";
import { handleGetTemplate } from "./tools/getTemplate.js";
import { handleInterpretTargets } from "./tools/interpretTargets.js";
import { handleSummarizeWritingProfile } from "./tools/summarizeWritingProfile.js";
import { handleBuildReferenceProfile } from "./tools/buildReferenceProfile.js";
import { handleCompareToReference } from "./tools/compareToReference.js";
import { handleCompareProfiles } from "./tools/compareProfiles.js";
import { handleFindReferenceDrift } from "./tools/findReferenceDrift.js";
import { handleCompareTextVersions } from "./tools/compareTextVersions.js";
import { handleFindHotspots } from "./tools/findHotspots.js";
import { handlePlanRevisionWorkflow } from "./tools/planRevisionWorkflow.js";
import { handleAuditAISoundingProse } from "./tools/auditAISoundingProse.js";

import { PACKAGE_DESCRIPTION, PACKAGE_NAME, PACKAGE_VERSION } from "./packageInfo.js";
import { PublicAnalysisResultSchema, TargetSchema } from "@veldica/publishready-schemas";
import {
  AnalyzeAgainstTargetsArguments,
  AnalyzeTextArguments,
  AuditAISoundingProseArguments,
  SuggestRevisionLeversArguments,
  AnalyzeAgainstTemplateArguments,
  ListTemplatesArguments,
  GetTemplateArguments,
  InterpretTargetsArguments,
  SummarizeWritingProfileArguments,
  BuildReferenceProfileArguments,
  CompareToReferenceArguments,
  CompareToReferenceInputShape,
  CompareProfilesArguments,
  FindReferenceDriftArguments,
  FindReferenceDriftInputShape,
  CompareTextVersionsArguments,
  FindHotspotsArguments,
  PlanRevisionWorkflowArguments,
} from "@veldica/publishready-schemas";
import {
  BuildReferenceProfileOutputSchema,
  CompareProfilesOutputSchema,
  CompareTextVersionsOutputSchema,
  CompareToReferenceOutputSchema,
  FindReferenceDriftOutputSchema,
  GetTemplateOutputSchema,
  InterpretTargetsOutputSchema,
  ListTemplatesOutputSchema,
  WritingProfileSummaryOutputSchema,
  PlanRevisionWorkflowOutputSchema,
} from "@veldica/publishready-schemas";
import { BUILTIN_TEMPLATES } from "@veldica/publishready-core";
import { logger } from "@veldica/publishready-core";
import {
  CHECK_COMPLIANCE_PROMPT,
  REVISE_PROSE_PROMPT,
  REVISE_WITHOUT_LOSING_FACTS_PROMPT,
  MATCH_REFERENCE_STYLE_PROMPT,
  REVISE_TO_TEMPLATE_PROMPT,
  FIND_AND_FIX_HOTSPOTS_PROMPT,
  COMPARE_REVISION_QUALITY_PROMPT,
  BUILD_STYLE_PROFILE_PROMPT,
  AUDIT_AI_SOUNDING_PROSE_PROMPT,
  FICTION_PACING_REVIEW_PROMPT,
  LANDING_PAGE_COPY_REVIEW_PROMPT,
  TECHNICAL_DOCS_REVIEW_PROMPT,
} from "@veldica/publishready-core";

export class WritingMetricsServer {
  private readonly server: McpServer;

  constructor() {
    this.server = new McpServer({
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
    });

    this.setupResources();
    this.setupTools();
    this.setupPrompts();
  }

  private setupResources() {
    this.server.registerResource(
      "metrics-definitions",
      "metrics://definitions",
      {
        description:
          "Glossary of structural, lexical, and readability metrics exposed by the writing metrics server.",
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                package_name: PACKAGE_NAME,
                package_version: PACKAGE_VERSION,
                description: PACKAGE_DESCRIPTION,
                counts: {
                  word_count: "Total detected word tokens.",
                  unique_word_count: "Unique normalized word tokens.",
                  sentence_count: "Detected sentence-like units.",
                  paragraph_count: "Paragraph or block count after markdown-aware splitting.",
                  heading_count: "ATX or Setext markdown heading count.",
                  list_item_count: "Markdown-style ordered or unordered list item count.",
                  character_count: "Total characters including whitespace.",
                  character_count_no_spaces: "Total characters excluding whitespace.",
                  letter_count: "Alphabetic characters only.",
                  syllable_count: "Estimated English syllable count.",
                  polysyllable_count: "Words with 3 or more syllables.",
                  complex_word_count:
                    "Alias of deterministic 3+ syllable words used by readability formulas.",
                  difficult_word_count: "Words outside the Dale-Chall easy-word list.",
                  long_word_count: "Words with 6 or more alphanumeric characters.",
                  reading_time_minutes: "Estimated reading time at 225 words per minute.",
                },
                sentence_metrics: {
                  avg_words_per_sentence: "Average sentence length in words.",
                  median_words_per_sentence: "Median sentence length in words.",
                  max_words_per_sentence: "Longest sentence length in words.",
                  sentence_length_p90: "90th percentile sentence length.",
                  sentence_length_p95: "95th percentile sentence length.",
                  sentence_length_stddev: "Standard deviation of sentence lengths.",
                  percent_sentences_over_20_words:
                    "Share of sentences longer than 20 words, expressed as 0-1.",
                  percent_sentences_over_25_words:
                    "Share of sentences longer than 25 words, expressed as 0-1.",
                  percent_sentences_over_30_words:
                    "Share of sentences longer than 30 words, expressed as 0-1.",
                  percent_sentences_over_40_words:
                    "Share of sentences longer than 40 words, expressed as 0-1.",
                },
                paragraph_metrics: {
                  avg_words_per_paragraph: "Average paragraph length in words.",
                  median_words_per_paragraph: "Median paragraph length in words.",
                  max_words_per_paragraph: "Longest paragraph length in words.",
                  paragraph_length_p90: "90th percentile paragraph length.",
                  percent_paragraphs_over_75_words:
                    "Share of paragraphs longer than 75 words, expressed as 0-1.",
                  percent_paragraphs_over_100_words:
                    "Share of paragraphs longer than 100 words, expressed as 0-1.",
                  percent_paragraphs_over_150_words:
                    "Share of paragraphs longer than 150 words, expressed as 0-1.",
                },
                lexical_metrics: {
                  lexical_diversity_ttr: "Type-token ratio: unique words divided by total words.",
                  lexical_diversity_mattr: "Moving Average Type-Token Ratio (windowed variety).",
                  lexical_density:
                    "Share of content words after removing a lightweight stopword list.",
                  repetition_ratio:
                    "Repeated token share, measured as repeated occurrences beyond the first mention divided by total words.",
                  avg_characters_per_word:
                    "Average alphanumeric characters per detected word token. This is a first-class supported metric.",
                  avg_syllables_per_word: "Average syllables per detected word token.",
                  long_word_ratio: "Share of words with 6 or more alphanumeric characters.",
                  complex_word_ratio: "Share of words with 3 or more syllables.",
                  difficult_word_ratio: "Share of words outside the Dale-Chall easy-word list.",
                },
                fiction_metrics: {
                  dialogue_ratio: "Share of sentences containing dialogue markers.",
                  avg_dialogue_run_length: "Estimated average length of dialogue exchanges.",
                  narration_vs_dialogue_balance: "Categorical balance of narrative vs dialogue.",
                  scene_density_proxy: "Estimated narrative movement and immediacy.",
                  exposition_density_proxy: "Estimated background information density.",
                  sensory_term_density: "Share of words from a deterministic sensory lexicon.",
                  abstract_word_ratio: "Share of words from a deterministic abstract lexicon.",
                  paragraph_cadence_variation:
                    "Variety in paragraph lengths (sentence rhythm proxy).",
                },
                exclusions: {
                  perplexity:
                    "Intentionally omitted. Perplexity is model-dependent, not a traditional readability metric, and would violate this package's deterministic local-first scope.",
                },
              },
              null,
              2
            ),
          },
        ],
      })
    );

    this.server.registerResource(
      "formulas-catalog",
      "formulas://catalog",
      {
        description:
          "Catalog of implemented readability formulas, assumptions, and interpretation notes.",
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                flesch_reading_ease: {
                  name: "Flesch Reading Ease",
                  formula: "206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)",
                  interpretation: "Higher scores are easier to read.",
                },
                flesch_kincaid_grade_level: {
                  name: "Flesch-Kincaid Grade Level",
                  formula: "0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59",
                  interpretation: "Approximate US grade level.",
                },
                gunning_fog: {
                  name: "Gunning Fog",
                  formula: "0.4 * ((words / sentences) + 100 * (complex_words / words))",
                  interpretation: "Approximate US grade level.",
                },
                smog: {
                  name: "SMOG",
                  formula: "1.0430 * sqrt(polysyllables * (30 / sentences)) + 3.1291",
                  interpretation: "Approximate US grade level. Best with 3 or more sentences.",
                },
                coleman_liau: {
                  name: "Coleman-Liau",
                  formula: "0.0588 * L - 0.296 * S - 15.8",
                  interpretation: "Uses character counts instead of syllables.",
                },
                automated_readability_index: {
                  name: "Automated Readability Index",
                  formula: "4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43",
                  interpretation: "Uses average characters per word and sentence length.",
                },
                dale_chall: {
                  name: "Dale-Chall",
                  formula:
                    "0.1579 * difficult_word_percentage + 0.0496 * (words / sentences) [+ 3.6365 if difficult_word_percentage > 5]",
                  interpretation: "Uses a familiar-word list rather than syllable counts alone.",
                },
                linsear_write: {
                  name: "Linsear Write",
                  formula: "Normalized ((easy_words + 3 * hard_words) / sentences)",
                  interpretation:
                    "Deterministic whole-text variant suitable for arbitrary local inputs, including short passages.",
                },
                type_token_ratio: {
                  name: "Type-Token Ratio",
                  formula: "unique_words / total_words",
                  interpretation: "Vocabulary variety indicator rather than a readability grade.",
                },
                consensus_grade: {
                  interpretation:
                    "Average of applicable grade-oriented formulas. Dale-Chall is treated as a numeric difficulty signal in that consensus.",
                },
                readability_band: {
                  interpretation: "Human-readable band derived from the consensus grade.",
                },
              },
              null,
              2
            ),
          },
        ],
      })
    );

    this.server.registerResource(
      "editorial-guardrails",
      "usage://editorial_guardrails",
      {
        description:
          "Server-level instructions for preserving voice, facts, and intentional style during revision workflows.",
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                principle:
                  "Use PublishReady as a deterministic editorial diagnostic system, not as a command to sand down all distinctive wording.",
                guardrails: [
                  "Preserve facts, claims, named entities, dates, numbers, citations, and technical terminology unless the user explicitly asks for substantive rewriting.",
                  "Treat flagged words, formulas, and lever suggestions as diagnostic evidence, not mandatory replacements.",
                  "Preserve intentional voice, rhythm, and domain-specific language when they are serving the text well.",
                  "Prefer surgical edits over broad rewrites when only a few localized hotspots are causing the score drag.",
                  "Use compare_text_versions after revision to verify improvement without integrity loss.",
                  "If a cleaner metric profile would obviously erase tone or nuance, explain the tradeoff instead of forcing compliance.",
                ],
                default_workflow: [
                  "analyze_text",
                  "suggest_revision_levers",
                  "find_hotspots",
                  "compare_text_versions",
                ],
              },
              null,
              2
            ),
          },
        ],
      })
    );

    this.server.registerResource(
      "targets-schema",
      "schemas://targets",
      {
        description: "JSON Schema reference for supported target constraints.",
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              zodToJsonSchema(TargetSchema, { name: "WritingMetricsTargets" }),
              null,
              2
            ),
          },
        ],
      })
    );

    this.server.registerResource(
      "templates-catalog",
      "templates://catalog",
      {
        description: "List of all built-in writing templates (nonfiction and fiction).",
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(BUILTIN_TEMPLATES, null, 2),
          },
        ],
      })
    );

    this.server.registerResource(
      "template-detail",
      new ResourceTemplate("templates://{template_id}", { list: undefined }),
      {
        description: "Detailed numeric targets and metadata for a specific template.",
      },
      async (uri, { template_id }) => {
        const template = BUILTIN_TEMPLATES.find((t) => t.id === template_id);
        if (!template) {
          throw new Error(`Template not found: ${template_id}`);
        }
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify(template, null, 2),
            },
          ],
        };
      }
    );

    this.server.registerResource(
      "metric-signals",
      "signals://metric_interpretations",
      {
        description: "Guidance on how to interpret high/low values for key writing metrics.",
      },
      async (uri) => {
        const { METRIC_SIGNALS } = await import("@veldica/publishready-core");
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify(METRIC_SIGNALS, null, 2),
            },
          ],
        };
      }
    );

    this.server.registerResource(
      "profiles-schema",
      "profiles://reference_schema",
      {
        description: "Schema definition for writing profiles and fingerprints.",
      },
      async (uri) => {
        const { WritingProfileSchema } = await import("@veldica/publishready-schemas");
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify(
                zodToJsonSchema(WritingProfileSchema, { name: "WritingProfile" }),
                null,
                2
              ),
            },
          ],
        };
      }
    );

    this.server.registerResource(
      "targets-meaning",
      "targets://meaning_reference",
      {
        description: "Human-readable reference for what specific numeric targets imply.",
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                sentence_length: {
                  at_most_15: "Fast-paced, punchy, suitable for mobile or general public.",
                  at_most_20: "Standard professional prose.",
                  over_25: "Formal, academic, or literary; higher cognitive load.",
                },
                difficult_word_ratio: {
                  at_most_0_05: "Highly accessible, plain English.",
                  at_most_0_10: "Standard professional audience.",
                  over_0_15: "Expert, specialized, or academic audience.",
                },
                avg_characters_per_word: {
                  at_most_4_3: "Very simple word shape; useful for broad public access.",
                  at_most_5_2: "Standard professional readability.",
                  over_5_5: "Technical, academic, or jargon-heavy word shape.",
                },
                lexical_diversity_mattr: {
                  at_least_0_50: "Adequate local vocabulary variety.",
                  at_least_0_70:
                    "Rich local vocabulary variety; common in polished essays or fiction.",
                },
                paragraph_scannability_score: {
                  at_least_70: "Readable digital structure.",
                  at_least_85: "Highly skimmable landing-page or support style.",
                },
                dialogue_ratio: {
                  over_0_30: "Balanced narrative/dialogue scene.",
                  over_0_60: "Dialogue-driven scene; high immediacy.",
                },
                scene_density_proxy: {
                  over_0_50: "Active, immediate scene pacing.",
                  under_0_30: "Static, reflective, or exposition-heavy passage.",
                },
              },
              null,
              2
            ),
          },
        ],
      })
    );

    this.server.registerResource(
      "tool-decision-tree",
      "usage://tool_decision_tree",
      {
        description: "Guidance on which tools to use for specific user goals.",
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                user_wants_general_feedback: ["analyze_text"],
                user_wants_revision: [
                  "analyze_text",
                  "suggest_revision_levers",
                  "compare_text_versions",
                ],
                user_wants_style_match: [
                  "build_reference_profile",
                  "compare_to_reference",
                  "compare_text_versions",
                ],
                user_wants_template_fit: [
                  "list_templates",
                  "get_template",
                  "analyze_against_template",
                ],
                user_wants_specific_problem_sentences: ["find_hotspots"],
                user_wants_fact_preservation_check: ["compare_text_versions"],
                user_wants_ai_sounding_prose_audit: [
                  "audit_ai_sounding_prose",
                  "find_hotspots",
                  "compare_text_versions",
                ],
              },
              null,
              2
            ),
          },
        ],
      })
    );

    this.server.registerResource(
      "quality-gates",
      "usage://quality_gates",
      {
        description: "Recommended quality thresholds for accepting a revised draft.",
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                revision_acceptance: {
                  "content_integrity.integrity_score": ">= 85 preferred",
                  "content_integrity.polarity_shift_count": "must be 0",
                  anchor_recall: ">= 0.85 preferred",
                  movement: "should be toward_goal when a goal exists",
                },
                warning:
                  "Do not treat lower grade level as success if factual anchors were dropped.",
              },
              null,
              2
            ),
          },
        ],
      })
    );

    this.server.registerResource(
      "revision-workflows",
      "usage://revision_workflows",
      {
        description: "Step-by-step recipes for common writing revision tasks.",
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                safe_revision: [
                  "analyze_text",
                  "suggest_revision_levers",
                  "revise",
                  "compare_text_versions",
                  "apply quality gate",
                ],
                template_revision: [
                  "get_template",
                  "analyze_against_template",
                  "revise",
                  "compare_text_versions",
                ],
                reference_match: [
                  "build_reference_profile",
                  "compare_to_reference",
                  "revise",
                  "compare_text_versions",
                ],
              },
              null,
              2
            ),
          },
        ],
      })
    );
  }

  private setupTools() {
    this.server.registerTool(
      "analyze_text",
      {
        title: "Analyze Text",
        description:
          "Return a deterministic writing analysis. MUST be used as the first step in most revision workflows to establish a baseline. After analysis, call suggest_revision_levers for optimization advice.",
        inputSchema: AnalyzeTextArguments,
        outputSchema: PublicAnalysisResultSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("analyze_text", () => handleAnalyzeText(AnalyzeTextArguments.parse(args)))
    );

    this.server.registerTool(
      "analyze_against_targets",
      {
        title: "Analyze Against Targets",
        description:
          "Check text against an explicit target profile. Use this before rewriting. After producing a revision, call compare_text_versions with the same targets to verify movement.",
        inputSchema: AnalyzeAgainstTargetsArguments,
        outputSchema: PublicAnalysisResultSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("analyze_against_targets", () =>
          handleAnalyzeAgainstTargets(AnalyzeAgainstTargetsArguments.parse(args))
        )
    );

    this.server.registerTool(
      "audit_ai_sounding_prose",
      {
        title: "Audit AI-Sounding Prose",
        description:
          "Run the Veldica AI marker inventory directly. Returns marker density, weighted score, style band, categories, exact matches, tracked phrases, and supporting writing metrics. Use this when text feels generic, over-polished, formulaic, or AI-like.",
        inputSchema: AuditAISoundingProseArguments,
        outputSchema: PublicAnalysisResultSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("audit_ai_sounding_prose", () =>
          handleAuditAISoundingProse(AuditAISoundingProseArguments.parse(args))
        )
    );

    this.server.registerTool(
      "suggest_revision_levers",
      {
        title: "Suggest Revision Levers",
        description:
          "Rank deterministic revision levers. Use this before rewriting to identify high-impact changes. After revision, MUST call compare_text_versions to verify style improved without factual loss.",
        inputSchema: SuggestRevisionLeversArguments,
        outputSchema: PublicAnalysisResultSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("suggest_revision_levers", () =>
          handleSuggestRevisionLevers(SuggestRevisionLeversArguments.parse(args))
        )
    );

    this.server.registerTool(
      "analyze_against_template",
      {
        title: "Analyze Against Template",
        description:
          "Check text against a built-in template. Use this before revising. After revision, call compare_text_versions with the same template_id to verify alignment.",
        inputSchema: AnalyzeAgainstTemplateArguments,
        outputSchema: PublicAnalysisResultSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("analyze_against_template", () =>
          handleAnalyzeAgainstTemplate(AnalyzeAgainstTemplateArguments.parse(args))
        )
    );

    this.server.registerTool(
      "list_templates",
      {
        title: "List Templates",
        description: "Return a list of available writing templates with their metadata.",
        inputSchema: ListTemplatesArguments,
        outputSchema: ListTemplatesOutputSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("list_templates", () =>
          handleListTemplates(ListTemplatesArguments.parse(args))
        )
    );

    this.server.registerTool(
      "get_template",
      {
        title: "Get Template",
        description:
          "Return the full details of a specific template including its numeric targets.",
        inputSchema: GetTemplateArguments,
        outputSchema: GetTemplateOutputSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("get_template", () => handleGetTemplate(GetTemplateArguments.parse(args)))
    );

    this.server.registerTool(
      "interpret_targets",
      {
        title: "Interpret Targets",
        description:
          "Explain the human implications, likely audience, and tradeoffs of a set of numeric targets.",
        inputSchema: InterpretTargetsArguments,
        outputSchema: InterpretTargetsOutputSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("interpret_targets", () =>
          handleInterpretTargets(InterpretTargetsArguments.parse(args))
        )
    );

    this.server.registerTool(
      "summarize_writing_profile",
      {
        title: "Summarize Writing Profile",
        description: "Generate a fingerprint profile from a text sample.",
        inputSchema: SummarizeWritingProfileArguments,
        outputSchema: WritingProfileSummaryOutputSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("summarize_writing_profile", () =>
          handleSummarizeWritingProfile(SummarizeWritingProfileArguments.parse(args))
        )
    );

    this.server.registerTool(
      "build_reference_profile",
      {
        title: "Build Reference Profile",
        description:
          "Generate a Fingerprint Profile from one or more high-quality reference texts.",
        inputSchema: BuildReferenceProfileArguments,
        outputSchema: BuildReferenceProfileOutputSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("build_reference_profile", () =>
          handleBuildReferenceProfile(BuildReferenceProfileArguments.parse(args))
        )
    );

    this.server.registerTool(
      "compare_to_reference",
      {
        title: "Compare to Reference",
        description: "Compare current text against a specific Fingerprint Profile.",
        inputSchema: CompareToReferenceInputShape,
        outputSchema: CompareToReferenceOutputSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("compare_to_reference", () =>
          handleCompareToReference(CompareToReferenceArguments.parse(args))
        )
    );

    this.server.registerTool(
      "compare_profiles",
      {
        title: "Compare Profiles",
        description: "Compare two writing profiles, explicit target profiles, or templates.",
        inputSchema: CompareProfilesArguments,
        outputSchema: CompareProfilesOutputSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("compare_profiles", () =>
          handleCompareProfiles(CompareProfilesArguments.parse(args))
        )
    );

    this.server.registerTool(
      "find_reference_drift",
      {
        title: "Find Reference Drift",
        description:
          "Detect if current writing samples are drifting away from a reference profile.",
        inputSchema: FindReferenceDriftInputShape,
        outputSchema: FindReferenceDriftOutputSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("find_reference_drift", () =>
          handleFindReferenceDrift(FindReferenceDriftArguments.parse(args))
        )
    );

    this.server.registerTool(
      "compare_text_versions",
      {
        title: "Compare Text Versions",
        description:
          "Compare original and revised drafts. MUST be called after any revision to verify mechanical improvement and factual integrity. It returns a 'quality_gate' which acts as a final decision object.",
        inputSchema: CompareTextVersionsArguments,
        outputSchema: CompareTextVersionsOutputSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("compare_text_versions", () =>
          handleCompareTextVersions(CompareTextVersionsArguments.parse(args))
        )
    );

    this.server.registerTool(
      "find_hotspots",
      {
        title: "Find Hotspots",
        description:
          "Locate specific sentences or paragraphs for surgical revision. Each hotspot includes a 'hotspot_id' and 'revision_instruction'. After editing, MUST call compare_text_versions to verify the fix.",
        inputSchema: FindHotspotsArguments,
        outputSchema: PublicAnalysisResultSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("find_hotspots", () =>
          handleFindHotspots(FindHotspotsArguments.parse(args))
        )
    );

    this.server.registerTool(
      "plan_revision_workflow",
      {
        title: "Plan Revision Workflow",
        description:
          "Generate a step-by-step tool-call sequence for a specific revision task (e.g., fact-preserving revision, template alignment). Use this when you are unsure which tool to call next.",
        inputSchema: PlanRevisionWorkflowArguments,
        outputSchema: PlanRevisionWorkflowOutputSchema,
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args) =>
        this.executeTool("plan_revision_workflow", () =>
          handlePlanRevisionWorkflow(PlanRevisionWorkflowArguments.parse(args))
        )
    );
  }

  private setupPrompts() {
    this.server.registerPrompt(
      REVISE_PROSE_PROMPT.name,
      {
        description: REVISE_PROSE_PROMPT.description,
        argsSchema: REVISE_PROSE_PROMPT.argsSchema,
      },
      async (args) => {
        const text = (args.text as string) || "";
        const goals = (args.goals as string) || "general professional clarity";

        return {
          description: "Revision workflow using deterministic writing metrics",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I have a draft that needs a metrics-guided revision plan toward these goals: ${goals}.\n\nPlease follow this deterministic workflow:\n1. Use 'analyze_text' to get the current baseline metrics for this draft.\n2. Identify the top 3-5 revision levers that will have the most impact on the stated goals.\n3. Produce a concise revision plan tied to those mechanical signals. Do not invent model-dependent scores or use perplexity.\n4. If you provide a revised draft, preserve the author's meaning and then verify the change with 'compare_text_versions'.\n\nDraft:\n${text}`,
              },
            },
          ],
        };
      }
    );

    this.server.registerPrompt(
      CHECK_COMPLIANCE_PROMPT.name,
      {
        description: CHECK_COMPLIANCE_PROMPT.description,
        argsSchema: CHECK_COMPLIANCE_PROMPT.argsSchema,
      },
      async (args) => {
        const text = (args.text as string) || "";
        const targets = (args.targets_json as string) || "{}";

        return {
          description: "Target compliance check workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please evaluate this text against the following numeric targets: ${targets}.\n\nUse the 'analyze_against_targets' tool to perform a deterministic check. Report all violations, explain their severity, and suggest the most effective revision levers to bring the text into compliance.\n\nDraft:\n${text}`,
              },
            },
          ],
        };
      }
    );

    this.server.registerPrompt(
      REVISE_WITHOUT_LOSING_FACTS_PROMPT.name,
      {
        description: REVISE_WITHOUT_LOSING_FACTS_PROMPT.description,
        argsSchema: REVISE_WITHOUT_LOSING_FACTS_PROMPT.argsSchema,
      },
      async (args) => {
        const text = (args.text as string) || "";
        const goals = (args.goals as string) || "clarity and professional tone";

        return {
          description: "Fact-preserving style revision workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I need to improve the style of this text toward these goals: ${goals}, but it is CRITICAL that no factual anchors, proper nouns, or core meanings are lost or distorted.\n\nWorkflow:\n1. Run 'analyze_text' to get baseline metrics.\n2. Run 'suggest_revision_levers' to identify stylistic drags.\n3. Revise the text only where metrics suggest improvement is needed.\n4. Run 'compare_text_versions' on the original and your revision.\n5. REJECT your own revision if 'integrity_score' is low (< 85) or if 'polarity_shift_count' > 0. Factual accuracy is more important than a lower grade level.\n6. Present the final revision along with a note on preserved anchors.\n\nDraft:\n${text}`,
              },
            },
          ],
        };
      }
    );

    this.server.registerPrompt(
      MATCH_REFERENCE_STYLE_PROMPT.name,
      {
        description: MATCH_REFERENCE_STYLE_PROMPT.description,
        argsSchema: MATCH_REFERENCE_STYLE_PROMPT.argsSchema,
      },
      async (args) => {
        const draft = (args.draft as string) || "";
        const reference = (args.reference as string) || "";

        return {
          description: "Reference style matching workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I want to revise a draft to match the stylistic fingerprint of a reference text.\n\nWorkflow:\n1. Run 'build_reference_profile' on the reference text.\n2. Run 'compare_to_reference' on the draft using the reference_profile object returned by build_reference_profile.\n3. Identify which mechanical traits (sentence length, word complexity, etc.) differ most from the reference.\n4. Revise the draft to pull its metrics closer to the reference fingerprint.\n5. Run 'compare_text_versions' (using the reference profile) to verify movement toward the goal.\n\nReference Text:\n${reference}\n\nDraft:\n${draft}`,
              },
            },
          ],
        };
      }
    );

    this.server.registerPrompt(
      REVISE_TO_TEMPLATE_PROMPT.name,
      {
        description: REVISE_TO_TEMPLATE_PROMPT.description,
        argsSchema: REVISE_TO_TEMPLATE_PROMPT.argsSchema,
      },
      async (args) => {
        const text = (args.text as string) || "";
        const template_id = (args.template_id as string) || "";

        return {
          description: "Template-based revision workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I need to revise this text to comply with the '${template_id}' writing template.\n\nWorkflow:\n1. Run 'get_template' for '${template_id}' to see the target numeric ranges.\n2. Run 'analyze_against_template' on the text to find violations.\n3. Apply the suggested revision levers to bring the text into the template's 'success' zones.\n4. Verify the final result with another 'analyze_against_template' call.\n\nDraft:\n${text}`,
              },
            },
          ],
        };
      }
    );

    this.server.registerPrompt(
      FIND_AND_FIX_HOTSPOTS_PROMPT.name,
      {
        description: FIND_AND_FIX_HOTSPOTS_PROMPT.description,
        argsSchema: FIND_AND_FIX_HOTSPOTS_PROMPT.argsSchema,
      },
      async (args) => {
        const text = (args.text as string) || "";

        return {
          description: "Surgical hotspot correction workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I want to find and fix specific sentences or paragraphs that are dragging down the readability of this text.\n\nWorkflow:\n1. Run 'find_hotspots' to identify the highest-risk segments.\n2. For each hotspot, identify the specific cause (e.g., long sentence tail, wall of text).\n3. Apply surgical edits to ONLY those hotspots.\n4. Run 'find_hotspots' again to verify that the high-risk segments have been neutralized.\n\nDraft:\n${text}`,
              },
            },
          ],
        };
      }
    );

    this.server.registerPrompt(
      COMPARE_REVISION_QUALITY_PROMPT.name,
      {
        description: COMPARE_REVISION_QUALITY_PROMPT.description,
        argsSchema: COMPARE_REVISION_QUALITY_PROMPT.argsSchema,
      },
      async (args) => {
        const original = (args.original as string) || "";
        const revised = (args.revised as string) || "";

        return {
          description: "Deep revision audit workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please perform a deep audit of the changes between this original draft and the revised version.\n\nWorkflow:\n1. Run 'compare_text_versions' to get the delta report.\n2. Evaluate the 'content_integrity' and 'anchor_recall' scores.\n3. Analyze the 'movement' toward goal—did the revision actually improve the intended traits?\n4. Identify any accidental regressions (e.g., an 'improvement' in grade level that caused a 'regression' in scannability).\n\nOriginal:\n${original}\n\nRevised:\n${revised}`,
              },
            },
          ],
        };
      }
    );

    this.server.registerPrompt(
      BUILD_STYLE_PROFILE_PROMPT.name,
      {
        description: BUILD_STYLE_PROFILE_PROMPT.description,
        argsSchema: BUILD_STYLE_PROFILE_PROMPT.argsSchema,
      },
      async (args) => {
        const texts = (args.texts as string[]) || [];

        return {
          description: "Style fingerprint creation workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I want to create a reusable stylistic profile from these high-quality reference samples.\n\nWorkflow:\n1. Run 'build_reference_profile' on the provided texts.\n2. Review the resulting profile to understand the 'lexical_diversity', 'sentence_length_stddev', and other fingerprint traits.\n3. Use the 'summarize_writing_profile' tool on each individual text if you need to see how they differ from the aggregate.\n4. Save the final reference_profile object for use in future 'match_reference_style' tasks.\n\nReference Samples:\n${texts.join("\n---\n")}`,
              },
            },
          ],
        };
      }
    );

    this.server.registerPrompt(
      AUDIT_AI_SOUNDING_PROSE_PROMPT.name,
      {
        description: AUDIT_AI_SOUNDING_PROSE_PROMPT.description,
        argsSchema: AUDIT_AI_SOUNDING_PROSE_PROMPT.argsSchema,
      },
      async (args) => {
        const text = (args.text as string) || "";

        return {
          description: "AI pattern detection and humanization workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Audit this text for patterns commonly associated with AI-generated prose (e.g., low variance in sentence length, repetitive transition words, lack of specific scannability cues).\n\nWorkflow:\n1. Run 'analyze_text' and look at 'sentence_length_stddev' and 'lexical_diversity'. Low variance often feels 'robotic'.\n2. Run 'suggest_revision_levers' and look for 'vary_sentence_lengths' or 'increase_lexical_diversity'.\n3. Run 'find_hotspots' to see if there are 'walls of text' that lack human-friendly breaks.\n4. Suggest specific humanizing revisions that introduce rhythmic variety and more precise vocabulary.\n\nDraft:\n${text}`,
              },
            },
          ],
        };
      }
    );

    this.server.registerPrompt(
      FICTION_PACING_REVIEW_PROMPT.name,
      {
        description: FICTION_PACING_REVIEW_PROMPT.description,
        argsSchema: FICTION_PACING_REVIEW_PROMPT.argsSchema,
      },
      async (args) => {
        const text = (args.text as string) || "";

        return {
          description: "Narrative pacing and balance workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I need a narrative pacing review of this fiction scene.\n\nWorkflow:\n1. Run 'analyze_text' and focus on the 'fiction_metrics' section.\n2. Evaluate the 'dialogue_ratio' and 'narration_vs_dialogue_balance'.\n3. Check 'scene_density_proxy' (pacing immediacy) and 'exposition_density_proxy' (info-dumping risk).\n4. Look at 'paragraph_cadence_variation'—is the rhythm too static for an action scene or too frantic for a reflective one?\n5. Suggest specific pacing adjustments based on these narrative signals.\n\nScene:\n${text}`,
              },
            },
          ],
        };
      }
    );

    this.server.registerPrompt(
      LANDING_PAGE_COPY_REVIEW_PROMPT.name,
      {
        description: LANDING_PAGE_COPY_REVIEW_PROMPT.description,
        argsSchema: LANDING_PAGE_COPY_REVIEW_PROMPT.argsSchema,
      },
      async (args) => {
        const text = (args.text as string) || "";

        return {
          description: "Marketing copy scannability workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Review this landing page copy for impact and skimmability.\n\nWorkflow:\n1. Run 'analyze_text' and focus on 'scannability_metrics'.\n2. Check the 'paragraph_scannability_score'. For landing pages, this should ideally be > 80.\n3. Look at 'words_between_breaks' and 'wall_of_text_risk'.\n4. Run 'find_hotspots' to see if any paragraph is too dense for a quick skim.\n5. Suggest revisions to improve visual hierarchy and punchiness.\n\nCopy:\n${text}`,
              },
            },
          ],
        };
      }
    );

    this.server.registerPrompt(
      TECHNICAL_DOCS_REVIEW_PROMPT.name,
      {
        description: TECHNICAL_DOCS_REVIEW_PROMPT.description,
        argsSchema: TECHNICAL_DOCS_REVIEW_PROMPT.argsSchema,
      },
      async (args) => {
        const text = (args.text as string) || "";

        return {
          description: "Technical documentation clarity workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Audit this technical document for clarity and accessibility.\n\nWorkflow:\n1. Run 'analyze_against_template' using the 'technical_docs' template ID.\n2. Pay close attention to 'difficult_word_ratio' and 'avg_words_per_sentence'. Technical docs should minimize jargon and complexity.\n3. Check 'heading_density' to ensure the document is well-structured.\n4. Use 'interpret_targets' if you need to explain to the user why a specific grade level is recommended for technical docs.\n\nDocument:\n${text}`,
              },
            },
          ],
        };
      }
    );
  }

  private async executeTool(
    toolName: string,
    handler: () => Promise<{
      content: { type: "text"; text: string }[];
      structuredContent?: Record<string, unknown>;
      isError?: boolean;
    }>
  ) {
    try {
      return await handler();
    } catch (error) {
      logger.error(`Error in ${toolName}:`, error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run(transport: Transport) {
    await this.server.connect(transport);
  }

  async close() {
    await this.server.close();
  }
}
