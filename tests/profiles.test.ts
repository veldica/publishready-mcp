import { describe, it, expect } from "vitest";
import { handleBuildReferenceProfile } from "../packages/mcp/src/tools/buildReferenceProfile.js";
import { handleCompareToReference } from "../packages/mcp/src/tools/compareToReference.js";
import { handleCompareProfiles } from "../packages/mcp/src/tools/compareProfiles.js";
import { handleFindReferenceDrift } from "../packages/mcp/src/tools/findReferenceDrift.js";
import {
  BuildReferenceProfileOutputSchema,
  CompareProfilesOutputSchema,
  CompareToReferenceOutputSchema,
  FindReferenceDriftOutputSchema,
} from "@veldica/publishready-schemas";

describe("Profile Tools", () => {
  it("should build a reference profile", async () => {
    const texts = [
      "This is the first reference text. It has some sentences.",
      "This is the second reference text. It is also quite simple.",
    ];
    const result = await handleBuildReferenceProfile({ texts, profile_name: "test_profile" });
    const json = JSON.parse(result.content[0].text);
    expect(() => BuildReferenceProfileOutputSchema.parse(result.structuredContent)).not.toThrow();
    expect(json.name).toBe("test_profile");
    expect(json.counts.word_count).toBeGreaterThan(0);
    expect(json.lexical_metrics).toBeDefined();
  });

  it("builds deterministic reference profiles for identical inputs", async () => {
    const args = {
      texts: ["A crisp reference sentence. Another crisp line."],
      profile_name: "stable",
    };
    const first = await handleBuildReferenceProfile(args);
    const second = await handleBuildReferenceProfile(args);

    expect(first.structuredContent).toEqual(second.structuredContent);
    expect(first.structuredContent?.source_sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should compare text to a reference profile", async () => {
    const reference_text = "This is a reference text with specific style.";
    const candidate_text = "This is a candidate text that might match or drift.";

    // First build profile
    const profileResult = await handleBuildReferenceProfile({ texts: [reference_text] });
    const reference_profile = JSON.parse(profileResult.content[0].text);

    const result = await handleCompareToReference({
      reference_profile,
      candidate_text,
    });

    // index 1 contains the JSON
    const json = JSON.parse(result.content[1].text);
    expect(() => CompareToReferenceOutputSchema.parse(result.structuredContent)).not.toThrow();
    expect(json.alignment_score).toBeGreaterThan(0);
    expect(json.strongest_similarities).toBeDefined();
    expect(json.revision_levers).toBeDefined();
    expect(json.reference_targets).toBeDefined();
  });

  it("compares targets/templates and detects reference drift points", async () => {
    const comparison = await handleCompareProfiles({
      profile_a: "plain_english_general",
      profile_b: {
        sentence_metrics: {
          avg_words_per_sentence: { value: 12, operator: "at_most" },
        },
        lexical_metrics: {
          avg_characters_per_word: { value: 4.5, operator: "at_most" },
        },
      },
    });

    expect(() => CompareProfilesOutputSchema.parse(comparison.structuredContent)).not.toThrow();
    expect(comparison.structuredContent.alignment_score).toBeGreaterThanOrEqual(0);

    const drift = await handleFindReferenceDrift({
      reference_text: "Short clear sentences. Simple words help readers.",
      candidate_text:
        "This extraordinarily convoluted construction accumulates subordinate explanations and specialized terminology until readers lose the thread.",
    });

    expect(() => FindReferenceDriftOutputSchema.parse(drift.structuredContent)).not.toThrow();
    expect(drift.structuredContent.drift_detected).toBe(true);
  });
});
