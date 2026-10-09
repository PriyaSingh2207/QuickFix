import React, { useState } from 'react';
import {
  AlertTriangle,
  Users,
  MapPin,
  Layers,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import type { UnifiedIncident, IncidentStatus } from '@/types/urbanIntelligence';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RankedIncidentQueueProps {
  incidents: UnifiedIncident[];
  onSelectIncident: (incident: UnifiedIncident) => void;
  onStatusChange?: (incidentId: string, newStatus: IncidentStatus) => void;
  onInitiateMerge: (sourceIncident: UnifiedIncident) => void;
}

export const RankedIncidentQueue: React.FC<RankedIncidentQueueProps> = ({
  incidents,
  onSelectIncident,
  onStatusChange: _onStatusChange,
  onInitiateMerge
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'waiting' | 'population'>('priority');

  // Filter list
  const filtered = incidents
    .filter(inc => {
      const matchSearch =
        inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchWard = selectedWard === 'all' || inc.wardId === selectedWard;
      const matchDept = selectedDepartment === 'all' || inc.department === selectedDepartment;
      const matchStatus = selectedStatus === 'all' || inc.status === selectedStatus;

      return matchSearch && matchWard && matchDept && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priorityScore.totalScore - a.priorityScore.totalScore;
      if (sortBy === 'waiting') return b.priorityScore.waitingTime - a.priorityScore.waitingTime;
      if (sortBy === 'population') return b.affectedPopulationEstimate - a.affectedPopulationEstimate;
      return 0;
    });

  const getPriorityColor = (score: number) => {
    if (score >= 85) return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300';
    if (score >= 70) return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300';
    return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300';
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="border-red-300 text-red-600 bg-red-50 text-[11px]">Open</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="border-amber-300 text-amber-600 bg-amber-50 text-[11px]">Investigating</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="border-blue-300 text-blue-600 bg-blue-50 text-[11px]">Assigned</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="border-purple-300 text-purple-600 bg-purple-50 text-[11px]">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="border-green-300 text-green-600 bg-green-50 text-[11px]">Resolved</Badge>;
      default:
        return <Badge variant="secondary" className="text-[11px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-card border rounded-lg p-3 sm:p-4 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search incidents by problem, address, ID (e.g. Hospital, AB Road, URB-IND-26-01)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="text-sm h-9 pl-3 pr-8"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedWard}
              onChange={e => setSelectedWard(e.target.value)}
              className="h-9 px-2.5 rounded-md border text-xs bg-background text-foreground"
            >
              <option value="all">All Wards</option>
              <option value="WARD-04">Ward 4 - Vijay Nagar</option>
              <option value="WARD-09">Ward 9 - Rajwada</option>
              <option value="WARD-12">Ward 12 - Sukhlia</option>
              <option value="WARD-17">Ward 17 - Chhoti Gwaltoli</option>
              <option value="WARD-23">Ward 23 - Banganga (Disparity)</option>
              <option value="WARD-28">Ward 28 - Annapurna</option>
            </select>

            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="h-9 px-2.5 rounded-md border text-xs bg-background text-foreground"
            >
              <option value="all">All Departments</option>
              <option value="Water & Sewage">Water & Sewage</option>
              <option value="Electricity & Lighting">Electricity & Lighting</option>
              <option value="Roads & Infrastructure">Roads & Infrastructure</option>
              <option value="Solid Waste">Solid Waste</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="h-9 px-2.5 rounded-md border text-xs bg-background text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="h-9 px-2.5 rounded-md border text-xs bg-background font-medium text-foreground"
            >
              <option value="priority">Sort: Dynamic Priority (High → Low)</option>
              <option value="waiting">Sort: Longest Waiting Time</option>
              <option value="population">Sort: Affected Population</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident Queue List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-lg p-6">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-base font-semibold">No incidents match the selected filter criteria</p>
            <p className="text-xs text-muted-foreground mt-1">Try clearing ward or department filters</p>
          </div>
        ) : (
          filtered.map((inc, rankIdx) => {
            const p = inc.priorityScore;
            return (
              <div
                key={inc.id}
                className="bg-card border rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:border-teal-500/50 group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Rank & Title & Details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-12 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 border text-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Rank</span>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">#{rankIdx + 1}</span>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">{inc.incidentNumber}</span>
                        {getStatusBadge(inc.status)}
                        <Badge variant="secondary" className="text-[11px] font-normal">{inc.department}</Badge>
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {inc.wardName}
                        </span>
                        {inc.complaintCount > 1 && (
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 text-[11px] font-medium">
                            <Layers className="h-3 w-3 mr-1" />
                            {inc.complaintCount} fused reports
                          </Badge>
                        )}
                        {inc.weatherEscalationRisk === 'severe' && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[11px] font-medium">
                            <AlertTriangle className="h-3 w-3 mr-1 text-amber-700" />
                            Weather Risk
                          </Badge>
                        )}
                      </div>

                      <h3
                        onClick={() => onSelectIncident(inc)}
                        className="text-base font-bold text-foreground cursor-pointer group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1"
                      >
                        {inc.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {inc.description}
                      </p>

                      {/* Factor Chips */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Urgency: <strong className="text-foreground">{p.urgency}</strong>
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Safety: <strong className="text-foreground">{p.safety}</strong>
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          ~{inc.affectedPopulationEstimate.toLocaleString()} affected
                        </span>
                        {inc.assignedTeamName && (
                          <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                            Assigned: {inc.assignedTeamName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Dynamic Priority Gauge & Action Buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1.5 rounded-lg border text-center ${getPriorityColor(p.totalScore)}`}>
                        <div className="text-[10px] font-bold uppercase tracking-wide">Priority Score</div>
                        <div className="text-2xl font-black">{p.totalScore}</div>
                        <div className="text-[9px] opacity-75 font-mono">P = 0.25U+0.25I...</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onInitiateMerge(inc)}
                        className="h-8 text-xs px-2.5 text-muted-foreground hover:text-foreground"
                      >
                        <Layers className="h-3.5 w-3.5 mr-1" />
                        Merge
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onSelectIncident(inc)}
                        className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium px-3"
                      >
                        Inspect & Act
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
