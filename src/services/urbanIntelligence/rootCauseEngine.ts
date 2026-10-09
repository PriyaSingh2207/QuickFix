import type { UnifiedIncident } from '@/types/urbanIntelligence';

export interface RootCauseInsight {
  category: string;
  identifiedSymptomCount: number;
  primaryHypothesis: string;
  recommendedPreventativeAction: string;
  affectedAssets: string[];
}

/**
 * Connects scattered complaint symptoms to underlying municipal infrastructure failure hypotheses
 */
export function inferRootCauseHypothesis(incident: UnifiedIncident): RootCauseInsight {
  const text = `${incident.title} ${incident.description}`.toLowerCase();

  if (text.includes('water') || text.includes('pipe') || text.includes('surge')) {
    return {
      category: 'Water Transmission Infrastructure',
      identifiedSymptomCount: incident.complaintCount,
      primaryHypothesis: 'Underground high-pressure pipe wall fatigue caused by water hammer shock or road foundation settling.',
      recommendedPreventativeAction: 'Isolate upstream sluice valve 4B, inspect cathodic corrosion protection, and deploy ultrasonic acoustic pipe leak sensors along the 500m feeder corridor.',
      affectedAssets: ['Feeder Line 600mm DI', 'Distribution Valve Box 12', 'Sub-road gravel bedding']
    };
  }

  if (text.includes('wire') || text.includes('spark') || text.includes('transformer') || text.includes('electric')) {
    return {
      category: 'Power Distribution Grid',
      identifiedSymptomCount: incident.complaintCount,
      primaryHypothesis: 'Insulator flashover or phase-to-ground fault caused by degraded terminal clamps and ambient humidity.',
      recommendedPreventativeAction: 'Perform thermal camera scan on adjacent pole cross-arms, replace lightning surge arresters, and trim overhanging tree branches within 4m envelope.',
      affectedAssets: ['11kV Feeder Pole #88', 'Step-down Transformer 250kVA', 'Drop-out fuse assembly']
    };
  }

  if (text.includes('drain') || text.includes('culvert') || text.includes('flood')) {
    return {
      category: 'Stormwater & Drainage Network',
      identifiedSymptomCount: incident.complaintCount,
      primaryHypothesis: 'Hydraulic constriction at bridge culvert inlet caused by solid debris bridging and reduced channel gradient.',
      recommendedPreventativeAction: 'Install automated trash rack screen at intake headwall, desilt 200m downstream canal, and enforce anti-dumping CCTV surveillance.',
      affectedAssets: ['RC Box Culvert 2x2m', 'Masonry Side Retaining Wall', 'Storm Catch Basin']
    };
  }

  if (text.includes('pothole') || text.includes('road') || text.includes('bridge')) {
    return {
      category: 'Highway & Pavement Engineering',
      identifiedSymptomCount: incident.complaintCount,
      primaryHypothesis: 'Water ingress into bitumen binder layer through fine alligator cracks, combined with heavy axle bus braking shear.',
      recommendedPreventativeAction: 'Mill and re-lay 40mm Dense Bituminous Macadam (DBM) with geogrid reinforcement, and restore non-functional road camber drainage.',
      affectedAssets: ['Bituminous Wearing Course', 'Overbridge Approach Slab', 'Storm Kerb Drain']
    };
  }

  return {
    category: 'Municipal Sanitation & Public Health',
    identifiedSymptomCount: incident.complaintCount,
    primaryHypothesis: 'Route optimization failure and shortage of tipper collection vehicles causing cumulative waste buildup.',
    recommendedPreventativeAction: 'Re-route morning secondary transfer compactor, conduct door-to-door biometric collection audit, and install localized secondary bin.',
    affectedAssets: ['Ward Collection Route 7', 'Secondary Transfer Station', 'Vector Control Bio-sprayer']
  };
}
