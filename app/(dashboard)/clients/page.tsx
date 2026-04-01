import { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Clients",
};

export default function ClientsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Clients</h1>
          <p className="section-subtitle">Gérez vos acheteurs, vendeurs et locataires</p>
        </div>
        <Link href="/clients/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un client
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
            <input className="input pl-9" placeholder="Rechercher par nom, téléphone..." />
          </div>
          <select className="input w-auto">
            <option value="">Tous les types</option>
            <option value="BUYER">Acheteur</option>
            <option value="SELLER">Vendeur</option>
            <option value="TENANT">Locataire</option>
            <option value="LANDLORD">Propriétaire</option>
            <option value="INVESTOR">Investisseur</option>
          </select>
          <select className="input w-auto">
            <option value="">Tout statut</option>
            <option value="LEAD">Lead</option>
            <option value="PROSPECT">Prospect</option>
            <option value="ACTIVE">Actif</option>
            <option value="CLOSED">Fermé</option>
          </select>
        </div>
      </div>

      <div className="card text-center py-16">
        <div className="text-5xl mb-4">👥</div>
        <h3 className="text-lg font-semibold text-obsidian mb-2">Aucun client pour l'instant</h3>
        <p className="text-charcoal-muted mb-6">Ajoutez votre premier client pour commencer</p>
        <Link href="/clients/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un client
        </Link>
      </div>
    </div>
  );
}
