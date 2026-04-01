"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Banknote, TrendingUp, CheckCircle2, Clock,
  ChevronDown, ExternalLink,
} from "lucide-react";

import { useAuth }              from "@/lib/hooks/useAuth";
import { Badge }                from "@/components/ui/Badge";
import { Card, CardBody }       from "@/components/ui/Card";
import {
  DEFAULT_COMMISSION_RATE,
  DEFAULT_APPORTEUR_SHARE,
  COMMISSION_STATUSES,
} from "@/lib/config";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn }                      from "@/lib/utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CommissionItem {
  id:              string;
  estimatedAmount: number | null;
  validatedAmount: number | null;
  status:          "ESTIMATED" | "VALIDATED" | "PAID";
  paidAt:          string | null;
  createdAt:       string;
  property: {
    id:             string;
    reference:      string;
    city:           string | null;
    propertyType:   string | null;
    estimatedPrice: number | null;
    country:        string | null;
    agency: {
      commissionRate: number;
      apporteurShare: number;
      name:           string;
    } | null;
  };
  apporteur: {
    firstName: string;
    lastName:  string;
    email:     string;
  };
}

interface Stats {
  estimated: { total: number; count: number };
  validated: { total: number; count: number };
  paid:      { total: number; count: number };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  APARTMENT: "Appartement", HOUSE: "Maison", VILLA: "Villa",
  LAND: "Terrain", COMMERCIAL: "Commercial", OFFICE: "Bureau",
  WAREHOUSE: "Entrepôt", OTHER: "Autre",
};

const TAB_FILTERS = [
  { key: "",          label: "Toutes"    },
  { key: "ESTIMATED", label: "Estimées"  },
  { key: "VALIDATED", label: "Validées"  },
  { key: "PAID",      label: "Payées"    },
];

// ── Composant ─────────────────────────────────────────────────────────────────

