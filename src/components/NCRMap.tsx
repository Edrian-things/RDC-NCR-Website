import React, { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Project } from "../services/projectsData";
import { ncrCityCenters } from "../services/ncrCityCenters";

type NCRMapProps = {
  projects: Project[]; // already filtered by UI (year/status/agency/search)
  selectedCity?: string | undefined;
  selectedStatus?: Project["status"] | "all";
  onCitySelect?: (city?: string) => void;
  showCityMarker?: boolean;
  height?: number | string;
};

const STATUS_COLORS: Record<string, string> = {
  completed: "#10B981",
  ongoing: "#F59E0B",
  proposed: "#3B82F6",
  planning: "#8B5CF6",
};

const NCR_BOUNDS: [[number, number], [number, number]] = [
  [14.31, 120.85], // SW
  [14.85, 121.15], // NE
];

// helper to create a small pin-like DivIcon with color + optional count
function createPinDivIcon(color: string, count?: number) {
  const html = `
    <div style="
      display:inline-flex;
      align-items:center;
      justify-content:center;
      width:34px;
      height:34px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:${color};
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      border:2px solid #fff;
      color: white;
      font-weight:700;
      font-size:12px;
    ">
      <div style="transform:rotate(45deg); display:flex; align-items:center; justify-content:center; width:100%; height:100%;">
        ${count ? count : ""}
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "custom-pin-icon",
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -36],
  });
}

// component to fit bounds when markers change or when selectedCity changes
function FitBoundsToMarkers({
  markerLatLngs,
  selectedCity,
}: {
  markerLatLngs: L.LatLngExpression[];
  selectedCity?: string | undefined;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (selectedCity && ncrCityCenters[selectedCity]) {
      const [lat, lng] = ncrCityCenters[selectedCity];
      map.setView([lat, lng], 12, { animate: true });
      return;
    }
    if (markerLatLngs.length === 0) {
      // default center over NCR
      map.setView([14.6, 121.02], 11);
      return;
    }
    if (markerLatLngs.length === 1) {
      map.setView(markerLatLngs[0], 12, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(markerLatLngs);
    bounds.pad(0.2);
    map.fitBounds(bounds, { animate: true, maxZoom: 13 });
  }, [map, markerLatLngs, selectedCity]);
  return null;
}

const NCRMap: React.FC<NCRMapProps> = ({
  projects,
  selectedCity,
  onCitySelect,
  showCityMarker = true,
  selectedStatus = "all",
  height = 420,
}) => {
  // group projects by LGU (city/municipality)
  const projectsByCity = useMemo(() => {
    const m: Record<string, Project[]> = {};
    projects.forEach((p) => {
      const city = p.lgu || "Unspecified";
      if (!m[city]) m[city] = [];
      m[city].push(p);
    });
    return m;
  }, [projects]);

  // build markers for cities that exist in ncrCityCenters and have >=1 project
  const markers = useMemo(() => {
    return Object.entries(projectsByCity)
      .map(([city, ps]) => {
        const coords = ncrCityCenters[city];
        if (!coords) return null; // skip if center unknown
        // count or derive dominant status color
        const countsByStatus: Record<string, number> = {};
        ps.forEach(
          (p) =>
            (countsByStatus[p.status] = (countsByStatus[p.status] || 0) + 1)
        );
        // choose color based on highest count status
        let dominantStatus = Object.keys(countsByStatus)[0];
        let max = -1;
        Object.entries(countsByStatus).forEach(([s, c]) => {
          if (c > max) {
            max = c;
            dominantStatus = s;
          }
        });
        const color = STATUS_COLORS[dominantStatus] || "#3B82F6";
        return {
          city,
          coords,
          count: ps.length,
          projects: ps,
          color,
        };
      })
      .filter(Boolean) as {
      city: string;
      coords: [number, number];
      count: number;
      projects: Project[];
      color: string;
    }[];
  }, [projectsByCity]);

  // markers latlngs for fitting bounds
  const markerLatLngs = useMemo(
    () => markers.map((m) => [m.coords[0], m.coords[1]] as L.LatLngExpression),
    [markers]
  );

  // map initial center and bounds
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <MapContainer
        center={[14.6, 121.02]}
        zoom={11}
        minZoom={10}
        maxZoom={16}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(m) => {
          mapRef.current = m;
          // enforce max bounds
          m.setMaxBounds(NCR_BOUNDS);
          m.on("drag", () => {
            // keep inside bounds
            if (!m.getBounds().intersects(L.latLngBounds(NCR_BOUNDS))) {
              m.panInsideBounds(L.latLngBounds(NCR_BOUNDS));
            }
          });
        }}
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBoundsToMarkers
          markerLatLngs={markerLatLngs}
          selectedCity={selectedCity}
        />

        {markers.map((m) => {
          const icon = createPinDivIcon(
            m.color,
            m.count > 1 ? m.count : undefined
          );
          return (
            <Marker
              key={m.city}
              position={[m.coords[0], m.coords[1]]}
              icon={icon}
              eventHandlers={{
                click: () => onCitySelect && onCitySelect(m.city),
              }}
            >
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    {m.city}
                  </div>
                  <div style={{ fontSize: 13, color: "#334155" }}>
                    {m.count} project(s)
                  </div>
                  <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                    {m.projects.slice(0, 5).map((p) => (
                      <li key={p.id} style={{ fontSize: 13 }}>
                        <strong style={{ color: "#0ea5a6" }}>{p.status}</strong>{" "}
                        — {p.title}
                      </li>
                    ))}
                  </ul>
                  {m.projects.length > 5 && (
                    <div style={{ fontSize: 12, marginTop: 6 }}>
                      +{m.projects.length - 5} more
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* optional small circle marker when showCityMarker = true to highlight selectedCity */}
        {showCityMarker && selectedCity && ncrCityCenters[selectedCity] && (
          <CircleMarker
            center={[
              ncrCityCenters[selectedCity][0],
              ncrCityCenters[selectedCity][1],
            ]}
            radius={10}
            pathOptions={{
              color: "#111827",
              weight: 2,
              fillColor: "#f97316",
              fillOpacity: 0.6,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default NCRMap;
