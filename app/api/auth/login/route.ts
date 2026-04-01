import { NextRequest, NextResponse } from "next/server";
import { prisma }                        from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { loginSchema }                   from "@/lib/validations/auth";

// Même message pour "email inconnu" et "mauvais mdp" → anti-énumération
const AUTH_ERROR = "Email ou mot de passe incorrect";

// ── POST /api/auth/login ──────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Parse & validate
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { email, password } = parsed.data;

  // 2. Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where:  { email },
    select: {
      id:           true,
      email:        true,
      password:     true,   // hash — jamais renvoyé au client
      firstName:    true,
      lastName:     true,
      phone:        true,
      country:      true,
      role:         true,
      isActive:     true,
      referralCode: true,
      agencyId:     true,
      createdAt:    true,
    },
  });

  // 3. Vérifier existence + mot de passe (même timing intentionnel)
  const passwordOk = user
    ? await verifyPassword(password, user.password)
    : await verifyPassword(password, "$2b$12$invalidhashtopreventtimingattack00000000000");

  if (!user || !passwordOk) {
    return NextResponse.json({ error: AUTH_ERROR }, { status: 401 });
  }

  // 4. Compte désactivé
  if (!user.isActive) {
    return NextResponse.json(
      { error: "Votre compte a été désactivé. Contactez le support." },
      { status: 403 }
    );
  }

  // 5. Générer le token JWT
  const token = generateToken(user.id, user.role);

  // 6. Retourner user sans le hash
  const { password: _pwd, ...safeUser } = user;

  return NextResponse.json({ user: safeUser, token, role: user.role });
}
