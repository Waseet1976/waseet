/**
 * PATCH /api/users/password
 * Changer le mot de passe de l'utilisateur connecté.
 * Body : { currentPassword, newPassword }
 */

import { NextRequest, NextResponse } from "next/server";
import { z }                          from "zod";

import { prisma }                                   from "@/lib/prisma";
import { extractBearerToken, verifyToken }          from "@/lib/auth";
import { verifyPassword, hashPassword }             from "@/lib/auth";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword:     z.string()
    .min(8,  "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une lettre majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path:    ["confirmPassword"],
});

export async function PATCH(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps invalide" }, { status: 400 }); }

  const result = passwordSchema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Données invalides", field: issue?.path[0] },
      { status: 422 }
    );
  }

  const { currentPassword, newPassword } = result.data;

  // Récupérer le hash actuel
  const user = await prisma.user.findUnique({
    where:  { id: payload.userId },
    select: { id: true, password: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  // Vérifier le mot de passe actuel
  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json(
      { error: "Mot de passe actuel incorrect", field: "currentPassword" },
      { status: 400 }
    );
  }

  // Vérifier que le nouveau est différent
  const isSame = await verifyPassword(newPassword, user.password);
  if (isSame) {
    return NextResponse.json(
      { error: "Le nouveau mot de passe doit être différent de l'actuel", field: "newPassword" },
      { status: 400 }
    );
  }

  const hashed = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: payload.userId },
    data:  { password: hashed },
  });

  return NextResponse.json({ success: true });
}
