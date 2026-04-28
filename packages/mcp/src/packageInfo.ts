import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as {
  name: string;
  version: string;
  description: string;
};

export const PACKAGE_NAME = packageJson.name;
export const PACKAGE_VERSION = packageJson.version;
export const PACKAGE_DESCRIPTION = packageJson.description;
export const ANALYSIS_PROFILE = "deterministic_english_v1";
export const ANALYSIS_SCHEMA_VERSION = 1;
