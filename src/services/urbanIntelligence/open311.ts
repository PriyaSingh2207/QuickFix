import type { UnifiedIncident } from '@/types/urbanIntelligence';

export interface Open311ServiceRequest {
  service_request_id: string;
  status: 'open' | 'closed';
  status_notes: string;
  service_name: string;
  service_code: string;
  description: string;
  agency_responsible: string;
  service_notice?: string;
  requested_datetime: string;
  updated_datetime: string;
  expected_datetime?: string;
  address: string;
  address_id?: string;
  zipcode?: string;
  lat: number;
  long: number;
  media_url?: string;
  priority_score: number;
}

/**
 * Converts a Quickfix UnifiedIncident into Open311 GeoReport v2 standard format
 */
export function exportIncidentToOpen311(incident: UnifiedIncident): Open311ServiceRequest {
  const serviceCodeMap: Record<string, string> = {
    'Water & Sewage': 'WATER-MAIN-01',
    'Electricity & Lighting': 'ELEC-POWER-02',
    'Roads & Infrastructure': 'ROAD-POTHOLE-03',
    'Solid Waste': 'SAN-WASTE-04',
    'Public Health': 'HEALTH-EPID-05'
  };

  return {
    service_request_id: incident.incidentNumber,
    status: incident.status === 'resolved' || incident.status === 'closed' ? 'closed' : 'open',
    status_notes: `Quickfix Priority Score: ${incident.priorityScore.totalScore}/100. Status: ${incident.status}`,
    service_name: incident.category,
    service_code: serviceCodeMap[incident.department] || 'CIVIC-GEN-99',
    description: `${incident.title} - ${incident.description}`,
    agency_responsible: incident.department,
    requested_datetime: incident.firstReportedAt,
    updated_datetime: incident.lastUpdatedAt,
    address: incident.address,
    lat: incident.latitude,
    long: incident.longitude,
    media_url: incident.evidencePhotos[0],
    priority_score: incident.priorityScore.totalScore
  };
}

/**
 * Batch export incidents to Open311 JSON
 */
export function exportAllIncidentsToOpen311(incidents: UnifiedIncident[]): string {
  const exportData = incidents.map(exportIncidentToOpen311);
  return JSON.stringify(exportData, null, 2);
}
