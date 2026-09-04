#!/usr/bin/env node
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const root = path.resolve(__dirname, "..");
const lockPath = path.join(os.tmpdir(), "loja-gemape-git-sync.lock");
const PROTECTED_BRANCHES = ["main", "master"];
const WORK_BRANCH = "desenvolvimento";

function git(args, opts = {}) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  }).trim();
}

function log(msg) {
  process.stderr.write(`[git-sync] ${msg}\n`);
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

function buildSummary() {
  const lines = [];
  lines.push("===== RESUMO DAS ALTERACOES =====");
  try {
    const status = git(["status", "--short"]);
    if (status) {
      lines.push("Arquivos modificados:");
      lines.push(status);
    }
    const staged = git(["diff", "--cached", "--stat"]);
    if (staged) {
      lines.push("");
      lines.push("Stat dos arquivos staged:");
      lines.push(staged);
    }
    const names = git(["diff", "--cached", "--name-only"]);
    if (names) {
      lines.push("");
      lines.push("Lista de arquivos:");
      lines.push(names.split("\n").map(n => `  - ${n}`).join("\n"));
    }
  } catch (e) {}
  lines.push("==================================");
  return lines.join("\n");
}

function detectRiskyChanges(files) {
  const riskyPatterns = [
    /checkout/i,
    /cart/i,
    /product\.liquid/i,
    /product-template\.liquid/i,
    /collection/i,
    /price/i,
    /header/i,
    /footer/i,
    /navigation/i,
    /menu/i,
    /settings_data/i,
    /settings_schema/i,
  ];
  const risky = files.filter(f => riskyPatterns.some(p => p.test(f)));
  return risky;
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
    try { fs.unlinkSync(lockPath); } catch {}
    return;
  }

  try {
    const currentBranch = git(["rev-parse", "--abbrev-ref", "HEAD"]);

    if (PROTECTED_BRANCHES.includes(currentBranch)) {
      log(`ERRO CRITICO: Voce esta na branch protegida '${currentBranch}'.`);
      log(`Toda modificacao deve ser feita na branch '${WORK_BRANCH}'.`);
      log(`Execute: git checkout ${WORK_BRANCH}`);
      process.exitCode = 1;
      return;
    }

    if (currentBranch !== WORK_BRANCH) {
      log(`AVISO: Branch atual '${currentBranch}' nao e '${WORK_BRANCH}'.`);
      log(`Trocando automaticamente para '${WORK_BRANCH}'...`);
      try {
        git(["stash", "--include-untracked"]);
      } catch {}
      try {
        git(["checkout", WORK_BRANCH]);
      } catch {
        try { git(["checkout", "-b", WORK_BRANCH]); } catch {}
      }
      try {
        git(["stash", "pop"]);
      } catch {}
      const newBranch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
      if (newBranch !== WORK_BRANCH) {
        log(`ERRO: Nao foi possivel mudar para '${WORK_BRANCH}'. Abortando.`);
        process.exitCode = 1;
        return;
      }
      log(`Agora na branch: ${WORK_BRANCH}`);
    }

    git(["add", "-A"]);
    const status = git(["status", "--porcelain"]);
    if (!status) {
      return;
    }

    const changedFiles = git(["diff", "--cached", "--name-only"]).split("\n").filter(Boolean);

    const summary = buildSummary();
    log("\n" + summary + "\n");

    const riskyFiles = detectRiskyChanges(changedFiles);
    if (riskyFiles.length > 0) {
      log("ATENCAO: Arquivos sensiveis detectados (checkout, carrinho, produtos, precos, navegacao):");
      riskyFiles.forEach(f => log(`  -> ${f}`));
    }

    const commitMsg = `chore: auto-sync ${stamp()}`;
    log(`Commitando com mensagem: "${commitMsg}"`);
    git(["commit", "-m", commitMsg], {
      env: { ...process.env, GIT_SYNC_SKIP: "1" },
    });
    log("Commit realizado com sucesso.");

    const finalBranch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
    if (PROTECTED_BRANCHES.includes(finalBranch)) {
      log(`ERRO CRITICO: Bloqueado push para branch protegida '${finalBranch}'.`);
      log(`O commit foi feito mas NAO sera enviado. Mova para '${WORK_BRANCH}'.`);
      process.exitCode = 1;
      return;
    }

    log(`Fazendo push para: origin ${finalBranch}`);
    const push = spawnSync("git", ["push", "-u", "origin", finalBranch], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, GIT_SYNC_SKIP: "1" },
    });
    if (push.status !== 0) {
      process.stderr.write(push.stderr || push.stdout || "git push failed\n");
      process.exitCode = push.status || 1;
    } else {
      log(`Push concluido com sucesso para origin/${finalBranch}.`);
    }
  } finally {
    try { fs.unlinkSync(lockPath); } catch {}
  }
}

main().catch((err) => {
  process.stderr.write(String(err && err.message ? err.message : err) + "\n");
  process.exitCode = 1;
});
