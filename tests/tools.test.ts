import { describe, expect, it } from "vitest";
import { handleAnalyzeText } from "../packages/mcp/src/tools/analyzeText.js";
import { handleAuditAISoundingProse } from "../packages/mcp/src/tools/auditAISoundingProse.js";
import { handleAnalyzeAgainstTargets } from "../packages/mcp/src/tools/analyzeAgainstTargets.js";
import { handleAnalyzeAgainstTemplate } from "../packages/mcp/src/tools/analyzeAgainstTemplate.js";
import { handleSummarizeWritingProfile } from "../packages/mcp/src/tools/summarizeWritingProfile.js";
import { handleBuildReferenceProfile } from "../packages/mcp/src/tools/buildReferenceProfile.js";
import { handleCompareToReference } from "../packages/mcp/src/tools/compareToReference.js";
import { handleCompareTextVersions } from "../packages/mcp/src/tools/compareTextVersions.js";
import { handleFindHotspots } from "../packages/mcp/src/tools/findHotspots.js";
import { handleListTemplates } from "../packages/mcp/src/tools/listTemplates.js";
import { handleInterpretTargets } from "../packages/mcp/src/tools/interpretTargets.js";
import { handleSuggestRevisionLevers } from "../packages/mcp/src/tools/suggestRevisionLevers.js";
import { handleCompareProfiles } from "../packages/mcp/src/tools/compareProfiles.js";
import { handleFindReferenceDrift } from "../packages/mcp/src/tools/findReferenceDrift.js";
import {
  CompareTextVersionsOutputSchema,
  InterpretTargetsOutputSchema,
  ListTemplatesOutputSchema,
  WritingProfileSummaryOutputSchema,
} from "@veldica/publishready-schemas";
import { PublicAnalysisResultSchema } from "@veldica/publishready-schemas";

const SAMPLE_TEXT =
  "The quick brown fox jumps over the lazy dog. This is a simple test sentence for the MCP server.";
const REVISED_TEXT =
  "A fast brown fox leaped over a sleepy dog. It serves as a revised sample for testing.";

