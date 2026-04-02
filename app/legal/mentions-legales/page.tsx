import Link from "next/link";

export const metadata = {
  title: "Mentions légales — Waseet",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/">
            <img src="/logo.svg" alt="Waseet" className="h-8 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-[#635BFF] hover:text-[#4C45E0] font-medium transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentions légales</h1>
        <p className="text-sm text-gray-500 mb-12">Dernière mise à jour : avril 2025</p>

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">1. Éditeur du site</h2>
            <p>Le site <strong>waseet.be</strong> est édité par :</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li><strong>Dénomination sociale :</strong> Waseet SRL</li>
              <li><strong>Forme juridique :</strong> Société à responsabilité limitée (SRL)</li>
              <li><strong>Siège social :</strong> Avenue Louise 54, 1050 Ixelles, Belgique</li>
              <li><strong>Numéro d&apos;entreprise (BCE) :</strong> BE 0XXX.XXX.XXX</li>
              <li><strong>Numéro de TVA :</strong> BE 0XXX.XXX.XXX</li>
              <li><strong>Adresse e-mail :</strong> contact@waseet.be</li>
              <li><strong>Téléphone :</strong> +32 (0)2 000 00 00</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">2. Responsable de la publication</h2>
            <p>Le responsable de la publication est le gérant de Waseet SRL, joignable à l&apos;adresse : <a href="mailto:contact@waseet.be" className="text-[#635BFF] hover:underline">contact@waseet.be</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">3. Hébergement</h2>
            <p>Le site est hébergé par :</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li><strong>Société :</strong> Vercel Inc.</li>
              <li><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
              <li><strong>Site web :</strong> vercel.com</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500">Les données sont stockées sur des serveurs situés dans l&apos;Union européenne (région Frankfurt, AWS eu-central-1) via Supabase Inc.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">4. Propriété intellectuelle</h2>
            <p>L&apos;ensemble du contenu de ce site (textes, images, graphismes, logo, icônes, code source) est la propriété exclusive de Waseet SRL ou de ses partenaires, et est protégé par les lois belges et internationales relatives à la propriété intellectuelle.</p>
            <p className="mt-3">Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l&apos;autorisation préalable et écrite de Waseet SRL.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">5. Limitation de responsabilité</h2>
            <p>Waseet SRL s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur ce site. Cependant, Waseet SRL décline toute responsabilité pour :</p>
            <ul className="mt-3 space-y-1 text-sm list-disc list-inside">
              <li>Les inexactitudes, omissions ou erreurs dans les informations fournies sur la plateforme ;</li>
              <li>Toute interruption, panne ou indisponibilité du service ;</li>
              <li>Les dommages directs ou indirects résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le service ;</li>
              <li>Les contenus de sites tiers accessibles via des liens hypertextes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">6. Droit applicable et juridiction compétente</h2>
            <p>Les présentes mentions légales sont régies par le droit belge. En cas de litige, les tribunaux compétents sont ceux de l&apos;arrondissement judiciaire de Bruxelles, sauf disposition légale contraire.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">7. Contact</h2>
            <p>Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à : <a href="mailto:legal@waseet.be" className="text-[#635BFF] hover:underline">legal@waseet.be</a></p>
          </section>

        </div>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-gray-200 py-8 px-6 mt-16">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Waseet SRL. Tous droits réservés.</span>
          <div className="flex gap-6">
            <Link href="/legal/cgu" className="hover:text-[#635BFF] transition-colors">CGU</Link>
            <Link href="/legal/confidentialite" className="hover:text-[#635BFF] transition-colors">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
