import type {
  Complaint,
  UnifiedIncident
} from '@/types/urbanIntelligence';
import {
  INITIAL_UNIFIED_INCIDENTS,
  INITIAL_COMPLAINTS
} from './syntheticDataset';
import { evaluateComplaintFusion } from './incidentFusion';
import type { FusionMatchResult } from './incidentFusion';
import { calculatePriorityScore } from './priorityEngine';

import { generateUniqueTicketId } from '@/services/contractorPortal/contractorStore';
import { translateWithSarvam } from '@/services/sarvamService';

const STORAGE_KEY_INCIDENTS = 'quickfix_urban_incidents_v1';
const STORAGE_KEY_COMPLAINTS = 'quickfix_urban_complaints_v1';

export function getStoredIncidents(): UnifiedIncident[] {
  if (typeof window === 'undefined') return INITIAL_UNIFIED_INCIDENTS;
  try {
    const data = localStorage.getItem(STORAGE_KEY_INCIDENTS);
    return data ? JSON.parse(data) : INITIAL_UNIFIED_INCIDENTS;
  } catch {
    return INITIAL_UNIFIED_INCIDENTS;
  }
}

export function saveStoredIncidents(incidents: UnifiedIncident[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
    window.dispatchEvent(new CustomEvent('quickfix-data-updated'));
  } catch (err) {
    console.error('Failed to save incidents', err);
  }
}

export function getStoredComplaints(): Complaint[] {
  if (typeof window === 'undefined') return INITIAL_COMPLAINTS;
  try {
    const data = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
    return data ? JSON.parse(data) : INITIAL_COMPLAINTS;
  } catch {
    return INITIAL_COMPLAINTS;
  }
}

export function saveStoredComplaints(complaints: Complaint[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    window.dispatchEvent(new CustomEvent('quickfix-data-updated'));
  } catch (err) {
    console.error('Failed to save complaints', err);
  }
}

export interface ComplaintValidationResult {
  isValid: boolean;
  missingFields: string[];
  errorMessage?: string;
}

/**
 * Validates whether all mandatory complaint parameters and location coordinates are provided.
 * If any crucial info is missing, registration is strictly rejected.
 */
export function validateCitizenComplaint(data: {
  title?: string;
  description: string;
  category: string;
  wardId: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}): ComplaintValidationResult {
  const missing: string[] = [];

  if (!data.description || data.description.trim().length < 10) {
    missing.push('Detailed problem description (minimum 10 characters)');
  }

  if (!data.category || data.category.trim().length === 0) {
    missing.push('Civic category (e.g. Water, Roads, Electricity, Waste)');
  }

  if (!data.address || data.address.trim().length < 3) {
    missing.push('Street address or landmark');
  }

  if (!data.wardId || data.wardId.trim().length === 0) {
    missing.push('Ward administrative jurisdiction');
  }

  // Check if valid GPS coordinates or manual location with address & ward is provided
  const hasValidCoordinates = (
    data.latitude !== null &&
    data.longitude !== null &&
    !isNaN(data.latitude) &&
    !isNaN(data.longitude) &&
    data.latitude !== 0 &&
    data.longitude !== 0
  );

  const hasManualLocation = Boolean(data.address && data.address.trim().length >= 3 && data.wardId);

  if (!hasValidCoordinates && !hasManualLocation) {
    missing.push('Location verification (GPS coordinates or manual address with ward)');
  }

  if (missing.length > 0) {
    return {
      isValid: false,
      missingFields: missing,
      errorMessage: `Cannot register complaint. The following mandatory information is missing: ${missing.join(', ')}.`
    };
  }

  return { isValid: true, missingFields: [] };
}