describe("MCP Tool Handlers", () => {
  it("analyze_text returns complete structural and lexical results", async () => {
    const result = await handleAnalyzeText({ text: SAMPLE_TEXT });
    const content = result.structuredContent!;
    expect(content.counts.word_count).toBeGreaterThan(10);
    expect(content.lexical_metrics.lexical_diversity_mattr).toBeDefined();
    expect(content.readability_band).toBeDefined();
  });

  it("audit_ai_sounding_prose exposes Veldica marker inventory", async () => {
    const result = await handleAuditAISoundingProse({
      text: "In today's fast-paced digital landscape, it is important to leverage robust solutions. This helps teams streamline workflows. This helps leaders unlock potential.",
      track_words: ["leverage"],
    });
    const content = result.structuredContent!;
    expect(() => PublicAnalysisResultSchema.parse(content)).not.toThrow();
    expect(content.metadata.requested_tool).toBe("audit_ai_sounding_prose");
    expect(content.ai_analysis?.marker_count).toBeGreaterThan(0);
    expect(content.ai_analysis?.matches.length).toBeGreaterThan(0);
    expect(content.word_tracking_metrics?.leverage).toBeGreaterThan(0);
  });

  it("analyze_against_targets returns violations and fit score", async () => {
    const result = await handleAnalyzeAgainstTargets({
      text: SAMPLE_TEXT,
      targets: {
        sentence_metrics: { avg_words_per_sentence: { value: 5, operator: "at_most" } },
      },
    });
    const content = result.structuredContent!;
    expect(content.violations.length).toBeGreaterThan(0);
    expect(content.fit?.score).toBeLessThan(100);
  });

  it("analyze_against_template works with builtin technical_docs", async () => {
    const result = await handleAnalyzeAgainstTemplate({
      text: SAMPLE_TEXT,
      template_id: "technical_docs",
    });
    const content = result.structuredContent!;
    expect(content.template_info?.id).toBe("technical_docs");
    expect(content.fit).toBeDefined();
  });

  it("summarize_writing_profile returns human-readable summary", async () => {
    const result = await handleSummarizeWritingProfile({ text: SAMPLE_TEXT });
    expect(() => WritingProfileSummaryOutputSchema.parse(result.structuredContent)).not.toThrow();
    const textContent = result.content[0] as { text: string };
    expect(textContent.text).toContain("Writing Profile Summary");
  });

  it("build_reference_profile aggregates multiple texts", async () => {
    const result = await handleBuildReferenceProfile({
      texts: [SAMPLE_TEXT, REVISED_TEXT],
      profile_name: "Test Profile",
    });
    const content = result.content[0] as { text: string };
    const profile = JSON.parse(content.text);
    expect(profile.name).toBe("Test Profile");
    expect(profile.counts.word_count).toBeGreaterThan(0);
  });

  it("compare_to_reference identifies alignment and differences", async () => {
    const result = await handleCompareToReference({
      candidate_text: REVISED_TEXT,
      reference_text: SAMPLE_TEXT,
    });
    const textContent = result.content[0] as { text: string };
    expect(textContent.text).toContain("alignment with reference");
  });

  it("compare_text_versions detects improvement trends", async () => {
    const result = await handleCompareTextVersions({
      original_text: SAMPLE_TEXT,
      revised_text: REVISED_TEXT,
      template_id: "plain_english_general",
      targets: {
        lexical_metrics: {
          avg_characters_per_word: { value: 5, operator: "at_most" },
        },
      },
      reference_text: SAMPLE_TEXT,
    });
    expect(() => CompareTextVersionsOutputSchema.parse(result.structuredContent)).not.toThrow();
    const textContent = result.content[0] as { text: string };
    expect(textContent.text).toContain("Version Comparison");
  });

  it("find_hotspots identifies problematic sentences", async () => {
    const longText =
      "This is a very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long sentence that should definitely be a hotspot. This is fine.";
    const result = await handleFindHotspots({
      text: longText,
      template_id: "plain_english_general",
    });
    const content = result.structuredContent!;
    expect(content.details.hotspots?.length).toBeGreaterThan(0);
    expect(content.details.hotspots![0].reason).toContain("length");
    expect(content.revision_levers.length).toBeGreaterThan(0);
    expect(content.template_info?.id).toBe("plain_english_general");
  });

  it("list_templates returns filtered catalog", async () => {
    const result = await handleListTemplates({ family: "fiction" });
    expect(() => ListTemplatesOutputSchema.parse(result.structuredContent)).not.toThrow();
    const content = JSON.parse((result.content[0] as { text: string }).text);
    expect(content.every((t: any) => t.family === "fiction")).toBe(true);
  });

  it("interpret_targets explains numeric constraints", async () => {
    const result = await handleInterpretTargets({
      targets: {
        sentence_metrics: { avg_words_per_sentence: { value: 10, operator: "at_most" } },
        lexical_metrics: { avg_characters_per_word: { value: 4.5, operator: "at_most" } },
      },
    });
    expect(() => InterpretTargetsOutputSchema.parse(result.structuredContent)).not.toThrow();
    const textContent = result.content[0] as { text: string };
    expect(textContent.text.toLowerCase()).toContain("human terms");
  });

  it("suggest_revision_levers, compare_profiles, and find_reference_drift smoke-test cleanly", async () => {
    const levers = await handleSuggestRevisionLevers({
      text: "This sentence is deliberately and unnecessarily elongated because it contains numerous additional clauses that make readability worse.",
      targets: {
        sentence_metrics: {
          avg_words_per_sentence: { value: 12, operator: "at_most" },
        },
      },
    });
    expect(() => PublicAnalysisResultSchema.parse(levers.structuredContent)).not.toThrow();
    expect(levers.structuredContent!.revision_levers.length).toBeGreaterThan(0);

    const profiles = await handleCompareProfiles({
      profile_a: "technical_docs",
      profile_b: "api_reference",
    });
    expect(profiles.structuredContent.alignment_score).toBeGreaterThanOrEqual(0);

    const drift = await handleFindReferenceDrift({
      reference_text: "Short clear sentences. Simple familiar words.",
      candidate_text:
        "This unnecessarily elaborate passage introduces specialized conceptual terminology and meandering syntactic structure.",
    });
    expect(drift.structuredContent.drift_detected).toBe(true);
    expect(drift.structuredContent.drift_points).toBeDefined();
  });

  it("rejects unknown templates instead of silently skipping template goals", async () => {
    await expect(
      handleFindHotspots({ text: SAMPLE_TEXT, template_id: "missing_template" })
    ).rejects.toThrow("Template not found");

    await expect(
      handleCompareTextVersions({
        original_text: SAMPLE_TEXT,
        revised_text: REVISED_TEXT,
        template_id: "missing_template",
      })
    ).rejects.toThrow("Template not found");
  });
});
