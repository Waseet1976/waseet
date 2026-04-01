import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL    = "admin@waseet.be";
const ADMIN_PASSWORD = "Admin2024!";
const ADMIN_FIRST    = "Admin";
const ADMIN_LAST     = "Waseet";

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where:  { email: ADMIN_EMAIL },
    update: { password: hash, firstName: ADMIN_FIRST, lastName: ADMIN_LAST, role: "ADMIN", isActive: true },
    create: {
      email:     ADMIN_EMAIL,
      password:  hash,
      firstName: ADMIN_FIRST,
      lastName:  ADMIN_LAST,
      role:      "ADMIN",
      isActive:  true,
    },
  });

  console.log(`✓ Admin créé/mis à jour : ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