export const WARD_FALLBACK_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  'WARD-04': { lat: 22.7540, lng: 75.8912, name: 'Ward 4 - Vijay Nagar North' },
  'WARD-09': { lat: 22.7196, lng: 75.8577, name: 'Ward 9 - Rajwada Central' },
  'WARD-12': { lat: 22.7610, lng: 75.8750, name: 'Ward 12 - Sukhlia Industrial' },
  'WARD-17': { lat: 22.7160, lng: 75.8710, name: 'Ward 17 - Chhoti Gwaltoli' },
  'WARD-23': { lat: 22.7480, lng: 75.8450, name: 'Ward 23 - Banganga Colony' },
  'WARD-28': { lat: 22.6950, lng: 75.8320, name: 'Ward 28 - Annapurna Hills' }
};

export interface RegisterComplaintOutput {
  complaint: Complaint;
  matchedIncident: UnifiedIncident;
  isGroupedIntoExisting: boolean;
  fusionMatch: FusionMatchResult | null;
}

/**
 * Processes a citizen complaint, validates required inputs, runs AI incident fusion,
 * and groups with existing incidents or creates a new incident.
 */
export function processCitizenComplaint(data: {
  citizenName?: string;
  phone?: string;
  description: string;
  category: string;
  subcategory?: string;
  wardId: string;
  wardName: string;
  address: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}): RegisterComplaintOutput {
  // If coordinates are missing from manual location entry, resolve from ward coordinates
  let finalLat = data.latitude;
  let finalLng = data.longitude;
  if (!finalLat || !finalLng || isNaN(finalLat) || isNaN(finalLng) || finalLat === 0 || finalLng === 0) {
    const fallback = WARD_FALLBACK_COORDINATES[data.wardId] || { lat: 22.7540, lng: 75.8912 };
    finalLat = fallback.lat;
    finalLng = fallback.lng;
  }

  // 1. Validation check
  const validation = validateCitizenComplaint({ ...data, latitude: finalLat, longitude: finalLng });
  if (!validation.isValid) {
    throw new Error(validation.errorMessage);
  }

  const currentIncidents = getStoredIncidents();
  const currentComplaints = getStoredComplaints();

  // Detect language
  let lang: 'en' | 'hi' | 'hinglish' = 'en';
  if (/[\u0900-\u097F]/.test(data.description)) lang = 'hi';
  else if (data.description.toLowerCase().match(/hai|ke|se|paas|bohot|gaya|nahi/)) lang = 'hinglish';

  const ticketId = generateUniqueTicketId();

  const newComplaint: Complaint = {
    id: ticketId,
    ticketId: ticketId,
    citizenName: data.citizenName || 'Verified Citizen',
    phone: data.phone || '',
    language: lang,
    rawText: data.description,
    category: data.category,
    subcategory: data.subcategory || `${data.category} Issue`,
    wardId: data.wardId,
    wardName: data.wardName,
    latitude: finalLat,
    longitude: finalLng,
    address: data.address,
    photoUrl: data.photoUrl,
    timestamp: new Date().toISOString(),
    confidenceScore: 92,
    missingDetails: []
  };

  // 2. Run AI Incident Fusion against existing incidents
  const fusionMatch = evaluateComplaintFusion(newComplaint, currentIncidents);

  let updatedIncidents: UnifiedIncident[];
  let targetIncident: UnifiedIncident;
  let isGrouped = false;

  if (fusionMatch && fusionMatch.matchedIncidentId) {
    // MATCH FOUND: Group into existing incident
    isGrouped = true;
    newComplaint.incidentId = fusionMatch.matchedIncidentId;
    newComplaint.isDuplicateOf = fusionMatch.relation === 'EXACT_DUPLICATE' ? fusionMatch.matchedIncidentId : undefined;

    updatedIncidents = currentIncidents.map(inc => {
      if (inc.id === fusionMatch.matchedIncidentId) {
        const newCount = inc.complaintCount + 1;
        const newComplaintIds = Array.from(new Set([...inc.complaintIds, newComplaint.id]));

        // Elevated urgency / impact when multiple independent citizens report
        const newScore = calculatePriorityScore({
          urgency: Math.min(100, inc.priorityScore.urgency + (fusionMatch.relation === 'EXACT_DUPLICATE' ? 3 : 2)),
          impact: Math.min(100, inc.priorityScore.impact + 4),
          safety: inc.priorityScore.safety,
          waitingTime: inc.priorityScore.waitingTime,
          confidence: Math.min(99, inc.priorityScore.confidence + 2),
          environmental: inc.priorityScore.environmental
        });

        const updatedInc: UnifiedIncident = {
          ...inc,
          complaintCount: newCount,
          complaintIds: newComplaintIds,
          priorityScore: newScore,
          lastUpdatedAt: new Date().toISOString(),
          priorityHistory: [
            {
              id: `EVT-FUS-${Date.now()}`,
              timestamp: new Date().toISOString(),
              previousScore: inc.priorityScore.totalScore,
              newScore: newScore.totalScore,
              reason: `AI Grouping: Fused new citizen complaint (${newComplaint.id}) within ${fusionMatch.distanceMeters}m radius (${fusionMatch.relation.replace('_', ' ')}). Priority surged to ${newScore.totalScore}.`,
              author: 'AI_DYNAMIC_RECALC'
            },
            ...inc.priorityHistory
          ]
        };
        targetIncident = updatedInc;
        return updatedInc;
      }
      return inc;
    });
  } else {
    // NO MATCH: Spawn a new Unified Incident
    isGrouped = false;
    const newIncId = `INC-2026-${Date.now().toString().slice(-4)}`;
    const newIncNumber = `URB-IND-26-${Date.now().toString().slice(-2)}`;
    newComplaint.incidentId = newIncId;

    const initialScore = calculatePriorityScore({
      urgency: 65,
      impact: 55,
      safety: 50,
      waitingTime: 10,
      confidence: 85,
      environmental: 35
    });

    const newInc: UnifiedIncident = {
      id: newIncId,
      incidentNumber: newIncNumber,
      title: `${data.category}: ${data.address.split(',')[0]}`,
      description: data.description,
      category: data.category,
      department: (data.category as any) || 'Water & Sewage',
      wardId: data.wardId,
      wardName: data.wardName,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      status: 'open',
      urgency: 'medium',
      complaintCount: 1,
      complaintIds: [newComplaint.id],
      evidencePhotos: data.photoUrl ? [data.photoUrl] : [],
      firstReportedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      priorityScore: initialScore,
      priorityHistory: [
        {
          id: `EVT-INIT-${Date.now()}`,
          timestamp: new Date().toISOString(),
          previousScore: 0,
          newScore: initialScore.totalScore,
          reason: `Initial complaint recorded via Citizen Dashboard by ${newComplaint.citizenName}.`,
          author: 'AI_DYNAMIC_RECALC'
        }
      ],
      affectedPopulationEstimate: 600,
      nearbyCriticalInfrastructure: [],
      weatherEscalationRisk: 'none',
      slaBreachRiskPercent: 15
    };

    targetIncident = newInc;
    updatedIncidents = [newInc, ...currentIncidents];
  }

  // Save to storage
  saveStoredIncidents(updatedIncidents);
  saveStoredComplaints([newComplaint, ...currentComplaints]);

  // Sarvam AI Indic translation to English for municipal officer transparency
  if (lang !== 'en') {
    translateWithSarvam({
      text: data.description,
      sourceLang: 'hi-IN',
      targetLang: 'en-IN'
    }).then(enText => {
      if (enText && enText !== data.description) {
        const stored = getStoredComplaints().map(c =>
          c.id === newComplaint.id ? { ...c, translatedText: enText } : c
        );
        saveStoredComplaints(stored);
      }
    }).catch(err => {
      console.warn('[Sarvam AI] Background translation caught:', err);
    });
  }

  return {
    complaint: newComplaint,
    matchedIncident: targetIncident!,
    isGroupedIntoExisting: isGrouped,
    fusionMatch
  };
}
