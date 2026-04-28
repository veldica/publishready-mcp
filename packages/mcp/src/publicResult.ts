import {
  buildPublicResult as coreBuildPublicResult,
  createStructuredToolResult as coreCreateStructuredToolResult,
} from "@veldica/publishready-core";
import type { PublicAnalysisResult, BuildPublicResultOptions } from "@veldica/publishready-core";

export type { RequestedTool, BuildPublicResultOptions } from "@veldica/publishready-core";

export function buildPublicResult(options: BuildPublicResultOptions): PublicAnalysisResult {
  return coreBuildPublicResult(options);
}

export function createStructuredToolResult(result: PublicAnalysisResult) {
  return coreCreateStructuredToolResult(result);
}
