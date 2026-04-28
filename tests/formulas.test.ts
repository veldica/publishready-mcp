import { describe, expect, it } from "vitest";
import { analyzeStructure } from "../packages/core/src/index.js";
import { runAllFormulas } from "@veldica/readability";
import { applyTargetsToFormulas } from "../packages/core/src/index.js";

describe("formulas and lexical metrics", () => {
  it("keeps avg_characters_per_word accurate even with punctuation", () => {
    const stats = analyzeStructure("Hello, world!");
    expect(stats.lexical.avg_characters_per_word).toBe(5);
  });

  it("returns the expected formula catalog and preserves avg_characters_per_word in ARI inputs", () => {
    const stats = analyzeStructure("This is a simple sentence. It is easy to read.");
    const analysis = runAllFormulas(stats);

    expect(analysis.formulas).toHaveLength(9);
    expect(analysis.consensus_grade).toBeGreaterThan(0);
    expect(analysis.formulas.map((formula) => formula.metric)).toEqual([
      "flesch_reading_ease",
      "flesch_kincaid_grade_level",
      "gunning_fog",
      "smog",
      "coleman_liau",
      "automated_readability_index",
      "dale_chall",
      "linsear_write",
      "type_token_ratio",
    ]);

    const ari = analysis.formulas.find(
      (formula) => formula.metric === "automated_readability_index"
    );
    expect(ari?.inputs.avg_characters_per_word).toBe(stats.lexical.avg_characters_per_word);
  });

  it("marks SMOG as not applicable for fewer than three sentences", () => {
    const stats = analyzeStructure("Short text. Still short.");
    const analysis = runAllFormulas(stats);
    const smog = analysis.formulas.find((formula) => formula.metric === "smog");

    expect(smog?.applicable).toBe(false);
    expect(smog?.interpretation).toContain("Not reliable");
  });

  it("enriches formula objects with target metadata and pass/fail results", () => {
    const stats = analyzeStructure(
      "This sentence is intentionally uncomplicated. It stays fairly short."
    );
    const analysis = runAllFormulas(stats);
    const targets = {
      formulas: {
        flesch_kincaid_grade_level: { value: 5, operator: "at_most" as const },
        flesch_reading_ease: { value: 70, operator: "at_least" as const },
      },
    };
    const enriched_formulas = applyTargetsToFormulas(analysis.formulas, targets);

    const fk = enriched_formulas.find((f: any) => f.metric === "flesch_kincaid_grade_level");
    const fre = enriched_formulas.find((f: any) => f.metric === "flesch_reading_ease");

    expect(fk?.target).toEqual({ value: 5, operator: "at_most" });
    expect(typeof fk?.pass).toBe("boolean");
    expect(fre?.target).toEqual({ value: 70, operator: "at_least" });
  });
});
