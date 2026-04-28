import express, { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { WritingMetricsServer } from "../server.js";
import { logger } from "@veldica/publishready-core";

/**
 * Runs the PublishReady MCP Server over Streamable HTTP.
 * This is the transport expected by hosted MCP directories such as Smithery.
 */
export async function runHttpServer(port: number = 3000) {
  const app = express();

  app.use(express.json({ limit: "5mb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", transport: "streamable-http" });
  });

  app.post("/mcp", async (req: Request, res: Response) => {
    const server = new WritingMetricsServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    try {
      await server.run(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error("Error handling MCP HTTP request", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    } finally {
      res.on("close", () => {
        void transport.close();
      });
    }
  });

  app.all("/mcp", (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    });
  });

  app.listen(port, () => {
    logger.info(`PublishReady MCP Server listening on port ${port}`);
    logger.info(`Streamable HTTP endpoint: http://localhost:${port}/mcp`);
  });
}
