import { spawn } from "bun";
import { join } from "node:path";

export interface BiomeDiagnostic {
  category: string;
  severity: string;
  message: string;
  location: {
    path: string;
    line: number;
    column: number;
  };
}

export interface LintResult {
  diagnostics: BiomeDiagnostic[];
  pluginDiagnostics: BiomeDiagnostic[];
}

export async function runBiomeLint(filePath: string): Promise<LintResult> {
  const projectRoot = join(import.meta.dir, "..");
  const absolutePath = join(projectRoot, filePath);

  const proc = spawn({
    cmd: ["bunx", "biome", "lint", "--reporter=json", absolutePath],
    cwd: projectRoot,
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  await proc.exited;

  const diagnostics: BiomeDiagnostic[] = [];

  // Parse JSON output (Biome outputs JSON lines)
  const lines = stdout.split("\n").filter((line) => line.trim());
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.diagnostics) {
        for (const diag of parsed.diagnostics) {
          diagnostics.push({
            category: diag.category || "unknown",
            severity: diag.severity || "error",
            message: diag.description || diag.message || "",
            location: {
              path: diag.location?.path?.file || filePath,
              line: diag.location?.span?.start?.line || 0,
              column: diag.location?.span?.start?.character || 0,
            },
          });
        }
      }
    } catch {
      // Skip non-JSON lines
    }
  }

  // Filter plugin diagnostics
  const pluginDiagnostics = diagnostics.filter(
    (d) => d.category === "plugin" || d.category.includes("plugin")
  );

  return { diagnostics, pluginDiagnostics };
}

export function expectPluginDiagnostics(
  result: LintResult,
  expectedCount: number,
  messageContains?: string
) {
  const count = result.pluginDiagnostics.length;
  if (count !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} plugin diagnostics, got ${count}.\n` +
        `Diagnostics: ${JSON.stringify(result.pluginDiagnostics, null, 2)}`
    );
  }

  if (messageContains) {
    const hasMessage = result.pluginDiagnostics.some((d) =>
      d.message.toLowerCase().includes(messageContains.toLowerCase())
    );
    if (!hasMessage) {
      throw new Error(
        `Expected diagnostic message to contain "${messageContains}".\n` +
          `Actual messages: ${result.pluginDiagnostics.map((d) => d.message).join(", ")}`
      );
    }
  }
}

export function expectNoPluginDiagnostics(result: LintResult) {
  if (result.pluginDiagnostics.length > 0) {
    throw new Error(
      `Expected no plugin diagnostics, got ${result.pluginDiagnostics.length}.\n` +
        `Diagnostics: ${JSON.stringify(result.pluginDiagnostics, null, 2)}`
    );
  }
}
