/**
 * maps.service.ts
 * Service de géocodage serveur via Google Geocoding API.
 * Utilisé côté API route uniquement (clé serveur GOOGLE_MAPS_KEY).
 * Tombe en fallback sur NEXT_PUBLIC_GOOGLE_MAPS_KEY si la clé serveur manque.
 */

import { prisma } from "@/lib/prisma";

const GEOCODING_BASE = "https://maps.googleapis.com/maps/api/geocode/json";

function getApiKey(): string {
  return (
    process.env.GOOGLE_MAPS_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ??
    ""
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GeocodeResult {
  lat:              number;
  lng:              number;
  formattedAddress: string;
}

// ── geocodeAddress ─────────────────────────────────────────────────────────────

/**
 * Convertit une adresse en coordonnées GPS.
 * Retourne null si introuvable ou en cas d'erreur.
 */
export async function geocodeAddress(
  address: string,
  city:    string,
  country: string
): Promise<GeocodeResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[maps.service] Clé Google Maps manquante — géocodage ignoré");
    return null;
  }

  // Construire la query : adresse + ville + pays
  const countryMap: Record<string, string> = { MA: "Maroc", BE: "Belgique" };
  const parts  = [address, city, countryMap[country] ?? country].filter(Boolean);
  const query  = parts.join(", ");

  const url = `${GEOCODING_BASE}?address=${encodeURIComponent(query)}&key=${apiKey}&language=fr`;

  try {
    const res  = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
    const data = await res.json() as {
      status:  string;
      results: Array<{
        geometry:           { location: { lat: number; lng: number } };
        formatted_address:  string;
      }>;
    };

    if (data.status !== "OK" || data.results.length === 0) {
      console.warn(`[maps.service] Geocoding ${data.status} pour "${query}"`);
      return null;
    }

    const first = data.results[0]!;
    return {
      lat:              first.geometry.location.lat,
      lng:              first.geometry.location.lng,
      formattedAddress: first.formatted_address,
    };
  } catch (err) {
    console.error("[maps.service] geocodeAddress error:", err);
    return null;
  }
}

// ── batchGeocodeProperties ─────────────────────────────────────────────────────

export interface BatchGeocodeResult {
  propertyId: string;
  success:    boolean;
  lat?:       number;
  lng?:       number;
}

/**
 * Géocode plusieurs biens en parallèle (avec throttle pour éviter le dépassement de quota).
 * Ne met à jour que les biens qui n'ont pas encore de coordonnées.
 *
 * @param propertyIds  IDs des biens à géocoder (si vide → tous les biens sans coordonnées)
 * @param concurrency  Nombre de requêtes simultanées (défaut 5)
 */
export async function batchGeocodeProperties(
  propertyIds?: string[],
  concurrency = 5
): Promise<BatchGeocodeResult[]> {
  // Récupérer les biens sans coordonnées
  const where = {
    latitude:  null,
    longitude: null,
    ...(propertyIds?.length ? { id: { in: propertyIds } } : {}),
  };

  const properties = await prisma.property.findMany({
    where,
    select: {
      id:      true,
      address: true,
      city:    true,
      country: true,
    },
  });

  if (properties.length === 0) return [];

  const results: BatchGeocodeResult[] = [];

  // Traitement par chunks pour respecter le quota
  for (let i = 0; i < properties.length; i += concurrency) {
    const chunk = properties.slice(i, i + concurrency);

    const chunkResults = await Promise.all(
      chunk.map(async (p) => {
        if (!p.city) return { propertyId: p.id, success: false };

        const coords = await geocodeAddress(
          p.address ?? "",
          p.city,
          p.country ?? "MA"
        );

        if (!coords) return { propertyId: p.id, success: false };

        await prisma.property.update({
          where: { id: p.id },
          data:  { latitude: coords.lat, longitude: coords.lng },
        });

        return {
          propertyId: p.id,
          success:    true,
          lat:        coords.lat,
          lng:        coords.lng,
        };
      })
    );

    results.push(...chunkResults);

    // Petite pause entre les chunks pour éviter les rate limits
    if (i + concurrency < properties.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return results;
}
