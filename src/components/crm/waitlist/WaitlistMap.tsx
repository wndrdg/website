"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/crm/ui/card";
import type { WaitlistContact } from "./types";

// Minimal Google Maps JS API surface we use. Avoids dragging in
// @types/google.maps for a handful of fields.
type LatLng = { lat: number; lng: number };
type GLatLngLiteral = LatLng;
type GMap = {
  fitBounds: (b: GBounds, padding?: number) => void;
};
type GBounds = {
  extend: (l: GLatLngLiteral) => void;
  isEmpty: () => boolean;
};
type GeocodeRequest = {
  address?: string;
  componentRestrictions?: { country?: string; postalCode?: string };
};
type GeocoderLocation = { lat: () => number; lng: () => number };
type GGeocoder = {
  geocode: (req: GeocodeRequest) => Promise<{
    results: Array<{ geometry: { location: GeocoderLocation } }>;
  }>;
};
type GMarker = {
  addListener: (ev: string, cb: () => void) => { remove?: () => void };
  setMap: (m: GMap | null) => void;
};
type GoogleNamespace = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => GMap;
    LatLngBounds: new () => GBounds;
    Geocoder: new () => GGeocoder;
    Marker: new (opts: Record<string, unknown>) => GMarker;
  };
};

// Module-level caches persist across tab switches (List → Map → List) so
// we don't re-geocode the same zip repeatedly within a session.
const GEOCODE_CACHE = new Map<string, LatLng>();
const GEOCODE_FAILED = new Set<string>();
// Last observed geocode error (for surfacing quota / config issues to the UI).
let LAST_GEOCODE_ERROR: string | null = null;

function useGoogleMaps() {
  const [ready, setReady] = useState(() => {
    if (typeof window === "undefined") return false;
    const w = window as unknown as { google?: GoogleNamespace };
    return !!w.google?.maps?.Geocoder;
  });

  useEffect(() => {
    if (ready) return;
    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!key) return;

    const w = window as unknown as {
      google?: GoogleNamespace;
      __wdPlacesLoading?: Promise<void>;
    };

    if (!w.__wdPlacesLoading) {
      w.__wdPlacesLoading = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Maps"));
        document.head.appendChild(script);
      });
    }

    w.__wdPlacesLoading.then(() => setReady(true)).catch(() => {});
  }, [ready]);

  return ready;
}

/** Accepts "90210" or "90210-1234" — returns the 5-digit core, or null. */
function normalizeZip(z: string | null | undefined): string | null {
  if (!z) return null;
  const t = z.trim();
  return /^\d{5}(-\d{4})?$/.test(t) ? t.slice(0, 5) : null;
}

async function geocodeZip(
  geocoder: GGeocoder,
  zip: string,
): Promise<LatLng | null> {
  if (GEOCODE_CACHE.has(zip)) return GEOCODE_CACHE.get(zip)!;
  if (GEOCODE_FAILED.has(zip)) return null;

  try {
    const { results } = await geocoder.geocode({
      componentRestrictions: { country: "US", postalCode: zip },
    });
    if (results.length === 0) {
      GEOCODE_FAILED.add(zip);
      return null;
    }
    const loc = results[0].geometry.location;
    const latlng = { lat: loc.lat(), lng: loc.lng() };
    GEOCODE_CACHE.set(zip, latlng);
    return latlng;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!LAST_GEOCODE_ERROR) {
      LAST_GEOCODE_ERROR = msg;
      // eslint-disable-next-line no-console
      console.warn("[WaitlistMap] geocode failed:", msg);
    }
    GEOCODE_FAILED.add(zip);
    return null;
  }
}

function hintForGeocodeError(msg: string | null): string | null {
  if (!msg) return null;
  if (/REQUEST_DENIED/i.test(msg)) {
    return "Geocoding API is not enabled on this Google Cloud project. Enable it in: console.cloud.google.com → APIs & Services → Library → search “Geocoding API” → Enable. Billing must also be active on the project.";
  }
  if (/OVER_QUERY_LIMIT|quota/i.test(msg)) {
    return "Google Maps quota exceeded. Check billing/quotas in Google Cloud Console.";
  }
  if (/ApiNotActivatedMapError|ApiTargetBlockedMapError/i.test(msg)) {
    return "Your Maps API key doesn't have Geocoding enabled, or is restricted to the wrong APIs. Update the key restrictions in Google Cloud Console.";
  }
  return `Geocoding error: ${msg}`;
}

