export type IncidentUrgency = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type MunicipalDepartment = 'Water & Sewage' | 'Roads & Infrastructure' | 'Solid Waste' | 'Electricity & Lighting' | 'Public Health' | 'Disaster Management';

export interface Complaint {
  id: string;
  ticketId?: string;
  citizenName?: string;
  phone?: string;
  language: 'en' | 'hi' | 'hinglish';
  rawText: string;
  translatedText?: string;
  category: string;
  subcategory: string;
  wardId: string;
  wardName: string;
  latitude: number;
  longitude: number;
  address: string;
  photoUrl?: string;
  timestamp: string;
  confidenceScore: number; // 0 - 100
  missingDetails?: string[];
  followUpQuestions?: string[];
  isDuplicateOf?: string;
  incidentId?: string;
}

export interface PriorityScoreBreakdown {
  urgency: number; // U: 0 - 100 (Weight: 0.25)
  impact: number;  // I: 0 - 100 (Weight: 0.25)
  safety: number;  // S: 0 - 100 (Weight: 0.20)
  waitingTime: number; // W: 0 - 100 (Weight: 0.10)
  confidence: number;  // C: 0 - 100 (Weight: 0.10)
  environmental: number; // E: 0 - 100 (Weight: 0.10)
  totalScore: number; // P: 0 - 100
  formulaExplanation: string;
}

export interface PriorityEvent {
  id: string;
  timestamp: string;
  previousScore: number;
  newScore: number;
  reason: string;
  author: 'AI_DYNAMIC_RECALC' | 'OFFICER_OVERRIDE' | 'WEATHER_ALERT' | 'NEW_EVIDENCE';
  authorName?: string;
}

export interface UnifiedIncident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  category: string;
  department: MunicipalDepartment;
  wardId: string;
  wardName: string;
  latitude: number;
  longitude: number;
  address: string;
  status: IncidentStatus;
  urgency: IncidentUrgency;
  complaintCount: number;
  complaintIds: string[];
  evidencePhotos: string[];
  firstReportedAt: string;
  lastUpdatedAt: string;
  priorityScore: PriorityScoreBreakdown;
  priorityHistory: PriorityEvent[];
  affectedPopulationEstimate: number;
  nearbyCriticalInfrastructure: string[];
  rootCauseHypothesis?: string;
  weatherEscalationRisk: 'none' | 'moderate' | 'severe';
  assignedTeamId?: string;
  assignedTeamName?: string;
  slaBreachRiskPercent: number;
  simulatedDelayScore?: number;
}

export interface WardEquityMetric {
  wardId: string;
  wardName: string;
  population: number;
  complaintCount: number;
  complaintsPerCapita: number;
  avgResolutionHours: number;
  avgWaitHours: number;
  resolutionRatePercent: number;
  potentialUnderReporting: boolean;
  disparityLevel: 'normal' | 'moderate_delay' | 'severe_disparity';
  activeIncidents: number;
}

export interface FieldTeam {
  id: string;
  name: string;
  department: MunicipalDepartment;
  contactNumber: string;
  skills: string[];
  equipment: string[];
  currentStatus: 'available' | 'on_site' | 'dispatched' | 'off_duty';
  activeAssignments: number;
  baseLatitude: number;
  baseLongitude: number;
  zone: string;
}

export interface WhatIfSimulationResult {
  delayHours: number;
  weatherScenario: 'normal' | 'heavy_rain' | 'heatwave';
  projectedPriority: number;
  projectedAffectedPopulation: number;
  projectedEscalationRisk: 'low' | 'moderate' | 'high' | 'catastrophic';
  slaBreachLikelihood: number;
  infrastructureRiskNotes: string[];
  simulatedTimeline: { hours: number; projectedScore: number; consequence: string }[];
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  incidentId: string;
  incidentTitle: string;
  action: string;
  performedBy: string;
  previousState: string;
  newState: string;
  reasonNotes: string;
}
