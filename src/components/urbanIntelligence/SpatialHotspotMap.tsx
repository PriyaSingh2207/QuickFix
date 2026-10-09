import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { UnifiedIncident } from '@/types/urbanIntelligence';
import { Badge } from '@/components/ui/badge';

interface SpatialHotspotMapProps {
  incidents: UnifiedIncident[];
  onSelectIncident: (incident: UnifiedIncident) => void;
}

// Function to generate beautiful CSS markers based on priority score
const createIncidentIcon = (score: number, complaintCount: number) => {
  let bgColor = '#3b82f6';
  let pulse = '';
  if (score >= 85) {
    bgColor = '#ef4444';
    pulse = 'animate-ping';
  } else if (score >= 70) {
    bgColor = '#f97316';
  } else if (score >= 50) {
    bgColor = '#f59e0b';
  }

  const html = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      ${score >= 85 ? `<div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: ${bgColor}; opacity: 0.4;" class="${pulse}"></div>` : ''}
      <div style="background: ${bgColor}; width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">
        ${Math.round(score)}
      </div>
      ${complaintCount > 1 ? `<div style="position: absolute; top: -4px; right: -4px; background: #9333ea; color: white; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 9999px; border: 1px solid white;">+${complaintCount}</div>` : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-incident-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

export const SpatialHotspotMap: React.FC<SpatialHotspotMapProps> = ({
  incidents,
  onSelectIncident
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showHotspots, setShowHotspots] = useState(true);

  // Center map around Indore / city coordinates (22.735, 75.87)
  const defaultCenter: [number, number] = [22.735, 75.87];

  const filteredIncidents = incidents.filter(i =>
    selectedCategory === 'all' || i.category === selectedCategory
  );

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border shadow-sm bg-card">
      {/* Top Map Controls Overlay (shifted left-14 to cleanly clear Leaflet zoom controls) */}
      <div className="absolute top-3 left-14 z-[1000] bg-background/95 backdrop-blur border border-border/80 rounded-lg p-2.5 shadow-md flex items-center gap-2 max-w-[calc(100%-70px)] flex-wrap text-xs">
        <span className="font-bold text-foreground">Filter Map:</span>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="h-7 px-2 text-xs rounded border bg-background font-medium text-foreground"
        >
          <option value="all">All Departments</option>
          <option value="Water & Sewage">Water & Sewage</option>
          <option value="Electricity & Lighting">Electricity & Lighting</option>
          <option value="Roads & Infrastructure">Roads & Infrastructure</option>
          <option value="Solid Waste">Solid Waste</option>
        </select>

        <label className="flex items-center gap-1.5 cursor-pointer text-foreground font-medium ml-2">
          <input
            type="checkbox"
            checked={showHotspots}
            onChange={e => setShowHotspots(e.target.checked)}
            className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
          />
          Hotspot Risk Radii
        </label>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-background/95 backdrop-blur border border-border/80 rounded-lg p-2.5 shadow-md text-[11px] space-y-1.5 hidden sm:block">
        <span className="font-bold text-foreground block">Priority Key:</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          <span>Critical Hazard (85 - 100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
          <span>High Severity (70 - 84)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span>Medium Priority (50 - 69)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span>Routine Issue (&lt; 50)</span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hotspot Circles for Critical / Severe Incidents */}
        {showHotspots &&
          filteredIncidents
            .filter(inc => inc.priorityScore.totalScore >= 75)
            .map(inc => (
              <Circle
                key={`hotspot-${inc.id}`}
                center={[inc.latitude, inc.longitude]}
                radius={inc.priorityScore.totalScore >= 85 ? 450 : 250}
                pathOptions={{
                  color: inc.priorityScore.totalScore >= 85 ? '#ef4444' : '#f97316',
                  fillColor: inc.priorityScore.totalScore >= 85 ? '#ef4444' : '#f97316',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '4 4'
                }}
              />
            ))}

        {/* Incident Pins */}
        {filteredIncidents.map(inc => (
          <Marker
            key={inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={createIncidentIcon(inc.priorityScore.totalScore, inc.complaintCount)}
          >
            <Popup className="custom-popup">
              <div className="p-1 space-y-1.5 max-w-[240px]">
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="font-mono font-bold text-teal-700">{inc.incidentNumber}</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1">{inc.department}</Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{inc.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{inc.description}</p>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t">
                  <span className="font-bold text-red-600">Score: {inc.priorityScore.totalScore}</span>
                  <button
                    onClick={() => onSelectIncident(inc)}
                    className="text-teal-700 font-semibold hover:underline text-[11px]"
                  >
                    Inspect & Act →
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
