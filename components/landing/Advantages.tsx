import {
  TrendingUp, Users, FileText,
  BarChart2, Bell, Shield,
} from "lucide-react";

const features = [
  {
    icon:  <TrendingUp className="w-5 h-5 text-[#635BFF]" />,
    title: "Ne perdez plus aucune opportunité",
    desc:  "Chaque contact rencontré lors de votre prospection peut devenir un apporteur actif sur la plateforme.",
  },
  {
    icon:  <Users className="w-5 h-5 text-[#635BFF]" />,
    title: "Activez votre réseau local",
    desc:  "Vos contacts du terrain déclarent eux-mêmes les biens depuis leur compte. Vous en restez l'initiateur.",
  },
  {
    icon:  <FileText className="w-5 h-5 text-[#635BFF]" />,
    title: "Générez des leads en continu",
    desc:  "Continuez à recevoir des opportunités qualifiées même après votre passage sur le terrain.",
  },
  {
    icon:  <BarChart2 className="w-5 h-5 text-[#635BFF]" />,
    title: "Centralisez tout dans un seul outil",
    desc:  "Déclarations, dossiers, suivi de pipeline et commissions, tout est accessible depuis un seul tableau de bord.",
  },
  {
    icon:  <Bell className="w-5 h-5 text-[#635BFF]" />,
    title: "Suivez chaque dossier en temps réel",
    desc:  "Consultez l'état d'avancement de chaque opportunité à tout moment. Aucun dossier ne tombe à l'oubli.",
  },
  {
    icon:  <Shield className="w-5 h-5 text-[#635BFF]" />,
    title: "Transformez votre prospection",
    desc:  "Passez d'une approche ponctuelle à un système durable et structuré qui travaille pour vous en permanence.",
  },
];

export default function Advantages() {
  return (
    <section id="advantages" className="py-24 px-5 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#635BFF] text-xs font-semibold tracking-widest uppercase mb-3">
            Pour les professionnels
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
            Transformez votre prospection
            <br />
            en système durable
          </h2>
          <p className="text-charcoal-muted mt-4 max-w-xl mx-auto">
            Présentez la plateforme à vos contacts terrain. Ils déclarent directement depuis leur compte.
            Vous ne perdez plus aucune opportunité et continuez à générer des leads même après votre passage.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-sand-light rounded-2xl p-6 border border-sand-dark/50 hover:border-[#635BFF]/30 hover:shadow-md hover:shadow-[#635BFF]/8 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 flex items-center justify-center mb-4 group-hover:bg-[#635BFF]/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-black mb-2">{f.title}</h3>
              <p className="text-sm text-charcoal-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
