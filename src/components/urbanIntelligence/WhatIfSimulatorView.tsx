import React, { useState } from 'react';
import {
  Sliders,
  CloudRain,
  Sun,
  Clock,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import type { UnifiedIncident } from '@/types/urbanIntelligence';
import { runWhatIfSimulation } from '@/services/urbanIntelligence/whatIfSimulator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WhatIfSimulatorViewProps {
  incidents: UnifiedIncident[];
  onSelectIncident: (incident: UnifiedIncident) => void;
}

export const WhatIfSimulatorView: React.FC<WhatIfSimulatorViewProps> = ({
  incidents,
  onSelectIncident
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [delayHours, setDelayHours] = useState<number>(6);
  const [weatherScenario, setWeatherScenario] = useState<'normal' | 'heavy_rain' | 'heatwave'>('heavy_rain');

  const targetIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  if (!targetIncident) {
    return <div className="p-8 text-center text-muted-foreground">No active incidents available to simulate.</div>;
  }

  const simulation = runWhatIfSimulation(targetIncident, delayHours, weatherScenario);
  const baselineScore = targetIncident.priorityScore.totalScore;
  const scoreDiff = simulation.projectedPriority - baselineScore;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900/90 via-slate-900 to-slate-900 text-white rounded-xl p-5 border border-amber-800/40 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-slate-950 font-bold uppercase text-[10px] tracking-wider">
                Predictive Intelligence
              </Badge>
              <h2 className="text-xl font-bold tracking-tight">What-If Intervention Simulator</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Simulate dynamic cascade failures. Model how incident risk escalates under delayed response times and adverse weather stresses.
              <span className="text-amber-300 font-medium ml-1">Simulated estimates represent scenario forecasting, not guaranteed outcomes.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Scenario Controls */}
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-5 lg:col-span-1">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-teal-600" />
            Simulation Parameters
          </h3>

          {/* Select Target Incident */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Target Urban Incident:</label>
            <select
              value={selectedIncidentId}
              onChange={e => setSelectedIncidentId(e.target.value)}
              className="w-full text-xs rounded-md border p-2 bg-background font-medium text-foreground"
            >
              {incidents.map(inc => (
                <option key={inc.id} value={inc.id}>
                  {inc.incidentNumber} - {inc.title.slice(0, 40)}... ({inc.priorityScore.totalScore} pts)
                </option>
              ))}
            </select>
          </div>

          {/* Delay Slider */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground">Delayed Intervention:</span>
              <span className="font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                +{delayHours} Hours Delay
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="48"
              step="2"
              value={delayHours}
              onChange={e => setDelayHours(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Immediate (0h)</span>
              <span>12h</span>
              <span>24h</span>
              <span>48h (2 Days)</span>
            </div>
          </div>

          {/* Weather Scenario Buttons */}
          <div className="space-y-2 pt-2 border-t">
            <label className="text-xs font-semibold text-foreground block">Weather Stress Scenario:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWeatherScenario('normal')}
                className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${weatherScenario === 'normal' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-muted-foreground'}`}
              >
                <Clock className="h-4 w-4 mx-auto mb-1" />
                Normal
              </button>

              <button
                type="button"
                onClick={() => setWeatherScenario('heavy_rain')}
                className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${weatherScenario === 'heavy_rain' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-muted-foreground'}`}
              >
                <CloudRain className="h-4 w-4 mx-auto mb-1" />
                Heavy Rain
              </button>

              <button
                type="button"
                onClick={() => setWeatherScenario('heatwave')}
                className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${weatherScenario === 'heatwave' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-muted-foreground'}`}
              >
                <Sun className="h-4 w-4 mx-auto mb-1" />
                Heatwave
              </button>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectIncident(targetIncident)}
            className="w-full text-xs font-medium"
          >
            Open Live Incident File
          </Button>
        </div>

        {/* Right 2 Columns: Impact Projections & Cascade Timeline */}
        <div className="lg:col-span-2 space-y-5">
          {/* Top Projection KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border rounded-xl p-3.5 shadow-sm text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Baseline Score</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{baselineScore}</span>
              <span className="text-[10px] text-muted-foreground block">Current rating</span>
            </div>

            <div className="bg-card border rounded-xl p-3.5 shadow-sm text-center border-amber-300 dark:border-amber-700/60 bg-amber-50/20">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Projected Score</span>
              <span className="text-2xl font-black text-amber-600">
                {simulation.projectedPriority}
                <span className="text-xs font-bold text-red-500 ml-1">+{scoreDiff}</span>
              </span>
              <span className="text-[10px] text-muted-foreground block">At +{delayHours}h delay</span>
            </div>

            <div className="bg-card border rounded-xl p-3.5 shadow-sm text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Affected Citizens</span>
              <span className="text-2xl font-black text-foreground">
                ~{simulation.projectedAffectedPopulation.toLocaleString()}
              </span>
              <span className="text-[10px] text-orange-600 font-semibold block">
                {Math.round((simulation.projectedAffectedPopulation / targetIncident.affectedPopulationEstimate) * 100)}% of baseline
              </span>
            </div>

            <div className="bg-card border rounded-xl p-3.5 shadow-sm text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">SLA Breach Risk</span>
              <span className={`text-2xl font-black ${simulation.slaBreachLikelihood >= 80 ? 'text-red-600' : 'text-amber-600'}`}>
                {simulation.slaBreachLikelihood}%
              </span>
              <span className="text-[10px] text-muted-foreground block">Likelihood</span>
            </div>
          </div>

          {/* Infrastructure Consequence Warnings */}
          {simulation.infrastructureRiskNotes.length > 0 && (
            <div className="bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                Predicted Critical Infrastructure Failure Vulnerabilities
              </div>
              <ul className="space-y-1.5 pl-5 list-disc text-xs text-red-900 dark:text-red-200 leading-relaxed">
                {simulation.infrastructureRiskNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Cascade Failure Progression Timeline */}
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              Simulated Progression Timeline (+{delayHours}h Horizon)
            </h4>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-4 py-1">
              {simulation.simulatedTimeline.map((step, idx) => (
                <div key={idx} className="ml-4 relative">
                  <div className={`absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background ${step.hours === 0 ? 'bg-blue-500' : step.hours <= 6 ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-foreground">
                      T + {step.hours} Hours
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                      Priority: {step.projectedScore}/100
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.consequence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
