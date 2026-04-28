import { describe, it, expect } from "vitest";
import { handleListTemplates } from "../packages/mcp/src/tools/listTemplates.js";
import { handleGetTemplate } from "../packages/mcp/src/tools/getTemplate.js";
import { handleAnalyzeAgainstTemplate } from "../packages/mcp/src/tools/analyzeAgainstTemplate.js";
import { BUILTIN_TEMPLATES } from "../packages/core/src/index.js";
import { TemplateSchema } from "@veldica/publishready-schemas";

describe("Template Tools", () => {
  it("should list templates", async () => {
    const result = await handleListTemplates({});
    const json = JSON.parse(result.content[0].text);
    expect(json.length).toBeGreaterThan(10);
    expect(json.some((t: any) => t.id === "technical_docs")).toBe(true);
  });

  it("ships schema-valid rich templates with interpretation fields", () => {
    expect(BUILTIN_TEMPLATES).toHaveLength(26);

    for (const template of BUILTIN_TEMPLATES) {
      const parsed = TemplateSchema.parse(template);
      expect(Object.keys(parsed.hard_fails).length).toBeGreaterThan(0);
      expect(Object.keys(parsed.soft_preferences).length).toBeGreaterThan(0);
      expect(Object.keys(parsed.signal_interpretations)).toContain("avg_characters_per_word");
      expect(parsed.revision_priorities.length).toBeGreaterThan(0);
      expect(parsed.tradeoffs.length).toBeGreaterThan(0);
      expect(parsed.targets.lexical_metrics?.avg_characters_per_word).toBeDefined();
      expect(parsed.targets.lexical_metrics?.difficult_word_ratio).toBeDefined();
      expect(parsed.targets.sentence_metrics?.sentence_length_p95).toBeDefined();
      expect(parsed.targets.paragraph_metrics?.paragraph_length_p95).toBeDefined();
      expect(parsed.targets.formulas?.consensus_grade).toBeDefined();
    }
  });

  it("filters templates by family, use case, audience, and query", async () => {
    const result = await handleListTemplates({
      family: "nonfiction",
      use_case: "knowledge",
      query: "support",
    });
    const payload = result.structuredContent;

    expect(payload.count).toBe(1);
    expect(payload.templates[0].id).toBe("support_article");
  });

  it("should get a template", async () => {
    const result = await handleGetTemplate({ template_id: "technical_docs" });
    const json = JSON.parse(result.content[0].text);
    expect(json.id).toBe("technical_docs");
    expect(json.targets.sentence_metrics.avg_words_per_sentence.value).toBe(20);
  });

  it("should analyze text against a template", async () => {
    const text = "This is a short sentence. It is very simple. We like simple things.";
    const result = await handleAnalyzeAgainstTemplate({
      text,
      template_id: "plain_english_general",
    });
    const structured = (result as any).structuredContent;
    expect(structured.template_info.id).toBe("plain_english_general");
    expect(structured.fit.score).toBeGreaterThan(0);
    expect(structured.fit.label).toBeDefined();
  });
});
