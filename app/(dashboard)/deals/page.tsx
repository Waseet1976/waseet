import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Deals",
};

export default function DealsPage() {
  const columns = [
    { id: "OPEN", label: "Ouvert", color: "bg-[#635BFF]/20 text-[#635BFF]" },
    { id: "IN_PROGRESS", label: "En cours", color: "bg-warning-bg text-warning" },
    { id: "NEGOTIATION", label: "Négociation", color: "bg-sand-dark text-charcoal" },
    { id: "UNDER_CONTRACT", label: "Sous contrat", color: "bg-success-bg text-success" },
    { id: "CLOSED_WON", label: "Gagné", color: "bg-success/20 text-success-dark" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Deals</h1>
          <p className="section-subtitle">Suivez vos opportunités commerciales</p>
        </div>
        <Link href="/deals/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau deal
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-72">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${col.color}`}>
              {col.label}
              <span className="ml-2 bg-white/50 rounded-full px-1.5 text-[10px]">0</span>
            </div>
            <div className="space-y-3">
              <div className="card border-2 border-dashed border-sand-dark text-center py-8 text-charcoal-muted text-sm cursor-pointer hover:border-[#635BFF]/50 hover:text-[#635BFF] transition-colors">
                + Ajouter un deal
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
