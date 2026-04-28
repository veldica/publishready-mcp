import { describe, expect, it } from "vitest";
import { analyzeStructure } from "../packages/core/src/index.js";

describe("tokenization and structure", () => {
  it("analyzes markdown-ish content without crashing and reports zeroes for blank text", () => {
    const blank = analyzeStructure(" \n\t");
    expect(blank.counts.word_count).toBe(0);
    expect(blank.counts.sentence_count).toBe(0);
    expect(blank.counts.paragraph_count).toBe(0);

    const markdown = analyzeStructure(`# Plan
Intro line.

- First point
- Second point

## Details
More text here.`);

    expect(markdown.counts.heading_count).toBe(2);
    expect(markdown.counts.list_item_count).toBe(2);
    expect(markdown.counts.paragraph_count).toBe(6);
  });
});

