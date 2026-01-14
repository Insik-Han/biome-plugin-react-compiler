#!/usr/bin/env node

const RULES = [
  "no-try-catch-in-render.grit",
  "no-ref-access-in-render.grit",
  "no-prop-mutation.grit",
  "no-props-array-push.grit",
  "no-props-array-pop.grit",
  "no-props-array-splice.grit",
  "no-props-array-sort.grit",
  "no-props-array-reverse.grit",
];

const PACKAGE_PATH = "./node_modules/biome-plugin-react-compiler/rules";

function printHelp() {
  console.log(`
biome-plugin-react-compiler

Usage:
  npx biome-plugin-react-compiler init
  npx biome-plugin-react-compiler list

Commands:
  init    Show plugins config to add to biome.json
  list    List available rules

Examples:
  npx biome-plugin-react-compiler init
  npx biome-plugin-react-compiler list
`);
}

function listRules() {
  console.log("\nAvailable rules:\n");
  for (const rule of RULES) {
    const name = rule.replace(".grit", "");
    console.log(`  - ${name}`);
  }
  console.log("");
}

function init() {
  const pluginPaths = RULES.map((rule) => `${PACKAGE_PATH}/${rule}`);

  console.log(`
Add the following to your biome.json or biome.jsonc:

{
  "plugins": [
${pluginPaths.map((p) => `    "${p}"`).join(",\n")}
  ]
}

Or copy this array if you already have other plugins configured.

Done! Run 'biome lint .' to check your code.
`);
}

// Main
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "init":
    init();
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