export function WaitlistMap({
  entries,
  onSelect,
}: {
  entries: WaitlistContact[];
  onSelect: (id: string) => void;
}) {
  const ready = useGoogleMaps();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GMap | null>(null);
  const markersRef = useRef<GMarker[]>([]);

  // Stash onSelect in a ref so the main effect doesn't re-run on every
  // parent render (it would be brittle and cause re-geocoding).
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [stats, setStats] = useState({ plotted: 0, failed: 0, total: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  // Partition entries up front so stats are accurate independent of the
  // async geocoding loop below.
  const { withZip, withoutZip } = useMemo(() => {
    const a: WaitlistContact[] = [];
    const b: WaitlistContact[] = [];
    for (const e of entries) {
      if (normalizeZip(e.zip)) a.push(e);
      else b.push(e);
    }
    return { withZip: a, withoutZip: b };
  }, [entries]);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const w = window as unknown as { google: GoogleNamespace };
    const { google } = w;

    // First mount → create the map. Re-runs just repopulate markers.
    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(containerRef.current, {
        center: { lat: 39.5, lng: -98.5 }, // rough US center
        zoom: 4,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: "greedy",
      });
    }

    // Clear any previous markers (tab-switch, entries changed, strict-mode re-run).
    for (const m of markersRef.current) m.setMap(null);
    markersRef.current = [];

    let cancelled = false;
    const geocoder = new google.maps.Geocoder();
    const bounds = new google.maps.LatLngBounds();

    // Group entries by zip so we make one geocode call per unique zip,
    // then place one marker per entry (with a tiny jitter for duplicates).
    const byZip = new Map<string, WaitlistContact[]>();
    for (const e of withZip) {
      const z = normalizeZip(e.zip)!;
      const list = byZip.get(z) || [];
      list.push(e);
      byZip.set(z, list);
    }

    let plotted = 0;
    let failed = 0;
    setStats({ plotted: 0, failed: 0, total: withZip.length });

    (async () => {
      for (const [zip, group] of byZip) {
        if (cancelled) return;
        const wasCached = GEOCODE_CACHE.has(zip);
        const latlng = await geocodeZip(geocoder, zip);
        if (cancelled) return;

        if (!latlng) {
          failed += group.length;
          setStats((s) => ({ ...s, failed }));
          if (LAST_GEOCODE_ERROR) setGeocodeError(LAST_GEOCODE_ERROR);
        } else {
          group.forEach((entry, i) => {
            // Small diagonal jitter so multiple entries in one zip don't
            // stack on one pixel. ~0.001deg ≈ 110 meters; imperceptible
            // when zoomed out, separable when zoomed in.
            const jitter = group.length > 1 ? (i - (group.length - 1) / 2) * 0.0012 : 0;
            const pos = { lat: latlng.lat + jitter, lng: latlng.lng + jitter };
            const name =
              [entry.first_name, entry.last_name].filter(Boolean).join(" ") ||
              entry.email;

            const marker = new google.maps.Marker({
              map: mapRef.current,
              position: pos,
              title: name,
            });
            marker.addListener("click", () => onSelectRef.current(entry.id));
            markersRef.current.push(marker);
            bounds.extend(pos);
          });
          plotted += group.length;
          setStats((s) => ({ ...s, plotted }));
        }

        // Be kind to the API — only throttle between actual network calls,
        // not cache hits.
        if (!wasCached) await new Promise((r) => setTimeout(r, 120));
      }

      if (!cancelled && markersRef.current.length > 0 && mapRef.current) {
        mapRef.current.fitBounds(bounds, 64);
      }
    })().catch((e) => {
      if (!cancelled) setLoadError(e instanceof Error ? e.message : String(e));
    });

    return () => {
      cancelled = true;
    };
  }, [ready, withZip]);

  // Clean up the markers we created when the component unmounts entirely
  // (e.g. user navigates away from /waitlist). Separate effect so the
  // main loop doesn't have to worry about this on each entries update.
  useEffect(() => {
    return () => {
      for (const m of markersRef.current) m.setMap(null);
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  const statsLine = [
    `${stats.plotted} plotted`,
    stats.plotted < stats.total ? `of ${stats.total}` : null,
    withoutZip.length > 0
      ? `${withoutZip.length} hidden (no zip)`
      : null,
    stats.failed > 0 ? `${stats.failed} unmappable` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>Map</span>
          <span className="text-xs font-normal text-muted-foreground">
            {statsLine}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!key ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Map unavailable — <code>NEXT_PUBLIC_GOOGLE_PLACES_API_KEY</code> not set.
          </p>
        ) : loadError ? (
          <p className="py-12 text-center text-sm text-red-600">
            Map failed to load: {loadError}
          </p>
        ) : withZip.length === 0 ? (
          <div className="space-y-2 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No waitlist entries have a zip code yet.
            </p>
            {withoutZip.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                {withoutZip.length} entr
                {withoutZip.length === 1 ? "y is" : "ies are"} hidden from the map.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {geocodeError && stats.plotted === 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <p className="font-medium">Map can&apos;t place any pins.</p>
                <p className="mt-1">
                  {hintForGeocodeError(geocodeError) || geocodeError}
                </p>
              </div>
            ) : null}
            <div
              ref={containerRef}
              className="h-[600px] w-full overflow-hidden rounded-md border border-border"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
