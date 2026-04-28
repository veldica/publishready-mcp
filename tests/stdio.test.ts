import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const MCP_ARGS = ["packages/mcp/dist/index.js"];
const CLI_ARGS = ["packages/cli/dist/index.js"];
const REPO_ROOT = process.cwd();

const openClients: Array<{ client: Client; transport: StdioClientTransport }> = [];

afterEach(async () => {
  while (openClients.length > 0) {
    const { client } = openClients.pop()!;
    await client.close();
  }
});

async function createClient() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: MCP_ARGS,
    cwd: REPO_ROOT,
    stderr: "pipe",
  });
  const client = new Client({
    name: "writing-metrics-test-client",
    version: "1.0.0",
  });

  await client.connect(transport);
  openClients.push({ client, transport });
  return client;
}

function resourceText(content: { text?: string; blob?: string }) {
  return content.text ?? "";
}

describe("CLI and stdio integration", () => {
  it("shows help text for CLI", async () => {
    const { stdout } = await execFileAsync(process.execPath, [...CLI_ARGS, "--help"], {
      cwd: REPO_ROOT,
    });

    expect(stdout).toContain("Analyze a local text file");
    expect(stdout).not.toContain("--transport");
  });

  it("starts cleanly over stdio, exposes explicit schemas, and returns structured tool output", async () => {
    const client = await createClient();
    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name).sort()).toEqual(
      [
        "analyze_against_targets",
        "analyze_against_template",
        "analyze_text",
        "audit_ai_sounding_prose",
        "build_reference_profile",
        "compare_profiles",
        "compare_text_versions",
        "compare_to_reference",
        "find_hotspots",
        "find_reference_drift",
        "get_template",
        "interpret_targets",
        "list_templates",
        "plan_revision_workflow",
        "suggest_revision_levers",
        "summarize_writing_profile",
      ].sort()
    );

    const targetTool = tools.find((tool) => tool.name === "analyze_against_targets");
    const targetProperties = targetTool?.inputSchema.properties?.targets as any;
    const compareToReferenceTool = tools.find((tool) => tool.name === "compare_to_reference");
    const findReferenceDriftTool = tools.find((tool) => tool.name === "find_reference_drift");

    expect(
      targetProperties?.properties?.sentence_metrics?.properties?.avg_words_per_sentence
    ).toBeDefined();
    expect(
      targetProperties?.properties?.sentence_metrics?.properties?.sentence_length_p90
    ).toBeDefined();
    expect(compareToReferenceTool?.inputSchema.properties?.candidate_text).toBeDefined();
    expect(compareToReferenceTool?.inputSchema.properties?.reference_text).toBeDefined();
    expect(compareToReferenceTool?.inputSchema.properties?.reference_profile).toBeDefined();
    expect(compareToReferenceTool?.inputSchema.required).toContain("candidate_text");
    expect(findReferenceDriftTool?.inputSchema.properties?.candidate_text).toBeDefined();
    expect(findReferenceDriftTool?.inputSchema.properties?.reference_text).toBeDefined();
    expect(findReferenceDriftTool?.inputSchema.properties?.reference_profile).toBeDefined();
    expect(findReferenceDriftTool?.inputSchema.required).toContain("candidate_text");
    expect(targetTool?.outputSchema?.properties?.revision_levers).toBeDefined();
    expect(tools.every((tool) => tool.outputSchema)).toBe(true);

    const response = await client.callTool({
      name: "analyze_text",
      arguments: {
        text: "This is a short sentence. This one is short too.",
      },
    });

    const structured = response.structuredContent as
      | { lexical_metrics?: { avg_characters_per_word?: number } }
      | undefined;

    expect(structured?.lexical_metrics?.avg_characters_per_word).toBeGreaterThan(0);
  });

  it("smoke-tests every public tool over stdio", async () => {
    const client = await createClient();
    const sample =
      "This is a sample draft. It has clear sentences, simple words, and enough structure to test.";
    const reference = "Short clear sentences. Simple words help readers move quickly.";

    const profileResponse = await client.callTool({
      name: "build_reference_profile",
      arguments: {
        texts: [reference],
        profile_name: "stdio_reference",
      },
    });
    const referenceProfile = profileResponse.structuredContent;

    const calls = [
      { name: "analyze_text", arguments: { text: sample } },
      { name: "audit_ai_sounding_prose", arguments: { text: sample, track_words: ["clear"] } },
      {
        name: "analyze_against_targets",
        arguments: {
          text: sample,
          targets: {
            lexical_metrics: {
              avg_characters_per_word: { value: 5.2, operator: "at_most" },
            },
          },
        },
      },
      {
        name: "suggest_revision_levers",
        arguments: {
          text: sample,
          targets: {
            sentence_metrics: {
              avg_words_per_sentence: { value: 12, operator: "at_most" },
            },
          },
        },
      },
      { name: "list_templates", arguments: { query: "plain" } },
      { name: "get_template", arguments: { template_id: "plain_english_general" } },
      {
        name: "analyze_against_template",
        arguments: { text: sample, template_id: "plain_english_general" },
      },
      {
        name: "interpret_targets",
        arguments: {
          targets: {
            sentence_metrics: {
              avg_words_per_sentence: { value: 12, operator: "at_most" },
            },
          },
        },
      },
      { name: "summarize_writing_profile", arguments: { text: sample } },
      {
        name: "compare_to_reference",
        arguments: { candidate_text: sample, reference_profile: referenceProfile },
      },
      {
        name: "compare_profiles",
        arguments: { profile_a: "plain_english_general", profile_b: "technical_docs" },
      },
      {
        name: "find_reference_drift",
        arguments: { candidate_text: sample, reference_profile: referenceProfile },
      },
      {
        name: "compare_text_versions",
        arguments: {
          original_text:
            "This is a very long sentence that includes many unnecessary phrases and slow clauses for a simple point.",
          revised_text: "This sentence is shorter. It makes the same point clearly.",
          template_id: "plain_english_general",
          reference_profile: referenceProfile,
        },
      },
      { name: "find_hotspots", arguments: { text: sample, template_id: "plain_english_general" } },
      { name: "plan_revision_workflow", arguments: { task: "template_revision", text: sample } },
    ];

    for (const call of calls) {
      const response = await client.callTool(call);
      expect(response.isError).not.toBe(true);
      expect(response.structuredContent).toBeDefined();
    }
  });

  it("exposes synchronized resources and useful prompts", async () => {
    const client = await createClient();
    const { resources } = await client.listResources();
    const uris = resources.map((resource) => resource.uri);

    expect(uris).toContain("metrics://definitions");
    expect(uris).toContain("formulas://catalog");
    expect(uris).toContain("schemas://targets");
    expect(uris).toContain("templates://catalog");
    expect(uris).toContain("signals://metric_interpretations");
    expect(uris).toContain("profiles://reference_schema");
    expect(uris).toContain("targets://meaning_reference");
    expect(uris).toContain("usage://tool_decision_tree");
    expect(uris).toContain("usage://quality_gates");

    const metrics = await client.readResource({ uri: "metrics://definitions" });
    expect(resourceText(metrics.contents[0])).toContain("avg_characters_per_word");
    expect(resourceText(metrics.contents[0])).toContain("perplexity");

    const formulas = await client.readResource({ uri: "formulas://catalog" });
    expect(resourceText(formulas.contents[0])).toContain("Automated Readability Index");

    const schemas = await client.readResource({ uri: "schemas://targets" });
    expect(resourceText(schemas.contents[0])).toContain("avg_characters_per_word");

    const signals = await client.readResource({ uri: "signals://metric_interpretations" });
    expect(resourceText(signals.contents[0])).toContain("avg_characters_per_word");

    const profiles = await client.readResource({ uri: "profiles://reference_schema" });
    expect(resourceText(profiles.contents[0])).toContain("WritingProfile");

    const targets = await client.readResource({ uri: "targets://meaning_reference" });
    expect(resourceText(targets.contents[0])).toContain("lexical_diversity_mattr");

    const { prompts } = await client.listPrompts();
    expect(prompts.map((prompt) => prompt.name).sort()).toEqual(
      [
        "check_compliance",
        "revise_prose",
        "revise_without_losing_facts",
        "match_reference_style",
        "revise_to_template",
        "find_and_fix_hotspots",
        "compare_revision_quality",
        "build_style_profile",
        "audit_ai_sounding_prose",
        "fiction_pacing_review",
        "landing_page_copy_review",
        "technical_docs_review",
      ].sort()
    );

    const prompt = await client.getPrompt({
      name: "revise_prose",
      arguments: { text: "Draft text.", goals: "plain English" },
    });
    expect(prompt.messages[0].content.type).toBe("text");
    if (prompt.messages[0].content.type !== "text") {
      throw new Error("Expected text prompt content.");
    }
    expect(prompt.messages[0].content.text).toContain("revision plan");
  });
});
