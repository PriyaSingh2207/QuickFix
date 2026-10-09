import type { UnifiedIncident, WhatIfSimulationResult } from '@/types/urbanIntelligence';

/**
 * What-If Simulation Engine
 * Models risk escalation if municipal intervention is delayed or under adverse weather conditions.
 */
export function runWhatIfSimulation(
  incident: UnifiedIncident,
  delayHours: number,
  weatherScenario: 'normal' | 'heavy_rain' | 'heatwave'
): WhatIfSimulationResult {
  const baseScore = incident.priorityScore.totalScore;
  let scoreIncrease = 0;
  let populationMultiplier = 1.0;
  let slaBreachRisk = incident.slaBreachRiskPercent;
  const consequenceNotes: string[] = [];

  // 1. Time Delay Factor (Non-linear decay of stability)
  if (delayHours > 0) {
    const delayFactor = Math.log2(delayHours + 1) * 3.5;
    scoreIncrease += delayFactor;
    populationMultiplier += (delayHours / 12) * 0.4;
    slaBreachRisk = Math.min(100, Math.round(slaBreachRisk + delayHours * 2.2));
  }

  // 2. Weather Multipliers & Category Vulnerabilities
  const categoryLower = incident.category.toLowerCase();

  if (weatherScenario === 'heavy_rain') {
    if (categoryLower.includes('water') || categoryLower.includes('drain') || categoryLower.includes('sewage')) {
      scoreIncrease += 14;
      populationMultiplier += 1.8;
      consequenceNotes.push('Severe Runoff Hazard: Surcharged drains will cause localized inundation into adjoining structures.');
    } else if (categoryLower.includes('electric') || categoryLower.includes('wire')) {
      scoreIncrease += 18;
      consequenceNotes.push('Water-Conductivity Hazard: Rain pooling around fallen or low-hanging wire drastically elevates electrocution radius.');
    } else if (categoryLower.includes('road')) {
      scoreIncrease += 11;
      consequenceNotes.push('Sub-base Erosion: Saturated asphalt under heavy rain creates deep blind sinkholes under moving vehicles.');
    }
  } else if (weatherScenario === 'heatwave') {
    if (categoryLower.includes('waste') || categoryLower.includes('garbage')) {
      scoreIncrease += 15;
      populationMultiplier += 1.4;
      consequenceNotes.push('Biochemical Hazard: Accelerated organic decomposition triggers severe odor complaints and pathogen vector breeding.');
    } else if (categoryLower.includes('electric')) {
      scoreIncrease += 12;
      consequenceNotes.push('Grid Overload Risk: High thermal ambient temperature increases transformer oil combustion risk under peak load.');
    }
  }

  // 3. Infrastructure Criticality Amplification
  if (incident.nearbyCriticalInfrastructure.some(i => i.toLowerCase().includes('hospital'))) {
    scoreIncrease += 6;
    consequenceNotes.push('Medical Access Disruption: Continued delay poses direct threat to emergency patient transport & oxygen supply delivery.');
  }
  if (incident.nearbyCriticalInfrastructure.some(i => i.toLowerCase().includes('school'))) {
    scoreIncrease += 5;
    consequenceNotes.push('Vulnerable Population: Pedestrian safety risk for children and elders within 150m perimeter.');
  }

  const projectedScore = Math.min(100, Math.round(baseScore + scoreIncrease));
  const projectedPopulation = Math.round(incident.affectedPopulationEstimate * populationMultiplier);

  // 4. Escalation Tier
  let escalationTier: 'low' | 'moderate' | 'high' | 'catastrophic' = 'low';
  if (projectedScore >= 90) escalationTier = 'catastrophic';
  else if (projectedScore >= 80) escalationTier = 'high';
  else if (projectedScore >= 65) escalationTier = 'moderate';

  // 5. Generate Simulation Timeline
  const intervals = [0, 2, 6, 12, 24, delayHours].filter((v, idx, arr) => arr.indexOf(v) === idx).sort((a, b) => a - b);
  const simulatedTimeline = intervals.map(h => {
    const intervalScore = Math.min(100, Math.round(baseScore + (h > 0 ? (h / delayHours) * scoreIncrease : 0)));
    let consequence = 'Current containment level';
    if (h >= 24) consequence = 'Widespread multi-block service collapse; severe public outrage';
    else if (h >= 12) consequence = 'Spillover impact onto arterial traffic and community health';
    else if (h >= 6) consequence = 'Localized failure expands to neighboring residential lanes';
    else if (h >= 2) consequence = 'Minor seepage and mounting citizen dissatisfaction';

    return {
      hours: h,
      projectedScore: intervalScore,
      consequence
    };
  });

  return {
    delayHours,
    weatherScenario,
    projectedPriority: projectedScore,
    projectedAffectedPopulation: projectedPopulation,
    projectedEscalationRisk: escalationTier,
    slaBreachLikelihood: slaBreachRisk,
    infrastructureRiskNotes: consequenceNotes,
    simulatedTimeline
  };
}
