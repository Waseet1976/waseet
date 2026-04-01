import { Lock, Server, ShieldCheck, KeyRound } from "lucide-react";

const items = [
  {
    icon:  <Lock className="w-5 h-5 text-[#635BFF]" />,
    title: "Données chiffrées",
    desc:  "Toutes vos données sont chiffrées en transit (TLS 1.3) et au repos avec AES-256.",
  },
  {
    icon:  <ShieldCheck className="w-5 h-5 text-[#635BFF]" />,
    title: "Conformité RGPD",
    desc:  "Nous respectons le règlement européen sur la protection des données personnelles.",
  },
  {
    icon:  <Server className="w-5 h-5 text-[#635BFF]" />,
    title: "Sauvegardes quotidiennes",
    desc:  "Backups automatiques chaque jour. Vos données ne sont jamais perdues.",
  },
  {
    icon:  <KeyRound className="w-5 h-5 text-[#635BFF]" />,
    title: "Authentification sécurisée",
    desc:  "JWT tokens, sessions expirantes et protection contre les accès non autorisés.",
  },
];

export default function Security() {
  return (
    <section className="py-24 px-5 sm:px-8 bg-black text-white overflow-hidden relative">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#635BFF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left copy */}
          <div>
            <p className="text-[#635BFF] text-xs font-semibold tracking-widest uppercase mb-4">
              Sécurité
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-5 tracking-tight">
              Votre activité en sécurité,{" "}
              <span className="font-lora italic text-[#635BFF]">toujours.</span>
            </h2>
            <p className="text-charcoal-muted text-base leading-relaxed mb-8">
              Infrastructure hébergée en Europe, accès strictement contrôlé et
              audits de sécurité réguliers pour protéger vos données et celles de vos clients.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm text-charcoal-muted">
                Uptime <span className="text-white font-semibold">99,9%</span> — SLA garanti
              </p>
            </div>
          </div>

          {/* Right cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-[#635BFF]/20 flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold mb-1.5">{item.title}</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
