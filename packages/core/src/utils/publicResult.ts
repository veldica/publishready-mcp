import { createHash } from "node:crypto";
import type {
  StructuralMetrics,
  PublicAnalysisResult,
  Targets,
  RankedLever,
  AIAnalysis,
  Fit,
  ComplianceSummary,
  Violation,
  FormulaResult,
} from "@veldica/publishready-schemas";
import {
  ANALYSIS_PROFILE,
  ANALYSIS_SCHEMA_VERSION,
  PACKAGE_NAME,
  PACKAGE_VERSION,
} from "../packageInfo.js";
import type { Hotspot } from "../hotspots.js";

export type RequestedTool =
  | "analyze_text"
  | "analyze_against_targets"
  | "suggest_revision_levers"
  | "analyze_against_template"
  | "summarize_writing_profile"
  | "compare_to_reference"
  | "find_reference_drift"
  | "compare_text_versions"
  | "find_hotspots"
  | "audit_ai_sounding_prose";

export interface BuildPublicResultOptions {
  requested_tool: RequestedTool;
  text: string;
  stats: StructuralMetrics;
  analysis: {
    formulas: FormulaResult[];
    consensus_grade: number;
    readability_band: string;
    consensus_sources: string[];
    excluded_formulas: string[];
  };
  targets?: Targets | null;
  template_info?: { id: string; name: string; family: string };
  fit?: Fit;
  summary?: ComplianceSummary | null;
  violations?: Violation[];
  revision_levers?: RankedLever[];
  ai_analysis?: AIAnalysis;
  word_tracking_metrics?: Record<string, number>;
  interpretations?: Record<string, string>;
  hotspots?: Hotspot[];
  include_sentence_details?: boolean;
  include_paragraph_details?: boolean;
  recommended_next?: {
    tool: string;
    reason: string;
    required?: boolean;
  };
}

export function buildPublicResult({
  requested_tool,
  text,
  stats,
  analysis,
  targets = null,
  template_info,
  fit,
  summary = null,
  violations = [],
  revision_levers = [],
  ai_analysis,
  word_tracking_metrics,
  interpretations,
  hotspots,
  include_sentence_details = false,
  include_paragraph_details = false,
  recommended_next,
}: BuildPublicResultOptions): PublicAnalysisResult {
  return {
    metadata: {
      package_name: PACKAGE_NAME,
      package_version: PACKAGE_VERSION,
      schema_version: ANALYSIS_SCHEMA_VERSION,
      analysis_profile: ANALYSIS_PROFILE,
      language: "en",
      requested_tool,
      input_sha256: createHash("sha256").update(text).digest("hex"),
    },
    counts: stats.counts,
    sentence_metrics: stats.sentence_metrics,
    paragraph_metrics: stats.paragraph_metrics,
    lexical_metrics: stats.lexical,
    scannability_metrics: stats.scannability,
    fiction_metrics: stats.fiction,
    word_tracking_metrics,
    ai_analysis,
    formulas: analysis.formulas,
    readability_band: analysis.readability_band,
    consensus_grade: analysis.consensus_grade,
    consensus_sources: analysis.consensus_sources,
    excluded_formulas: analysis.excluded_formulas,
    targets,
    template_info,
    fit,
    summary,
    violations,
    revision_levers,
    interpretations,
    details: {
      sentences: include_sentence_details ? stats.sentences : null,
      paragraphs: include_paragraph_details ? stats.paragraphs : null,
      hotspots: hotspots as any,
    },
    recommended_next,
  };
}

export function createStructuredToolResult(result: PublicAnalysisResult) {
  return {
    structuredContent: result,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
