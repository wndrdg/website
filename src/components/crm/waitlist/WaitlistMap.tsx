"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/crm/ui/card";
import type { WaitlistEntry } from "./types";

// Minimal declarations for the Google Maps JS API surface we use. Keeps us
// off @types/google.maps without any runtime cost.
type LatLng = { lat: number; lng: number };
type GMap = {
  fitBounds: (b: GBounds) => void;
  setCenter: (l: LatLng) => void;
  setZoom: (z: number) => void;
};
type GBounds = {
  extend: (l: LatLng) => void;
  isEmpty: () => boolean;
};
type GGeocoder = {
  geocode: (req: { address: string }) => Promise<{
    results: Array<{
      geometry: { location: { lat: () => number; lng: () => number } };
    }>;
  }>;
};
type GMarker = { addListener: (ev: string, cb: () => void) => void };
type GoogleNamespace = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => GMap;
    LatLngBounds: new () => GBounds;
    Geocoder: new () => GGeocoder;
    Marker: new (opts: Record<string, unknown>) => GMarker;
    InfoWindow: new (opts: { content: string }) => {
      open: (opts: { anchor: GMarker; map: GMap }) => void;
    };
  };
};

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

// Build a geocoder address string from an entry. Prefer city+zip+US, fall
// back to just zip+US. Returns null if we can't construct anything useful.
function addressForEntry(e: WaitlistEntry): string | null {
  const parts: string[] = [];
  if (e.city) parts.push(e.city);
  if (e.zip) parts.push(e.zip);
  if (parts.length === 0) return null;
  parts.push("USA");
  return parts.join(", ");
}

export function WaitlistMap({
  entries,
  onSelect,
}: {
  entries: WaitlistEntry[];
  onSelect: (id: string) => void;
}) {
  const ready = useGoogleMaps();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stats, setStats] = useState<{ geocoded: number; skipped: number; failed: number }>({
    geocoded: 0,
    skipped: 0,
    failed: 0,
  });

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const w = window as unknown as { google: GoogleNamespace };
    const { google } = w;

    const map = new google.maps.Map(containerRef.current, {
      center: { lat: 39.5, lng: -98.5 }, // geographic center of the US
      zoom: 4,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    const bounds = new google.maps.LatLngBounds();
    const geocoder = new google.maps.Geocoder();

    let geocoded = 0;
    let skipped = 0;
    let failed = 0;
    let cancelled = false;

    // Throttle to ~8 geocodes/sec to stay safely under Google's rate limits
    // without blocking the UI for long.
    async function processEntries() {
      for (const entry of entries) {
        if (cancelled) return;
        const address = addressForEntry(entry);
        if (!address) {
          skipped++;
          continue;
        }
        try {
          const { results } = await geocoder.geocode({ address });
          if (cancelled) return;
          if (results.length > 0) {
            const loc = results[0].geometry.location;
            const pos = { lat: loc.lat(), lng: loc.lng() };
            bounds.extend(pos);

            const marker = new google.maps.Marker({
              map,
              position: pos,
              title:
                [entry.first_name, entry.last_name].filter(Boolean).join(" ") ||
                entry.email,
            });

            const infoContent = [
              `<div style="font: 13px system-ui; line-height: 1.4;">`,
              `<div style="font-weight: 600;">${escapeHtml(
                [entry.first_name, entry.last_name].filter(Boolean).join(" ") ||
                  entry.email,
              )}</div>`,
              `<div style="color: #666;">${escapeHtml(entry.email)}</div>`,
              entry.dog_name
                ? `<div style="margin-top: 4px;">${escapeHtml(entry.dog_name)}${
                    entry.dog_breed ? ` · ${escapeHtml(entry.dog_breed)}` : ""
                  }</div>`
                : "",
              `<div style="margin-top: 6px; color: #2563eb; cursor: pointer;" data-click="inspect">View full details →</div>`,
              `</div>`,
            ].join("");

            const infoWindow = new google.maps.InfoWindow({ content: infoContent });
            marker.addListener("click", () => {
              infoWindow.open({ anchor: marker, map });
              // Click handler on the "View full details" link — binds
              // once the InfoWindow DOM is in the page.
              setTimeout(() => {
                document
                  .querySelectorAll('[data-click="inspect"]')
                  .forEach((el) => {
                    (el as HTMLElement).onclick = () => onSelect(entry.id);
                  });
              }, 100);
            });
            geocoded++;
          } else {
            failed++;
          }
        } catch {
          if (cancelled) return;
          failed++;
        }
        setStats({ geocoded, skipped, failed });
        // Throttle ~8/s
        await new Promise((r) => setTimeout(r, 120));
      }
      if (!cancelled && !bounds.isEmpty()) map.fitBounds(bounds);
    }

    processEntries();

    return () => {
      cancelled = true;
    };
    // Deliberately run once per entries-identity change; onSelect is stable
    // in the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, entries]);

  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>Map</span>
          <span className="font-normal text-muted-foreground text-xs">
            {stats.geocoded} plotted
            {stats.skipped > 0 ? ` · ${stats.skipped} no location` : ""}
            {stats.failed > 0 ? ` · ${stats.failed} failed` : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!key ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Map unavailable — set <code>NEXT_PUBLIC_GOOGLE_PLACES_API_KEY</code>.
          </p>
        ) : (
          <div
            ref={containerRef}
            className="h-[600px] w-full overflow-hidden rounded-md border border-border"
          />
        )}
      </CardContent>
    </Card>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
