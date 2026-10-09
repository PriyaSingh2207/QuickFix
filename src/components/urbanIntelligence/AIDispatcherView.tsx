import React, { useState } from 'react';
import {
  Wrench,
  Navigation,
  CheckCircle,
  Clock,
  MapPin,
  Send,
  Users,
  Shield,
  Briefcase
} from 'lucide-react';
import type { FieldTeam, UnifiedIncident } from '@/types/urbanIntelligence';
import { rankRecommendedTeams } from '@/services/urbanIntelligence/dispatcherEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AIDispatcherViewProps {
  teams: FieldTeam[];
  incidents: UnifiedIncident[];
  onDispatchTeam: (incidentId: string, teamId: string, teamName: string) => void;
}

export const AIDispatcherView: React.FC<AIDispatcherViewProps> = ({
  teams,
  incidents,
  onDispatchTeam
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const targetIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  const recommendations = targetIncident ? rankRecommendedTeams(targetIncident, teams) : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 text-white rounded-xl p-5 border border-blue-800/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500 text-slate-950 font-bold uppercase text-[10px] tracking-wider">
                Autonomous Resource Optimization
              </Badge>
              <h2 className="text-xl font-bold tracking-tight">Resource-Aware AI Dispatcher</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dynamically matches field repair crews based on required technical skillsets, equipment payloads, geographic travel distance, and active workload balance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Target Incident Selector */}
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4 lg:col-span-1">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-blue-600" />
            Dispatch Ticket Target
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Select Active Incident to Crew:</label>
            <select
              value={selectedIncidentId}
              onChange={e => setSelectedIncidentId(e.target.value)}
              className="w-full text-xs rounded-md border p-2 bg-background font-medium text-foreground"
            >
              {incidents.map(inc => (
                <option key={inc.id} value={inc.id}>
                  {inc.incidentNumber} - {inc.title.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>

          {targetIncident && (
            <div className="bg-muted/40 rounded-lg p-3.5 space-y-2 text-xs border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{targetIncident.department}</span>
                <Badge variant="outline" className="text-[10px] font-bold text-red-600 border-red-300">
                  Priority: {targetIncident.priorityScore.totalScore}
                </Badge>
              </div>
              <p className="text-muted-foreground line-clamp-2">{targetIncident.description}</p>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {targetIncident.address}
              </div>
              {targetIncident.assignedTeamName && (
                <div className="bg-green-50 text-green-800 dark:bg-green-950/60 dark:text-green-300 p-2 rounded border border-green-200 text-[11px] font-semibold mt-2">
                  Currently Assigned: {targetIncident.assignedTeamName}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Ranked Team Recommendations */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
            <span>Ranked Field Crew Options for Selected Incident</span>
            <span className="text-xs text-muted-foreground font-normal">Ranked by Proximity & Skill Fit</span>
          </h3>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => {
              const isAssigned = targetIncident?.assignedTeamId === rec.team.id;
              return (
                <div
                  key={rec.team.id}
                  className={`bg-card border rounded-xl p-4 shadow-sm transition-all hover:border-blue-500/50 ${isAssigned ? 'border-green-400 bg-green-50/10' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{rec.team.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{rec.team.department}</Badge>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">{rec.team.zone}</Badge>
                        <span className={`text-[11px] font-semibold ${rec.team.currentStatus === 'available' ? 'text-green-600' : 'text-amber-600'}`}>
                          • {rec.statusText}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {rec.recommendationReason}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-muted-foreground">
                        <span className="bg-muted px-2 py-0.5 rounded">
                          Distance: <strong className="text-foreground">{rec.distanceKm} km</strong>
                        </span>
                        <span className="bg-muted px-2 py-0.5 rounded">
                          Active Jobs: <strong className="text-foreground">{rec.team.activeAssignments}</strong>
                        </span>
                        <span className="bg-muted px-2 py-0.5 rounded">
                          Payload: <strong className="text-foreground">{rec.team.equipment[0] || 'Standard'}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:border-l sm:pl-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Fit Match</span>
                        <span className="text-xl font-black text-blue-600">{rec.matchScore}%</span>
                      </div>

                      <Button
                        size="sm"
                        disabled={isAssigned || !targetIncident}
                        onClick={() => onDispatchTeam(targetIncident.id, rec.team.id, rec.team.name)}
                        className={`h-8 text-xs font-medium px-3 ${isAssigned ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      >
                        <Send className="h-3 w-3 mr-1.5" />
                        {isAssigned ? 'Dispatched' : 'Dispatch'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
