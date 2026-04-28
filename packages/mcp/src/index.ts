#!/usr/bin/env node
import { runStdioServer } from "./transports/stdio.js";
import { runHttpServer } from "./transports/http.js";

import { pathToFileURL } from "node:url";

export * from "./server.js";
export * from "./transports/stdio.js";
export * from "./transports/http.js";
export { logger } from "@veldica/publishready-core";
export * from "./packageInfo.js";

// Run server if executed directly
const isDirectRun =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  const transportArg = process.argv.find((arg) => arg.startsWith("--transport="));
  const transport = transportArg ? transportArg.split("=")[1] : "stdio";

  if (transport === "http") {
    const portArg = process.argv.find((arg) => arg.startsWith("--port="));
    const port = portArg ? parseInt(portArg.split("=")[1], 10) : 3000;
    runHttpServer(port).catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
  } else {
    runStdioServer().catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
  }
}
