import { spawn } from "node:child_process";
import http from "node:http";
import { join } from "node:path";

const cwd = process.cwd();
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const playwrightCommand = join(cwd, "node_modules", ".bin", isWindows ? "playwright.cmd" : "playwright");
const server = spawn(isWindows ? "cmd.exe" : npmCommand, isWindows
  ? ["/d", "/c", `${npmCommand} run dev -- --host 127.0.0.1 --port 4173`]
  : ["run", "dev", "--", "--host", "127.0.0.1", "--port", "4173"], { cwd, stdio: "inherit" });

function stopServer() {
  if (!server.pid) return;
  if (isWindows) spawn("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore" });
  else server.kill("SIGTERM");
}

function waitForServer(attempt = 0) {
  return new Promise((resolve, reject) => {
    const request = http.get("http://127.0.0.1:4173/", (response) => {
      response.resume();
      if ((response.statusCode ?? 500) < 500) resolve();
      else reject(new Error(`Dev server returned HTTP ${response.statusCode}`));
    });
    request.on("error", () => {
      if (attempt >= 60) reject(new Error("Timed out waiting for the E2E dev server."));
      else setTimeout(() => waitForServer(attempt + 1).then(resolve, reject), 250);
    });
    request.setTimeout(1000, () => request.destroy());
  });
}

try {
  await waitForServer();
  const testArgs = isWindows
    ? ["/d", "/c", `node_modules\\.bin\\playwright.cmd test ${process.argv.slice(2).join(" ")}`]
    : ["test", ...process.argv.slice(2)];
  const test = spawn(isWindows ? "cmd.exe" : playwrightCommand, testArgs, { cwd, stdio: "inherit" });
  const [code, signal] = await new Promise((resolve) => test.on("exit", (exitCode, exitSignal) => resolve([exitCode, exitSignal])));
  stopServer();
  process.exit(code ?? (signal ? 1 : 0));
} catch (error) {
  stopServer();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
