import Link from "next/link";
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
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#635BFF] hover:bg-[#4C45E0] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#635BFF]/25 hover:shadow-[#635BFF]/40"
          >
            Créer un compte <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-white border border-sand-dark text-black text-sm font-semibold rounded-xl hover:bg-sand-light transition-colors"
          >
            Se connecter
          </Link>
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

      {/* Dashboard preview */}
      <div className="max-w-5xl mx-auto mt-16">
        <div className="bg-white rounded-2xl border border-sand-dark shadow-2xl shadow-black/8 p-5 sm:p-6">
          {/* Window dots */}
          <div className="flex items-center gap-1.5 mb-5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="ml-3 h-5 flex-1 max-w-xs bg-sand rounded-full" />
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: "Déclarations reçues", val: "47", color: "bg-[#635BFF]",  text: "text-[#635BFF]" },
              { label: "Dossiers en cours",   val: "12", color: "bg-warning",  text: "text-warning" },
              { label: "Commissions versées", val: "8",  color: "bg-emerald-500", text: "text-emerald-600" },
            ].map((c) => (
              <div key={c.label} className="bg-sand-light rounded-xl p-4">
                <div className={`w-8 h-1.5 rounded-full ${c.color} mb-3`} />
                <p className={`text-2xl font-bold ${c.text}`}>{c.val}</p>
                <p className="text-xs text-charcoal-muted mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Pipeline rows */}
          <div className="bg-sand-light rounded-xl p-4 space-y-3">
            {[
              { ref: "WS-2025-001", type: "Appartement", city: "Bruxelles", stage: "Mandat signé",      dot: "bg-[#635BFF]" },
              { ref: "WS-2025-002", type: "Villa",        city: "Liège",     stage: "Compromis signé",  dot: "bg-warning" },
              { ref: "WS-2025-003", type: "Terrain",      city: "Gand",      stage: "En vérification", dot: "bg-sand-dark"  },
            ].map((row) => (
              <div key={row.ref} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${row.dot}`} />
                <span className="text-xs font-mono font-bold text-[#635BFF] w-24 flex-shrink-0">{row.ref}</span>
                <span className="text-xs text-charcoal-muted flex-1">{row.type} · {row.city}</span>
                <span className="text-[11px] text-charcoal-muted hidden sm:block">{row.stage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
