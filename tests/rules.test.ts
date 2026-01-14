import { describe, test, expect } from "bun:test";
import { spawn } from "bun";
import { join } from "node:path";

const PROJECT_ROOT = join(import.meta.dir, "..");

interface PluginDiagnostic {
  file: string;
  line: number;
  message: string;
}

async function runBiomeLint(relativePath: string): Promise<PluginDiagnostic[]> {
  const absolutePath = join(PROJECT_ROOT, relativePath);

  const proc = spawn({
    cmd: ["bunx", "biome", "lint", absolutePath],
    cwd: PROJECT_ROOT,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  await proc.exited;

  // Biome outputs diagnostics to stderr
  const output = stderr || stdout;

  // Parse plugin diagnostics from output
  const diagnostics: PluginDiagnostic[] = [];
  const lines = output.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match pattern: "path:line:col plugin"
    const match = line.match(/^(.+):(\d+):(\d+)\s+plugin/);
    if (match) {
      // Next non-empty line after diagnostic header contains the message
      let message = "";
      for (let j = i + 1; j < lines.length; j++) {
        const msgLine = lines[j].trim();
        if (msgLine.startsWith("×") || msgLine.startsWith("✖")) {
          message = msgLine.replace(/^[×✖]\s*/, "");
          break;
        }
      }
      diagnostics.push({
        file: match[1],
        line: parseInt(match[2], 10),
        message,
      });
    }
  }

  return diagnostics;
}

describe("no-prop-mutation", () => {
  test("detects direct prop assignment", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-prop-mutation/invalid.tsx"
    );
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
    expect(diagnostics.some((d) => d.message.includes("mutate") || d.message.includes("props"))).toBe(true);
  });

  test("does not flag valid immutable prop usage", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-prop-mutation/valid.tsx"
    );
    expect(diagnostics.length).toBe(0);
  });
});

describe("no-props-array-push", () => {
  test("detects props.array.push()", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-props-array-push/invalid.tsx"
    );
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
    expect(diagnostics.some((d) => d.message.includes("push"))).toBe(true);
  });

  test("does not flag spread operator usage", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-props-array-push/valid.tsx"
    );
    expect(diagnostics.length).toBe(0);
  });
});

describe("no-props-array-pop", () => {
  test("detects props.array.pop()", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-props-array-pop/invalid.tsx"
    );
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
    expect(diagnostics.some((d) => d.message.includes("pop"))).toBe(true);
  });

  test("does not flag slice usage", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-props-array-pop/valid.tsx"
    );
    expect(diagnostics.length).toBe(0);
  });
});

describe("no-props-array-splice", () => {
  test("detects props.array.splice()", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-props-array-splice/invalid.tsx"
    );
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
    expect(diagnostics.some((d) => d.message.includes("splice"))).toBe(true);
  });

  test("does not flag filter usage", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-props-array-splice/valid.tsx"
    );
    expect(diagnostics.length).toBe(0);
  });
});

describe("no-props-array-sort", () => {
  test("detects props.array.sort()", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-props-array-sort/invalid.tsx"
    );
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
    expect(diagnostics.some((d) => d.message.includes("sort"))).toBe(true);
  });

  test("does not flag spread then sort", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-props-array-sort/valid.tsx"
    );
    expect(diagnostics.length).toBe(0);
  });
});

describe("no-props-array-reverse", () => {
  test("detects props.array.reverse()", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-props-array-reverse/invalid.tsx"
    );
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
    expect(diagnostics.some((d) => d.message.includes("reverse"))).toBe(true);
  });

  test("does not flag spread then reverse", async () => {
    const diagnostics = await runBiomeLint(
      "tests/fixtures/no-props-array-reverse/valid.tsx"
    );
    expect(diagnostics.length).toBe(0);
  });
});
