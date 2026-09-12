// Next.js's `output: "export"` (used for the Capacitor/Android build, see
// capacitor.config.ts webDir: "out") can't include dynamic Route Handlers — Next
// requires a route's `dynamic` config to be a literal string it can statically
// analyze, so there's no way to conditionally disable a route based on BUILD_TARGET
// from inside the route file itself. Instead, this script removes src/app/api for the
// duration of the mobile build (those routes, e.g. TikTok OAuth, are web-only anyway —
// see src/app/api/tiktok/authorize/route.ts) and always restores it afterward, even if
// the build fails.
//
// This copies-then-deletes rather than renaming in place: on Windows, renaming this
// specific directory reliably hit EPERM/"Access is denied" while a dev server or
// editor had any file inside it open (a rename needs an exclusive lock on the parent
// directory entry; copy + delete does not).

import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const apiDir = "src/app/api";
const hadApiDir = existsSync(apiDir);
const backupDir = hadApiDir ? join(mkdtempSync(join(tmpdir(), "clippifi-api-backup-")), "api") : null;

if (hadApiDir && backupDir) {
  cpSync(apiDir, backupDir, { recursive: true });
  rmSync(apiDir, { recursive: true, force: true });
}

let exitCode = 0;
try {
  const result = spawnSync("next", ["build"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, BUILD_TARGET: "mobile" },
  });
  exitCode = result.status ?? 1;
} finally {
  if (hadApiDir && backupDir) {
    cpSync(backupDir, apiDir, { recursive: true });
    rmSync(join(backupDir, ".."), { recursive: true, force: true });
  }
}

process.exit(exitCode);
