import { Building2, UserCheck, Handshake } from "lucide-react";

const profiles = [
  {
    icon:  <UserCheck className="w-6 h-6 text-[#635BFF]" />,
    title: "Apporteurs d'affaires",
    desc:  "Vous connaissez un bien à vendre ? Déclarez l'opportunité, suivez son avancement et consultez vos commissions. Un système clair et structuré.",
    perks: ["Déclarez des opportunités", "Suivez vos dossiers", "Consultez vos commissions"],
  },
  {
    icon:     <Building2 className="w-6 h-6 text-white" />,
    title:    "Agents immobiliers",
    desc:     "Lors de votre prospection, présentez la plateforme à vos contacts. Ils déclarent directement. Vous ne perdez plus aucune opportunité et continuez à générer des leads.",
    perks:    ["Ne perdez plus aucune opportunité", "Activez votre réseau local", "Générez des leads en continu"],
    featured: true,
  },
  {
    icon:  <Handshake className="w-6 h-6 text-[#635BFF]" />,
    title: "Agences immobilières",
    desc:  "Structurez le réseau d'apporteurs de votre agence. Supervisez tous les dossiers, suivez les commissions et centralisez l'ensemble dans un seul outil.",
    perks: ["Réseau d'apporteurs structuré", "Supervision des dossiers", "Suivi des commissions d'équipe"],
  },
];

export default function ForWho() {
  return (
    <section id="for-who" className="py-24 px-5 sm:px-8 bg-sand-light">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#635BFF] text-xs font-semibold tracking-widest uppercase mb-3">
            Pour qui ?
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
            Une plateforme pour tous
            <br className="hidden sm:block" />
            <span className="font-lora italic"> les acteurs du terrain</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.map((p) => (
            <div
              key={p.title}
              className={
                p.featured
                  ? "rounded-2xl p-7 bg-[#635BFF] text-white border border-[#635BFF] shadow-xl shadow-[#635BFF]/25"
                  : "rounded-2xl p-7 bg-white border border-sand-dark hover:border-[#635BFF]/30 hover:shadow-lg hover:shadow-black/5 transition-all"
              }
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
                p.featured ? "bg-white/20" : "bg-[#635BFF]/10"
              }`}>
                {p.icon}
              </div>

              <h3 className={`text-lg font-bold mb-2 ${p.featured ? "text-white" : "text-black"}`}>
                {p.title}
              </h3>
              <p className={`text-sm mb-6 leading-relaxed ${p.featured ? "text-white/75" : "text-charcoal-muted"}`}>
                {p.desc}
              </p>

              <ul className="space-y-2">
                {p.perks.map((perk) => (
                  <li
                    key={perk}
                    className={`flex items-center gap-2.5 text-sm ${p.featured ? "text-white" : "text-charcoal"}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.featured ? "bg-white" : "bg-[#635BFF]"}`} />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
