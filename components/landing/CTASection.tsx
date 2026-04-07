import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 px-5 sm:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#635BFF] rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden">
          {/* Decorations */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.15),_transparent_60%)] pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Commencez
              <br />
              <span className="font-lora italic">dès maintenant</span>
            </h2>
            <p className="text-white/70 mb-10 text-base max-w-md mx-auto leading-relaxed">
              Créez votre compte et déclarez votre première opportunité en quelques minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#635BFF] font-semibold text-sm rounded-xl hover:bg-sand-light transition-colors shadow-xl"
              >
                Créer un compte <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-white/30 text-white font-semibold text-sm rounded-xl hover:bg-white/10 transition-colors"
              >
                Se connecter
              </a>
            </div>
            <p className="text-white/40 text-xs mt-6">
              Aucune carte de crédit requise · Accès immédiat
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
