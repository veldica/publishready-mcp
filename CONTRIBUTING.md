# Contributing to PublishReady

Thank you for your interest in contributing to PublishReady.

## Development Workflow

This is a TypeScript monorepo using `npm` workspaces.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/veldica/publishready-mcp.git
    cd publishready-mcp
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Build the project**:
    ```bash
    npm run build
    ```

4.  **Run tests**:
    ```bash
    npm test
    ```

## Project Structure

- `packages/core`: The core deterministic analysis engine.
- `packages/mcp`: The Model Context Protocol server implementation.
- `packages/cli`: Command-line interface for the analysis engine.
- `packages/schemas`: Shared Zod schemas and TypeScript types.

## Coding Standards

- We use `eslint` for linting and `prettier` for formatting.
- Ensure all changes are covered by tests in the `tests/` directory.
- All public-facing tools must have corresponding schemas in `packages/schemas`.

## Submitting Changes

1.  Create a feature branch.
2.  Make your changes and add tests.
3.  Ensure `npm run typecheck`, `npm run lint`, and `npm test` pass.
4.  Submit a Pull Request.

## Release Process

For maintainers preparing a release:

1.  **Validation**: Run the full local gate to ensure everything is solid.
    ```bash
    npm run release:dry-run
    ```
2.  **Publish Order**: If publishing for the first time or if multiple packages changed, follow this order:
    `@veldica/publishready-schemas` -> `@veldica/publishready-core` -> `@veldica/publishready-mcp` -> `@veldica/publishready-cli`.
3.  **Provenance**: Packages are published with `--provenance` requirement.
4.  **Smithery**: Host the MCP server over Streamable HTTP and publish the public HTTPS `/mcp` endpoint.
    ```bash
    npx @veldica/publishready-mcp --transport=http --port=3000
    smithery mcp publish "https://your-domain.example/mcp" -n @veldica/publishready-mcp
    ```
5.  **MCP Registry**: Publish `server.json` after the npm package is available.
    ```bash
    mcp-publisher login github
    mcp-publisher publish --file=./server.json
    ```
6.  **Smoke Test**: After publishing MCP, verify with:
    ```bash
    echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}' | npx @veldica/publishready-mcp
    ```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
