#!/usr/bin/env node

// src/cli.ts
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
var __filename2 = fileURLToPath(import.meta.url);
var __dirname2 = dirname(__filename2);
var RULES = [
  "no-try-catch-in-render.grit",
  "no-ref-access-in-render.grit",
  "no-prop-mutation.grit",
  "no-props-array-push.grit",
  "no-props-array-pop.grit",
  "no-props-array-splice.grit",
  "no-props-array-sort.grit",
  "no-props-array-reverse.grit"
];
function printHelp() {
  console.log(`
biome-plugin-react-compiler

Usage:
  npx biome-plugin-react-compiler init [options]
  npx biome-plugin-react-compiler list

Commands:
  init    Copy plugin rules to your project and update biome.json
  list    List available rules

Options:
  --dir <path>     Target directory for rules (default: ./biome-plugins)
  --no-update      Don't update biome.json
  --help           Show this help message

Examples:
  npx biome-plugin-react-compiler init
  npx biome-plugin-react-compiler init --dir ./rules
  npx biome-plugin-react-compiler list
`);
}
function listRules() {
  console.log(`
Available rules:
`);
  for (const rule of RULES) {
    const name = rule.replace(".grit", "");
    console.log(`  - ${name}`);
  }
  console.log("");
}
function findPackageRoot() {
  const packageRulesDir = resolve(__dirname2, "..", "rules");
  if (existsSync(packageRulesDir)) {
    return resolve(__dirname2, "..");
  }
  return resolve(__dirname2, "..");
}
function copyRules(targetDir) {
  const packageRoot = findPackageRoot();
  const rulesSource = join(packageRoot, "rules");
  if (!existsSync(rulesSource)) {
    console.error(`Error: Could not find rules at ${rulesSource}`);
    process.exit(1);
  }
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }
  const copiedRules = [];
  for (const rule of RULES) {
    const sourcePath = join(rulesSource, rule);
    const targetPath = join(targetDir, rule);
    if (existsSync(sourcePath)) {
      copyFileSync(sourcePath, targetPath);
      copiedRules.push(rule);
      console.log(`  Copied: ${rule}`);
    } else {
      console.warn(`  Warning: ${rule} not found`);
    }
  }
  return copiedRules;
}
function updateBiomeJson(rulesDir, rules) {
  const biomeJsonPath = join(process.cwd(), "biome.json");
  const biomejsoncPath = join(process.cwd(), "biome.jsonc");
  let configPath = existsSync(biomeJsonPath) ? biomeJsonPath : existsSync(biomejsoncPath) ? biomejsoncPath : null;
  const pluginPaths = rules.map((rule) => `./${rulesDir}/${rule}`);
  if (configPath) {
    try {
      const content = readFileSync(configPath, "utf-8");
      const jsonContent = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      const config = JSON.parse(jsonContent);
      const existingPlugins = config.plugins || [];
      const newPlugins = [...new Set([...existingPlugins, ...pluginPaths])];
      config.plugins = newPlugins;
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`
Updated: ${configPath}`);
    } catch (error) {
      console.error(`
Error updating ${configPath}:`, error);
      console.log(`
Manually add these plugins to your biome.json:`);
      console.log(JSON.stringify({ plugins: pluginPaths }, null, 2));
    }
  } else {
    const config = {
      $schema: "https://biomejs.dev/schemas/2.0.0/schema.json",
      plugins: pluginPaths,
      linter: {
        enabled: true,
        rules: {
          recommended: true
        }
      }
    };
    writeFileSync(biomeJsonPath, JSON.stringify(config, null, 2));
    console.log(`
Created: ${biomeJsonPath}`);
  }
}
function init(args) {
  let targetDir = "biome-plugins";
  let shouldUpdateBiome = true;
  for (let i = 0;i < args.length; i++) {
    if (args[i] === "--dir" && args[i + 1]) {
      targetDir = args[i + 1];
      i++;
    } else if (args[i] === "--no-update") {
      shouldUpdateBiome = false;
    }
  }
  console.log(`
Installing biome-plugin-react-compiler...
`);
  console.log(`Target directory: ${targetDir}
`);
  const copiedRules = copyRules(targetDir);
  if (copiedRules.length === 0) {
    console.error(`
No rules were copied. Installation failed.`);
    process.exit(1);
  }
  console.log(`
Copied ${copiedRules.length} rules.`);
  if (shouldUpdateBiome) {
    updateBiomeJson(targetDir, copiedRules);
  } else {
    console.log(`
Skipped biome.json update. Add plugins manually:`);
    const pluginPaths = copiedRules.map((rule) => `./${targetDir}/${rule}`);
    console.log(JSON.stringify({ plugins: pluginPaths }, null, 2));
  }
  console.log(`
Done! Run 'biome lint .' to check your code.
`);
}
var args = process.argv.slice(2);
var command = args[0];
switch (command) {
  case "init":
    init(args.slice(1));
    break;
  case "list":
    listRules();
    break;
  case "--help":
  case "-h":
  case undefined:
    printHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
