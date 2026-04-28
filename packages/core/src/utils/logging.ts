/**
 * Logging utility to ensure logs go to stderr.
 * This is critical for MCP stdio transport to avoid polluting stdout.
 */

export const logger = {
  log: (...args: any[]) => {
    console.error(...args);
  },
  error: (...args: any[]) => {
    console.error("[ERROR]", ...args);
  },
  warn: (...args: any[]) => {
    console.error("[WARN]", ...args);
  },
  info: (...args: any[]) => {
    console.error("[INFO]", ...args);
  },
  debug: (...args: any[]) => {
    if (process.env.DEBUG) {
      console.error("[DEBUG]", ...args);
    }
  },
};
