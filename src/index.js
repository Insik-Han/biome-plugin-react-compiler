// src/index.ts
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
var __filename2 = fileURLToPath(import.meta.url);
var __dirname2 = dirname(__filename2);
var RULES = [
  "no-try-catch-in-render",
  "no-ref-access-in-render",
  "no-prop-mutation",
  "no-props-array-push",
  "no-props-array-pop",
  "no-props-array-splice",
  "no-props-array-sort",
  "no-props-array-reverse"
];
function getPackageRoot() {
  return resolve(__dirname2, "..");
}
function getRulesDir() {
  return join(getPackageRoot(), "rules");
}
function getRulePath(ruleName) {
  return join(getRulesDir(), `${ruleName}.grit`);
}
function getRuleContent(ruleName) {
  const path = getRulePath(ruleName);
  if (!existsSync(path)) {
    throw new Error(`Rule not found: ${ruleName}`);
  }
  return readFileSync(path, "utf-8");
}
function getAllRulePaths() {
  return RULES.map((rule) => getRulePath(rule));
}
function getBiomePluginConfig(rulesDir = "./node_modules/biome-plugin-react-compiler/rules") {
  return {
    plugins: RULES.map((rule) => `${rulesDir}/${rule}.grit`)
  };
}
var src_default = {
  RULES,
  getRulesDir,
  getRulePath,
  getRuleContent,
  getAllRulePaths,
  getBiomePluginConfig
};
export {
  getRulesDir,
  getRulePath,
  getRuleContent,
  getBiomePluginConfig,
  getAllRulePaths,
  src_default as default,
  RULES
};
