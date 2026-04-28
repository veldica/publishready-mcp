import { describe, it, expect } from "vitest";
import { analyzeStructure } from "../packages/core/src/index.js";

describe("Fiction Metrics", () => {
  it("should detect dialogue and calculate dialogue ratio", () => {
    const text = `
"Hello," said John.
John looked at the tree.
"How are you?" Mary asked.
    `.trim();
    const stats = analyzeStructure(text);
    expect(stats.fiction).toBeDefined();
    expect(stats.fiction?.dialogue_ratio).toBeGreaterThanOrEqual(0.5);
    expect(stats.fiction?.narration_vs_dialogue_balance).toBe("balanced");
  });

  it("should detect sensory terms", () => {
    const text = "He saw the bright red light and heard the loud noise. The soft velvet felt warm.";
    const stats = analyzeStructure(text);
    expect(stats.fiction?.sensory_term_density).toBeGreaterThan(0);
  });

  it("should detect abstract terms", () => {
    const text = "The truth and justice of the system was a complex theory.";
    const stats = analyzeStructure(text);
    expect(stats.fiction?.abstract_word_ratio).toBeGreaterThan(0);
  });
});
