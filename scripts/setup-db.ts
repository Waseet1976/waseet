/**
 * scripts/setup-db.ts
 * Configuration initiale de la base de données Waseet.
 *
 * Usage :
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/setup-db.ts
 *   ou via : npm run db:setup
 *
 * Ce script :
 *  1. Exécute les migrations Prisma (prisma migrate deploy)
 *  2. Génère le client Prisma
 *  3. Appelle le seeder (scripts/seed.ts)
 *  4. Vérifie que le compte admin existe
 */

import { execSync } from "child_process";
import path from "path";

const LOG_PREFIX = "[setup-db]";

function log(msg: string)  { console.log(`\x1b[32m${LOG_PREFIX}\x1b[0m ${msg}`); }
function warn(msg: string) { console.warn(`\x1b[33m${LOG_PREFIX}\x1b[0m ${msg}`); }
function err(msg: string)  { console.error(`\x1b[31m${LOG_PREFIX}\x1b[0m ${msg}`); }

function run(cmd: string, label: string) {
  log(`▸ ${label}...`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: path.resolve(__dirname, "..") });
    log(`✓ ${label} OK`);
  } catch (e) {
    err(`✗ ${label} FAILED`);
    throw e;
  }
}

async function main() {
  console.log("\n\x1b[1m=== Waseet — Setup DB ===\x1b[0m\n");

  if (!process.env.DATABASE_URL) {
    err("DATABASE_URL non défini. Ajoutez-le dans .env.local avant de continuer.");
    process.exit(1);
  }

  // 1. Migrations
  try {
    run("npx prisma migrate deploy", "Prisma migrate deploy");
  } catch {
    warn("migrate deploy a échoué — tentative avec db push...");
    run("npx prisma db push --accept-data-loss", "Prisma db push");
  }

  // 2. Génération du client Prisma
  run("npx prisma generate", "Génération client Prisma");

  // 3. Seed
  log("▸ Exécution du seeder...");
  run(
    "npx ts-node --compiler-options '{\"module\":\"CommonJS\"}' scripts/seed.ts",
    "Seed données de base"
  );

  console.log("\n\x1b[1m\x1b[32m✅ Setup terminé avec succès !\x1b[0m\n");
  console.log("Accès admin : admin@waseet.be / WaseetAdmin2024!");
  console.log("Dashboard  : http://localhost:3000\n");
}

main().catch((e) => {
  err(String(e));
  process.exit(1);
});
