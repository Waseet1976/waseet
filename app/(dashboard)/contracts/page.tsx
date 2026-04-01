"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText, PenLine, Download, Clock, CheckCircle2,
  XCircle, FileX, RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils/cn";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ContractItem {
  id:                 string;
  type:               "MANDATE" | "COMPROMISE" | "DEED" | "APPORTEUR_AGREEMENT";
  status:             "DRAFT" | "SENT" | "SIGNED" | "REJECTED";
  hellosignRequestId: string | null;
  signedAt:           string | null;
  documentUrl:        string | null;
  createdAt:          string;
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

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ContractItem["type"], string> = {
  MANDATE:             "Mandat de vente",
  COMPROMISE:          "Compromis de vente",
  DEED:                "Acte de vente",
  APPORTEUR_AGREEMENT: "Convention apporteur",
};

const STATUS_CONFIG: Record<
  ContractItem["status"],
  { label: string; className: string; icon: React.ReactNode }
> = {
  DRAFT:    { label: "Brouillon",              className: "bg-sand text-charcoal-muted",         icon: <FileText    className="w-3 h-3" /> },
  SENT:     { label: "En attente de signature", className: "bg-warning-bg text-warning",           icon: <Clock       className="w-3 h-3" /> },
  SIGNED:   { label: "Signé ✓",               className: "bg-emerald-100 text-emerald-700",       icon: <CheckCircle2 className="w-3 h-3" /> },
  REJECTED: { label: "Refusé",                className: "bg-red-100 text-red-700",               icon: <XCircle     className="w-3 h-3" /> },
};

// ── Composant ─────────────────────────────────────────────────────────────────

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState<ContractItem["status"] | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("waseet_token") ?? "";
      const res   = await fetch("/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setContracts(data.contracts ?? []);
    } catch {
      setError("Impossible de charger les contrats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter
    ? contracts.filter((c) => c.status === filter)
    : contracts;

  const tabs: { value: ContractItem["status"] | ""; label: string }[] = [
    { value: "",          label: "Tous" },
    { value: "SENT",     label: "À signer" },
    { value: "SIGNED",   label: "Signés" },
    { value: "DRAFT",    label: "Brouillons" },
    { value: "REJECTED", label: "Refusés" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-obsidian">Mes contrats</h1>
          <p className="text-sm text-charcoal-muted mt-0.5">
            Gérez et signez vos contrats immobiliers
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-sand-dark rounded-lg hover:bg-sand transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-white border border-sand-dark rounded-xl p-1 w-fit flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={cn(
              "px-4 py-2 text-sm rounded-lg transition-colors font-medium",
              filter === t.value
                ? "bg-obsidian text-white"
                : "text-charcoal-muted hover:bg-sand"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#635BFF] border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && error && (
        <p className="text-center text-sm text-charcoal-muted py-12">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 bg-white border border-sand-dark rounded-xl">
          <FileX className="w-10 h-10 text-charcoal-muted/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-obsidian">Aucun contrat</p>
          <p className="text-xs text-charcoal-muted mt-1">
            {filter ? "Aucun contrat dans cette catégorie" : "Vos contrats apparaîtront ici"}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-white border border-sand-dark rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-dark bg-sand/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Bien</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide hidden md:table-cell">Créé par</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-charcoal-muted uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark/60">
                {filtered.map((contract) => {
                  const statusConf = STATUS_CONFIG[contract.status];
                  return (
                    <tr key={contract.id} className="hover:bg-sand/30 transition-colors">

                      {/* Bien */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/properties/${contract.property.reference}`}
                          className="font-mono text-xs font-bold text-[#635BFF] hover:underline"
                        >
                          {contract.property.reference}
                        </Link>
                        {contract.property.city && (
                          <p className="text-xs text-charcoal-muted mt-0.5">{contract.property.city}</p>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-charcoal-muted" />
                          <span className="text-sm text-obsidian">{TYPE_LABELS[contract.type]}</span>
                        </div>
                      </td>

                      {/* Créé par */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-obsidian">
                          {contract.user.firstName} {contract.user.lastName}
                        </p>
                        <p className="text-[11px] text-charcoal-muted">{contract.user.email}</p>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full",
                          statusConf.className
                        )}>
                          {statusConf.icon}
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-charcoal-muted">
                        {contract.signedAt
                          ? formatDate(contract.signedAt)
                          : formatDate(contract.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* Signer — lien externe HelloSign */}
                          {contract.status === "SENT" && (
                            <a
                              href={`/api/contracts/${contract.id}/status`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#635BFF] hover:bg-[#635BFF]/90 text-obsidian rounded-lg transition-colors"
                            >
                              <PenLine className="w-3 h-3" /> Signer
                            </a>
                          )}

                          {/* Télécharger PDF */}
                          {contract.status === "SIGNED" && (
                            <a
                              href={`/api/contracts/${contract.id}/download`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            >
                              <Download className="w-3 h-3" /> PDF
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
