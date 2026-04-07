'use client'

import { useState } from 'react'
import Link from 'next/link'

const checkIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill="#C9973A" fillOpacity="0.12" />
    <path d="M5 8l2 2 4-4" stroke="#C9973A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const neutralIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill="#E8DFC8" />
    <path d="M5 8h6" stroke="#A09880" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

interface Feature {
  label: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  badge?: string
  price: string
  priceSub: string
  description: string
  commission: string
  commissionDetail: string
  features: Feature[]
  cta: string
  ctaStyle: 'primary' | 'outline'
  highlight: boolean
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0 €',
    priceSub: 'sans abonnement',
    description: 'Pour démarrer sans engagement. Accédez à la plateforme complète et ne payez qu\'en cas de résultat.',
    commission: '10 % de la commission agence',
    commissionDetail: 'minimum 500 € par transaction',
    features: [
      { label: 'Accès complet à la plateforme', included: true },
      { label: 'Déclaration de biens illimitée', included: true },
      { label: 'Priorité horodatée garantie', included: true },
      { label: 'Suivi pipeline en temps réel', included: true },
      { label: 'Tableau de bord commissions', included: true },
      { label: 'Réseau de parrainage', included: true },
      { label: 'Taux de commission réduit', included: false },
    ],
    cta: 'Commencer gratuitement',
    ctaStyle: 'outline',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'Recommandé',
    price: '49 €',
    priceSub: 'par mois, sans engagement',
    description: 'Pour les professionnels actifs. Un abonnement fixe qui devient rapidement rentable dès la première transaction.',
    commission: '5 % de la commission agence',
    commissionDetail: 'sans minimum imposé',
    features: [
      { label: 'Accès complet à la plateforme', included: true },
      { label: 'Déclaration de biens illimitée', included: true },
      { label: 'Priorité horodatée garantie', included: true },
      { label: 'Suivi pipeline en temps réel', included: true },
      { label: 'Tableau de bord commissions', included: true },
      { label: 'Réseau de parrainage', included: true },
      { label: 'Taux de commission réduit (5 %)', included: true },
    ],
    cta: 'Passer en Pro',
    ctaStyle: 'primary',
    highlight: true,
  },
]

