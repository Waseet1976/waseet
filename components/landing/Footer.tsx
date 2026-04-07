import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-16 pb-8 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Top grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="Waseet logo" className="h-7 w-auto brightness-0 invert" />
              <span className="text-[11px] font-semibold text-[#635BFF] bg-[#635BFF]/20 px-2 py-0.5 rounded-full">
                Immo
              </span>
            </div>
            <p className="text-charcoal-muted text-sm leading-relaxed max-w-xs">
              La plateforme SaaS immobilière complète pour les agents
              et agences en Belgique.
            </p>
            <p className="mt-5 text-xs text-charcoal font-lora italic">
              &ldquo;Simplifier l&apos;immobilier, amplifier vos résultats.&rdquo;
            </p>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-5">
              Plateforme
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Fonctionnalités", href: "#advantages" },
                { label: "Comment ça marche", href: "#how" },
                { label: "Simulateur", href: "#calc" },
                { label: "Sécurité", href: "#securite" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-charcoal-muted hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-5">
              Compte
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Se connecter",     href: "/login"                    },
                { label: "S'inscrire",       href: "/register"                 },
                { label: "Mentions légales", href: "/legal/mentions-legales"   },
                { label: "CGU",              href: "/legal/cgu"                },
                { label: "Confidentialité",  href: "/legal/confidentialite"    },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-charcoal-muted hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-charcoal">
            © {year} Waseet. Tous droits réservés.
          </p>
          <p className="text-xs text-charcoal">
            Plateforme immobilière · Belgique
          </p>
        </div>
      </div>
    </footer>
  );
}
