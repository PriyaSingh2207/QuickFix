import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Shield,
  Layers,
  Wrench,
  CheckCircle,
  HelpCircle,
  History,
  Send,
  Sliders,
  FileText,
  FileDown,
  ExternalLink
} from 'lucide-react';
import type { UnifiedIncident, IncidentStatus, Complaint, FieldTeam } from '@/types/urbanIntelligence';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { rankRecommendedTeams } from '@/services/urbanIntelligence/dispatcherEngine';
import { inferRootCauseHypothesis } from '@/services/urbanIntelligence/rootCauseEngine';
import {
  exportSingleIncidentToPDF,
  exportSingleIncidentToWord,
  openSingleIncidentPDF
} from '@/services/urbanIntelligence/reportExporter';
import { toast } from 'sonner';

interface IncidentDetailModalProps {
  incident: UnifiedIncident | null;
  allComplaints: Complaint[];
  allTeams: FieldTeam[];
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (incidentId: string, status: IncidentStatus) => void;
  onOverridePriority: (incidentId: string, newScore: number, reason: string) => void;
  onAssignTeam: (incidentId: string, teamId: string, teamName: string) => void;
  onSplitComplaint: (parentIncident: UnifiedIncident, complaint: Complaint) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  allComplaints,
  allTeams,
  isOpen,
  onClose,
  onStatusChange,
  onOverridePriority,
  onAssignTeam,
  onSplitComplaint
}) => {
  if (!incident) return null;

  const [activeTab, setActiveTab] = useState<'evidence' | 'factors' | 'root_cause' | 'dispatch' | 'history'>('evidence');
  const [overrideScore, setOverrideScore] = useState<number>(incident.priorityScore.totalScore);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);

  const incidentComplaints = allComplaints.filter(c => incident.complaintIds.includes(c.id));
  const recommendedTeams = rankRecommendedTeams(incident, allTeams);
  const rootCause = inferRootCauseHypothesis(incident);

  const handleDownloadPDF = () => {
    try {
      exportSingleIncidentToPDF(incident, incidentComplaints, 'download');
      toast.success(`Exported ${incident.incidentNumber} Case File as PDF`);
    } catch (err: any) {
      toast.error(`PDF export failed: ${err.message}`);
    }
  };

  const handleOpenPDF = () => {
    try {
      openSingleIncidentPDF(incident, incidentComplaints);
      toast.success(`Opening ${incident.incidentNumber} PDF preview in new tab...`);
    } catch (err: any) {
      toast.error(`PDF preview failed: ${err.message}`);
    }
  };

  const handleDownloadWord = async () => {
    try {
      setIsExportingWord(true);
      await exportSingleIncidentToWord(incident);
      toast.success(`Exported ${incident.incidentNumber} Case File as Word (.docx)`);
    } catch (err: any) {
      toast.error(`Word export failed: ${err.message}`);
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    onOverridePriority(incident.id, overrideScore, overrideReason);
    setShowOverrideForm(false);
    setOverrideReason('');
  };

  const p = incident.priorityScore;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0 border border-slate-700 bg-card shadow-2xl">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 sticky top-0 z-20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-teal-300 bg-teal-950/80 border border-teal-700/60 px-2 py-0.5 rounded">
                  {incident.incidentNumber}
                </span>
                <Badge variant="outline" className="text-white border-slate-600 bg-slate-800 text-xs">
                  {incident.department}
                </Badge>
                <span className="text-xs text-slate-300 flex items-center gap-1 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  {incident.address} ({incident.wardName})
                </span>
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                {incident.title}
              </DialogTitle>
            </div>

            {/* Score Pill, Export Buttons & Close Button */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              <div className="hidden sm:flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="h-8 text-xs bg-rose-950/50 border-rose-800/60 text-rose-300 hover:bg-rose-900/70 hover:text-white"
                  title="Download Incident Case File as PDF"
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenPDF}
                  className="h-8 text-xs bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                  title="Open PDF Preview in new browser tab"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadWord}
                  disabled={isExportingWord}
                  className="h-8 text-xs bg-blue-950/50 border-blue-800/60 text-blue-300 hover:bg-blue-900/70 hover:text-white"
                  title="Download Incident Case File as Word (.docx)"
                >
                  <FileDown className="h-3.5 w-3.5 mr-1" />
                  {isExportingWord ? 'Exporting...' : 'Word'}
                </Button>
              </div>

              <div className="text-center bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-lg shadow-inner">
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Dynamic Priority</div>
                <div className="text-xl font-black text-amber-400">{p.totalScore}</div>
                <div className="text-[10px] text-slate-400">/ 100 max</div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors shadow-sm"
                title="Close dialog (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${activeTab === 'evidence' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 bg-slate-800/60 hover:text-white hover:bg-slate-800 border border-slate-700/50'}`}
            >
              Evidence & Fused Reports ({incidentComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab('factors')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${activeTab === 'factors' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 bg-slate-800/60 hover:text-white hover:bg-slate-800 border border-slate-700/50'}`}
            >
              Priority Factor Breakdown
            </button>
            <button
              onClick={() => setActiveTab('root_cause')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${activeTab === 'root_cause' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 bg-slate-800/60 hover:text-white hover:bg-slate-800 border border-slate-700/50'}`}
            >
              Root-Cause Hypothesis
            </button>
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${activeTab === 'dispatch' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 bg-slate-800/60 hover:text-white hover:bg-slate-800 border border-slate-700/50'}`}
            >
              Crew Dispatch ({recommendedTeams.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 bg-slate-800/60 hover:text-white hover:bg-slate-800 border border-slate-700/50'}`}
            >
              Audit & Score History ({incident.priorityHistory.length})
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* TAB 1: Evidence & Fused Reports */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 border rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Incident Problem Synopsis
                </h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {incident.description}
                </p>
                {incident.nearbyCriticalInfrastructure.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground">Critical Assets within 200m:</span>
                    {incident.nearbyCriticalInfrastructure.map((asset, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[11px] font-normal">
                        {asset}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-2.5 flex items-center justify-between">
                  <span>Constituent Citizen Complaints Fused into this Incident ({incidentComplaints.length})</span>
                  <span className="text-xs text-muted-foreground font-normal">Spatially & Semantically Correlated</span>
                </h4>

                <div className="space-y-2.5">
                  {incidentComplaints.map(comp => (
                    <div key={comp.id} className="border rounded-lg p-3 bg-card hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-teal-600">{comp.id}</span>
                            <span className="text-muted-foreground">• Reported by {comp.citizenName || 'Citizen'} ({comp.language.toUpperCase()})</span>
                            <span className="text-muted-foreground">• {new Date(comp.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-foreground mt-1 font-medium">"{comp.rawText}"</p>
                          {comp.translatedText && comp.language !== 'en' && (
                            <p className="text-[11px] text-muted-foreground italic mt-0.5">
                              Translation: "{comp.translatedText}"
                            </p>
                          )}
                        </div>

                        {incidentComplaints.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onSplitComplaint(incident, comp)}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-7"
                          >
                            Split Off
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Dynamic Priority Factor Breakdown */}
          {activeTab === 'factors' && (
            <div className="space-y-5">
              <div className="bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-teal-950 dark:text-teal-200 text-sm">
                    Municipal Decision Formula: P = 0.25U + 0.25I + 0.20S + 0.10W + 0.10C + 0.10E
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowOverrideForm(!showOverrideForm)}
                    className="h-7 text-xs border-teal-300 text-teal-800 dark:text-teal-200"
                  >
                    <Sliders className="h-3 w-3 mr-1" />
                    Officer Override
                  </Button>
                </div>
                <p className="text-xs text-teal-800 dark:text-teal-300 mt-1 leading-relaxed">
                  {p.formulaExplanation}
                </p>
              </div>

              {/* Override Form */}
              {showOverrideForm && (
                <form onSubmit={handleApplyOverride} className="bg-card border rounded-lg p-4 space-y-3 shadow-sm border-amber-300">
                  <h5 className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400">
                    Human-in-the-Loop Override (Logged with Audit Trail)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium block mb-1">Override Score (0 - 100):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={overrideScore}
                        onChange={e => setOverrideScore(Number(e.target.value))}
                        className="w-full h-8 px-2.5 rounded border text-sm bg-background"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">Reason for Adjustment:</label>
                      <input
                        type="text"
                        placeholder="e.g. VIP corridor, VIP hospital admission, ground inspection"
                        value={overrideReason}
                        onChange={e => setOverrideReason(e.target.value)}
                        className="w-full h-8 px-2.5 rounded border text-sm bg-background"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowOverrideForm(false)} className="h-7 text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white">
                      Confirm Override
                    </Button>
                  </div>
                </form>
              )}

              {/* Factor Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-3.5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">Urgency Factor (U) • 25%</span>
                    <span className="font-bold text-red-600">{p.urgency} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${p.urgency}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Time sensitivity and speed of hazard expansion.</span>
                </div>

                <div className="border rounded-lg p-3.5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">Infrastructure Impact (I) • 25%</span>
                    <span className="font-bold text-orange-600">{p.impact} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${p.impact}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Estimated citizens affected & arterial disruption.</span>
                </div>

                <div className="border rounded-lg p-3.5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">Life Safety Threat (S) • 20%</span>
                    <span className="font-bold text-red-600">{p.safety} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: `${p.safety}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Physical injury, drowning, or electrocution risk.</span>
                </div>

                <div className="border rounded-lg p-3.5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">Elapsed Waiting Time (W) • 10%</span>
                    <span className="font-bold text-amber-600">{p.waitingTime} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${p.waitingTime}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Pending duration preventing ticket starvation.</span>
                </div>

                <div className="border rounded-lg p-3.5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">Evidence Confidence (C) • 10%</span>
                    <span className="font-bold text-blue-600">{p.confidence} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.confidence}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Multi-source verification & photo evidence.</span>
                </div>

                <div className="border rounded-lg p-3.5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">Environmental Risk (E) • 10%</span>
                    <span className="font-bold text-teal-600">{p.environmental} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${p.environmental}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Weather forecast sensitivity (e.g. rain multiplier).</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Root-Cause Hypothesis */}
          {activeTab === 'root_cause' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-sm">
                  <HelpCircle className="h-4 w-4 text-indigo-600" />
                  AI Root-Cause Diagnosis: {rootCause.category}
                </div>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-2 font-medium leading-relaxed">
                  <strong>Hypothesis:</strong> {rootCause.primaryHypothesis}
                </p>
                <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800/60">
                  <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 block mb-1">
                    Recommended Permanent Engineering Fix:
                  </span>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    {rootCause.recommendedPreventativeAction}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2">Affected Sub-Assets</h5>
                <div className="flex flex-wrap gap-2">
                  {rootCause.affectedAssets.map((asset, i) => (
                    <Badge key={i} variant="outline" className="text-xs py-1 px-2.5">
                      {asset}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Crew Dispatch */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">
                  AI Recommended Field Crews (Ranked by Proximity & Expertise)
                </h4>
                {incident.assignedTeamName && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Currently Assigned: {incident.assignedTeamName}
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                {recommendedTeams.map(rec => (
                  <div key={rec.team.id} className="border rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card hover:border-teal-500/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{rec.team.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{rec.team.zone}</Badge>
                        <span className={`text-[11px] font-semibold ${rec.team.currentStatus === 'available' ? 'text-green-600' : 'text-amber-600'}`}>
                          • {rec.statusText}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.recommendationReason}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                        <span>Equipment: {rec.team.equipment.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Fit Score</span>
                        <span className="text-base font-black text-teal-600">{rec.matchScore}%</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={incident.assignedTeamId === rec.team.id}
                        onClick={() => onAssignTeam(incident.id, rec.team.id, rec.team.name)}
                        className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium"
                      >
                        {incident.assignedTeamId === rec.team.id ? 'Assigned' : 'Dispatch Team'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: History & Audit Log */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground">Priority Changes & Decision Audit Log</h4>
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-4 py-1">
                {incident.priorityHistory.map(evt => (
                  <div key={evt.id} className="ml-4 relative">
                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-teal-500 border-2 border-background" />
                    <div className="text-xs text-muted-foreground font-mono">
                      {new Date(evt.timestamp).toLocaleString()} • {evt.author}
                    </div>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{evt.reason}</p>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Score shifted from <span className="font-bold">{evt.previousScore}</span> → <span className="font-bold text-teal-600">{evt.newScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Status Bar */}
          <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">Change Status:</span>
              {(['investigating', 'assigned', 'in_progress', 'resolved'] as IncidentStatus[]).map(st => (
                <Button
                  key={st}
                  size="sm"
                  variant={incident.status === st ? 'default' : 'outline'}
                  onClick={() => onStatusChange(incident.id, st)}
                  className={`h-7 text-[11px] capitalize ${incident.status === st ? 'bg-slate-900 text-white' : ''}`}
                >
                  {st.replace('_', ' ')}
                </Button>
              ))}
            </div>

            <Button size="sm" variant="ghost" onClick={onClose} className="h-7 text-xs">
              Close Panel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