export default function CommissionsPage() {
  const { user, isLoading } = useAuth();

  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [stats, setStats]             = useState<Stats | null>(null);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState("");

  // Fetch ─────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (statusFilter: string) => {
    const token  = localStorage.getItem("waseet_token");
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/commissions?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const d = await res.json();
      setCommissions(d.commissions ?? []);
      setStats(d.stats ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && user) fetchData(tab);
  }, [isLoading, user, tab, fetchData]);

  const country  = "BE" as const;

  const isAdmin = user?.role === "ADMIN";

  // Action admin : valider ou payer
  async function handleAction(
    commId: string,
    action: "validate" | "pay",
    validatedAmount?: number
  ) {
    const token = localStorage.getItem("waseet_token");
    await fetch(`/api/commissions/${commId}`, {
      method:  "PATCH",
      headers: {
        "Content-Type":  "application/json",
        Authorization:   `Bearer ${token}`,
      },
      body: JSON.stringify({ action, validatedAmount }),
    });
    fetchData(tab);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-obsidian">Commissions</h1>
        <p className="text-sm text-charcoal-muted mt-0.5">
          Suivi de vos gains en tant qu'apporteur d'affaires
        </p>
      </div>

      {/* ── Cartes stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* En attente */}
        <Card className="border-warning/30">
          <CardBody className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <Badge variant="warning">{stats?.estimated.count ?? 0}</Badge>
            </div>
            <p className="text-xs text-charcoal-muted font-medium mb-1">Estimées</p>
            <p className="text-xl font-bold text-obsidian">
              {loading ? "—" : formatPrice(stats?.estimated.total ?? 0, country)}
            </p>
            <p className="text-[10px] text-charcoal-muted mt-1">En attente d'acte signé</p>
          </CardBody>
        </Card>

        {/* Validées */}
        <Card className="border-info/30">
          <CardBody className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
              <Badge variant="info">{stats?.validated.count ?? 0}</Badge>
            </div>
            <p className="text-xs text-charcoal-muted font-medium mb-1">Validées</p>
            <p className="text-xl font-bold text-obsidian">
              {loading ? "—" : formatPrice(stats?.validated.total ?? 0, country)}
            </p>
            <p className="text-[10px] text-charcoal-muted mt-1">Montant confirmé</p>
          </CardBody>
        </Card>

        {/* Payées */}
        <Card className="border-success/30">
          <CardBody className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <Badge variant="success">{stats?.paid.count ?? 0}</Badge>
            </div>
            <p className="text-xs text-charcoal-muted font-medium mb-1">Payées</p>
            <p className="text-xl font-bold text-obsidian">
              {loading ? "—" : formatPrice(stats?.paid.total ?? 0, country)}
            </p>
            <p className="text-[10px] text-charcoal-muted mt-1">Versé sur votre compte</p>
          </CardBody>
        </Card>
      </div>

      {/* ── Formule de calcul ───────────────────────────────────────────────── */}
      <div className="bg-sand border border-sand-dark rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#635BFF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Banknote className="w-4 h-4 text-[#635BFF]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-obsidian mb-1">Formule de calcul</p>
            <p className="text-xs text-charcoal leading-relaxed">
              <span className="font-mono bg-white border border-sand-dark px-1.5 py-0.5 rounded text-[#635BFF] font-bold">
                Prix vente × {DEFAULT_COMMISSION_RATE}% (agence) × {DEFAULT_APPORTEUR_SHARE}% (apporteur)
              </span>
              <br />
              <span className="text-charcoal-muted mt-1 block">
                Les taux peuvent varier selon l'agence partenaire. Le montant final est validé après signature de l'acte.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Onglets + Tableau ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card overflow-hidden">

        {/* Onglets */}
        <div className="flex border-b border-sand-dark overflow-x-auto">
          {TAB_FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setLoading(true); }}
              className={cn(
                "px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px",
                tab === t.key
                  ? "border-[#635BFF] text-[#635BFF] bg-[#635BFF]/5"
                  : "border-transparent text-charcoal-muted hover:text-charcoal"
              )}
            >
              {t.label}
              {t.key === "" && commissions.length > 0 && (
                <span className="ml-2 text-xs bg-sand-dark text-charcoal-muted px-1.5 py-0.5 rounded-full">
                  {commissions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border-b border-sand-dark animate-pulse">
                  <div className="h-4 bg-sand rounded w-28" />
                  <div className="h-4 bg-sand rounded w-40 flex-1" />
                  <div className="h-4 bg-sand rounded w-24" />
                  <div className="h-4 bg-sand rounded w-24" />
                  <div className="h-4 bg-sand rounded w-20" />
                </div>
              ))}
            </div>
          ) : commissions.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center mb-4">
                <Banknote className="w-6 h-6 text-charcoal-muted" />
              </div>
              <p className="text-sm font-semibold text-charcoal mb-1">Aucune commission</p>
              <p className="text-xs text-charcoal-muted">
                {tab ? "Aucune commission dans cet onglet." : "Déclarez des biens pour commencer à gagner des commissions."}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-dark bg-sand/40">
                  <Th>Référence</Th>
                  <Th>Bien</Th>
                  <Th>Prix vente</Th>
                  <Th>% Agence</Th>
                  <Th>% Apporteur</Th>
                  <Th>Ma commission</Th>
                  <Th>Statut</Th>
                  <Th>Date</Th>
                  {isAdmin && <Th>Actions</Th>}
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => {
                  const commRate   = c.property.agency?.commissionRate ?? DEFAULT_COMMISSION_RATE;
                  const appShare   = c.property.agency?.apporteurShare ?? DEFAULT_APPORTEUR_SHARE;
                  const cc         = "BE" as const;
                  const amount     = c.validatedAmount ?? c.estimatedAmount ?? 0;
                  const isEstimated = c.status === "ESTIMATED";
                  const statusCfg  = COMMISSION_STATUSES[c.status];

                  return (
                    <tr
                      key={c.id}
                      className="border-b border-sand-dark/50 hover:bg-sand/30 transition-colors"
                    >
                      {/* Référence */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/properties/${c.property.id}`}
                          className="font-mono font-bold text-[#635BFF] hover:text-[#4C45E0] flex items-center gap-1 transition-colors"
                        >
                          {c.property.reference}
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </Link>
                      </td>

                      {/* Bien */}
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-obsidian">{c.property.city ?? "—"}</p>
                        <p className="text-xs text-charcoal-muted">
                          {TYPE_LABEL[c.property.propertyType ?? ""] ?? c.property.propertyType}
                        </p>
                      </td>

                      {/* Prix vente */}
                      <td className="px-4 py-3.5 font-medium text-charcoal">
                        {c.property.estimatedPrice
                          ? formatPrice(c.property.estimatedPrice, "BE")
                          : <span className="text-charcoal-muted">—</span>}
                      </td>

                      {/* % Agence */}
                      <td className="px-4 py-3.5 text-charcoal-muted">
                        {commRate}%
                      </td>

                      {/* % Apporteur */}
                      <td className="px-4 py-3.5 text-charcoal-muted">
                        {appShare}%
                      </td>

                      {/* Commission */}
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "font-bold text-base",
                            c.status === "PAID"      && "text-success",
                            c.status === "VALIDATED" && "text-info",
                            c.status === "ESTIMATED" && "text-warning"
                          )}
                        >
                          {formatPrice(amount, "BE")}
                        </span>
                        {isEstimated && (
                          <p className="text-[10px] text-charcoal-muted">estimée</p>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            c.status === "PAID"      ? "success" :
                            c.status === "VALIDATED" ? "info"    : "warning"
                          }
                        >
                          {statusCfg.label}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-xs text-charcoal-muted whitespace-nowrap">
                        {c.paidAt ? formatDate(c.paidAt) : formatDate(c.createdAt)}
                      </td>

                      {/* Actions admin */}
                      {isAdmin && (
                        <td className="px-4 py-3.5">
                          <AdminActions
                            commission={c}
                            onAction={handleAction}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sous-composants ───────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}

function AdminActions({
  commission,
  onAction,
}: {
  commission: CommissionItem;
  onAction: (id: string, action: "validate" | "pay", amount?: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(
    commission.validatedAmount ?? commission.estimatedAmount ?? 0
  );

  if (commission.status === "PAID") {
    return <span className="text-xs text-charcoal-muted">—</span>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-medium text-[#635BFF] hover:text-[#4C45E0] transition-colors"
      >
        Actions <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-20 bg-white rounded-xl shadow-lg border border-sand-dark p-3 w-56">
          {commission.status === "ESTIMATED" && (
            <>
              <p className="text-[11px] text-charcoal-muted mb-2">Montant validé (€)</p>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-8 border border-sand-dark rounded-lg px-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
              />
              <button
                onClick={() => { onAction(commission.id, "validate", amount); setOpen(false); }}
                className="w-full text-xs font-semibold bg-[#635BFF]/10 text-[#635BFF] hover:bg-[#635BFF]/20 rounded-lg py-1.5 transition-colors mb-1"
              >
                Valider la commission
              </button>
            </>
          )}
          {commission.status === "VALIDATED" && (
            <button
              onClick={() => { onAction(commission.id, "pay"); setOpen(false); }}
              className="w-full text-xs font-semibold bg-success/10 text-success hover:bg-success/20 rounded-lg py-1.5 transition-colors"
            >
              Marquer comme payée
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            className="w-full text-xs text-charcoal-muted hover:text-charcoal rounded-lg py-1 mt-1 transition-colors"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}
