/**
 * scripts/seed.ts
 * Initialise la base de données Waseet avec les données de base.
 *
 * Données créées (idempotent — skip si déjà existants) :
 *  - 1 compte ADMIN  : admin@waseet.be
 *  - 2 agences pilotes : Waseet Belgique + Waseet Maroc
 *  - 4 utilisateurs test (1 AGENCY, 1 AGENT, 2 DEAL_FINDER par pays)
 *
 * Usage : npm run db:seed  (ou via setup-db.ts)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

// ── Helpers ────────────────────────────────────────────────────────────────────

async function hash(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function referralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `WST-${code}`;
}

function log(msg: string)  { console.log(`\x1b[36m[seed]\x1b[0m ${msg}`); }
function skip(msg: string) { console.log(`\x1b[33m[seed]\x1b[0m ⟳  ${msg} (déjà existant)`); }
function ok(msg: string)   { console.log(`\x1b[32m[seed]\x1b[0m ✓  ${msg}`); }

// ── Seed principal ────────────────────────────────────────────────────────────

async function main() {
  console.log("\n\x1b[1m=== Waseet — Seed ===\x1b[0m\n");

  // ── 1. Compte ADMIN ─────────────────────────────────────────────────────────
  const adminEmail = "admin@waseet.be";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    skip(`Admin (${adminEmail})`);
  } else {
    await prisma.user.create({
      data: {
        email:        adminEmail,
        password:     await hash("WaseetAdmin2024!"),
        firstName:    "Admin",
        lastName:     "Waseet",
        role:         "ADMIN",
        referralCode: "WST-ADMIN",
        country:      "BE",
        isActive:     true,
      },
    });
    ok(`Admin créé : ${adminEmail}`);
  }

  // ── 2. Agence Belgique ───────────────────────────────────────────────────────
  let agencyBE = await prisma.agency.findFirst({ where: { email: "contact@waseet.be" } });
  if (agencyBE) {
    skip("Agence Waseet Belgique");
  } else {
    agencyBE = await prisma.agency.create({
      data: {
        name:           "Waseet Belgique",
        email:          "contact@waseet.be",
        phone:          "+32 2 000 00 00",
        city:           "Bruxelles",
        country:        "BE",
        commissionRate: 2.5,
        apporteurShare: 40,
        isActive:       true,
      },
    });
    ok(`Agence créée : Waseet Belgique (${agencyBE.id})`);
  }

  // ── 3. Agence Maroc ──────────────────────────────────────────────────────────
  let agencyMA = await prisma.agency.findFirst({ where: { email: "contact@waseet.ma" } });
  if (agencyMA) {
    skip("Agence Waseet Maroc");
  } else {
    agencyMA = await prisma.agency.create({
      data: {
        name:           "Waseet Maroc",
        email:          "contact@waseet.ma",
        phone:          "+212 5 00 00 00 00",
        city:           "Casablanca",
        country:        "MA",
        commissionRate: 2.5,
        apporteurShare: 40,
        isActive:       true,
      },
    });
    ok(`Agence créée : Waseet Maroc (${agencyMA.id})`);
  }

  // ── 4. Utilisateur AGENCY Belgique ───────────────────────────────────────────
  const agencyUserBE = "agence.be@waseet.be";
  if (await prisma.user.findUnique({ where: { email: agencyUserBE } })) {
    skip(`Utilisateur agence BE (${agencyUserBE})`);
  } else {
    await prisma.user.create({
      data: {
        email:        agencyUserBE,
        password:     await hash("Agence2024!"),
        firstName:    "Sophie",
        lastName:     "Dupont",
        role:         "AGENCY",
        referralCode: referralCode(),
        country:      "BE",
        agencyId:     agencyBE.id,
        isActive:     true,
      },
    });
    ok(`Utilisateur AGENCY BE : ${agencyUserBE}`);
  }

  // ── 5. Utilisateur AGENCY Maroc ──────────────────────────────────────────────
  const agencyUserMA = "agence.ma@waseet.ma";
  if (await prisma.user.findUnique({ where: { email: agencyUserMA } })) {
    skip(`Utilisateur agence MA (${agencyUserMA})`);
  } else {
    await prisma.user.create({
      data: {
        email:        agencyUserMA,
        password:     await hash("Agence2024!"),
        firstName:    "Youssef",
        lastName:     "Benali",
        role:         "AGENCY",
        referralCode: referralCode(),
        country:      "MA",
        agencyId:     agencyMA.id,
        isActive:     true,
      },
    });
    ok(`Utilisateur AGENCY MA : ${agencyUserMA}`);
  }

  // ── 6. Apporteur BE (DEAL_FINDER) ─────────────────────────────────────────
  const apporteurBE = "apporteur.be@test.com";
  if (await prisma.user.findUnique({ where: { email: apporteurBE } })) {
    skip(`Apporteur BE (${apporteurBE})`);
  } else {
    await prisma.user.create({
      data: {
        email:        apporteurBE,
        password:     await hash("Apporteur2024!"),
        firstName:    "Lucas",
        lastName:     "Martin",
        role:         "DEAL_FINDER",
        referralCode: referralCode(),
        country:      "BE",
        agencyId:     agencyBE.id,
        isActive:     true,
      },
    });
    ok(`Apporteur BE : ${apporteurBE}`);
  }

  // ── 7. Apporteur MA (DEAL_FINDER) ─────────────────────────────────────────
  const apporteurMA = "apporteur.ma@test.com";
  if (await prisma.user.findUnique({ where: { email: apporteurMA } })) {
    skip(`Apporteur MA (${apporteurMA})`);
  } else {
    await prisma.user.create({
      data: {
        email:        apporteurMA,
        password:     await hash("Apporteur2024!"),
        firstName:    "Mehdi",
        lastName:     "Alaoui",
        role:         "DEAL_FINDER",
        referralCode: referralCode(),
        country:      "MA",
        agencyId:     agencyMA.id,
        isActive:     true,
      },
    });
    ok(`Apporteur MA : ${apporteurMA}`);
  }

  // ── 8. Résumé ──────────────────────────────────────────────────────────────
  const counts = {
    users:    await prisma.user.count(),
    agencies: await prisma.agency.count(),
  };

  console.log("\n\x1b[1m=== Résumé ===\x1b[0m");
  console.log(`  Utilisateurs : ${counts.users}`);
  console.log(`  Agences      : ${counts.agencies}`);

  console.log("\n\x1b[1mComptes de test :\x1b[0m");
  console.log("  Admin     : admin@waseet.be        / WaseetAdmin2024!");
  console.log("  Agence BE : agence.be@waseet.be    / Agence2024!");
  console.log("  Agence MA : agence.ma@waseet.ma    / Agence2024!");
  console.log("  Apporteur : apporteur.be@test.com  / Apporteur2024!");
  console.log("  Apporteur : apporteur.ma@test.com  / Apporteur2024!\n");

  console.log("\x1b[1m\x1b[32mVilles disponibles pour les biens :\x1b[0m");
  console.log("  🇧🇪 BE : Bruxelles, Liège, Anvers, Gand, Namur, Louvain, Bruges");
  console.log("  🇲🇦 MA : Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès\n");

  console.log("\x1b[1m\x1b[32mTypes de biens disponibles :\x1b[0m");
  console.log("  APARTMENT, HOUSE, VILLA, LAND, COMMERCIAL, OFFICE, WAREHOUSE, OTHER\n");
}

main()
  .catch((e) => {
    console.error("\x1b[31m[seed] ERREUR :\x1b[0m", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
