import type { UnifiedIncident, FieldTeam } from '@/types/urbanIntelligence';
import { haversineDistanceMeters } from './incidentFusion';

export interface TeamRecommendation {
  team: FieldTeam;
  matchScore: number; // 0 - 100
  distanceKm: number;
  skillMatchCount: number;
  matchedSkills: string[];
  statusText: string;
  recommendationReason: string;
}

/**
 * Recommends field crews for an incident based on department, skills, proximity, and current workload
 */
export function rankRecommendedTeams(
  incident: UnifiedIncident,
  teams: FieldTeam[]
): TeamRecommendation[] {
  return teams
    .map(team => {
      // 1. Department match
      const deptMatch = team.department.toLowerCase() === incident.department.toLowerCase();

      // 2. Proximity distance
      const distanceMeters = haversineDistanceMeters(
        incident.latitude,
        incident.longitude,
        team.baseLatitude,
        team.baseLongitude
      );
      const distanceKm = Number((distanceMeters / 1000).toFixed(1));

      // 3. Skills overlap with incident category & description
      const incidentText = `${incident.title} ${incident.description} ${incident.category}`.toLowerCase();
      const matchedSkills = team.skills.filter(s =>
        incidentText.includes(s.toLowerCase().split(' ')[0]) ||
        incidentText.includes(s.toLowerCase())
      );

      // 4. Availability penalty
      let availabilityScore = 100;
      if (team.currentStatus === 'on_site') availabilityScore = 50;
      else if (team.currentStatus === 'dispatched') availabilityScore = 30;
      else if (team.currentStatus === 'off_duty') availabilityScore = 0;

      const workloadPenalty = Math.min(40, team.activeAssignments * 15);

      // 5. Compute overall composite score
      let score = 0;
      if (deptMatch) score += 40;
      score += Math.max(0, 30 - distanceKm * 3.5); // Proximity score
      score += matchedSkills.length * 12;          // Skills match
      score += (availabilityScore * 0.2) - workloadPenalty;

      const finalMatchScore = Math.min(99, Math.max(15, Math.round(score)));

      let statusText = 'Ready for immediate dispatch';
      if (team.currentStatus === 'on_site') statusText = 'Currently completing nearby ticket';
      else if (team.currentStatus === 'dispatched') statusText = 'En-route to secondary site';

      const reason = deptMatch
        ? `Primary Department Match (${team.department}) • ${distanceKm} km away • Matched expertise: ${matchedSkills.length > 0 ? matchedSkills.join(', ') : 'General response'}`
        : `Inter-departmental backup crew • ${distanceKm} km away`;

      return {
        team,
        matchScore: finalMatchScore,
        distanceKm,
        skillMatchCount: matchedSkills.length,
        matchedSkills,
        statusText,
        recommendationReason: reason
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
