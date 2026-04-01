"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Building2, TrendingUp, Banknote,
  Star, Clock, CheckCircle2,
} from "lucide-react";

import { useAuth }             from "@/lib/hooks/useAuth";
import { ReferralCodeBox }     from "@/components/referral/ReferralCodeBox";
import { Badge }               from "@/components/ui/Badge";
import { Card, CardBody }      from "@/components/ui/Card";
import { formatPrice, getInitials, formatDate } from "@/lib/utils";
import { BONUS_REFERRAL_AMOUNT }                from "@/lib/config";
import { cn }                                   from "@/lib/utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FilleulItem {
  id:          string;
  bonusAmount: number;
  bonusPaid:   boolean;
  createdAt:   string;
  isActive:    boolean;
  referred: {
    id:        string;
    firstName: string;
    lastName:  string;
    country:   string | null;
    createdAt: string;
    _count:    { declaredProps: number };
  } | null;
}

interface ReferralData {
  referralCode: string;
  country:      string | null;
  user:         { firstName: string; lastName: string };
  stats: {
    filleulsCount:          number;
    networkPropertiesCount: number;
    networkSalesCount:      number;
    totalBonusReceived:     number;
    bonusPaidCount:         number;
  };
  referrals:    FilleulItem[];
  topReferrals: FilleulItem[];
  monthlyData:  { month: string; count: number }[];
}

