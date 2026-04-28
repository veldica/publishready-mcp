import { describe, expect, it } from "vitest";
import { analyzeStructure } from "../packages/core/src/index.js";
import { runAllFormulas } from "@veldica/readability";
import { rankRevisionLevers } from "../packages/core/src/index.js";
import { checkViolations } from "../packages/core/src/index.js";

describe("revision lever ranking", () => {
  it("prioritizes sentence simplification when sentence-length pressure dominates", () => {
    const text =
      "This is a deliberately extended sentence that keeps layering additional clauses and explanations so it blows past the intended readability limit for sentence length. This second sentence repeats the same pattern with another set of elongated phrases so the average and tail sentence lengths both remain far above target.";

    const stats = analyzeStructure(text);
    const analysis = runAllFormulas(stats);
    const profile = {
      targets: {
        sentence_metrics: {
          avg_words_per_sentence: { value: 12, operator: "at_most" as const },
          sentence_length_p90: { value: 18, operator: "at_most" as const },
        },
      }
    };
    const violations = checkViolations(stats, analysis.formulas, profile as any);
    const levers = rankRevisionLevers(stats, analysis.formulas, violations);

    expect(levers[0].lever).toBe("shorten_long_sentences");
    expect(levers[0].priority).toBe("high");
  });

  it("surfaces repetition control when lexical variety is weak and targeted", () => {
    const text =
      "The platform helps teams move faster. The platform helps teams move cleaner. The platform helps teams move with confidence. The platform helps teams move with clarity.";

    const stats = analyzeStructure(text);
    const analysis = runAllFormulas(stats);
    const profile = {
      targets: {
        lexical_metrics: {
          repetition_ratio: { value: 0.05, operator: "at_most" as const }
        }
      }
    };
    const violations = checkViolations(stats, analysis.formulas, profile as any);
    const levers = rankRevisionLevers(stats, analysis.formulas, violations);

    expect(levers.some((lever) => lever.lever === "reduce_repetition")).toBe(true);
    expect(levers.find((lever) => lever.lever === "reduce_repetition")?.affected_metrics).toContain(
      "repetition_ratio"
    );
  });
});
