import { NextRequest, NextResponse } from "next/server";
import { prisma }            from "@/lib/prisma";
import { hashPassword, generateToken }   from "@/lib/auth";
import { registerSchema }    from "@/lib/validations/auth";
import { createContact }     from "@/lib/services/ghl.service";

// ── POST /api/auth/register ───────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Parse & validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { email, password, firstName, lastName, phone, country, referralCode } = parsed.data;

  // 2. Email unique
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Cette adresse email est déjà utilisée" },
      { status: 409 }
    );
  }

  // 3. Résoudre le parrain si un code est fourni
  let referrer: { id: string } | null = null;
  if (referralCode) {
    referrer = await prisma.user.findUnique({
      where:  { referralCode },
      select: { id: true },
    });
    // Code inconnu → on ignore silencieusement (pas d'erreur bloquante)
  }

  // 4. Hash du mot de passe
  const hashedPassword = await hashPassword(password);

  // 5. Créer l'utilisateur (role DEAL_FINDER par défaut pour les inscriptions publiques)
  const user = await prisma.user.create({
    data: {
      email,
      password:    hashedPassword,
      firstName,
      lastName,
      phone,
      country,
      role:        "DEAL_FINDER",
      referredById: referrer?.id ?? null,
      // referralCode sera mis à jour juste après avec le format WST-XX####
    },
    select: {
      id:          true,
      email:       true,
      firstName:   true,
      lastName:    true,
      phone:       true,
      country:     true,
      role:        true,
      referralCode: true,
      createdAt:   true,
    },
  });

  // 6. Mettre à jour le referralCode au format WST-{2 lettres}{4 chars id}
  const initials    = firstName.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, "X");
  const idSuffix    = user.id.replace(/[^A-Z0-9]/gi, "").slice(-4).toUpperCase();
  const newRefCode  = `WST-${initials.padEnd(2, "X")}${idSuffix.padEnd(4, "0")}`;

  // En cas de collision rare, on conserve le cuid par défaut
  try {
    await prisma.user.update({
      where: { id: user.id },
      data:  { referralCode: newRefCode },
    });
    user.referralCode = newRefCode;
  } catch {
    // collision sur referralCode → on garde le cuid déjà en place
  }

  // 7. Créer le Referral si parrain trouvé
  if (referrer) {
    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: user.id,
      },
    });
  }

  // 8. Notification de bienvenue
  await prisma.notification.create({
    data: {
      userId:  user.id,
      type:    "WELCOME",
      title:   "Bienvenue sur Waseet ! 🎉",
      message: `Bonjour ${firstName}, votre compte est créé. Partagez votre code ${user.referralCode} pour gagner des bonus.`,
      link:    "/dashboard",
    },
  });

  // 9. GHL — créer un contact (fire-and-forget) ────────────────────────────
  createContact({
    id:        user.id,
    email:     user.email,
    firstName: user.firstName,
    lastName:  user.lastName,
    phone:     user.phone ?? null,
    country:   user.country ?? null,
  }).then(async (contactId) => {
    if (contactId) {
      await prisma.user.update({
        where: { id: user.id },
        data:  { ghlContactId: contactId },
      });
    }
  }).catch(() => {});

  // 10. Générer le token JWT
  const token = generateToken(user.id, user.role);

  return NextResponse.json(
    { user, token },
    { status: 201 }
  );
}
