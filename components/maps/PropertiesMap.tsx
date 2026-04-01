"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader }      from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { MapPin, Layers, Filter, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { PIPELINE_STAGES } from "@/lib/config";
import { cn } from "@/lib/utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MapProperty {
  id:             string;
  reference:      string;
  city:           string | null;
  neighborhood?:  string | null;
  latitude?:      number | null;
  longitude?:     number | null;
  pipelineStage:  string;
  isPriority:     boolean;
  estimatedPrice?: number | null;
  surfaceSqm?:    number | null;
  country?:       string | null;
  propertyType?:  string | null;
}

interface PropertiesMapProps {
  properties:  MapProperty[];
  selectedId?: string | null;
  onSelect?:   (id: string) => void;
  className?:  string;
  showFilters?: boolean;
}

// ── InfoWindow HTML ───────────────────────────────────────────────────────────

function buildInfoContent(p: MapProperty): string {
  const stageConf  = PIPELINE_STAGES[p.pipelineStage as keyof typeof PIPELINE_STAGES];
  const stageLabel = stageConf?.label ?? p.pipelineStage;
  const stageColor = stageConf?.color ?? "#6B7280";
  const priceStr   = p.estimatedPrice
    ? formatPrice(p.estimatedPrice, "BE")
    : "";

  return `
    <div style="font-family:Inter,system-ui,sans-serif;padding:4px 0 2px;min-width:210px;max-width:250px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="color:#C9973A;font-weight:700;font-size:12px;font-family:monospace">${p.reference}</span>
        ${p.isPriority ? '<span style="font-size:10px;color:#C9973A;font-weight:600">⭐ Prioritaire</span>' : ""}
      </div>
      <p style="color:#1C1C1A;font-size:13px;font-weight:600;margin:0 0 3px">
        ${p.city}${p.neighborhood ? ` · ${p.neighborhood}` : ""}
      </p>
      <div style="display:flex;gap:6px;margin-bottom:4px;flex-wrap:wrap">
        ${p.surfaceSqm ? `<span style="color:#3C3C3A;font-size:11px">${p.surfaceSqm} m²</span>` : ""}
        ${p.propertyType ? `<span style="color:#3C3C3A;font-size:11px">${p.propertyType}</span>` : ""}
      </div>
      ${priceStr ? `<p style="color:#1C1C1A;font-weight:700;font-size:13px;margin:0 0 6px">${priceStr}</p>` : ""}
      <span style="display:inline-block;background:${stageColor}20;color:${stageColor};font-size:10px;font-weight:600;padding:2px 8px;border-radius:6px;margin-bottom:8px">
        ${stageLabel}
      </span>
      <div>
        <a href="/properties/${p.id}"
           style="display:inline-block;background:#C9973A;color:white;font-size:11px;font-weight:600;
                  padding:5px 12px;border-radius:8px;text-decoration:none">
          Voir le détail →
        </a>
      </div>
    </div>
  `;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function PropertiesMap({
  properties,
  selectedId,
  onSelect,
  className,
  showFilters = true,
}: PropertiesMapProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<google.maps.Map | null>(null);
  const markersRef     = useRef<Map<string, google.maps.Marker>>(new Map());
  const clustererRef   = useRef<MarkerClusterer | null>(null);
  const infoWindowRef  = useRef<google.maps.InfoWindow | null>(null);
  const onSelectRef    = useRef(onSelect);

  const [mapReady,  setMapReady]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  // Filtres carte
  const [filterStage,    setFilterStage]    = useState("");
  const [filterPriority, setFilterPriority] = useState(false);
  const [filterCountry,  setFilterCountry]  = useState("");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";

  // Sync onSelect ref
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  // ── Init carte ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapReady) return;
    if (!apiKey) {
      setError("Clé API Google Maps non configurée (NEXT_PUBLIC_GOOGLE_MAPS_KEY)");
      return;
    }

    const loader = new Loader({ apiKey, version: "weekly", libraries: ["maps", "marker"] });

    loader.load().then(() => {
      if (!containerRef.current) return;

      const map = new window.google.maps.Map(containerRef.current, {
        center:            { lat: 33.5731, lng: -7.5898 },
        zoom:              11,
        mapTypeControl:    false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        styles: [
          { featureType: "poi",     elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
        ],
      });

      mapRef.current        = map;
      infoWindowRef.current = new window.google.maps.InfoWindow();
      setMapReady(true);
    }).catch(() => {
      setError("Impossible de charger Google Maps. Vérifiez votre clé API.");
    });
  }, [apiKey, mapReady]);

  // ── Filtrer les biens à afficher ───────────────────────────────────────────
  const visibleProperties = properties.filter((p) => {
    if (!p.latitude || !p.longitude) return false;
    if (filterStage    && p.pipelineStage !== filterStage) return false;
    if (filterPriority && !p.isPriority)                   return false;
    if (filterCountry  && p.country !== filterCountry)     return false;
    return true;
  });

  // ── Mise à jour markers + clusters ────────────────────────────────────────
  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // Détruire l'ancien clusterer + markers
    clustererRef.current?.clearMarkers();
    clustererRef.current = null;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    const newMarkers: google.maps.Marker[] = [];

    visibleProperties.forEach((p) => {
      const isSelected = p.id === selectedId;

      const marker = new window.google.maps.Marker({
        position: { lat: p.latitude!, lng: p.longitude! },
        title:    p.reference,
        icon: {
          path:         window.google.maps.SymbolPath.CIRCLE,
          fillColor:    isSelected ? "#1C1C1A" : p.isPriority ? "#C9973A" : "#6B7280",
          fillOpacity:  1,
          strokeColor:  isSelected ? "#C9973A" : "#FFFFFF",
          strokeWeight: isSelected ? 3 : 2.5,
          scale:        isSelected ? 12 : 9,
        },
        zIndex: isSelected ? 999 : p.isPriority ? 10 : 1,
      });

      marker.addListener("click", () => {
        infoWindowRef.current?.setContent(buildInfoContent(p));
        infoWindowRef.current?.open({ anchor: marker, map: mapRef.current! });
        onSelectRef.current?.(p.id);
      });

      markersRef.current.set(p.id, marker);
      newMarkers.push(marker);
    });

    // Créer un nouveau clusterer
    if (newMarkers.length > 0) {
      clustererRef.current = new MarkerClusterer({
        map:     mapRef.current,
        markers: newMarkers,
        renderer: {
          render: ({ count, position }) =>
            new window.google.maps.Marker({
              position,
              icon: {
                path:         window.google.maps.SymbolPath.CIRCLE,
                fillColor:    "#C9973A",
                fillOpacity:  0.9,
                strokeColor:  "#FFFFFF",
                strokeWeight: 2,
                scale:        count > 10 ? 20 : count > 5 ? 17 : 14,
              },
              label: {
                text:      String(count),
                color:     "#1C1C1A",
                fontSize:  "11px",
                fontWeight: "700",
              },
              title:  `${count} biens`,
              zIndex: 200,
            }),
        },
      });
    }

    // Ajuster les bounds
    if (visibleProperties.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      visibleProperties.forEach((p) => bounds.extend({ lat: p.latitude!, lng: p.longitude! }));
      mapRef.current?.fitBounds(bounds, 80);
    } else if (visibleProperties.length === 1) {
      mapRef.current?.setCenter({ lat: visibleProperties[0]!.latitude!, lng: visibleProperties[0]!.longitude! });
      mapRef.current?.setZoom(14);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleProperties, selectedId]);

  useEffect(() => {
    if (!mapReady) return;
    updateMarkers();
  }, [mapReady, updateMarkers]);

  // ── Pan vers le bien sélectionné ───────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !selectedId) return;

    const marker = markersRef.current.get(selectedId);
    if (!marker) return;

    const pos = marker.getPosition();
    if (pos) {
      mapRef.current?.panTo(pos);
      mapRef.current?.setZoom(15);
    }

    const prop = properties.find((p) => p.id === selectedId);
    if (prop) {
      infoWindowRef.current?.setContent(buildInfoContent(prop));
      infoWindowRef.current?.open({ anchor: marker, map: mapRef.current! });
    }
  }, [mapReady, selectedId, properties]);

  // ── Stages uniques pour le filtre ──────────────────────────────────────────
  const uniqueStages = [...new Set(properties.map((p) => p.pipelineStage))];
  const uniqueCountries = [...new Set(properties.map((p) => p.country).filter(Boolean))];
  const activeFiltersCount =
    (filterStage ? 1 : 0) + (filterPriority ? 1 : 0) + (filterCountry ? 1 : 0);

  // ── Erreur ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center h-full bg-sand rounded-2xl border border-sand-dark gap-3",
        className
      )}>
        <div className="w-12 h-12 rounded-full bg-sand-dark flex items-center justify-center">
          <MapPin className="w-6 h-6 text-charcoal-muted" />
        </div>
        <div className="text-center px-4">
          <p className="text-sm font-medium text-charcoal">Carte non disponible</p>
          <p className="text-xs text-charcoal-muted mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Map container */}
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />

      {/* Loader */}
      {!mapReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-sand rounded-2xl">
          <div className="w-7 h-7 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {mapReady && (
        <>
          {/* Compteur */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-charcoal-muted" />
            <p className="text-xs font-medium text-charcoal">
              {visibleProperties.length} / {properties.filter((p) => p.latitude && p.longitude).length} biens
            </p>
          </div>

          {/* Bouton filtres */}
          {showFilters && (
            <button
              onClick={() => setShowPanel((v) => !v)}
              className={cn(
                "absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors",
                showPanel || activeFiltersCount > 0
                  ? "bg-obsidian text-white"
                  : "bg-white/95 backdrop-blur-sm text-obsidian hover:bg-white"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="ml-0.5 bg-[#635BFF] text-obsidian text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}

          {/* Panneau filtres */}
          {showFilters && showPanel && (
            <div className="absolute top-12 right-3 w-56 bg-white rounded-xl shadow-lg border border-sand-dark p-3 space-y-3 z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-obsidian">Filtres carte</p>
                <button onClick={() => setShowPanel(false)} className="text-charcoal-muted hover:text-obsidian">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Filtre stage */}
              {uniqueStages.length > 1 && (
                <div>
                  <p className="text-[10px] text-charcoal-muted mb-1 uppercase tracking-wide font-medium">Étape pipeline</p>
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="w-full text-xs border border-sand-dark rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#635BFF]/50"
                  >
                    <option value="">Toutes les étapes</option>
                    {uniqueStages.map((s) => (
                      <option key={s} value={s}>
                        {PIPELINE_STAGES[s as keyof typeof PIPELINE_STAGES]?.label ?? s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtre pays */}
              {uniqueCountries.length > 1 && (
                <div>
                  <p className="text-[10px] text-charcoal-muted mb-1 uppercase tracking-wide font-medium">Pays</p>
                  <select
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="w-full text-xs border border-sand-dark rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#635BFF]/50"
                  >
                    <option value="">Tous les pays</option>
                    {uniqueCountries.map((c) => (
                      <option key={c!} value={c!}>
                        {c === "MA" ? "🇲🇦 Maroc" : c === "BE" ? "🇧🇪 Belgique" : c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtre prioritaires */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#635BFF]"
                />
                <span className="text-xs text-obsidian">Prioritaires seulement ⭐</span>
              </label>

              {/* Reset */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setFilterStage(""); setFilterPriority(false); setFilterCountry(""); }}
                  className="w-full text-xs text-charcoal-muted hover:text-obsidian underline transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
