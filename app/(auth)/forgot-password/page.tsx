"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <img src="/logo.svg" alt="Waseet logo" className="h-12 w-auto" />
        </div>
        <p className="text-sm text-charcoal-muted mt-2">
          Réinitialisez votre mot de passe
        </p>
      </div>

      {/* Card */}
      <div className="bg-white border border-sand-dark rounded-2xl shadow-2xl shadow-black/8 p-8">
        <h1 className="text-2xl font-bold text-black tracking-tight mb-1">Mot de passe oublié</h1>
        <p className="text-sm text-charcoal-muted mb-7">
          Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
        </p>

        {/* Message bientôt disponible */}
        <div className="mb-6 flex items-start gap-3 bg-[#635BFF]/5 border border-[#635BFF]/20 rounded-xl px-4 py-3">
          <span className="text-[#635BFF] mt-0.5 shrink-0">ℹ</span>
          <p className="text-sm text-[#635BFF]">
            Fonctionnalité bientôt disponible. Contactez-nous à{" "}
            <a href="mailto:contact@waseet.be" className="underline font-medium">
              contact@waseet.be
            </a>{" "}
            pour réinitialiser votre mot de passe.
          </p>
        </div>

        <div className="space-y-5">
          <Input
            label="Adresse email"
            type="email"
            icon={<Mail />}
            placeholder="vous@exemple.be"
            autoComplete="email"
            disabled
          />

          <Button
            type="button"
            fullWidth
            size="lg"
            disabled
            className="mt-2 bg-[#635BFF] hover:bg-[#4C45E0] text-white shadow-[#635BFF]/25 opacity-50 cursor-not-allowed"
          >
            Envoyer le lien
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-[#635BFF] hover:text-[#4C45E0] transition-colors font-medium"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
