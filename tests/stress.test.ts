import { describe, expect, it } from "vitest";
import { analyzeStructure } from "../packages/core/src/index.js";
import { handleAnalyzeText } from "../packages/mcp/src/tools/analyzeText.js";
import { handleAnalyzeAgainstTargets } from "../packages/mcp/src/tools/analyzeAgainstTargets.js";
import { handleAnalyzeAgainstTemplate } from "../packages/mcp/src/tools/analyzeAgainstTemplate.js";
import { handleBuildReferenceProfile } from "../packages/mcp/src/tools/buildReferenceProfile.js";
import { handleCompareProfiles } from "../packages/mcp/src/tools/compareProfiles.js";
import { handleCompareTextVersions } from "../packages/mcp/src/tools/compareTextVersions.js";
import { handleCompareToReference } from "../packages/mcp/src/tools/compareToReference.js";
import { handleFindHotspots } from "../packages/mcp/src/tools/findHotspots.js";
import { handleFindReferenceDrift } from "../packages/mcp/src/tools/findReferenceDrift.js";
import { handleGetTemplate } from "../packages/mcp/src/tools/getTemplate.js";
import { handleInterpretTargets } from "../packages/mcp/src/tools/interpretTargets.js";
import { handleListTemplates } from "../packages/mcp/src/tools/listTemplates.js";
import { handlePlanRevisionWorkflow } from "../packages/mcp/src/tools/planRevisionWorkflow.js";
import { handleSuggestRevisionLevers } from "../packages/mcp/src/tools/suggestRevisionLevers.js";
import { handleSummarizeWritingProfile } from "../packages/mcp/src/tools/summarizeWritingProfile.js";
import {
  BuildReferenceProfileOutputSchema,
  CompareProfilesOutputSchema,
  CompareTextVersionsOutputSchema,
  CompareToReferenceOutputSchema,
  FindReferenceDriftOutputSchema,
  GetTemplateOutputSchema,
  InterpretTargetsOutputSchema,
  ListTemplatesOutputSchema,
  PlanRevisionWorkflowOutputSchema,
  PublicAnalysisResultSchema,
  WritingProfileSummaryOutputSchema,
} from "@veldica/publishready-schemas";

function assertFiniteNumbers(value: unknown, path = "result") {
  if (typeof value === "number") {
    expect(Number.isFinite(value), `${path} should be finite`).toBe(true);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFiniteNumbers(item, `${path}[${index}]`));
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    assertFiniteNumbers(nestedValue, `${path}.${key}`);
  }
}