export default function PricingSection() {
  const [, setHovered] = useState<string | null>(null)

  return (
    <section id="offres" className="bg-sand py-24 px-6">
      {/* En-tête */}
      <div className="max-w-3xl mx-auto text-center mb-14">
        <div className="inline-block bg-[#635BFF]/10 border border-[#635BFF]/25 rounded-full px-4 py-1 text-xs font-semibold tracking-widest uppercase text-[#635BFF] mb-5">
          Tarification
        </div>
        <h2 className="font-playfair text-4xl font-bold text-obsidian mb-4 leading-tight">
          Simple, transparent,<br />sans surprise
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Les apporteurs d&apos;affaires accèdent à Waseet gratuitement.
          Les professionnels choisissent la formule adaptée à leur activité.
        </p>
      </div>

      {/* Bandeau apporteurs gratuits */}
      <div className="max-w-2xl mx-auto mb-6 bg-charcoal rounded-2xl px-7 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#635BFF]/15 rounded-xl flex items-center justify-center text-xl shrink-0">
            🤝
          </div>
          <div>
            <div className="font-semibold text-white text-sm mb-1">
              Apporteur d&apos;affaires — Toujours gratuit
            </div>
            <div className="text-xs text-white/50 leading-snug">
              Inscrivez-vous, déclarez des biens et touchez vos commissions.
              Sans abonnement, sans frais fixes.
            </div>
          </div>
        </div>
        <Link
          href="/signup"
          className="text-xs font-semibold text-white/70 border border-white/15 rounded-lg px-4 py-2 hover:border-[#635BFF] hover:text-[#635BFF] transition-all whitespace-nowrap shrink-0"
        >
          Créer un compte →
        </Link>
      </div>

      {/* Séparateur offres pro */}
      <div className="max-w-2xl mx-auto mb-5 flex items-center gap-3 justify-center">
        <div className="h-px bg-sand-dark flex-1 max-w-[80px]" />
        <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
          Offres pour les professionnels
        </span>
        <div className="h-px bg-sand-dark flex-1 max-w-[80px]" />
      </div>

      {/* Grille plans */}
      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onMouseEnter={() => setHovered(plan.id)}
            onMouseLeave={() => setHovered(null)}
            className={`
              relative flex flex-col gap-6 rounded-2xl p-8 border transition-all duration-200
              ${plan.highlight
                ? 'border-[#635BFF] bg-white shadow-[0_8px_40px_rgba(99,91,255,0.14)] hover:shadow-[0_16px_48px_rgba(99,91,255,0.22)]'
                : 'border-gray-200 bg-white hover:shadow-[0_16px_48px_rgba(15,15,14,0.10)]'
              }
              hover:-translate-y-1
            `}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-7">
                <span className="bg-gradient-to-r from-[#635BFF] to-[#8680FF] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Header plan */}
            <div>
              <div className={`text-[10px] font-bold tracking-widest uppercase mb-2.5 ${plan.highlight ? 'text-[#635BFF]' : 'text-gray-400'}`}>
                {plan.name}
              </div>
              <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className="font-playfair text-4xl font-bold text-obsidian leading-none">
                  {plan.price}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {plan.priceSub}
                </span>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                {plan.description}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-sand-dark" />

            {/* Commission */}
            <div className={`rounded-xl p-4 ${plan.highlight ? 'bg-[#635BFF]/5 border border-[#635BFF]/20' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-[10px] font-bold tracking-widest uppercase mb-1.5 ${plan.highlight ? 'text-[#635BFF]' : 'text-gray-400'}`}>
                Commission en cas de vente
              </div>
              <div className="font-playfair text-[17px] font-semibold text-obsidian mb-0.5">
                {plan.commission}
              </div>
              <div className="text-xs text-gray-400">
                {plan.commissionDetail}
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-2.5 flex-1">
              {plan.features.map((feature, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 text-[13px] leading-snug ${!feature.included ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {feature.included ? checkIcon : neutralIcon}
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {plan.ctaStyle === 'primary' ? (
              <Link
                href="/signup?offre=pro"
                className="block w-full text-center bg-gradient-to-r from-[#635BFF] to-[#8680FF] text-white font-semibold text-sm rounded-xl py-3.5 px-6 transition-all hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(99,91,255,0.35)] hover:shadow-[0_6px_20px_rgba(99,91,255,0.45)]"
              >
                {plan.cta}
              </Link>
            ) : (
              <Link
                href="/signup?offre=gratuit"
                className="block w-full text-center border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl py-3.5 px-6 transition-all hover:border-[#635BFF] hover:text-[#635BFF] hover:bg-[#635BFF]/5"
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Notice légale */}
      <div className="max-w-2xl mx-auto flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 mb-10">
        <span className="text-base shrink-0 mt-0.5">ℹ️</span>
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-700">Commission due uniquement en cas de vente réalisée.</strong>{' '}
          La commission Waseet est calculée sur la commission perçue par l&apos;agence,
          non sur le prix de vente du bien. Aucun frais n&apos;est dû si la transaction n&apos;aboutit pas.
        </p>
      </div>

      {/* Comparatif rentabilité */}
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <span className="text-sm">📊</span>
          <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
            Quand le Pro devient rentable
          </span>
        </div>
        <div className="p-6">
          <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
            Sur une commission agence de{' '}
            <strong className="text-obsidian">10 000 €</strong> :
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              {
                label: 'Gratuit',
                calc: '10 000 € × 10 %',
                result: '1 000 €',
                sub: 'commission Waseet',
                highlight: false,
              },
              {
                label: 'Pro',
                calc: '49 € + (10 000 € × 5 %)',
                result: '549 €',
                sub: 'économie de 451 €',
                highlight: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl p-4 ${
                  item.highlight
                    ? 'bg-[#635BFF]/5 border border-[#635BFF]/20'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${item.highlight ? 'text-[#635BFF]' : 'text-gray-400'}`}>
                  {item.label}
                </div>
                <div className="text-[11px] text-gray-400 mb-1.5 font-mono">
                  {item.calc}
                </div>
                <div className={`font-playfair text-xl font-bold leading-none mb-1 ${item.highlight ? 'text-[#635BFF]' : 'text-gray-600'}`}>
                  {item.result}
                </div>
                <div className="text-[11px] text-gray-400">
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed italic">
            Le plan Pro est plus avantageux dès que la commission agence dépasse 980 €
            — ce qui correspond à la grande majorité des transactions immobilières.
          </p>
        </div>
      </div>

    </section>
  )
}
