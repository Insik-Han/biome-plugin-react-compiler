import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const RULES = [
  "no-try-catch-in-render",
  "no-ref-access-in-render",
  "no-prop-mutation",
  "no-props-array-push",
  "no-props-array-pop",
  "no-props-array-splice",
  "no-props-array-sort",
  "no-props-array-reverse",
] as const;

export type RuleName = (typeof RULES)[number];

function getPackageRoot(): string {
  return resolve(__dirname, "..");
}

export function getRulesDir(): string {
  return join(getPackageRoot(), "rules");
}

export function getRulePath(ruleName: RuleName): string {
  return join(getRulesDir(), `${ruleName}.grit`);
}

export function getRuleContent(ruleName: RuleName): string {
  const path = getRulePath(ruleName);
  if (!existsSync(path)) {
    throw new Error(`Rule not found: ${ruleName}`);
  }
  return readFileSync(path, "utf-8");
}

export function getAllRulePaths(): string[] {
  return RULES.map((rule) => getRulePath(rule));
}

export function getBiomePluginConfig(rulesDir = "./node_modules/biome-plugin-react-compiler/rules"): { plugins: string[] } {
  return {
    plugins: RULES.map((rule) => `${rulesDir}/${rule}.grit`),
  };
}

export default {
  RULES,
  getRulesDir,
  getRulePath,
  getRuleContent,
  getAllRulePaths,
  getBiomePluginConfig,
};
