import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WritingMetricsServer } from "../server.js";
import { logger } from "@veldica/publishready-core";

export async function runStdioServer() {
  const server = new WritingMetricsServer();
  const transport = new StdioServerTransport();

  logger.info("Starting Writing Metrics MCP Server in stdio mode");
  await server.run(transport);
}
