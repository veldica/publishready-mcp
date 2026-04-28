# PublishReady: Professional Writing Control

[![CI](https://github.com/veldica/publishready-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/veldica/publishready-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**PublishReady** is a deterministic writing analysis system designed to turn AI drafts into publish-ready writing. It serves as the final QA pass for AI-generated prose, providing local-first metrics, target compliance, and specific revision levers without sending text to remote services.

## The PublishReady Packages

This project is structured as a professional, layered monorepo containing specialized packages:

### Core Packages
- **[@veldica/publishready-mcp](packages/mcp)**: The Model Context Protocol (MCP) server implementation (`publishready-mcp`).
- **[@veldica/publishready-cli](packages/cli)**: The command-line tool for local analysis (`publishready`).
- **[@veldica/publishready-core](packages/core)**: The central orchestration engine.
- **[@veldica/publishready-schemas](packages/schemas)**: Unified Zod schemas and explicit interfaces.

### Underlying Libraries
- **[@veldica/prose-analyzer](https://www.npmjs.com/package/@veldica/prose-analyzer)**: Deterministic style signals (variety, density, repetition, narrative texture).
- **[@veldica/readability](https://www.npmjs.com/package/@veldica/readability)**: Consolidated library of all major readability formulas.
- **[@veldica/prose-tokenizer](https://www.npmjs.com/package/@veldica/prose-tokenizer)**: Standalone markdown-aware prose tokenization.
- **[@veldica/prose-linter](https://www.npmjs.com/package/@veldica/prose-linter)**: Target checks, revision levers, content integrity, and deterministic AI-sounding prose markers.

## Installation

### MCP Server (Recommended)
Add the server to your MCP client configuration:

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

### Command Line
```bash
npx @veldica/publishready-cli analyze sample.txt
```

### Hosted MCP
For Smithery, VPS, or gateway deployments, run the server with Streamable HTTP:

```bash
npx @veldica/publishready-mcp --transport=http --port=3000
```

The MCP endpoint is `/mcp`; the health endpoint is `/health`.

## Key Features

- **Template, Target, and Reference Modes**: Compare writing against built-in templates, explicit numeric targets, reference text, or reusable reference profiles.
- **Deterministic Metrics**: Structural counts, sentence and paragraph distributions, lexical signals, scannability, fiction proxies, and readability formulas.
- **Specific Revision Levers**: Ranked, evidence-based suggestions such as `shorten_long_sentences`, `replace_difficult_words`, and `reduce_abstract_wording`.
- **AI-Sounding Prose Audit**: Deterministic marker inventory for formulaic, generic, or over-polished prose, including exact matches and tracked phrase counts.
- **Fiction & Non-Fiction Support**: Narrative metrics for dialogue, sensory density, abstract wording, and scene pacing.
- **Explainable Interpretation**: Target and metric interpretation that explains audience, use cases, style implications, and tradeoffs.
- **Local-First & Private**: Stdio-first, deterministic, no external API calls, and no LLM wrappers.

## MCP Tool Surface

The MCP server exposes 16 specialized tools for analysis and control, including `audit_ai_sounding_prose` for deterministic AI-marker analysis. For a full list and documentation, see the [MCP README](packages/mcp/README.md).

## Deterministic Philosophy

This package explicitly avoids **perplexity** and other model-dependent scores. We believe writing control should be:

1. **Explainable**: You should know exactly why a score changed.
2. **Reproducible**: The same text should always yield the same metrics.
3. **Practical**: A metric is only useful if it tells you what to change.

## Development

```bash
npm install
npm run build
npm run lint
npm run typecheck
npm test
```

## Publishing Metadata

- npm package: `@veldica/publishready-mcp`
- MCP Registry name: `io.github.veldica/publishready`
- Product homepage: `https://veldica.com/publish-ready`
- Source repository: `https://github.com/veldica/publishready-mcp`

## License

MIT
