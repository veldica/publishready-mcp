#!/usr/bin/env node
import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { analyzeText } from "@veldica/publishready-core";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json");

const program = new Command();

program.name("publishready").description(packageJson.description).version(packageJson.version);

program
  .command("analyze <file>")
  .description("Analyze a local text file")
  .option("--json", "Output raw JSON", false)
  .action(async (file, options) => {
    try {
      const fullPath = path.resolve(process.cwd(), file);
      const content = await fs.readFile(fullPath, "utf-8");
      const result = analyzeText(content);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\nAnalysis for: ${file}`);
        console.log(`========================================`);
        console.log(`Word Count:      ${result.stats.counts.word_count}`);
        console.log(`Sentence Count:  ${result.stats.counts.sentence_count}`);
        console.log(`Consensus Grade: ${result.analysis.consensus_grade}`);
        console.log(`Readability:     ${result.analysis.readability_band}`);
        console.log(`\nTop Revision Levers:`);
        result.revision_levers.slice(0, 3).forEach((l, i) => {
          console.log(`${i + 1}. [${l.priority.toUpperCase()}] ${l.label}`);
          console.log(`   ${l.explanation}`);
        });
        console.log(``);
      }
    } catch (error) {
      console.error(
        `Error: Could not read or analyze file '${file}':`,
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

process.on("SIGINT", () => {
  process.exit(0);
});

process.on("SIGTERM", () => {
  process.exit(0);
});

program.parse();
