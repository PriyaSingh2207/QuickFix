import type { Complaint, UnifiedIncident } from '@/types/urbanIntelligence';
import { calculatePriorityScore } from './priorityEngine';

/**
 * Calculates geographic distance in meters between two lat/lng coordinates (Haversine formula)
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Computes semantic lexical & token overlap between two text strings
 */
export function computeSemanticSimilarity(text1: string, text2: string): number {
  const normalize = (t: string) =>
    t.toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/gi, '')
      .split(/\s+/)
      .filter(w => w.length > 2);

  const words1 = new Set(normalize(text1));
  const words2 = new Set(normalize(text2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersectionCount = 0;
  for (const w of words1) {
    if (words2.has(w)) intersectionCount++;
  }

  const unionCount = new Set([...words1, ...words2]).size;
  return unionCount === 0 ? 0 : Number(((intersectionCount / unionCount) * 100).toFixed(1));
}

export type FusionRelation = 'EXACT_DUPLICATE' | 'RELATED_INCIDENT' | 'INDEPENDENT';

export interface FusionParameterDetails {
  spatialDistanceMeters: number;
  spatialThresholdMeters: number;
  spatialPassed: boolean;
  timeDifferenceHours: number;
  temporalThresholdHours: number;
  temporalPassed: boolean;
  categoryMatch: boolean;
  semanticSimilarityPercent: number;
  semanticThresholdPercent: number;
  semanticPassed: boolean;
  wardMatch: boolean;
}

export interface FusionMatchResult {
  relation: FusionRelation;
  distanceMeters: number;
  semanticSimilarity: number;
  timeDifferenceHours: number;
  confidenceScore: number;
  matchedIncidentId?: string;
  matchedIncidentTitle?: string;
  matchedIncidentNumber?: string;
  parameterDetails?: FusionParameterDetails;
}

/**
 * Evaluates whether a new complaint should be fused with an existing incident based on defined parameters:
 * 1. Spatial distance (Haversine formula <= 150m for duplicate, <= 600m for cluster)
 * 2. Temporal proximity (<= 72h for duplicate, <= 120h for cluster)
 * 3. Category match
 * 4. Semantic NLP token overlap (> 35%)
 * 5. Ward administrative jurisdiction
 */
export function evaluateComplaintFusion(
  complaint: Complaint,
  incidents: UnifiedIncident[]
): FusionMatchResult | null {
  let bestMatch: FusionMatchResult | null = null;

  for (const inc of incidents) {
    // 1. Spatial distance
    const dist = haversineDistanceMeters(
      complaint.latitude,
      complaint.longitude,
      inc.latitude,
      inc.longitude
    );

    // 2. Time delta
    const tComplaint = new Date(complaint.timestamp).getTime();
    const tIncident = new Date(inc.firstReportedAt).getTime();
    const hoursDiff = Math.abs(tComplaint - tIncident) / (1000 * 60 * 60);

    // 3. Category match & semantic similarity
    const catMatch = complaint.category.toLowerCase() === inc.category.toLowerCase();
    const sim = computeSemanticSimilarity(complaint.rawText, inc.description);
    const wardMatch = complaint.wardId === inc.wardId;

    // Classification criteria:
    if (dist <= 150 && hoursDiff <= 72 && (sim > 35 || catMatch)) {
      const confidence = Math.min(99, Math.round(100 - (dist / 150) * 30 + sim * 0.4));
      return {
        relation: 'EXACT_DUPLICATE',
        distanceMeters: Math.round(dist),
        semanticSimilarity: sim,
        timeDifferenceHours: Math.round(hoursDiff),
        confidenceScore: confidence,
        matchedIncidentId: inc.id,
        matchedIncidentTitle: inc.title,
        matchedIncidentNumber: inc.incidentNumber,
        parameterDetails: {
          spatialDistanceMeters: Math.round(dist),
          spatialThresholdMeters: 150,
          spatialPassed: dist <= 150,
          timeDifferenceHours: Math.round(hoursDiff),
          temporalThresholdHours: 72,
          temporalPassed: hoursDiff <= 72,
          categoryMatch: catMatch,
          semanticSimilarityPercent: sim,
          semanticThresholdPercent: 35,
          semanticPassed: sim > 35 || catMatch,
          wardMatch
        }
      };
    } else if (dist <= 600 && hoursDiff <= 120 && catMatch) {
      const confidence = Math.min(85, Math.round(80 - (dist / 600) * 20 + sim * 0.2));
      if (!bestMatch || confidence > bestMatch.confidenceScore) {
        bestMatch = {
          relation: 'RELATED_INCIDENT',
          distanceMeters: Math.round(dist),
          semanticSimilarity: sim,
          timeDifferenceHours: Math.round(hoursDiff),
          confidenceScore: confidence,
          matchedIncidentId: inc.id,
          matchedIncidentTitle: inc.title,
          matchedIncidentNumber: inc.incidentNumber,
          parameterDetails: {
            spatialDistanceMeters: Math.round(dist),
            spatialThresholdMeters: 600,
            spatialPassed: dist <= 600,
            timeDifferenceHours: Math.round(hoursDiff),
            temporalThresholdHours: 120,
            temporalPassed: hoursDiff <= 120,
            categoryMatch: catMatch,
            semanticSimilarityPercent: sim,
            semanticThresholdPercent: 20,
            semanticPassed: sim > 20 || catMatch,
            wardMatch
          }
        };
      }
    }
  }

  return bestMatch;
}

/**
 * Merges two separate incidents into one consolidated incident
 */
export function mergeIncidents(
  targetIncident: UnifiedIncident,
  sourceIncident: UnifiedIncident,
  officerName: string
): UnifiedIncident {
  const mergedComplaintIds = Array.from(
    new Set([...targetIncident.complaintIds, ...sourceIncident.complaintIds])
  );

  const higherUrgency =
    targetIncident.urgency === 'critical' || sourceIncident.urgency === 'critical'
      ? 'critical'
      : targetIncident.urgency === 'high' || sourceIncident.urgency === 'high'
      ? 'high'
      : 'medium';

  // Recalculate priority with combined impact and evidence
  const combinedPriority = calculatePriorityScore({
    urgency: Math.max(targetIncident.priorityScore.urgency, sourceIncident.priorityScore.urgency),
    impact: Math.min(100, targetIncident.priorityScore.impact + 5),
    safety: Math.max(targetIncident.priorityScore.safety, sourceIncident.priorityScore.safety),
    waitingTime: Math.max(targetIncident.priorityScore.waitingTime, sourceIncident.priorityScore.waitingTime),
    confidence: Math.min(99, targetIncident.priorityScore.confidence + 4),
    environmental: Math.max(targetIncident.priorityScore.environmental, sourceIncident.priorityScore.environmental)
  });

  return {
    ...targetIncident,
    complaintCount: mergedComplaintIds.length,
    complaintIds: mergedComplaintIds,
    urgency: higherUrgency,
    priorityScore: combinedPriority,
    affectedPopulationEstimate: targetIncident.affectedPopulationEstimate + sourceIncident.affectedPopulationEstimate,
    lastUpdatedAt: new Date().toISOString(),
    priorityHistory: [
      {
        id: `EVT-MRG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousScore: targetIncident.priorityScore.totalScore,
        newScore: combinedPriority.totalScore,
        reason: `Officer ${officerName} merged Incident ${sourceIncident.incidentNumber} into this record.`,
        author: 'OFFICER_OVERRIDE',
        authorName: officerName
      },
      ...targetIncident.priorityHistory
    ]
  };
}

/**
 * Splits a complaint out of an incident into a brand-new distinct incident
 */
export function splitComplaintFromIncident(
  parentIncident: UnifiedIncident,
  complaintToSplit: Complaint,
  officerName: string
): { updatedParent: UnifiedIncident; newIncident: UnifiedIncident } {
  const remainingIds = parentIncident.complaintIds.filter(id => id !== complaintToSplit.id);

  const updatedParent: UnifiedIncident = {
    ...parentIncident,
    complaintCount: Math.max(1, remainingIds.length),
    complaintIds: remainingIds,
    lastUpdatedAt: new Date().toISOString(),
    priorityHistory: [
      {
        id: `EVT-SPL-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousScore: parentIncident.priorityScore.totalScore,
        newScore: Math.max(10, parentIncident.priorityScore.totalScore - 3),
        reason: `Officer ${officerName} unlinked Complaint ${complaintToSplit.id} as a separate incident.`,
        author: 'OFFICER_OVERRIDE',
        authorName: officerName
      },
      ...parentIncident.priorityHistory
    ]
  };

  const newIncidentId = `INC-${Date.now().toString().slice(-6)}`;
  const newIncidentPriority = calculatePriorityScore({
    urgency: 60,
    impact: 50,
    safety: 50,
    waitingTime: 30,
    confidence: 80,
    environmental: 40
  });

  const newIncident: UnifiedIncident = {
    id: newIncidentId,
    incidentNumber: `URB-SPL-${newIncidentId.slice(-4)}`,
    title: complaintToSplit.subcategory || complaintToSplit.category,
    description: complaintToSplit.rawText,
    category: complaintToSplit.category,
    department: parentIncident.department,
    wardId: complaintToSplit.wardId,
    wardName: complaintToSplit.wardName,
    latitude: complaintToSplit.latitude,
    longitude: complaintToSplit.longitude,
    address: complaintToSplit.address,
    status: 'open',
    urgency: 'medium',
    complaintCount: 1,
    complaintIds: [complaintToSplit.id],
    evidencePhotos: complaintToSplit.photoUrl ? [complaintToSplit.photoUrl] : [],
    firstReportedAt: complaintToSplit.timestamp,
    lastUpdatedAt: new Date().toISOString(),
    priorityScore: newIncidentPriority,
    priorityHistory: [
      {
        id: `EVT-NEW-${Date.now()}`,
        timestamp: new Date().toISOString(),
        previousScore: 0,
        newScore: newIncidentPriority.totalScore,
        reason: `Created from split by ${officerName}`,
        author: 'OFFICER_OVERRIDE',
        authorName: officerName
      }
    ],
    affectedPopulationEstimate: 500,
    nearbyCriticalInfrastructure: [],
    weatherEscalationRisk: 'none',
    slaBreachRiskPercent: 20
  };

  return { updatedParent, newIncident };
}
