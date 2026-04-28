import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { analyzeStructure } from "../packages/core/src/index.js";
import { runAllFormulas } from "@veldica/readability";
import { handleAnalyzeText } from "../packages/mcp/src/tools/analyzeText.js";

function fixture(name: string) {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
}

describe("representative fixture behavior", () => {
  it("orders simple, technical, and bloated prose by rising consensus grade", () => {
    const simple = runAllFormulas(analyzeStructure(fixture("simple.txt")));
    const technical = runAllFormulas(analyzeStructure(fixture("technical.txt")));
    const bloated = runAllFormulas(analyzeStructure(fixture("bloated.txt")));

    expect(simple.consensus_grade).toBeLessThan(technical.consensus_grade);
    expect(technical.consensus_grade).toBeLessThanOrEqual(bloated.consensus_grade);
  });

  it("handles short landing-page copy, long blog prose, markdown, and bullet-heavy content", async () => {
    const landing = await handleAnalyzeText({ text: fixture("landing-page.txt") });
    const blog = await handleAnalyzeText({ text: fixture("blog-long.txt") });
    const markdown = await handleAnalyzeText({ text: fixture("markdown.md") });
    const bullets = await handleAnalyzeText({ text: fixture("bullet-heavy.md") });

    const landingResult = landing.structuredContent!;
    const blogResult = blog.structuredContent!;
    const markdownResult = markdown.structuredContent!;
    const bulletResult = bullets.structuredContent!;

    expect(blogResult.counts.word_count).toBeGreaterThan(landingResult.counts.word_count);
    expect(markdownResult.counts.heading_count).toBeGreaterThan(0);
    expect(markdownResult.counts.list_item_count).toBeGreaterThan(0);
    expect(bulletResult.counts.list_item_count).toBeGreaterThan(3);
  });
});
