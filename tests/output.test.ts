import { describe, expect, it } from "vitest";
import { PublicAnalysisResultSchema } from "@veldica/publishready-schemas";
import { handleAnalyzeAgainstTargets } from "../packages/mcp/src/tools/analyzeAgainstTargets.js";
import { handleAnalyzeText } from "../packages/mcp/src/tools/analyzeText.js";

function assertSnakeCaseKeys(value: unknown) {
  if (Array.isArray(value)) {
    value.forEach(assertSnakeCaseKeys);
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    expect(key).toMatch(/^[a-z0-9_]+$/);
    assertSnakeCaseKeys(nestedValue);
  }
}

describe("public tool output", () => {
  it("returns schema-valid structured content with snake_case keys and no perplexity field", async () => {
    const response = await handleAnalyzeText({
      text: "This is a simple sentence. This is another simple sentence.",
    });

    expect(response.structuredContent).toBeDefined();
    const parsed = PublicAnalysisResultSchema.parse(response.structuredContent);

    assertSnakeCaseKeys(parsed);
    expect(parsed.lexical_metrics).toHaveProperty("avg_characters_per_word");
    expect(JSON.stringify(parsed)).not.toContain("perplexity");
    expect(JSON.parse(response.content[1].text)).toEqual(parsed);
  });

  it("returns targets, ranked violations, and ranked revision levers in a stable order", async () => {
    const targets = {
      sentence_metrics: {
        avg_words_per_sentence: { value: 12, operator: "at_most" as const },
      },
      lexical_metrics: {
        complex_word_ratio: { value: 0.08, operator: "at_most" as const },
      },
    };
    const response = await handleAnalyzeAgainstTargets({
      text: "This is a very long sentence that keeps running and running and running until it becomes far longer than it should be for a clean readability target. This paragraph also keeps adding more detail and explanation without stopping, which means the text is difficult to scan and harder to process quickly.",
      targets,
    });

    const parsed = PublicAnalysisResultSchema.parse(response.structuredContent);
    expect(parsed.targets).toEqual(targets);
    expect(parsed.summary?.overall_pass).toBe(false);
    expect(parsed.violations.length).toBeGreaterThan(0);
    expect(parsed.violations[0].rank_score).toBeGreaterThanOrEqual(
      parsed.violations[1]?.rank_score || 0
    );
    expect(parsed.revision_levers[0].rank).toBe(1);
    expect(parsed.revision_levers[0].score).toBeGreaterThanOrEqual(
      parsed.revision_levers[1]?.score || 0
    );
    expect(parsed.formulas.every((formula) => "revision_levers" in formula)).toBe(true);
  });
});
