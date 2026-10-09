import React from 'react';
import {
  Scale,
  AlertTriangle,
  Clock,
  Users,
  CheckCircle2,
  TrendingDown,
  Info,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import type { WardEquityMetric } from '@/types/urbanIntelligence';
import { analyzeCityFairness } from '@/services/urbanIntelligence/fairnessEngine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FairnessMonitorViewProps {
  wards: WardEquityMetric[];
  onSelectWardFilter?: (wardId: string) => void;
}

export const FairnessMonitorView: React.FC<FairnessMonitorViewProps> = ({
  wards
}) => {
  const report = analyzeCityFairness(wards);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-xl p-5 border border-teal-800/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-teal-500 text-slate-950 font-bold uppercase text-[10px] tracking-wider">
                Fairness & Equity Engine
              </Badge>
              <h2 className="text-xl font-bold tracking-tight">Municipal Service Disparity Detector</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Monitors service equality across demographic zones. Identifies under-reported wards where low complaints reflect digital access barriers rather than absence of civic problems.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-center shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">City Equity Score</span>
            <span className={`text-3xl font-black ${report.fairnessIndexScore >= 75 ? 'text-teal-400' : 'text-amber-400'}`}>
              {report.fairnessIndexScore}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Disparity & Under-Reporting Alerts */}
      {report.alerts.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            Active Service Disparity Alerts ({report.alerts.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.alerts.map((alt, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-3.5 flex items-start gap-3 shadow-sm ${alt.severity === 'critical' ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'}`}
              >
                <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${alt.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">{alt.wardName}</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 uppercase font-bold">
                      {alt.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {alt.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ward Comparison Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            Ward-Level Wait & Resolution Benchmarks
          </h3>
          <span className="text-xs text-muted-foreground">
            City Average Wait: <strong>{report.cityAvgWaitHours}h</strong> • Resolution: <strong>{report.cityAvgResolutionHours}h</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b">
              <tr>
                <th className="py-3 px-4">Ward Name</th>
                <th className="py-3 px-3">Population</th>
                <th className="py-3 px-3">Complaints</th>
                <th className="py-3 px-3">Per Capita (Rate)</th>
                <th className="py-3 px-3">Avg Wait Time</th>
                <th className="py-3 px-3">Resolution Rate</th>
                <th className="py-3 px-4 text-center">Equity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {wards.map(ward => {
                const waitRatio = ward.avgWaitHours / (report.cityAvgWaitHours || 1);
                return (
                  <tr key={ward.wardId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {ward.wardName}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {ward.population.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-foreground">
                      {ward.complaintCount}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-medium ${ward.complaintsPerCapita < 0.25 ? 'text-amber-600 font-bold' : 'text-foreground'}`}>
                        {ward.complaintsPerCapita.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      <span className={waitRatio > 1.8 ? 'text-red-600 font-bold' : waitRatio > 1.2 ? 'text-amber-600' : 'text-green-600'}>
                        {ward.avgWaitHours} hrs
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground">
                      {ward.resolutionRatePercent}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ward.potentialUnderReporting ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                          Under-Reported Risk
                        </Badge>
                      ) : ward.disparityLevel === 'severe_disparity' ? (
                        <Badge className="bg-red-100 text-red-800 border-red-300 text-[10px]">
                          Severe Backlog
                        </Badge>
                      ) : ward.disparityLevel === 'moderate_delay' ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px]">
                          Elevated Delay
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">
                          Balanced Coverage
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
