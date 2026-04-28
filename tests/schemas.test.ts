import { describe, expect, it } from "vitest";
import { PublicAnalysisResultSchema } from "@veldica/publishready-schemas";
import {
  AnalyzeAgainstTargetsArguments,
  AnalyzeTextArguments,
  CompareToReferenceArguments,
  FindReferenceDriftArguments,
  InterpretTargetsArguments,
  SuggestRevisionLeversArguments,
} from "@veldica/publishready-schemas";
import { TargetSchema } from "@veldica/publishready-schemas";
import { handleAnalyzeText } from "../packages/mcp/src/tools/analyzeText.js";

describe("schema validation", () => {
  it("accepts valid text analysis requests and preserves blank input", () => {
    const parsed = AnalyzeTextArguments.parse({ text: "   " });
    expect(parsed.text).toBe("   ");
  });

  it("rejects empty target sets, out-of-range ratios, and unknown target keys", () => {
    expect(AnalyzeAgainstTargetsArguments.safeParse({ text: "hello", targets: {} }).success).toBe(
      false
    );
    expect(
      TargetSchema.safeParse({
        sentence_metrics: {
          percent_sentences_over_20_words: { value: 1.5, operator: "at_most" },
        },
      }).success
    ).toBe(false);
    expect(
      TargetSchema.safeParse({
        made_up_metric: 1,
      }).success
    ).toBe(false);
    expect(
      TargetSchema.safeParse({
        formulas: {
          made_up_formula: { value: 10, operator: "at_most" },
        },
      }).success
    ).toBe(false);
  });

  it("accepts first-class target metrics and rejects missing reference inputs", () => {
    expect(
      AnalyzeAgainstTargetsArguments.safeParse({
        text: "hello",
        targets: {
          lexical_metrics: {
            avg_characters_per_word: { value: 5.2, operator: "at_most" },
            lexical_diversity_mattr: { value: 0.55, operator: "at_least" },
          },
          scannability_metrics: {
            paragraph_scannability_score: { value: 70, operator: "at_least" },
          },
        },
      }).success
    ).toBe(true);

    expect(
      AnalyzeAgainstTargetsArguments.safeParse({
        text: "hello",
        targets: { sentence_metrics: {} },
      }).success
    ).toBe(false);

    expect(CompareToReferenceArguments.safeParse({ candidate_text: "hello" }).success).toBe(false);
    expect(FindReferenceDriftArguments.safeParse({ candidate_text: "hello" }).success).toBe(false);
    expect(InterpretTargetsArguments.safeParse({ targets: {} }).success).toBe(false);
    expect(SuggestRevisionLeversArguments.safeParse({ text: "hello", targets: {} }).success).toBe(
      false
    );
  });

  it("validates the public output schema produced by analyze_text", async () => {
    const response = await handleAnalyzeText({ text: "A short sentence. Another one." });
    expect(() => PublicAnalysisResultSchema.parse(response.structuredContent)).not.toThrow();
  });
});
