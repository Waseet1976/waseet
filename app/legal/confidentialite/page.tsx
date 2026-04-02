import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité — Waseet",
};

export default function ConfidentialitePage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mb-12">Dernière mise à jour : avril 2025</p>

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">1. Introduction</h2>
            <p>Waseet SRL (ci-après « Waseet », « nous ») attache une importance fondamentale à la protection de vos données personnelles. La présente politique de confidentialité décrit comment nous collectons, utilisons, conservons et protégeons vos données, conformément au Règlement (UE) 2016/679 du 27 avril 2016 (RGPD) et à la loi belge du 30 juillet 2018 relative à la protection des personnes physiques à l&apos;égard des traitements de données à caractère personnel.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">2. Responsable du traitement</h2>
            <ul className="space-y-1 text-sm">
              <li><strong>Responsable :</strong> Waseet SRL</li>
              <li><strong>Adresse :</strong> Avenue Louise 54, 1050 Ixelles, Belgique</li>
              <li><strong>E-mail DPO :</strong> <a href="mailto:privacy@waseet.be" className="text-[#635BFF] hover:underline">privacy@waseet.be</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">3. Données collectées</h2>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">3.1 Données fournies directement</h3>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>Identité : prénom, nom</li>
              <li>Coordonnées : adresse e-mail, numéro de téléphone</li>
              <li>Données de compte : mot de passe haché, rôle, pays</li>
              <li>Données de biens déclarés : adresse, ville, type de bien, prix estimé, photos</li>
              <li>Données financières : montants de commissions (aucune donnée bancaire stockée directement)</li>
              <li>Code de parrainage et réseau de filleuls</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-6 mb-2">3.2 Données collectées automatiquement</h3>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>Adresse IP et données de connexion</li>
              <li>Navigateur, système d&apos;exploitation, appareil utilisé</li>
              <li>Logs d&apos;activité sur la plateforme (actions, horodatages)</li>
              <li>Cookies techniques nécessaires au fonctionnement du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">4. Finalités et bases légales du traitement</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border border-gray-200 font-semibold">Finalité</th>
                    <th className="text-left p-3 border border-gray-200 font-semibold">Base légale</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Création et gestion du compte utilisateur", "Exécution du contrat (art. 6.1.b RGPD)"],
                    ["Fourniture du service de mise en relation", "Exécution du contrat (art. 6.1.b RGPD)"],
                    ["Calcul et versement des commissions", "Exécution du contrat (art. 6.1.b RGPD)"],
                    ["Envoi de notifications liées à l'activité", "Exécution du contrat (art. 6.1.b RGPD)"],
                    ["Respect des obligations légales (comptabilité, TVA)", "Obligation légale (art. 6.1.c RGPD)"],
                    ["Amélioration de la plateforme, statistiques", "Intérêt légitime (art. 6.1.f RGPD)"],
                    ["Envoi d'e-mails marketing (opt-in uniquement)", "Consentement (art. 6.1.a RGPD)"],
                  ].map(([finalite, base]) => (
                    <tr key={finalite} className="border-b border-gray-200">
                      <td className="p-3 border border-gray-200">{finalite}</td>
                      <td className="p-3 border border-gray-200 text-gray-500">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">5. Durée de conservation</h2>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li><strong>Données de compte actif :</strong> pendant toute la durée de la relation contractuelle.</li>
              <li><strong>Données après clôture du compte :</strong> 3 ans à compter de la date de clôture (prescription de droit commun belge).</li>
              <li><strong>Données comptables et fiscales :</strong> 7 ans conformément à la loi belge.</li>
              <li><strong>Logs de connexion :</strong> 12 mois maximum.</li>
              <li><strong>Cookies :</strong> 13 mois maximum pour les cookies persistants.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">6. Destinataires des données</h2>
            <p>Vos données peuvent être partagées avec :</p>
            <ul className="mt-3 space-y-2 text-sm list-disc list-inside">
              <li><strong>Les agences immobilières partenaires</strong> — dans le cadre strict de la mise en relation ;</li>
              <li><strong>Nos sous-traitants techniques</strong> : Supabase (base de données, stockage), Vercel (hébergement), SendGrid (e-mails transactionnels), Stripe (paiements) — tous soumis au RGPD ;</li>
              <li><strong>Les autorités compétentes</strong> en cas d&apos;obligation légale (justice, administration fiscale belge).</li>
            </ul>
            <p className="mt-3 text-sm">Aucune donnée n&apos;est vendue à des tiers à des fins commerciales.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">7. Transferts hors UE</h2>
            <p>Certains de nos prestataires (Vercel, Stripe) peuvent traiter des données hors de l&apos;Union européenne. Ces transferts sont encadrés par des garanties appropriées : clauses contractuelles types approuvées par la Commission européenne et mécanismes de certification adéquats.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">8. Vos droits (RGPD)</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="mt-3 space-y-2 text-sm list-disc list-inside">
              <li><strong>Droit d&apos;accès</strong> — obtenir une copie de vos données personnelles ;</li>
              <li><strong>Droit de rectification</strong> — corriger des données inexactes ;</li>
              <li><strong>Droit à l&apos;effacement</strong> — demander la suppression de vos données (« droit à l&apos;oubli ») ;</li>
              <li><strong>Droit à la limitation du traitement</strong> — restreindre l&apos;utilisation de vos données ;</li>
              <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré et lisible par machine ;</li>
              <li><strong>Droit d&apos;opposition</strong> — vous opposer à certains traitements fondés sur l&apos;intérêt légitime ;</li>
              <li><strong>Droit de retirer votre consentement</strong> à tout moment, sans affecter la licéité des traitements antérieurs.</li>
            </ul>
            <p className="mt-4 text-sm">Pour exercer vos droits, contactez-nous à : <a href="mailto:privacy@waseet.be" className="text-[#635BFF] hover:underline">privacy@waseet.be</a>. Nous traiterons votre demande dans un délai d&apos;un mois (art. 12 RGPD).</p>
            <p className="mt-3 text-sm">Vous avez également le droit d&apos;introduire une réclamation auprès de l&apos;Autorité de protection des données belge (APD) : <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" className="text-[#635BFF] hover:underline">autoriteprotectiondonnees.be</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">9. Sécurité des données</h2>
            <p>Waseet met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, altération ou divulgation :</p>
            <ul className="mt-3 space-y-1 text-sm list-disc list-inside">
              <li>Chiffrement TLS/HTTPS de toutes les communications ;</li>
              <li>Mots de passe hachés avec bcrypt (12 rounds) ;</li>
              <li>Accès aux données restreint aux personnes habilitées ;</li>
              <li>Journalisation des actions sensibles ;</li>
              <li>Sauvegardes régulières chiffrées.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">10. Cookies</h2>
            <p>La plateforme utilise uniquement des cookies strictement nécessaires au fonctionnement du service (cookie de session d&apos;authentification). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé sans votre consentement explicite.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">11. Modifications de la politique</h2>
            <p>Waseet se réserve le droit de modifier la présente politique à tout moment. Toute modification substantielle sera notifiée par e-mail ou via la plateforme avant son entrée en vigueur.</p>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 px-6 mt-16">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Waseet SRL. Tous droits réservés.</span>
          <div className="flex gap-6">
            <Link href="/legal/mentions-legales" className="hover:text-[#635BFF] transition-colors">Mentions légales</Link>
            <Link href="/legal/cgu" className="hover:text-[#635BFF] transition-colors">CGU</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
