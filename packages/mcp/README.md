# @veldica/publishready-mcp (PublishReady Server)

[![npm version](https://img.shields.io/npm/v/@veldica/publishready-mcp.svg)](https://www.npmjs.com/package/@veldica/publishready-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-blue.svg)](https://nodejs.org)

**PublishReady** is a deterministic writing analysis ecosystem designed to turn AI drafts into publish-ready writing. This server provides tools for structural, lexical, and readability analysis of prose, helping models and humans refine text toward specific mechanical targets.

This package is the Model Context Protocol (MCP) server for the **PublishReady packages**.

## Features

- **Deterministic Analysis**: Local-first metrics for word counts, sentence complexity, and readability (Flesch, Gunning Fog, etc.).
- **Target Compliance**: Check text against specific numeric constraints or built-in templates (e.g., technical docs, marketing, fiction).
- **Fingerprinting**: Generate and compare writing profiles to detect stylistic drift or align with reference texts.
- **AI-Sounding Prose Audit**: Run deterministic Veldica marker analysis for formulaic, generic, or over-polished prose, with exact matches and tracked phrase counts.
- **Scannability**: Identify "hotspots" (problematic sentences/paragraphs) that negatively impact digital readability.
- **Privacy First**: All processing is local and deterministic; no prose is sent to third-party services.

## Installation

```bash
npm install @veldica/publishready-mcp
```

Most MCP users can run the package directly with `npx`, so a local install is optional.

## MCP Client Configuration

### Claude Desktop
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "publishready": {
      "command": "npx",
      "args": ["-y", "@veldica/publishready-mcp"]
    }
  }
}
```

### Other MCP Clients
Add a new MCP server in your settings with:
- **Name**: `publishready`
- **Type**: `command`
- **Command**: `npx -y @veldica/publishready-mcp`

### Streamable HTTP (for hosted environments)
To run the server as a Streamable HTTP service (e.g., on Smithery or a VPS):

```bash
npx @veldica/publishready-mcp --transport=http --port=3000
```

- **MCP Endpoint**: `http://localhost:3000/mcp`
- **Health Endpoint**: `http://localhost:3000/health`

For Smithery URL publishing, expose the `/mcp` endpoint over public HTTPS, then publish that URL:

```bash
smithery mcp publish "https://your-domain.example/mcp" -n @veldica/publishready-mcp
```

## Tool Surface

- `analyze_text`: Baseline analysis for `text`. Next: `suggest_revision_levers`.
- `audit_ai_sounding_prose`: AI-marker inventory for `text` and optional `track_words`. Next: `find_hotspots`.
- `analyze_against_targets`: Compliance check for `text` and numeric `targets`. Next: `find_hotspots`.
- `analyze_against_template`: Template comparison for `text` and `template_id`. Next: `suggest_revision_levers`.
- `suggest_revision_levers`: Ranked changes for `text`. Next: `find_hotspots`.
- `find_hotspots`: Specific problem segments for `text`. Next: revise and run `compare_text_versions`.
- `compare_text_versions`: Original vs revised comparison. Inputs: `original_text`, `revised_text`. Next: `summarize_writing_profile`.
- `summarize_writing_profile`: Style fingerprint for `text`. Next: `build_reference_profile`.
- `build_reference_profile`: Reusable reference profile from `texts`. Next: `compare_to_reference`.
- `compare_to_reference`: Candidate alignment against `reference_profile`. Next: `find_reference_drift`.
- `find_reference_drift`: Stylistic drift against `reference_profile`. Next: `suggest_revision_levers`.
- `list_templates`: Built-in template list. Next: `get_template`.
- `get_template`: Template details for `template_id`. Next: `analyze_against_template`.
- `interpret_targets`: Explanation for numeric `targets`. Next: `analyze_against_targets`.
- `compare_profiles`: Delta view for `profile_a` and `profile_b`.
- `plan_revision_workflow`: Step-by-step tool sequence for `task` and optional `text`.

## Tool Examples

### Baseline Analysis
Get a baseline of your text's structural and lexical metrics:
```json
// Tool: analyze_text
{
  "text": "The quick brown fox jumps over the lazy dog."
}
```

### Template Compliance
Check if your text aligns with a specific template (e.g., `technical_docs`):
```json
// Tool: analyze_against_template
{
  "text": "This documentation explains the core architecture of the system...",
  "template_id": "technical_docs"
}
```

### AI-Sounding Prose Audit
Detect deterministic markers that can make prose feel formulaic or AI-like:
```json
// Tool: audit_ai_sounding_prose
{
  "text": "In today's fast-paced digital landscape, teams can utilize polished solutions...",
  "track_words": ["utilize", "polished"]
}
```

### Version Comparison
Track improvements between an original and a revised draft:
```json
// Tool: compare_text_versions
{
  "original_text": "The system is fast.",
  "revised_text": "The system architecture enables sub-millisecond latency.",
  "template_id": "technical_docs"
}
```

## Resources

The server exposes several resources for documentation, schema reference, and workflow guidance:

- **Metrics & Formulas**:
    - `metrics://definitions`: Glossary of all supported structural and lexical metrics.
    - `formulas://catalog`: Readability formula definitions and interpretations.
    - `signals://metric_interpretations`: Guidance on how to interpret high/low metric values.
- **Templates & Targets**:
    - `templates://catalog`: List of all built-in writing templates.
    - `templates://{template_id}`: Detailed numeric targets for a specific template.
    - `targets://meaning_reference`: Human-readable reference for what specific numeric targets imply.
- **Schemas**:
    - `schemas://targets`: JSON Schema for target constraints.
    - `profiles://reference_schema`: JSON Schema for writing profiles and fingerprints.
- **Usage Guidance**:
    - `usage://tool_decision_tree`: Guidance on which tools to use for specific user goals.
    - `usage://quality_gates`: Recommended quality thresholds for accepting a revised draft.
    - `usage://revision_workflows`: Step-by-step recipes for common writing revision tasks.

## Requirements

- **Node.js**: >= 20.0.0
- **Local-first**: No external network access or API keys required.

## Publishing Metadata

- npm package: `@veldica/publishready-mcp`
- MCP Registry name: `io.github.veldica/publishready`
- Streamable HTTP path: `/mcp`
- Product homepage: `https://veldica.com/publish-ready`

## Troubleshooting

- **Logs**: The server uses `stderr` for logging. Check your client's logs to see server output.
- **Verification**: You can verify the server is running correctly using a quick smoke test:

```bash
npx -y @veldica/publishready-mcp
```

Or a real MCP Inspector smoke:

```bash
npx @modelcontextprotocol/inspector npx -y @veldica/publishready-mcp
```

## License

MIT
