"use client";

import { useEffect, useState, useCallback } from "react";
import Link                                  from "next/link";
import {
  Building2, Banknote, CheckCircle2, Users,
  PlusCircle, ArrowRight, Star, TrendingUp,
  Clock, MapPin, ChevronRight, Zap,
  type LucideIcon,
} from "lucide-react";

import { useAuth }          from "@/lib/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge }            from "@/components/ui/Badge";
import { PIPELINE_STAGES }  from "@/lib/config";
import { formatPrice, formatDate, formatRelativeDate, getInitials, truncate } from "@/lib/utils";

// ── Types réponse API ─────────────────────────────────────────
interface DashboardData {
  user: {
    id: string; firstName: string; lastName: string;
    email: string; role: string; country: string | null;
    referralCode: string; createdAt: string;
  };
  stats: {
    totalProperties: number; activeProperties: number; paidProperties: number;
    pendingCommissions: number; validatedCommissions: number; paidCommissions: number;
  };
  pipeline:  Record<string, number>;
  recentProperties: {
    id: string; reference: string; city: string | null; neighborhood: string | null;
    address: string | null; propertyType: string | null; estimatedPrice: number | null;
    pipelineStage: string; adminStatus: string;
    isPriority: boolean; country: string | null; createdAt: string; photos: string[];
  }[];
  referralStats: {
    total: number; bonusPaid: number; bonusPending: number; totalBonus: number;
    referredUsers: { firstName: string; lastName: string; role: string; createdAt: string; bonusPaid: boolean }[];
  };
}

// ── Helpers ───────────────────────────────────────────────────
const COUNTRY: Record<string, string> = { BE: "Belgique 🇧🇪" };

// ── Labels par rôle ───────────────────────────────────────────
const ROLE_LABEL: Record<string, string> = {
  DEAL_FINDER: "Apporteur d'affaires",
  AGENT:       "Agent immobilier",
  AGENCY:      "Agence immobilière",
  ADMIN:       "Administrateur",
};

// ── Actions rapides par rôle ──────────────────────────────────
const ROLE_QUICK_ACTIONS: Record<
  string,
  { href: string; label: string; icon: LucideIcon; accent: boolean }[]
> = {
  DEAL_FINDER: [
    { href: "/declare",     label: "Déclarer un bien", icon: PlusCircle,  accent: true  },
    { href: "/properties",  label: "Mes biens",         icon: Building2,   accent: false },
    { href: "/commissions", label: "Commissions",       icon: Banknote,    accent: false },
    { href: "/referral",    label: "Mon réseau",        icon: Users,       accent: false },
  ],
  AGENT: [
    { href: "/properties",  label: "Biens assignés",   icon: Building2,   accent: true  },
    { href: "/pipeline",    label: "Pipeline",          icon: TrendingUp,  accent: false },
    { href: "/commissions", label: "Commissions",       icon: Banknote,    accent: false },
    { href: "/clients",     label: "Clients",           icon: Users,       accent: false },
  ],
  AGENCY: [
    { href: "/properties",  label: "Biens assignés",   icon: Building2,   accent: true  },
    { href: "/pipeline",    label: "Pipeline",          icon: TrendingUp,  accent: false },
    { href: "/commissions", label: "Commissions",       icon: Banknote,    accent: false },
    { href: "/clients",     label: "Clients",           icon: Users,       accent: false },
  ],
};

function stageBadge(stage: string): { variant: "success" | "warning" | "gold" | "muted" | "info"; label: string } {
  const cfg = PIPELINE_STAGES[stage as keyof typeof PIPELINE_STAGES];
  const prog = cfg?.progress ?? 0;
  if (prog === 100) return { variant: "success", label: cfg?.label ?? stage };
  if (prog >= 57)   return { variant: "gold",    label: cfg?.label ?? stage };
  if (prog >= 28)   return { variant: "warning",  label: cfg?.label ?? stage };
  return               { variant: "muted",    label: cfg?.label ?? stage };
}

function adminBadge(status: string) {
  if (status === "VALIDATED") return <Badge variant="success">Validé</Badge>;
  if (status === "REJECTED")  return <Badge variant="danger">Rejeté</Badge>;
  return <Badge variant="warning">En attente</Badge>;
}

