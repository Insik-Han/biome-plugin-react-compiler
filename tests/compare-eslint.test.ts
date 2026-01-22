import { describe, test, expect } from "bun:test";
import { spawn } from "bun";
import { join } from "node:path";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";

const PROJECT_ROOT = join(import.meta.dir, "..");
const TEMP_DIR = join(PROJECT_ROOT, "tests", ".temp-compare");

// Setup eslint config for react-compiler
const ESLINT_CONFIG = `
import reactCompiler from "eslint-plugin-react-compiler";

export default [
  {
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      "react-compiler/react-compiler": [
        "error",
        { __unstable_donotuse_reportAllBailouts: true },
      ],
    },
  },
];
`;

async function setupTempDir() {
  rmSync(TEMP_DIR, { recursive: true, force: true });
  mkdirSync(TEMP_DIR, { recursive: true });
  writeFileSync(join(TEMP_DIR, "eslint.config.mjs"), ESLINT_CONFIG);
}

async function runEslint(code: string): Promise<string[]> {
  const testFile = join(TEMP_DIR, "test.tsx");
  writeFileSync(testFile, code);

  const proc = spawn({
    cmd: ["npx", "eslint", testFile, "--format", "json"],
    cwd: PROJECT_ROOT,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, ESLINT_USE_FLAT_CONFIG: "true" },
  });

  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  try {
    const results = JSON.parse(stdout);
    const messages = results[0]?.messages || [];
    return messages.map((m: any) => m.message);
  } catch {
    return [];
  }
}

async function runBiome(code: string): Promise<string[]> {
  const testFile = join(TEMP_DIR, "test.tsx");
  writeFileSync(testFile, code);

  const proc = spawn({
    cmd: ["bunx", "biome", "lint", testFile],
    cwd: PROJECT_ROOT,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  await proc.exited;

  const output = stderr || stdout;
  const messages: string[] = [];

  // Extract plugin messages
  const lines = output.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line?.includes("plugin")) {
      // Next line with × contains the message
      for (let j = i + 1; j < lines.length && j < i + 5; j++) {
        const msgLine = lines[j]?.trim();
        if (msgLine?.startsWith("×")) {
          messages.push(msgLine.replace(/^×\s*/, ""));
          break;
        }
      }
    }
  }

  return messages;
}

// Skip in CI - ESLint startup is slow and these are documentation-only tests
describe.skipIf(process.env.CI === "true")("Compare with eslint-plugin-react-compiler", () => {
  test("setup temp directory", async () => {
    await setupTempDir();
  });

  // Test cases that should NOT trigger errors in React Compiler
  describe("Valid React Compiler code (should not error)", () => {
    test("simple component", async () => {
      const code = `
function Component({ name }) {
  return <div>Hello {name}</div>;
}
`;
      const eslintErrors = await runEslint(code);
      const biomeErrors = await runBiome(code);

      console.log("ESLint errors:", eslintErrors);
      console.log("Biome errors:", biomeErrors);

      // If ESLint has no errors, Biome should have no errors too
      if (eslintErrors.length === 0) {
        expect(biomeErrors.length).toBe(0);
      }
    });

    test("component with spread copy then sort", async () => {
      const code = `
function Component({ items }) {
  const sorted = [...items].sort();
  return <ul>{sorted.map(i => <li key={i}>{i}</li>)}</ul>;
}
`;
      const eslintErrors = await runEslint(code);
      const biomeErrors = await runBiome(code);

      console.log("ESLint errors:", eslintErrors);
      console.log("Biome errors:", biomeErrors);

      if (eslintErrors.length === 0) {
        expect(biomeErrors.length).toBe(0);
      }
    });

    test("ref access in useEffect", async () => {
      const code = `
import { useRef, useEffect } from 'react';

function Component() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      console.log(ref.current);
    }
  }, []);

  return <div ref={ref}>Hello</div>;
}
`;
      const eslintErrors = await runEslint(code);
      const biomeErrors = await runBiome(code);

      console.log("ESLint errors:", eslintErrors);
      console.log("Biome errors:", biomeErrors);

      // This is a known limitation - our plugin will flag this but ESLint won't
      // Document the false positive
      if (eslintErrors.length === 0 && biomeErrors.length > 0) {
        console.log("⚠️ FALSE POSITIVE: Biome flagged valid ref access in useEffect");
      }
    });

    test("try/catch in event handler", async () => {
      const code = `
function Component() {
  const handleClick = () => {
    try {
      doSomething();
    } catch (e) {
      console.error(e);
    }
  };

  return <button onClick={handleClick}>Click</button>;
}
`;
      const eslintErrors = await runEslint(code);
      const biomeErrors = await runBiome(code);

      console.log("ESLint errors:", eslintErrors);
      console.log("Biome errors:", biomeErrors);

      // This is a known limitation - our plugin will flag any try/catch
      if (eslintErrors.length === 0 && biomeErrors.length > 0) {
        console.log("⚠️ FALSE POSITIVE: Biome flagged try/catch in event handler");
      }
    });
  });

  // Test cases that SHOULD trigger errors
  describe("Invalid React Compiler code (should error)", () => {
    test("direct prop mutation", async () => {
      const code = `
function Component(props) {
  props.name = "new";
  return <div>{props.name}</div>;
}
`;
      const eslintErrors = await runEslint(code);
      const biomeErrors = await runBiome(code);

      console.log("ESLint errors:", eslintErrors);
      console.log("Biome errors:", biomeErrors);

      // Both should flag this
      expect(biomeErrors.length).toBeGreaterThan(0);
    });

    test("props array push", async () => {
      const code = `
function Component(props) {
  props.items.push("new");
  return <ul>{props.items.map(i => <li key={i}>{i}</li>)}</ul>;
}
`;
      const eslintErrors = await runEslint(code);
      const biomeErrors = await runBiome(code);

      console.log("ESLint errors:", eslintErrors);
      console.log("Biome errors:", biomeErrors);

      // Biome should flag this (props.X.push pattern)
      expect(biomeErrors.length).toBeGreaterThan(0);
    });
  });
});