describe("stress and claim coverage", () => {
  it("keeps blank and punctuation-only input zero-safe without NaN or Infinity", async () => {
    for (const text of ["", " \n\t ", "!!! ... ??? ---"]) {
      const response = await handleAnalyzeText({
        text,
        options: {
          include_formula_breakdown: true,
          include_paragraph_details: true,
          include_sentence_details: true,
        },
      });
      const parsed = PublicAnalysisResultSchema.parse(response.structuredContent);

      expect(parsed.counts.word_count).toBe(0);
      assertFiniteNumbers(parsed);
    }
  });

  it("is deterministic for a large mixed markdown workload", async () => {
    const paragraph =
      "This release note explains the migration path, lists concrete risks, and keeps the guidance local and deterministic.";
    const largeText = [
      "# Migration Notes",
      ...Array.from({ length: 600 }, (_, index) =>
        index % 7 === 0 ? `- Step ${index}: ${paragraph}` : `${paragraph} Sentence ${index}.`
      ),
      "## Verification",
      "Run the analyzer twice and compare the structured result.",
    ].join("\n\n");

    const first = await handleAnalyzeText({ text: largeText });
    const second = await handleAnalyzeText({ text: largeText });

    expect(first.structuredContent).toEqual(second.structuredContent);
    expect(first.structuredContent!.counts.word_count).toBeGreaterThan(5000);
    expect(first.structuredContent!.counts.heading_count).toBe(2);
    expect(first.structuredContent!.counts.list_item_count).toBeGreaterThan(80);
    assertFiniteNumbers(first.structuredContent);
  });

  it("returns schema-valid structured content for every advertised public tool", async () => {
    const sample =
      "Short clear guidance helps readers act. The draft names concrete steps and avoids needless ceremony.";
    const revised = "Clear guidance helps readers act. The draft names concrete steps.";
    const targets = {
      sentence_metrics: { avg_words_per_sentence: { value: 12, operator: "at_most" as const } },
    };
    const profile = (
      await handleBuildReferenceProfile({
        texts: ["Short sentences help. Concrete steps keep work moving."],
        profile_name: "Stress Reference",
      })
    ).structuredContent;

    const checks = [
      [PublicAnalysisResultSchema, (await handleAnalyzeText({ text: sample })).structuredContent],
      [
        PublicAnalysisResultSchema,
        (await handleAnalyzeAgainstTargets({ text: sample, targets })).structuredContent,
      ],
      [
        PublicAnalysisResultSchema,
        (await handleSuggestRevisionLevers({ text: sample, targets })).structuredContent,
      ],
      [
        PublicAnalysisResultSchema,
        (
          await handleAnalyzeAgainstTemplate({
            text: sample,
            template_id: "plain_english_general",
          })
        ).structuredContent,
      ],
      [ListTemplatesOutputSchema, (await handleListTemplates({})).structuredContent],
      [
        GetTemplateOutputSchema,
        (await handleGetTemplate({ template_id: "technical_docs" })).structuredContent,
      ],
      [InterpretTargetsOutputSchema, (await handleInterpretTargets({ targets })).structuredContent],
      [
        WritingProfileSummaryOutputSchema,
        (await handleSummarizeWritingProfile({ text: sample })).structuredContent,
      ],
      [BuildReferenceProfileOutputSchema, profile],
      [
        CompareToReferenceOutputSchema,
        (
          await handleCompareToReference({
            candidate_text: sample,
            reference_profile: profile,
          })
        ).structuredContent,
      ],
      [
        CompareProfilesOutputSchema,
        (
          await handleCompareProfiles({
            profile_a: "plain_english_general",
            profile_b: "technical_docs",
          })
        ).structuredContent,
      ],
      [
        FindReferenceDriftOutputSchema,
        (
          await handleFindReferenceDrift({
            candidate_text: sample,
            reference_profile: profile,
          })
        ).structuredContent,
      ],
      [
        CompareTextVersionsOutputSchema,
        (
          await handleCompareTextVersions({
            original_text: sample,
            revised_text: revised,
            targets,
            reference_profile: profile,
          })
        ).structuredContent,
      ],
      [
        PublicAnalysisResultSchema,
        (await handleFindHotspots({ text: sample, template_id: "plain_english_general" }))
          .structuredContent,
      ],
      [
        PlanRevisionWorkflowOutputSchema,
        (
          await handlePlanRevisionWorkflow({
            task: "reference_match",
            text: sample,
            reference_text: "Short sentences help. Concrete steps keep work moving.",
          })
        ).structuredContent,
      ],
    ] as const;

    for (const [schema, structuredContent] of checks) {
      expect(() => schema.parse(structuredContent)).not.toThrow();
      assertFiniteNumbers(structuredContent);
    }
  });

  it("tracks markdown blocks, lists, headings, and dialogue-heavy fiction signals together", () => {
    const text = `# Scene Plan

- Open in the kitchen
- Keep the exchange tense

"I heard the door," Mara said. "Did you lock it?"

"Twice." The lights flickered, and cold rain tapped the glass.

They crossed the room slowly.`;

    const result = analyzeStructure(text);

    expect(result.counts.heading_count).toBe(1);
    expect(result.counts.list_item_count).toBe(2);
    expect(result.fiction.dialogue_ratio).toBeGreaterThan(0);
    expect(result.fiction.sensory_term_density).toBeGreaterThan(0);
    assertFiniteNumbers(result);
  });

  it("keeps reference profiles stable for identical source samples", async () => {
    const texts = [
      "Simple product copy makes one promise. It gives the reader a next step.",
      "Simple support copy solves one problem. It gives the reader a clear path.",
    ];

    const first = await handleBuildReferenceProfile({ texts, profile_name: "Stable" });
    const second = await handleBuildReferenceProfile({ texts, profile_name: "Stable" });

    expect(first.structuredContent).toEqual(second.structuredContent);
    expect(first.structuredContent.source_count).toBe(2);
    expect(first.structuredContent.source_sha256).toMatch(/^[a-f0-9]{64}$/);
  });
});
