#!/usr/bin/env node
/**
 * Adds, commits and pushes local theme changes to the tracked GitHub branch.
 * Safe to run repeatedly: no-ops when the working tree is clean.
 */
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const root = path.resolve(__dirname, "..");
const lockPath = path.join(os.tmpdir(), "loja-gemape-git-sync.lock");

function git(args, opts = {}) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  }).trim();
}

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isLocked() {
  try {
    const ageMs = Date.now() - fs.statSync(lockPath).mtimeMs;
    if (ageMs < 15000) return true;
  } catch {
    return false;
  }
  return false;
}

function drainStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve();
      return;
    }
    process.stdin.resume();
    process.stdin.on("data", () => {});
    process.stdin.on("end", resolve);
    setTimeout(resolve, 500);
  });
}

async function main() {
  await drainStdin();
  process.stdout.write("{}\n");

  if (process.env.GIT_SYNC_SKIP === "1") return;

  if (isLocked()) return;
  fs.writeFileSync(lockPath, String(process.pid));

  try {
    git(["rev-parse", "--is-inside-work-tree"]);
  } catch {
    try {
      fs.unlinkSync(lockPath);
    } catch {
      /* ignore */
    }
    return;
  }

  try {
    git(["add", "-A"]);
    const status = git(["status", "--porcelain"]);
    if (!status) return;

    const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
    git(["commit", "-m", `chore: auto-sync ${stamp()}`], {
      env: { ...process.env, GIT_SYNC_SKIP: "1" },
    });

    const push = spawnSync("git", ["push", "-u", "origin", branch], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, GIT_SYNC_SKIP: "1" },
    });
    if (push.status !== 0) {
      process.stderr.write(push.stderr || push.stdout || "git push failed\n");
      process.exitCode = push.status || 1;
    }
  } finally {
    try {
      fs.unlinkSync(lockPath);
    } catch {
      /* ignore */
    }
  }
}

main();
