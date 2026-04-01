"use client";

import { useState } from "react";

function getCommission(price: number): number {
  if (price <= 150000) return 500;
  if (price <= 300000) return 1000;
  if (price <= 500000) return 1500;
  return 2000;
}

function getBracketLabel(price: number): string {
  if (price <= 150000) return "≤ 150 000 €";
  if (price <= 300000) return "≤ 300 000 €";
  if (price <= 500000) return "≤ 500 000 €";
  return "> 500 000 €";
}

export default function CommissionCalc() {
  const [price, setPrice] = useState(300000);
  const commission = getCommission(price);

  return (
    <section id="calc" className="py-24 px-5 sm:px-8 bg-sand-light">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#635BFF] text-xs font-semibold tracking-widest uppercase mb-3">
            Simulateur
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
            Estimez votre commission
          </h2>
          <p className="text-charcoal-muted mt-4">
            Déplacez le curseur pour voir la commission apporteur correspondante.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-sand-dark p-8 sm:p-10 shadow-xl shadow-black/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Slider */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Prix estimé du bien
              </label>
              <p className="text-3xl font-bold text-[#635BFF] mb-6">
                {price.toLocaleString("fr-BE")} €
              </p>
              <input
                type="range"
                min={50000}
                max={1000000}
                step={10000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full accent-[#635BFF] h-2 cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs text-charcoal-muted mt-2">
                <span>50 000 €</span>
                <span>1 000 000 €</span>
              </div>

              <div className="mt-6 bg-sand-light rounded-2xl p-4 border border-sand-dark/50">
                <p className="text-xs text-charcoal-muted mb-1">Tranche applicable</p>
                <p className="text-sm font-bold text-black">{getBracketLabel(price)}</p>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="bg-[#635BFF] rounded-2xl p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">
                  Commission apporteur estimée
                </p>
                <p className="text-4xl font-bold">
                  {commission.toLocaleString("fr-BE")} €
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Montant indicatif HT
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-sand-light border border-sand-dark rounded-2xl p-4">
                  <p className="text-[11px] text-charcoal-muted mb-1">Palier de bien</p>
                  <p className="text-lg font-bold text-black">
                    {getBracketLabel(price)}
                  </p>
                </div>
                <div className="bg-sand-light border border-sand-dark rounded-2xl p-4">
                  <p className="text-[11px] text-charcoal-muted mb-1">Barème</p>
                  <p className="text-lg font-bold text-black">
                    4 paliers
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <p className="text-xs text-emerald-600 mb-1 font-medium">Versée si vente conclue</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {commission.toLocaleString("fr-BE")} €
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
