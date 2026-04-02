import Link from "next/link";

export const metadata = {
  title: "Conditions générales d'utilisation — Waseet",
};

export default function CGUPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions générales d&apos;utilisation</h1>
        <p className="text-sm text-gray-500 mb-12">Dernière mise à jour : avril 2025</p>

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">1. Objet</h2>
            <p>Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme <strong>Waseet</strong>, éditée par Waseet SRL (ci-après « Waseet »), accessible à l&apos;adresse waseet.be.</p>
            <p className="mt-3">Waseet est une plateforme SaaS de mise en relation immobilière permettant aux apporteurs d&apos;affaires de déclarer des biens immobiliers et aux agences immobilières de les valoriser, en échange d&apos;une commission partagée.</p>
            <p className="mt-3">L&apos;utilisation de la plateforme implique l&apos;acceptation pleine et entière des présentes CGU. Toute personne qui n&apos;accepte pas ces conditions doit s&apos;abstenir d&apos;utiliser le service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">2. Définitions</h2>
            <ul className="space-y-2 text-sm">
              <li><strong>Plateforme :</strong> l&apos;application web Waseet accessible sur waseet.be.</li>
              <li><strong>Utilisateur :</strong> toute personne physique ou morale disposant d&apos;un compte sur la plateforme.</li>
              <li><strong>Apporteur d&apos;affaires :</strong> personne physique qui signale à une agence partenaire un bien immobilier susceptible d&apos;être vendu ou loué, sans exercer d&apos;activité d&apos;agent immobilier au sens de la loi belge.</li>
              <li><strong>Agence :</strong> agence immobilière agréée IPI (Institut Professionnel des Agents Immobiliers) inscrite sur la plateforme.</li>
              <li><strong>Bien :</strong> propriété immobilière déclarée par un apporteur via la plateforme.</li>
              <li><strong>Commission :</strong> rémunération versée à l&apos;apporteur d&apos;affaires en cas de transaction réalisée.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">3. Inscription et accès au compte</h2>
            <p>L&apos;accès à la plateforme nécessite la création d&apos;un compte. L&apos;utilisateur s&apos;engage à fournir des informations exactes, complètes et à jour lors de son inscription.</p>
            <p className="mt-3">Chaque utilisateur est responsable de la confidentialité de ses identifiants de connexion et de toute activité effectuée depuis son compte. En cas de compromission, il doit en informer immédiatement Waseet à l&apos;adresse <a href="mailto:contact@waseet.be" className="text-[#635BFF] hover:underline">contact@waseet.be</a>.</p>
            <p className="mt-3">Waseet se réserve le droit de suspendre ou clôturer tout compte en cas de violation des présentes CGU, de comportement frauduleux ou de non-respect des lois en vigueur.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">4. Rôles et fonctionnalités</h2>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">4.1 Apporteur d&apos;affaires</h3>
            <p className="text-sm">L&apos;apporteur d&apos;affaires peut :</p>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
              <li>Déclarer des biens immobiliers via le formulaire de déclaration ;</li>
              <li>Suivre l&apos;avancement de ses déclarations dans le pipeline ;</li>
              <li>Consulter ses commissions estimées et validées ;</li>
              <li>Parrainer d&apos;autres utilisateurs et percevoir un bonus de parrainage ;</li>
              <li>Accéder à un tableau de bord personnalisé.</li>
            </ul>
            <p className="mt-3 text-sm">L&apos;apporteur d&apos;affaires déclare ne pas exercer d&apos;activité d&apos;intermédiaire immobilier au sens de la loi belge du 11 février 2013 réglementant le titre professionnel et les conditions d&apos;exercice de la profession d&apos;agent immobilier.</p>

            <h3 className="font-semibold text-gray-800 mt-6 mb-2">4.2 Agence immobilière</h3>
            <p className="text-sm">L&apos;agence immobilière partenaire peut :</p>
            <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
              <li>Recevoir et valider les déclarations de biens ;</li>
              <li>Gérer le pipeline de vente et les mandats ;</li>
              <li>Valider et déclencher les paiements de commissions ;</li>
              <li>Inviter des agents à rejoindre leur espace.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">5. Commissions et rémunération</h2>
            <p>La commission versée à l&apos;apporteur d&apos;affaires est calculée sur la commission perçue par l&apos;agence immobilière lors de la finalisation de la transaction, selon les modalités suivantes :</p>
            <ul className="mt-3 space-y-2 text-sm list-disc list-inside">
              <li><strong>Formule Gratuite :</strong> 10 % de la commission agence, minimum 500 € par transaction.</li>
              <li><strong>Formule Pro (49 €/mois) :</strong> 5 % de la commission agence, sans minimum imposé.</li>
            </ul>
            <p className="mt-3 text-sm"><strong>Aucune commission n&apos;est due en cas de transaction non aboutie.</strong> Le paiement intervient uniquement après validation par l&apos;agence et signature de l&apos;acte authentique.</p>
            <p className="mt-3 text-sm">Les montants affichés sur la plateforme sont des estimations non contractuelles. Seul le montant validé par l&apos;agence constitue la base de calcul définitive.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">6. Priorité horodatée</h2>
            <p>Lors de la déclaration d&apos;un bien, un horodatage certifié est attribué automatiquement. En cas de déclaration multiple d&apos;un même bien par des apporteurs différents, la priorité est accordée au premier déclarant selon cet horodatage, sous réserve de vérification par l&apos;agence.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">7. Obligations des utilisateurs</h2>
            <p>L&apos;utilisateur s&apos;engage à :</p>
            <ul className="mt-3 space-y-1 text-sm list-disc list-inside">
              <li>Utiliser la plateforme conformément à sa destination et aux lois belges en vigueur ;</li>
              <li>Ne pas déclarer de biens sans l&apos;accord préalable du propriétaire ou de son représentant légal ;</li>
              <li>Ne pas transmettre d&apos;informations fausses, trompeuses ou de nature à induire en erreur ;</li>
              <li>Ne pas tenter de contourner les mécanismes de sécurité ou d&apos;accéder à des données auxquelles il n&apos;est pas autorisé ;</li>
              <li>Respecter les droits des tiers, notamment les droits de propriété intellectuelle et le droit à la vie privée.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">8. Disponibilité du service</h2>
            <p>Waseet s&apos;efforce d&apos;assurer la disponibilité de la plateforme 24h/24 et 7j/7. Toutefois, des interruptions peuvent survenir pour maintenance, mises à jour ou causes indépendantes de notre volonté. Waseet ne saurait être tenu responsable d&apos;une indisponibilité temporaire du service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">9. Résiliation</h2>
            <p>L&apos;utilisateur peut résilier son compte à tout moment depuis les paramètres de son profil ou en contactant <a href="mailto:contact@waseet.be" className="text-[#635BFF] hover:underline">contact@waseet.be</a>. La résiliation prend effet dans un délai de 30 jours. Les commissions dues et validées avant la résiliation restent exigibles.</p>
            <p className="mt-3">Les abonnements Pro sont résiliables sans préavis, avec effet à la fin de la période d&apos;abonnement en cours.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">10. Modification des CGU</h2>
            <p>Waseet se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par e-mail ou notification sur la plateforme. La poursuite de l&apos;utilisation du service après notification vaut acceptation des nouvelles conditions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">11. Droit applicable</h2>
            <p>Les présentes CGU sont soumises au droit belge. Tout litige relatif à leur interprétation ou leur exécution sera soumis à la compétence exclusive des tribunaux de l&apos;arrondissement judiciaire de Bruxelles.</p>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 px-6 mt-16">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Waseet SRL. Tous droits réservés.</span>
          <div className="flex gap-6">
            <Link href="/legal/mentions-legales" className="hover:text-[#635BFF] transition-colors">Mentions légales</Link>
            <Link href="/legal/confidentialite" className="hover:text-[#635BFF] transition-colors">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
