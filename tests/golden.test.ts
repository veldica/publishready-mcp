import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { handleAnalyzeText } from "../packages/mcp/src/tools/analyzeText.js";

function fixture(name: string) {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
}

function golden(name: string) {
  return JSON.parse(readFileSync(new URL(`./golden/${name}.json`, import.meta.url), "utf8"));
}

function snapshotShape(result: any) {
  const formulaScores = Object.fromEntries(
    result.formulas.map((formula: any) => [formula.metric, formula.score])
  );

  return {
    counts: {
      word_count: result.counts.word_count,
      sentence_count: result.counts.sentence_count,
      paragraph_count: result.counts.paragraph_count,
      heading_count: result.counts.heading_count,
      list_item_count: result.counts.list_item_count,
    },
    lexical_metrics: {
      avg_characters_per_word: result.lexical_metrics.avg_characters_per_word,
      complex_word_ratio: result.lexical_metrics.complex_word_ratio,
      difficult_word_ratio: result.lexical_metrics.difficult_word_ratio,
    },
    readability_band: result.readability_band,
    consensus_grade: result.consensus_grade,
    formulas: {
      flesch_reading_ease: formulaScores.flesch_reading_ease,
      flesch_kincaid_grade_level: formulaScores.flesch_kincaid_grade_level,
      dale_chall: formulaScores.dale_chall,
      type_token_ratio: formulaScores.type_token_ratio,
    },
    top_revision_levers: result.revision_levers.slice(0, 3).map((lever: any) => lever.lever),
  };
}

describe("golden snapshots", () => {
  for (const name of [
    "simple",
    "technical",
    "bloated",
    "landing-page",
    "blog-long",
    "markdown",
    "bullet-heavy",
  ]) {
    it(`matches the golden snapshot for ${name}`, async () => {
      const response = await handleAnalyzeText({
        text: fixture(
          `${name}.${name.includes("markdown") || name.includes("bullet") ? "md" : "txt"}`
        ),
      });
      expect(snapshotShape(response.structuredContent)).toEqual(golden(name));
    });
  }
});
