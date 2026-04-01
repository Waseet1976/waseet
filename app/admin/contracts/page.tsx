"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileText, ExternalLink, Download } from "lucide-react";

import { Badge }          from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { formatDate }     from "@/lib/utils";
import { cn }             from "@/lib/utils/cn";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ContractItem {
  id:            string;
  type:          "MANDATE" | "COMPROMISE" | "DEED" | "APPORTEUR_AGREEMENT";
  status:        "DRAFT" | "SENT" | "SIGNED" | "REJECTED";
  signedAt:      string | null;
  documentUrl:   string | null;
  createdAt:     string;
  property: {
    reference:      string;
    city:           string | null;
    neighborhood:   string | null;
    estimatedPrice: number | null;
    country:        string | null;
  };
  user: {
    firstName: string;
    lastName:  string;
    email:     string;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<ContractItem["type"], string> = {
  MANDATE:            "Mandat",
  COMPROMISE:         "Compromis",
  DEED:               "Acte de vente",
  APPORTEUR_AGREEMENT:"Convention apporteur",
};

const STATUS_CFG: Record<ContractItem["status"], { label: string; variant: "muted" | "warning" | "success" | "danger" }> = {
  DRAFT:    { label: "Brouillon", variant: "muted"    },
  SENT:     { label: "Envoyé",    variant: "warning"  },
  SIGNED:   { label: "Signé",     variant: "success"  },
  REJECTED: { label: "Rejeté",    variant: "danger"   },
};

const TAB_FILTERS: { key: string; label: string }[] = [
  { key: "",         label: "Tous"        },
  { key: "DRAFT",    label: "Brouillons"  },
  { key: "SENT",     label: "Envoyés"     },
  { key: "SIGNED",   label: "Signés"      },
  { key: "REJECTED", label: "Rejetés"     },
];

// ── Composant ─────────────────────────────────────────────────────────────────

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("waseet_token");
    const res   = await fetch("/api/contracts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const d = await res.json();
      setContracts(d.contracts ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = tab
    ? contracts.filter((c) => c.status === tab)
    : contracts;

  // Comptages par statut
  const countByStatus = contracts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-obsidian flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#635BFF]" />
          Contrats
        </h1>
        <p className="text-sm text-charcoal-muted mt-0.5">
          Suivi des contrats générés — {contracts.length} contrat{contracts.length !== 1 ? "s" : ""} au total
        </p>
      </div>

      {/* ── Cartes KPI ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["DRAFT","SENT","SIGNED","REJECTED"] as const).map((s) => {
          const cfg   = STATUS_CFG[s];
          const count = countByStatus[s] ?? 0;
          return (
            <Card key={s} padding="none">
              <CardBody className="p-4">
                <p className="text-2xl font-bold text-obsidian">{loading ? "—" : count}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* ── Onglets + Tableau ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-sand-dark/40 shadow-card overflow-hidden">

        {/* Onglets */}
        <div className="flex border-b border-sand-dark overflow-x-auto">
          {TAB_FILTERS.map((t) => {
            const count = t.key ? (countByStatus[t.key] ?? 0) : contracts.length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px flex items-center gap-1.5",
                  tab === t.key
                    ? "border-[#635BFF] text-[#635BFF] bg-[#635BFF]/5"
                    : "border-transparent text-charcoal-muted hover:text-charcoal"
                )}
              >
                {t.label}
                {count > 0 && (
                  <span className="text-xs bg-sand-dark text-charcoal-muted px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border-b border-sand-dark animate-pulse">
                  <div className="h-4 bg-sand rounded w-28" />
                  <div className="h-4 bg-sand rounded flex-1" />
                  <div className="h-4 bg-sand rounded w-32" />
                  <div className="h-4 bg-sand rounded w-24" />
                  <div className="h-4 bg-sand rounded w-20" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-charcoal-muted" />
              </div>
              <p className="text-sm font-semibold text-charcoal mb-1">Aucun contrat</p>
              <p className="text-xs text-charcoal-muted">
                {tab ? "Aucun contrat dans cet état." : "Aucun contrat généré pour l'instant."}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-dark bg-sand/40">
                  <Th>Bien</Th>
                  <Th>Type</Th>
                  <Th>Contact</Th>
                  <Th>Statut</Th>
                  <Th>Créé le</Th>
                  <Th>Signé le</Th>
                  <Th>Document</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const statusCfg = STATUS_CFG[c.status];
                  return (
                    <tr key={c.id} className="border-b border-sand-dark/50 hover:bg-sand/30 transition-colors">

                      {/* Bien */}
                      <td className="px-4 py-3.5">
                        <p className="font-mono font-bold text-[#635BFF] text-xs">{c.property.reference}</p>
                        <p className="text-charcoal font-medium mt-0.5">{c.property.city ?? "—"}</p>
                        {c.property.neighborhood && (
                          <p className="text-xs text-charcoal-muted">{c.property.neighborhood}</p>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold bg-sand px-2 py-1 rounded-lg text-charcoal">
                          {TYPE_LABEL[c.type]}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-obsidian">
                          {c.user.firstName} {c.user.lastName}
                        </p>
                        <p className="text-xs text-charcoal-muted">{c.user.email}</p>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3.5">
                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                      </td>

                      {/* Créé le */}
                      <td className="px-4 py-3.5 text-xs text-charcoal-muted whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </td>

                      {/* Signé le */}
                      <td className="px-4 py-3.5 text-xs text-charcoal-muted whitespace-nowrap">
                        {c.signedAt ? formatDate(c.signedAt) : <span className="text-charcoal-muted/50">—</span>}
                      </td>

                      {/* Document */}
                      <td className="px-4 py-3.5">
                        {c.documentUrl ? (
                          <a
                            href={c.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-medium text-[#635BFF] hover:text-[#4C45E0] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Télécharger
                          </a>
                        ) : (
                          <span className="text-xs text-charcoal-muted/50">—</span>
                        )}
                      </td>
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
