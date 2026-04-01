export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      emoji:  "📝",
      title:  "Vous déclarez un bien",
      desc:   "Renseignez les informations du bien depuis votre portail. Simple, rapide, quelques secondes suffisent.",
    },
    {
      number: "02",
      emoji:  "🕐",
      title:  "Votre déclaration est enregistrée",
      desc:   "L'apport est horodaté et enregistré dans le système. Une référence unique lui est attribuée.",
    },
    {
      number: "03",
      emoji:  "🔍",
      title:  "Le dossier est pris en charge",
      desc:   "Un professionnel analyse le dossier et engage les démarches nécessaires auprès du propriétaire.",
    },
    {
      number: "04",
      emoji:  "📊",
      title:  "Vous suivez en temps réel",
      desc:   "Consultez à tout moment l'état d'avancement de votre déclaration via votre tableau de bord.",
    },
    {
      number: "05",
      emoji:  "💰",
      title:  "La commission est versée",
      desc:   "Si la vente se concrétise, une commission vous est attribuée et versée selon les conditions convenues.",
    },
  ];

  return (
    <section id="how" className="py-24 px-5 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#635BFF] text-xs font-semibold tracking-widest uppercase mb-3">
            Le processus
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
            Comment ça marche ?
          </h2>
          <p className="text-charcoal-muted mt-4 max-w-xl mx-auto text-base">
            Waseet permet à toute personne de transmettre une opportunité immobilière à un réseau professionnel.
            Si la vente se concrétise, une commission est attribuée à l&apos;apporteur.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%_-_8px)] w-full h-px bg-gradient-to-r from-[#635BFF]/40 to-transparent z-0 pointer-events-none" />
              )}
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#635BFF]/10 flex items-center justify-center text-2xl mb-5 border border-[#635BFF]/20">
                  {step.emoji}
                </div>
                <span className="text-xs font-bold text-[#635BFF] tracking-widest">{step.number}</span>
                <h3 className="text-base font-bold text-black mt-1.5 mb-2 leading-snug">{step.title}</h3>
                <p className="text-sm text-charcoal-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
