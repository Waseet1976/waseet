/**
 * ghl.service.ts
 * Intégration GoHighLevel (GHL) — CRM pipeline.
 * Appels vers l'API GHL v1 (REST).
 * Toutes les fonctions sont silencieuses si GHL_API_KEY manque.
 */

import type { PipelineStage } from "@prisma/client";

const GHL_BASE = "https://rest.gohighlevel.com/v1";

// ── Mapping PipelineStage Waseet → nom de stage GHL ──────────────────────────
// Les valeurs correspondent aux noms exacts définis dans votre pipeline GHL.
const WASEET_TO_GHL_STAGE: Record<PipelineStage, string> = {
  DECLARED:             "Déclaré",
  VALIDATED:            "Validé",
  IN_REVIEW:            "En révision",
  MANDATE_SIGNED:       "Mandat signé",
  COMPROMISE_SIGNED:    "Compromis signé",
  DEED_SIGNED:          "Acte signé",
  COMMISSION_VALIDATED: "Commission validée",
  COMMISSION_PAID:      "Commission payée",
};

// ── Helpers HTTP ──────────────────────────────────────────────────────────────

function headers() {
  return {
    Authorization:  `Bearer ${process.env.GHL_API_KEY ?? ""}`,
    "Content-Type": "application/json",
  };
}

async function ghlFetch(
  path:    string,
  method:  "GET" | "POST" | "PUT" | "DELETE",
  body?:   Record<string, unknown>
): Promise<unknown> {
  if (!process.env.GHL_API_KEY) {
    console.warn("[ghl.service] GHL_API_KEY manquant — appel ignoré");
    return null;
  }

  const res = await fetch(`${GHL_BASE}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[ghl.service] ${method} ${path} → ${res.status}`, text);
    return null;
  }

  return res.json();
}

// ── Types locaux ──────────────────────────────────────────────────────────────

interface GhlUser {
  id:        string;
  email:     string;
  firstName: string;
  lastName:  string;
  phone?:    string | null;
  country?:  string | null;
}

interface GhlProperty {
  id:             string;
  reference:      string;
  city?:          string | null;
  neighborhood?:  string | null;
  country?:       string | null;
  estimatedPrice?: number | null;
  propertyType?:  string | null;
  pipelineStage:  PipelineStage;
}

// ── Fonctions publiques ───────────────────────────────────────────────────────

/**
 * Crée ou met à jour un contact GHL pour un utilisateur Waseet.
 * Retourne le contactId GHL ou null en cas d'échec.
 */
export async function createContact(user: GhlUser): Promise<string | null> {
  const data = await ghlFetch("/contacts/", "POST", {
    email:     user.email,
    firstName: user.firstName,
    lastName:  user.lastName,
    phone:     user.phone ?? undefined,
    country:   user.country ?? undefined,
    customField: [
      { id: "waseet_user_id", field_value: user.id },
    ],
    tags:      ["waseet", `role-user`],
    source:    "Waseet",
  }) as Record<string, unknown> | null;

  return (data?.contact as Record<string, string>)?.id ?? null;
}

/**
 * Crée une opportunité GHL pour un bien déclaré.
 * Retourne l'opportunityId GHL ou null.
 */
export async function createOpportunity(property: GhlProperty): Promise<string | null> {
  const pipelineId = process.env.GHL_PIPELINE_ID;
  if (!pipelineId) {
    console.warn("[ghl.service] GHL_PIPELINE_ID manquant — opportunité non créée");
    return null;
  }

  const stageLabel = WASEET_TO_GHL_STAGE[property.pipelineStage];

  const data = await ghlFetch("/opportunities/", "POST", {
    pipelineId,
    name:          `[${property.reference}] ${property.city ?? "Bien"} — Waseet`,
    status:        "open",
    pipelineStage: stageLabel,
    monetaryValue: property.estimatedPrice ?? 0,
    customFields:  [
      { id: "property_reference",   fieldValue: property.reference },
      { id: "property_city",        fieldValue: property.city ?? "" },
      { id: "property_type",        fieldValue: property.propertyType ?? "" },
      { id: "waseet_property_id",   fieldValue: property.id },
    ],
  }) as Record<string, unknown> | null;

  return (data?.opportunity as Record<string, string>)?.id ?? null;
}

/**
 * Met à jour le stage d'une opportunité GHL lors d'un changement de pipeline.
 */
export async function updateOpportunityStage(
  ghlOpportunityId: string,
  newStage:         PipelineStage
): Promise<void> {
  const stageLabel = WASEET_TO_GHL_STAGE[newStage];

  await ghlFetch(`/opportunities/${ghlOpportunityId}`, "PUT", {
    pipelineStage: stageLabel,
    status:        newStage === "COMMISSION_PAID" ? "won" : "open",
  });
}

/**
 * Retourne le mapping complet stages Waseet ↔ labels GHL.
 */
export function getStageMapping(): Record<PipelineStage, string> {
  return { ...WASEET_TO_GHL_STAGE };
}