// ── Avatar couleurs ───────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ["#C9973A", "#F5ECD4"],
  ["#3B82F6", "#DBEAFE"],
  ["#8B5CF6", "#EDE9FE"],
  ["#EC4899", "#FCE7F3"],
  ["#3A8A5A", "#D1FAE5"],
  ["#F59E0B", "#FEF3C7"],
];
function avatarColors(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ── Graphique barres SVG simple ───────────────────────────────────────────────
function MonthlyChart({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-1">
      {/* Barres */}
      <div className="flex items-end gap-1.5 h-28">
        {data.map((d, i) => {
          const pct = (d.count / max) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end gap-1 group"
            >
              {/* Label valeur au survol */}
              <span
                className={cn(
                  "text-[10px] font-bold text-[#635BFF] transition-opacity",
                  d.count > 0 ? "opacity-0 group-hover:opacity-100" : "opacity-0"
                )}
              >
                {d.count}
              </span>
              {/* Barre */}
              <div className="w-full rounded-t-lg overflow-hidden relative" style={{ height: "100%" }}>
                <div
                  className="absolute bottom-0 w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height:     `${Math.max(pct, d.count > 0 ? 8 : 2)}%`,
                    background: d.count > 0
                      ? "linear-gradient(to top, #C9973A, #E8B65A)"
                      : "#E8E0D0",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Labels mois */}
      <div className="flex gap-1.5">
        {data.map((d, i) => (
          <p key={i} className="flex-1 text-center text-[9px] text-charcoal-muted">
            {d.month}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function ReferralPage() {
  const { user, isLoading } = useAuth();
  const [data, setData]     = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("waseet_token");
    const res   = await fetch("/api/referrals", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const d = await res.json();
      setData(d);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && user) fetchData();
  }, [isLoading, user, fetchData]);

  const country  = "BE" as const;
  const currency = "EUR";

  // ── Skeleton ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-7 bg-sand-dark rounded w-48" />
        <div className="h-56 bg-charcoal rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="h-28 bg-sand-dark rounded-2xl" />)}
        </div>
        <div className="h-64 bg-sand-dark rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-obsidian">Parrainage</h1>
        <p className="text-sm text-charcoal-muted mt-0.5">
          Invitez des apporteurs et gagnez {BONUS_REFERRAL_AMOUNT.toLocaleString("fr-FR")} {currency} par vente conclue
        </p>
      </div>

      {/* ════ Section code ════════════════════════════════════════════════════ */}
      {data?.referralCode && (
        <ReferralCodeBox
          code={data.referralCode}
          country={data.country}
          firstName={data.user.firstName}
        />
      )}

      {/* ════ Stats réseau ════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-[#635BFF]" />}
          iconBg="bg-[#635BFF]/10"
          label="Filleuls directs"
          value={data?.stats.filleulsCount ?? 0}
          sub={`${data?.stats.bonusPaidCount ?? 0} bonus versé(s)`}
        />
        <StatCard
          icon={<Building2 className="w-5 h-5 text-info" />}
          iconBg="bg-info/10"
          label="Biens réseau"
          value={data?.stats.networkPropertiesCount ?? 0}
          sub="Déclarés par vos filleuls"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-success" />}
          iconBg="bg-success/10"
          label="Ventes réseau"
          value={data?.stats.networkSalesCount ?? 0}
          sub="Actes signés"
        />
        <StatCard
          icon={<Banknote className="w-5 h-5 text-warning" />}
          iconBg="bg-warning/10"
          label="Bonus reçus"
          value={formatPrice(data?.stats.totalBonusReceived ?? 0, country)}
          isPrice
          sub={`${BONUS_REFERRAL_AMOUNT.toLocaleString("fr-FR")} ${currency} / vente`}
        />
      </div>

      {/* ════ Évolution + Top filleuls ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">

        {/* Graphique */}
        <Card className="sm:col-span-3">
          <CardBody className="p-5">
            <h3 className="text-sm font-semibold text-obsidian mb-1">
              Évolution du réseau
            </h3>
            <p className="text-xs text-charcoal-muted mb-4">
              Nouveaux filleuls — 6 derniers mois
            </p>
            {data?.monthlyData.length ? (
              <MonthlyChart data={data.monthlyData} />
            ) : (
              <div className="h-28 flex items-center justify-center">
                <p className="text-sm text-charcoal-muted">
                  Parrainez des filleuls pour voir l'évolution
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Top filleuls */}
        <Card className="sm:col-span-2">
          <CardBody className="p-5">
            <h3 className="text-sm font-semibold text-obsidian mb-4">
              Top filleuls
            </h3>
            {!data?.topReferrals.length ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Star className="w-8 h-8 text-sand-dark mb-2" />
                <p className="text-xs text-charcoal-muted">Aucun filleul actif</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.topReferrals.map((r, idx) => {
                  const [fg, bg] = avatarColors(`${r.referred?.firstName ?? ""}${r.referred?.lastName ?? ""}`);
                  return (
                    <div key={r.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-charcoal-muted w-4">{idx + 1}</span>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: bg, color: fg }}
                      >
                        {getInitials(r.referred?.firstName ?? "", r.referred?.lastName ?? "")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-obsidian truncate">
                          {r.referred?.firstName ?? "—"} {r.referred?.lastName ?? ""}
                        </p>
                        <p className="text-[10px] text-charcoal-muted">
                          {r.referred?._count?.declaredProps ?? 0} bien(s)
                        </p>
                      </div>
                      {r.bonusPaid && (
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* ════ Liste des filleuls ══════════════════════════════════════════════ */}
      <Card>
        <div className="px-5 py-4 border-b border-sand-dark flex items-center justify-between">
          <h3 className="text-sm font-semibold text-obsidian">
            Mes filleuls ({data?.referrals.length ?? 0})
          </h3>
          {(data?.stats.filleulsCount ?? 0) > 0 && (
            <p className="text-xs text-charcoal-muted">
              {data?.stats.filleulsCount} filleul(s) · {data?.stats.bonusPaidCount} bonus versé(s)
            </p>
          )}
        </div>

        {!data?.referrals.length ? (
          <CardBody className="py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sand flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-charcoal-muted" />
            </div>
            <p className="text-sm font-semibold text-charcoal mb-1">
              Aucun filleul pour l'instant
            </p>
            <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
              Partagez votre lien d'invitation et gagnez {BONUS_REFERRAL_AMOUNT.toLocaleString("fr-FR")} {currency}
              {" "}par vente conclue par vos filleuls.
            </p>
          </CardBody>
        ) : (
          <div className="divide-y divide-sand-dark">
            {data.referrals.map((r) => {
              const name   = `${r.referred?.firstName ?? ""} ${r.referred?.lastName ?? ""}`.trim();
              const [fg, bg] = avatarColors(name);

              return (
                <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-sand/30 transition-colors">

                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2"
                    style={{ background: bg, color: fg, borderColor: fg + "40" }}
                  >
                    {getInitials(r.referred?.firstName ?? "", r.referred?.lastName ?? "")}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-obsidian">{name}</p>
                      <Badge variant={r.isActive ? "success" : "muted"} dot>
                        {r.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <p className="text-xs text-charcoal-muted mt-0.5 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {r.referred ? `Inscrit le ${formatDate(r.referred.createdAt)}` : "—"}
                      {r.referred?.country === "BE" && (
                        <span>· Belgique 🇧🇪</span>
                      )}
                    </p>
                  </div>

                  {/* Biens déclarés */}
                  <div className="text-center hidden sm:block">
                    <p className="text-lg font-bold text-obsidian">
                      {r.referred?._count?.declaredProps ?? 0}
                    </p>
                    <p className="text-[10px] text-charcoal-muted">bien(s)</p>
                  </div>

                  {/* Bonus */}
                  <div className="text-right flex-shrink-0">
                    {r.bonusPaid ? (
                      <div>
                        <p className="text-sm font-bold text-success">
                          +{formatPrice(r.bonusAmount || BONUS_REFERRAL_AMOUNT, "BE")}
                        </p>
                        <p className="text-[10px] text-success/70">Bonus versé</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-charcoal-muted">
                          {formatPrice(BONUS_REFERRAL_AMOUNT, "BE")}
                        </p>
                        <p className="text-[10px] text-charcoal-muted">En attente</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ════ Règles du programme ═════════════════════════════════════════════ */}
      <div className="bg-sand border border-sand-dark rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-obsidian mb-3">
          Comment fonctionne le parrainage ?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "01", title: "Partagez votre lien", desc: "Envoyez votre lien unique par WhatsApp, email ou réseaux sociaux." },
            { step: "02", title: "Votre filleul s'inscrit", desc: "Il crée son compte en utilisant votre code ou votre lien." },
            { step: "03", title: "Vente conclue → Bonus", desc: `Dès sa première vente signée, vous recevez ${BONUS_REFERRAL_AMOUNT.toLocaleString("fr-FR")} ${currency}.` },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#635BFF]/15 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-black text-[#635BFF]">{item.step}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-obsidian mb-0.5">{item.title}</p>
                <p className="text-[11px] text-charcoal-muted leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sous-composant StatCard ───────────────────────────────────────────────────
function StatCard({
  icon, iconBg, label, value, sub, isPrice = false,
}: {
  icon:    React.ReactNode;
  iconBg:  string;
  label:   string;
  value:   number | string;
  sub?:    string;
  isPrice?: boolean;
}) {
  return (
    <Card>
      <CardBody className="p-4">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", iconBg)}>
          {icon}
        </div>
        <p className="text-xs text-charcoal-muted font-medium mb-1">{label}</p>
        <p className={cn("font-bold text-obsidian", isPrice ? "text-base" : "text-2xl")}>
          {value}
        </p>
        {sub && <p className="text-[10px] text-charcoal-muted mt-0.5">{sub}</p>}
      </CardBody>
    </Card>
  );
}
