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

      {/* ── Dashboard preview ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto mt-16">
        <div className="rounded-2xl border border-[#e8e4de] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.13)] overflow-hidden">

          {/* Browser chrome */}
          <div className="bg-[#f3f1ee] border-b border-[#e8e4de] px-4 py-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#d9d4cc]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#d9d4cc]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#d9d4cc]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-[#e8e4de] w-full max-w-xs">
                <svg className="w-3 h-3 text-[#635BFF] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[11px] text-[#9d9890] font-medium">app.waseet.be/dashboard</span>
              </div>
            </div>
          </div>

          {/* Dashboard body */}
          <div className="bg-[#faf9f7] p-5 sm:p-7">

            {/* Dashboard header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[13px] font-semibold text-[#1a1916]">Vue d'ensemble</p>
                <p className="text-[11px] text-[#9d9890] mt-0.5">Avril 2025</p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#635BFF]/10 text-[#635BFF] text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[#635BFF]/15">
                <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF] animate-pulse inline-block" />
                En direct
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                {
                  label:   "Déclarations reçues",
                  val:     "47",
                  trend:   "+12 ce mois",
                  tColor:  "text-[#635BFF]",
                  bgTrend: "bg-[#635BFF]/8",
                },
                {
                  label:   "Dossiers en cours",
                  val:     "12",
                  trend:   "3 prioritaires",
                  tColor:  "text-amber-600",
                  bgTrend: "bg-amber-50",
                },
                {
                  label:   "Commissions versées",
                  val:     "8",
                  trend:   "sur 12 clôturés",
                  tColor:  "text-emerald-600",
                  bgTrend: "bg-emerald-50",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="bg-white rounded-xl border border-[#ede9e3] p-3 sm:p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
                >
                  <p className="text-[22px] sm:text-2xl font-bold text-[#1a1916] leading-none">{c.val}</p>
                  <p className="text-[10px] sm:text-[11px] text-[#9d9890] mt-1 leading-snug">{c.label}</p>
                  <div className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bgTrend} ${c.tColor}`}>
                    {c.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* Pipeline table */}
            <div className="bg-white rounded-xl border border-[#ede9e3] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              {/* Table head */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-[#f0ece6]">
                <span className="col-span-4 text-[10px] font-semibold text-[#c0bab2] uppercase tracking-wider">Référence</span>
                <span className="col-span-4 text-[10px] font-semibold text-[#c0bab2] uppercase tracking-wider">Bien</span>
                <span className="col-span-4 text-[10px] font-semibold text-[#c0bab2] uppercase tracking-wider hidden sm:block">Statut</span>
              </div>

              {/* Rows */}
              {[
                {
                  ref:   "WS-2025-001",
                  type:  "Appartement",
                  city:  "Bruxelles",
                  stage: "Mandat signé",
                  badge: "bg-[#635BFF]/10 text-[#635BFF]",
                },
                {
                  ref:   "WS-2025-002",
                  type:  "Villa",
                  city:  "Liège",
                  stage: "Compromis signé",
                  badge: "bg-amber-50 text-amber-700",
                },
                {
                  ref:   "WS-2025-003",
                  type:  "Terrain",
                  city:  "Gand",
                  stage: "En vérification",
                  badge: "bg-[#f0ece6] text-[#9d9890]",
                },
              ].map((row, i, arr) => (
                <div
                  key={row.ref}
                  className={`grid grid-cols-12 gap-2 items-center px-4 py-3 ${
                    i < arr.length - 1 ? "border-b border-[#f5f2ee]" : ""
                  }`}
                >
                  <span className="col-span-4 text-[11px] font-mono font-bold text-[#635BFF] tracking-tight">
                    {row.ref}
                  </span>
                  <span className="col-span-4 text-[12px] text-[#1a1916]">
                    {row.type}{" "}
                    <span className="text-[#c0bab2]">·</span>{" "}
                    <span className="text-[#9d9890]">{row.city}</span>
                  </span>
                  <span
                    className={`col-span-4 hidden sm:inline-flex items-center justify-center text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit ${row.badge}`}
                  >
                    {row.stage}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
