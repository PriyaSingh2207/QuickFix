import type { WardEquityMetric } from '@/types/urbanIntelligence';

export interface CityFairnessReport {
  cityAvgWaitHours: number;
  cityAvgResolutionHours: number;
  highestDisparityWard: WardEquityMetric;
  underReportedWards: WardEquityMetric[];
  fairnessIndexScore: number; // 0 - 100 (100 = perfectly equitable)
  alerts: { wardName: string; type: 'WAIT_TIME_DISPARITY' | 'UNDER_REPORTING' | 'BACKLOG_CHOKE'; message: string; severity: 'warning' | 'critical' }[];
}

/**
 * Analyzes ward equity metrics to detect municipal service disparities and under-served zones
 */
export function analyzeCityFairness(wards: WardEquityMetric[]): CityFairnessReport {
  if (wards.length === 0) {
    return {
      cityAvgWaitHours: 0,
      cityAvgResolutionHours: 0,
      highestDisparityWard: {} as WardEquityMetric,
      underReportedWards: [],
      fairnessIndexScore: 100,
      alerts: []
    };
  }

  const totalWait = wards.reduce((acc, w) => acc + w.avgWaitHours, 0);
  const totalResolution = wards.reduce((acc, w) => acc + w.avgResolutionHours, 0);
  const cityAvgWaitHours = Number((totalWait / wards.length).toFixed(1));
  const cityAvgResolutionHours = Number((totalResolution / wards.length).toFixed(1));

  // Find ward with worst delay
  const sortedByWait = [...wards].sort((a, b) => b.avgWaitHours - a.avgWaitHours);
  const highestDisparityWard = sortedByWait[0];

  // Detect under-reporting: high population (>50k), but complaints per capita < 0.25 AND wait hours > 20
  const underReportedWards = wards.filter(w => w.potentialUnderReporting || (w.population > 50000 && w.complaintsPerCapita < 0.25));

  // Generate Equity Alerts
  const alerts: CityFairnessReport['alerts'] = [];

  wards.forEach(w => {
    if (w.avgWaitHours > cityAvgWaitHours * 2.0) {
      alerts.push({
        wardName: w.wardName,
        type: 'WAIT_TIME_DISPARITY',
        message: `Citizens in ${w.wardName} wait ${w.avgWaitHours}h on average (${Math.round((w.avgWaitHours / cityAvgWaitHours) * 100)}% of city avg). Resource reallocation advised.`,
        severity: 'critical'
      });
    }

    if (w.potentialUnderReporting) {
      alerts.push({
        wardName: w.wardName,
        type: 'UNDER_REPORTING',
        message: `High risk of silent infrastructure decay in ${w.wardName}. Only ${w.complaintCount} reports from population of ${w.population.toLocaleString()}. Dispatch proactive field audit inspection.`,
        severity: 'warning'
      });
    }
  });

  // Calculate fairness index (100 - standard deviation / disparity penalty)
  const waitVariances = wards.map(w => Math.pow(w.avgWaitHours - cityAvgWaitHours, 2));
  const stdDev = Math.sqrt(waitVariances.reduce((a, b) => a + b, 0) / wards.length);
  const fairnessIndexScore = Math.max(30, Math.min(100, Math.round(100 - stdDev * 3.2)));

  return {
    cityAvgWaitHours,
    cityAvgResolutionHours,
    highestDisparityWard,
    underReportedWards,
    fairnessIndexScore,
    alerts
  };
}
