import { ArrowRight, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-28 pb-20 px-5 sm:px-8 bg-sand-light">
      <div className="max-w-5xl mx-auto text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#635BFF]/10 text-[#635BFF] text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-[#635BFF]/20">
          <Star className="w-3 h-3 fill-current" />
          Déclarez · Suivez · Touchez votre commission
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold text-black leading-[1.12] mb-6 tracking-tight">
          Vous connaissez un bien à vendre ?
          <br />
          <span className="font-lora italic text-[#635BFF]">Transformez cette information en opportunité.</span>
        </h1>

        {/* Sub */}
        <p className="text-lg text-charcoal-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Déclarez un bien en quelques secondes. Votre apport est enregistré, horodaté et suivi.
          Une commission est prévue si la vente se réalise.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#635BFF] hover:bg-[#4C45E0] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#635BFF]/25 hover:shadow-[#635BFF]/40"
          >
            Créer un compte <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-white border border-sand-dark text-black text-sm font-semibold rounded-xl hover:bg-sand-light transition-colors"
          >
            Se connecter
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 text-center">
          {[
            { value: "500+",   label: "Apporteurs actifs" },
            { value: "2 000+", label: "Déclarations enregistrées" },
            { value: "7",      label: "Étapes de suivi" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-black">{s.value}</p>
              <p className="text-sm text-charcoal-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Dashboard preview ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto mt-16">
        <div className="rounded-2xl overflow-hidden border border-[#ddd8d0] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.20)]">

          {/* Browser bar */}
          <div className="bg-[#eeebe6] flex items-center gap-3 px-4 py-2.5 border-b border-[#ddd8d0]">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4cfc6]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4cfc6]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4cfc6]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[#ddd8d0] rounded-md px-3 py-1 max-w-xs w-full">
                {/* lock icon */}
                <svg className="w-3 h-3 text-[#635BFF] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[11px] text-[#a09890] font-medium tracking-wide">app.waseet.be/dashboard</span>
              </div>
            </div>
          </div>

          {/* App shell: sidebar + main */}
          <div className="flex h-[340px] sm:h-[380px]">

            {/* ── Sidebar dark ─────────────────────────────────────── */}
            <div className="w-12 sm:w-52 bg-[#14122a] shrink-0 flex flex-col">

              {/* Logo */}
              <div className="flex items-center gap-2.5 px-3 sm:px-4 py-3.5 border-b border-white/[0.07]">
                <div className="w-7 h-7 rounded-lg bg-[#635BFF] flex items-center justify-center shrink-0 shadow-lg shadow-[#635BFF]/40">
                  <span className="text-white text-[11px] font-extrabold tracking-tight">W</span>
                </div>
                <span className="hidden sm:block text-white text-[13px] font-semibold tracking-tight">Waseet</span>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
                {[
                  {
                    label: "Tableau de bord",
                    active: true,
                    icon: (
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                    ),
                  },
                  {
                    label: "Mes déclarations",
                    active: false,
                    icon: (
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    ),
                  },
                  {
                    label: "Pipeline",
                    active: false,
                    icon: (
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    ),
                  },
                  {
                    label: "Notifications",
                    active: false,
                    icon: (
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-2 sm:px-3 py-2 rounded-lg transition-colors ${
                      item.active
                        ? "bg-[#635BFF]/20 text-[#9b97ff]"
                        : "text-[#5a5575]"
                    }`}
                  >
                    {item.icon}
                    <span className="hidden sm:block text-[12px] font-medium">{item.label}</span>
                  </div>
                ))}
              </nav>

              {/* User avatar */}
              <div className="px-3 sm:px-4 py-3 border-t border-white/[0.07] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#635BFF] to-[#a78bfa] shrink-0" />
                <div className="hidden sm:block min-w-0">
                  <p className="text-[11px] font-semibold text-white/75 truncate">Hicham A.</p>
                  <p className="text-[10px] text-[#5a5575]">Apporteur</p>
                </div>
              </div>
            </div>

            {/* ── Main content ─────────────────────────────────────── */}
            <div className="flex-1 bg-[#f7f5f2] flex flex-col min-w-0 overflow-hidden">

              {/* Top bar */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-white border-b border-[#ede9e3] shrink-0">
                <div>
                  <p className="text-[13px] font-semibold text-[#1a1916]">Tableau de bord</p>
                  <p className="text-[10px] text-[#a09890] mt-0.5">Avril 2026</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* notification dot */}
                  <div className="relative w-7 h-7 rounded-lg bg-[#f3f0eb] border border-[#e8e3dc] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#635BFF]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#635BFF] border border-white" />
                  </div>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-hidden p-3 sm:p-5 flex flex-col gap-3">

                {/* KPI row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    {
                      label:  "Déclarations",
                      val:    "47",
                      trend:  "+12 ce mois",
                      accent: "#635BFF",
                      pill:   "bg-[#635BFF]/10 text-[#635BFF]",
                    },
                    {
                      label:  "En cours",
                      val:    "12",
                      trend:  "3 prioritaires",
                      accent: "#D97706",
                      pill:   "bg-amber-100 text-amber-700",
                    },
                    {
                      label:  "Commissions",
                      val:    "8",
                      trend:  "versées",
                      accent: "#059669",
                      pill:   "bg-emerald-100 text-emerald-700",
                    },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="bg-white rounded-xl border border-[#ede9e3] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] sm:text-[11px] text-[#a09890] font-medium truncate">{c.label}</p>
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${c.accent}18` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.accent }} />
                        </div>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-[#1a1916] leading-none mb-2">{c.val}</p>
                      <span className={`inline-flex items-center text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.pill}`}>
                        {c.trend}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Opportunités */}
                <div className="bg-white rounded-xl border border-[#ede9e3] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex-1">
                  <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-[#f3f0eb]">
                    <p className="text-[11px] sm:text-[12px] font-semibold text-[#1a1916]">Opportunités récentes</p>
                    <span className="text-[10px] text-[#635BFF] font-semibold">Voir tout</span>
                  </div>

                  {[
                    {
                      ref:   "WS-2025-001",
                      type:  "Appartement",
                      city:  "Bruxelles",
                      stage: "Mandat signé",
                      badge: "bg-[#635BFF]/10 text-[#635BFF]",
                      icon:  "A",
                    },
                    {
                      ref:   "WS-2025-002",
                      type:  "Villa",
                      city:  "Liège",
                      stage: "Compromis signé",
                      badge: "bg-amber-50 text-amber-700",
                      icon:  "V",
                    },
                    {
                      ref:   "WS-2025-003",
                      type:  "Terrain",
                      city:  "Gand",
                      stage: "En vérification",
                      badge: "bg-[#f3f0eb] text-[#a09890]",
                      icon:  "T",
                    },
                  ].map((row, i, arr) => (
                    <div
                      key={row.ref}
                      className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 ${
                        i < arr.length - 1 ? "border-b border-[#f7f4f0]" : ""
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#f3f0eb] border border-[#e8e3dc] flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#635BFF]">{row.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] sm:text-[12px] font-semibold text-[#1a1916] truncate">
                          {row.type} <span className="text-[#c8c2b8] font-normal">·</span> {row.city}
                        </p>
                        <p className="text-[9px] sm:text-[10px] font-mono text-[#a09890]">{row.ref}</p>
                      </div>
                      <span className={`shrink-0 text-[9px] sm:text-[10px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${row.badge}`}>
                        {row.stage}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
