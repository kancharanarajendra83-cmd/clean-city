import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SanitationHotspot, HotspotRiskLevel } from '../types';
import { AlertTriangle, ShieldCheck, Flame, Layers } from 'lucide-react';

interface HotspotMapProps {
  hotspots: SanitationHotspot[];
  selectedHotspot: SanitationHotspot | null;
  onSelectHotspot: (hotspot: SanitationHotspot) => void;
  filterRisk?: HotspotRiskLevel | 'ALL';
  height?: string;
}

const RISK_CONFIG: Record<
  HotspotRiskLevel,
  {
    color: string;
    fillColor: string;
    label: string;
    badgeBg: string;
    pulseClass: string;
  }
> = {
  Critical: {
    color: '#dc2626', // red-600
    fillColor: 'rgba(220, 38, 38, 0.25)',
    label: 'Critical Hazard',
    badgeBg: 'bg-red-500',
    pulseClass: 'animate-ping opacity-75 bg-red-400',
  },
  High: {
    color: '#ea580c', // orange-600
    fillColor: 'rgba(234, 88, 12, 0.20)',
    label: 'High Concern',
    badgeBg: 'bg-orange-500',
    pulseClass: 'animate-ping opacity-50 bg-orange-400',
  },
  Medium: {
    color: '#d97706', // amber-600
    fillColor: 'rgba(217, 119, 6, 0.18)',
    label: 'Moderate',
    badgeBg: 'bg-amber-500',
    pulseClass: '',
  },
  Low: {
    color: '#059669', // emerald-600
    fillColor: 'rgba(5, 150, 105, 0.15)',
    label: 'Low / Stabilized',
    badgeBg: 'bg-emerald-500',
    pulseClass: '',
  },
};

export function HotspotMap({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  filterRisk = 'ALL',
  height = '460px',
}: HotspotMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Filtered hotspots
  const visibleHotspots = hotspots.filter((h) => filterRisk === 'ALL' || h.riskLevel === filterRisk);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent double initialization
    if (!mapInstanceRef.current) {
      // Default to centroid or central coordinates
      const defaultCenter: [number, number] = [37.7749, -122.4194];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Add OpenStreetMap tiles (free, zero-API-key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Add Zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add clean attribution
      L.control
        .attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | CleanCity Ward GIS')
        .addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
        markerMapRef.current.clear();
      }
    };
  }, []);

  // Update Markers & Danger Heat Radii
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    markerMapRef.current.clear();

    const bounds: [number, number][] = [];

    visibleHotspots.forEach((hotspot) => {
      const { lat, lng } = hotspot.coordinates;
      bounds.push([lat, lng]);

      const cfg = RISK_CONFIG[hotspot.riskLevel] || RISK_CONFIG.Medium;
      const isSelected = selectedHotspot?.id === hotspot.id;

      // 1. Draw danger heat circle
      const radiusMeters = 180 + hotspot.reportCount * 45;
      const circle = L.circle([lat, lng], {
        radius: radiusMeters,
        color: cfg.color,
        weight: isSelected ? 2.5 : 1.5,
        fillColor: cfg.color,
        fillOpacity: isSelected ? 0.35 : 0.18,
        dashArray: hotspot.riskLevel === 'Critical' ? '4, 4' : undefined,
      });
      circle.addTo(layerGroup);

      // 2. Custom Marker HTML Icon
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 44px; height: 44px;">
          ${
            hotspot.riskLevel === 'Critical'
              ? `<span class="absolute inline-flex h-full w-full rounded-full ${cfg.pulseClass}"></span>`
              : ''
          }
          <div class="relative flex items-center justify-center rounded-full shadow-lg transition-transform transform group-hover:scale-110 ${
            isSelected ? 'ring-4 ring-white ring-offset-2 scale-110' : ''
          }" style="background-color: ${cfg.color}; width: 34px; height: 34px; border: 2.5px solid white;">
            <span class="text-white text-xs font-bold font-mono">${hotspot.reportCount}</span>
          </div>
          <span class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-900/90 text-white shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            ${hotspot.area.split('&')[0].trim()}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'clean-city-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -24],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Interactive Popup
      const popupHtml = `
        <div class="p-1 min-w-[200px] font-sans">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${cfg.color}"></span>
            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">${hotspot.riskLevel} Risk Hotspot</span>
          </div>
          <h4 class="text-sm font-bold text-gray-900 mb-1 leading-snug">${hotspot.area}</h4>
          <p class="text-xs text-gray-600 mb-2"><strong>Top Issue:</strong> ${hotspot.topIssue} (${hotspot.topIssueCount}x)</p>
          <div class="grid grid-cols-2 gap-1 text-[11px] text-gray-600 bg-gray-50 p-1.5 rounded border border-gray-100 mb-2">
            <div><strong>${hotspot.reportCount}</strong> Total Reports</div>
            <div><strong>${hotspot.unresolvedReports}</strong> Unresolved</div>
          </div>
          <div class="text-[11px] text-gray-500 line-clamp-2 italic mb-2">"${hotspot.recommendedAction}"</div>
          <button id="btn-popup-${hotspot.id}" class="w-full py-1 text-center text-xs font-semibold text-white rounded shadow-sm hover:opacity-90 transition" style="background-color: ${cfg.color}">
            Inspect Hotspot Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260, className: 'clean-city-popup' });

      marker.on('click', () => {
        onSelectHotspot(hotspot);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${hotspot.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            onSelectHotspot(hotspot);
          };
        }
      });

      marker.addTo(layerGroup);
      markerMapRef.current.set(hotspot.id, marker);
    });

    // Fit map bounds if there are markers
    if (bounds.length > 0 && !selectedHotspot) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [visibleHotspots, selectedHotspot, onSelectHotspot]);

  // Handle zooming to selected hotspot
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedHotspot) return;

    const { lat, lng } = selectedHotspot.coordinates;
    map.flyTo([lat, lng], 15, { duration: 1.2 });

    const marker = markerMapRef.current.get(selectedHotspot.id);
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 500);
    }
  }, [selectedHotspot]);

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map || visibleHotspots.length === 0) return;
    const bounds: [number, number][] = visibleHotspots.map((h) => [h.coordinates.lat, h.coordinates.lng]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white" id="hotspot-map-container">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-gray-200/80 shadow-md flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
            <span>Ward 4 Sanitation Map</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-semibold">
              Live GIS
            </span>
          </div>
          <div className="text-[11px] text-gray-500">
            {visibleHotspots.length} active hotspot zones identified
          </div>
        </div>
      </div>

      {/* Map Controls Overlay (Reset View + Legend) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <button
          id="btn-reset-map-view"
          onClick={handleResetView}
          className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200/80 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition"
        >
          Reset View
        </button>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Legend Footer */}
      <div className="bg-gray-50/90 border-t border-gray-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-gray-700">Risk Intensity:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block ring-2 ring-red-200"></span>
            <span className="text-gray-600 text-[11px]">Critical (Hazard/High Priority)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block ring-2 ring-orange-200"></span>
            <span className="text-gray-600 text-[11px]">High (Repeat Unresolved)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block ring-2 ring-amber-200"></span>
            <span className="text-gray-600 text-[11px]">Medium (Moderate Recurrence)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-200"></span>
            <span className="text-gray-600 text-[11px]">Low (Resolved Area)</span>
          </div>
        </div>
        <div className="text-[11px] text-gray-400">
          Circle diameter denotes incident cluster radius & recurrence frequency
        </div>
      </div>
    </div>
  );
}
