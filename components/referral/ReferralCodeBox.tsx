"use client";

import { useState } from "react";
import { Copy, Check, Share2, Link } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ── Icône WhatsApp (SVG inline) ───────────────────────────────────────────────
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ReferralCodeBoxProps {
  code:       string;
  country?:   string | null;
  firstName?: string;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function ReferralCodeBox({ code, country, firstName }: ReferralCodeBoxProps) {
  const [codeCopied,  setCodeCopied]  = useState(false);
  const [linkCopied,  setLinkCopied]  = useState(false);

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/signup?ref=${code}`;

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const countryLabel = country === "BE" ? "belge" : "marocaine";
    const text = [
      `Rejoignez *Waseet*, la plateforme immobilière ${countryLabel} !`,
      "",
      `Je vous recommande de vous inscrire avec mon code de parrainage :`,
      `*${code}*`,
      "",
      `Lien d'inscription : ${inviteUrl}`,
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-charcoal">

      {/* ── Fond décoratif ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 85% 15%, #C9973A 0%, transparent 45%), " +
            "radial-gradient(circle at 15% 85%, #C9973A20 0%, transparent 40%)",
        }}
      />
      {/* Grille décorative */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,151,58,.4) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(201,151,58,.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Contenu ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 p-6 sm:p-8">

        {/* Titre */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#635BFF]/20 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-[#635BFF]" />
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">
              Parrainage Waseet
            </p>
            <p className="text-white/80 text-xs">
              {firstName ? `Code de ${firstName}` : "Votre code personnel"}
            </p>
          </div>
        </div>

        {/* ── Code en grand ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">
              Code de parrainage
            </p>
            <button
              onClick={copyCode}
              title="Cliquer pour copier"
              className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <span className="text-[#635BFF] font-mono text-3xl sm:text-4xl font-black tracking-[0.15em] drop-shadow-[0_0_20px_rgba(201,151,58,0.4)]">
                {code}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all",
                  codeCopied
                    ? "bg-success/20 text-success"
                    : "bg-white/10 text-white/50 group-hover:bg-[#635BFF]/20 group-hover:text-[#635BFF]"
                )}
              >
                {codeCopied
                  ? <><Check className="w-3 h-3" /> Copié</>
                  : <><Copy className="w-3 h-3" /> Copier</>}
              </span>
            </button>
          </div>
        </div>

        {/* ── URL d'invitation ──────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">
            Lien d'invitation
          </p>
          <div
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 group hover:border-[#635BFF]/30 transition-colors cursor-pointer"
            onClick={copyLink}
            role="button"
            title="Cliquer pour copier"
          >
            <Link className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
            <p className="text-white/50 text-xs font-mono truncate flex-1 group-hover:text-white/70 transition-colors">
              {inviteUrl}
            </p>
            <span
              className={cn(
                "flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-all flex-shrink-0",
                linkCopied
                  ? "bg-success/20 text-success"
                  : "bg-white/10 text-white/40 group-hover:bg-[#635BFF]/20 group-hover:text-[#635BFF]"
              )}
            >
              {linkCopied ? <><Check className="w-2.5 h-2.5" /> Copié</> : <><Copy className="w-2.5 h-2.5" /> Copier</>}
            </span>
          </div>
        </div>

        {/* ── Boutons d'action ──────────────────────────────────────────── */}
        <div className="flex gap-3">
          {/* Copier le lien */}
          <button
            onClick={copyLink}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all",
              linkCopied
                ? "bg-success text-white"
                : "bg-[#635BFF] hover:bg-[#4C45E0] text-obsidian shadow-[0_4px_14px_rgba(201,151,58,0.35)] hover:shadow-[0_4px_20px_rgba(201,151,58,0.5)]"
            )}
          >
            {linkCopied
              ? <><Check className="w-4 h-4" /> Lien copié !</>
              : <><Copy className="w-4 h-4" /> Copier le lien</>}
          </button>

          {/* WhatsApp */}
          <button
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 border border-[#25D366]/30 hover:border-[#25D366]/50 transition-all"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>

        {/* ── Règle de priorité ─────────────────────────────────────────── */}
        <div className="mt-5 pt-5 border-t border-white/10">
          <p className="text-white/35 text-[11px] text-center leading-relaxed">
            Chaque filleul inscrit via votre lien vous rapporte{" "}
            <span className="text-[#635BFF] font-semibold">
              2 500 {country === "BE" ? "EUR" : "MAD"}
            </span>{" "}
            lors de sa première vente conclue.
          </p>
        </div>
      </div>
    </div>
  );
}