// ── Skeleton ──────────────────────────────────────────────────
function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-sand rounded-xl animate-pulse ${className ?? ""}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonBlock className="h-32 rounded-3xl" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-32" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-20" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonBlock className="h-80" />
        <div className="space-y-5">
          <SkeletonBlock className="h-52" />
          <SkeletonBlock className="h-24" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem("waseet_token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
        cache:   "no-store",
      });
      if (!res.ok) throw new Error("Erreur de chargement");
      setData(await res.json());
    } catch {
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchStats();
  }, [authLoading, fetchStats]);

  if (loading || authLoading) return <DashboardSkeleton />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-danger font-medium mb-3">{error}</p>
        <button onClick={fetchStats} className="btn-primary">Réessayer</button>
      </div>
    );
  }
  if (!data) return null;

  const { user, stats, pipeline, recentProperties, referralStats } = data;
  const countryCode = "BE" as const;
  const STAGES_ORDERED = Object.keys(PIPELINE_STAGES) as (keyof typeof PIPELINE_STAGES)[];

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── 1. BLOC BIENVENUE ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-obsidian to-charcoal p-6 sm:p-8">
        {/* Motif déco */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #C9973A 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #C9973A, transparent 70%)", filter: "blur(40px)" }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ background: "linear-gradient(135deg,#C9973A,#E5B85C)" }}>
            {getInitials(user.firstName, user.lastName)}
          </div>

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Bonjour, {user.firstName} 👋
            </h1>
            <p className="text-white/60 text-sm mt-1">
              <span className="text-[#635BFF] font-medium">
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
              {user.country && (
                <> · {COUNTRY[user.country] ?? user.country}</>
              )}
            </p>
            <p className="text-white/35 text-xs mt-1.5">
              Membre depuis {formatDate(user.createdAt)}
              <span className="mx-2">·</span>
              Code&nbsp;:&nbsp;
              <span className="text-[#635BFF] font-mono font-semibold">{user.referralCode}</span>
            </p>
          </div>

          {/* Stats rapides */}
          <div className="flex gap-4 sm:gap-6 shrink-0">
            {(user.role === "DEAL_FINDER"
              ? [
                  { value: stats.totalProperties, label: "Biens" },
                  { value: stats.paidProperties,  label: "Vendus" },
                  { value: referralStats.total,   label: "Filleuls" },
                ]
              : [
                  { value: stats.totalProperties,  label: "Biens" },
                  { value: stats.activeProperties, label: "En cours" },
                  { value: stats.paidProperties,   label: "Vendus" },
                ]
            ).map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. CARTES STATISTIQUES ────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {[
          {
            label:   "Biens déclarés",
            value:   stats.totalProperties,
            icon:    Building2,
            color:   "text-[#635BFF]",
            bg:      "bg-[#635BFF]/8",
            trend:   stats.activeProperties > 0 ? `${stats.activeProperties} en cours` : "Aucun en cours",
            trendUp: true,
          },
          {
            label:   "En cours",
            value:   stats.activeProperties,
            icon:    Clock,
            color:   "text-warning",
            bg:      "bg-warning-bg",
            trend:   stats.paidProperties > 0 ? `${stats.paidProperties} finalisés` : "Aucun finalisé",
            trendUp: stats.paidProperties > 0,
          },
          {
            label:   "Commissions en attente",
            value:   formatPrice(stats.pendingCommissions, "BE"),
            icon:    TrendingUp,
            color:   "text-[#635BFF]",
            bg:      "bg-[#635BFF]/8",
            trend:   formatPrice(stats.validatedCommissions, "BE") + " validées",
            trendUp: stats.validatedCommissions > 0,
          },
          {
            label:   "Commissions reçues",
            value:   formatPrice(stats.paidCommissions, "BE"),
            icon:    CheckCircle2,
            color:   "text-emerald-600",
            bg:      "bg-emerald-50",
            trend:   referralStats.totalBonus > 0
                       ? `+ ${formatPrice(referralStats.totalBonus, "BE")} bonus parrainage`
                       : "Parrainez pour gagner des bonus",
            trendUp: referralStats.totalBonus > 0,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} padding="md" className="hover:shadow-card-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-black leading-none">{card.value}</p>
              <p className="text-sm text-charcoal-muted mt-1">{card.label}</p>
              <p className={`text-xs mt-2.5 flex items-center gap-1 ${card.trendUp ? "text-emerald-600" : "text-charcoal-muted"}`}>
                {card.trendUp && <TrendingUp className="w-3 h-3" />}
                {card.trend}
              </p>
            </Card>
          );
        })}
      </div>

      {/* ── 3. ACTIONS RAPIDES ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {(ROLE_QUICK_ACTIONS[user.role] ?? ROLE_QUICK_ACTIONS.DEAL_FINDER).map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 text-center transition-all duration-200 group ${
                action.accent
                  ? "border-[#635BFF] bg-[#635BFF]/5 hover:bg-[#635BFF] hover:border-[#635BFF] text-[#635BFF] hover:text-white"
                  : "border-sand-dark bg-white hover:border-[#635BFF]/50 hover:bg-[#635BFF]/5 text-charcoal hover:text-obsidian"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                action.accent ? "bg-[#635BFF]/15 group-hover:bg-white/20" : "bg-sand group-hover:bg-[#635BFF]/10"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold leading-tight">{action.label}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity -mt-1" />
            </Link>
          );
        })}
      </div>

      {/* ── 4. GRILLE 2 COLONNES ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">

        {/* Colonne gauche — Biens récents */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-sand-dark/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{user.role === "DEAL_FINDER" ? "Biens récents" : "Biens assignés"}</CardTitle>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  {user.role === "DEAL_FINDER" ? "Vos 5 derniers biens déclarés" : "Vos 5 derniers biens assignés"}
                </p>
              </div>
              <Link href="/properties"
                className="text-xs text-[#635BFF] hover:text-[#4C45E0] font-medium flex items-center gap-1 transition-colors">
                Tout voir <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {recentProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5 text-charcoal-muted" />
              </div>
              <p className="text-sm font-medium text-black">Aucun bien déclaré</p>
              <p className="text-xs text-charcoal-muted mt-1 mb-4">Commencez par déclarer votre premier bien</p>
              <Link href="/declare" className="btn-primary text-sm px-4 py-2">
                Déclarer un bien
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentProperties.map((prop) => {
                const sb = stageBadge(prop.pipelineStage);
                return (
                  <li key={prop.id}>
                    <Link
                      href={`/property/${prop.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[#faf8f5] transition-colors group"
                    >
                      {/* Miniature ou placeholder */}
                      <div className="w-12 h-12 rounded-xl bg-sand shrink-0 overflow-hidden">
                        {prop.photos[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={prop.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-charcoal-muted" />
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {prop.isPriority && (
                            <Star className="w-3 h-3 text-[#635BFF] shrink-0 fill-gold" />
                          )}
                          <p className="text-sm font-semibold text-black truncate">
                            {prop.propertyType
                              ? `${prop.propertyType} · ${prop.city ?? "?"}`
                              : (prop.city ?? "Bien")}
                          </p>
                        </div>
                        <p className="text-xs text-charcoal-muted truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {[prop.neighborhood, prop.address].filter(Boolean).join(", ") || prop.city || "—"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {adminBadge(prop.adminStatus)}
                          <Badge variant={sb.variant}>{sb.label}</Badge>
                        </div>
                      </div>

                      {/* Prix + flèche */}
                      <div className="text-right shrink-0">
                        {prop.estimatedPrice ? (
                          <p className="text-sm font-bold text-black">
                            {formatPrice(prop.estimatedPrice, "BE")}
                          </p>
                        ) : (
                          <p className="text-xs text-charcoal-muted">Prix N/C</p>
                        )}
                        <p className="text-[10px] text-charcoal-muted mt-0.5">
                          {formatRelativeDate(prop.createdAt)}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-sand-dark shrink-0 group-hover:text-[#635BFF] transition-colors" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Colonne droite */}
        <div className="space-y-5">

          {/* Pipeline global */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline global</CardTitle>
              <Badge variant="muted">{stats.totalProperties} biens</Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              {STAGES_ORDERED.map((stage) => {
                const cfg   = PIPELINE_STAGES[stage];
                const count = pipeline[stage] ?? 0;
                const pct   = stats.totalProperties > 0
                  ? Math.round((count / stats.totalProperties) * 100)
                  : 0;

                if (count === 0) return null;

                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-charcoal font-medium">{cfg.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-black">{count}</span>
                        <span className="text-[10px] text-charcoal-muted">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-sand rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                      />
                    </div>
                  </div>
                );
              })}

              {stats.totalProperties === 0 && (
                <p className="text-sm text-charcoal-muted text-center py-4">
                  Déclarez un bien pour voir votre pipeline
                </p>
              )}
            </CardBody>

            {stats.totalProperties > 0 && (
              <CardFooter>
                <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                  <Zap className="w-3.5 h-3.5 text-[#635BFF]" />
                  {stats.activeProperties} bien{stats.activeProperties !== 1 ? "s" : ""} en cours de traitement
                </div>
              </CardFooter>
            )}
          </Card>

          {/* Mon réseau — visible pour les apporteurs uniquement */}
          {user.role === "DEAL_FINDER" && <Card>
            <CardHeader>
              <CardTitle>Mon réseau</CardTitle>
              <Link href="/referral" className="text-xs text-[#635BFF] hover:text-[#4C45E0] font-medium flex items-center gap-1">
                Gérer <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardBody>
              {/* Stats réseau */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Filleuls",     value: referralStats.total },
                  { label: "Bonus reçus",  value: referralStats.bonusPaid },
                  {
                    label:  "Bonus total",
                    value:  formatPrice(referralStats.totalBonus, "BE"),
                  },
                ].map((s) => (
                  <div key={s.label} className="text-center bg-[#faf8f5] rounded-xl p-3">
                    <p className="text-base font-bold text-black">{s.value}</p>
                    <p className="text-[10px] text-charcoal-muted mt-0.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Liste filleuls récents */}
              {referralStats.referredUsers.length > 0 ? (
                <ul className="space-y-2">
                  {referralStats.referredUsers.map((ru, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg,#C9973A,#E5B85C)" }}>
                        {getInitials(ru.firstName, ru.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">
                          {ru.firstName} {ru.lastName}
                        </p>
                        <p className="text-[10px] text-charcoal-muted">
                          Rejoint {formatRelativeDate(ru.createdAt)}
                        </p>
                      </div>
                      {ru.bonusPaid
                        ? <Badge variant="success">Bonus reçu</Badge>
                        : <Badge variant="warning">En attente</Badge>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-3">
                  <p className="text-sm text-charcoal-muted">Aucun filleul pour l'instant</p>
                  <p className="text-xs text-charcoal-muted mt-1">
                    Partagez votre code{" "}
                    <span className="text-[#635BFF] font-mono font-semibold">{user.referralCode}</span>
                  </p>
                </div>
              )}
            </CardBody>
          </Card>}
        </div>
      </div>
    </div>
  );
}
