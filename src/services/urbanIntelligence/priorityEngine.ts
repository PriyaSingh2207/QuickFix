import type { PriorityScoreBreakdown, PriorityEvent, UnifiedIncident } from '@/types/urbanIntelligence';

export interface ScoringWeights {
  urgencyWeight: number;      // default: 0.25
  impactWeight: number;       // default: 0.25
  safetyWeight: number;       // default: 0.20
  waitingTimeWeight: number;  // default: 0.10
  confidenceWeight: number;   // default: 0.10
  environmentalWeight: number;// default: 0.10
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  urgencyWeight: 0.25,
  impactWeight: 0.25,
  safetyWeight: 0.20,
  waitingTimeWeight: 0.10,
  confidenceWeight: 0.10,
  environmentalWeight: 0.10,
};

/**
 * Calculates Explainable Dynamic Priority Score based on the formula:
 * P = 0.25U + 0.25I + 0.20S + 0.10W + 0.10C + 0.10E
 */
export function calculatePriorityScore(
  rawFactors: {
    urgency: number;
    impact: number;
    safety: number;
    waitingTime: number;
    confidence: number;
    environmental: number;
  },
  weights: ScoringWeights = DEFAULT_WEIGHTS
): PriorityScoreBreakdown {
  const clamp = (val: number) => Math.min(100, Math.max(0, val));

  const u = clamp(rawFactors.urgency);
  const i = clamp(rawFactors.impact);
  const s = clamp(rawFactors.safety);
  const w = clamp(rawFactors.waitingTime);
  const c = clamp(rawFactors.confidence);
  const e = clamp(rawFactors.environmental);

  const total = Number(
    (
      weights.urgencyWeight * u +
      weights.impactWeight * i +
      weights.safetyWeight * s +
      weights.waitingTimeWeight * w +
      weights.confidenceWeight * c +
      weights.environmentalWeight * e
    ).toFixed(1)
  );

  // Generate transparent natural language explanation of the key drivers
  const drivers: string[] = [];
  if (u >= 80) drivers.push(`High urgency (${u}) contributes +${(weights.urgencyWeight * u).toFixed(1)} pts`);
  if (i >= 80) drivers.push(`Extensive infrastructure/population impact (${i}) adds +${(weights.impactWeight * i).toFixed(1)} pts`);
  if (s >= 80) drivers.push(`Critical life-safety hazard (${s}) adds +${(weights.safetyWeight * s).toFixed(1)} pts`);
  if (w >= 70) drivers.push(`Excessive pending wait time (${w}) adds +${(weights.waitingTimeWeight * w).toFixed(1)} pts`);
  if (e >= 80) drivers.push(`Weather/environmental escalation alert (${e}) adds +${(weights.environmentalWeight * e).toFixed(1)} pts`);

  const explanation = drivers.length > 0
    ? `Score ${total}/100 driven by: ${drivers.join('; ')}.`
    : `Balanced priority score of ${total}/100 based on standard weighted multi-factor municipal evaluation.`;

  return {
    urgency: u,
    impact: i,
    safety: s,
    waitingTime: w,
    confidence: c,
    environmental: e,
    totalScore: total,
    formulaExplanation: explanation
  };
}

/**
 * Creates an audit-trailed human override on an incident priority score
 */
export function applyHumanPriorityOverride(
  incident: UnifiedIncident,
  overrideScore: number,
  reason: string,
  officerName: string
): UnifiedIncident {
  const previousScore = incident.priorityScore.totalScore;
  const newScore = Math.min(100, Math.max(0, overrideScore));

  const newEvent: PriorityEvent = {
    id: `EVT-OVR-${Date.now()}`,
    timestamp: new Date().toISOString(),
    previousScore,
    newScore,
    reason: `Officer Override (${officerName}): ${reason}`,
    author: 'OFFICER_OVERRIDE',
    authorName: officerName
  };

  return {
    ...incident,
    priorityScore: {
      ...incident.priorityScore,
      totalScore: newScore,
      formulaExplanation: `Manual override to ${newScore}/100 by ${officerName}. Reason: "${reason}"`
    },
    priorityHistory: [newEvent, ...incident.priorityHistory],
    lastUpdatedAt: new Date().toISOString()
  };
}
