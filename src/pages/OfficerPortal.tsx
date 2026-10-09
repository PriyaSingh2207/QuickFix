import React, { useState, useEffect } from 'react';
import {
  INITIAL_WARDS,
  INITIAL_FIELD_TEAMS
} from '@/services/urbanIntelligence/syntheticDataset';
import type {
  UnifiedIncident,
  Complaint,
  FieldTeam,
  WardEquityMetric,
  IncidentStatus
} from '@/types/urbanIntelligence';
import { mergeIncidents, splitComplaintFromIncident } from '@/services/urbanIntelligence/incidentFusion';
import { applyHumanPriorityOverride } from '@/services/urbanIntelligence/priorityEngine';
import { analyzeCityFairness } from '@/services/urbanIntelligence/fairnessEngine';
import {
  getStoredIncidents,
  getStoredComplaints,
  saveStoredIncidents
} from '@/services/urbanIntelligence/urbanStore';

import { OfficerPortalHeader } from '@/components/urbanIntelligence/OfficerPortalHeader';
import { RankedIncidentQueue } from '@/components/urbanIntelligence/RankedIncidentQueue';
import { IncidentDetailModal } from '@/components/urbanIntelligence/IncidentDetailModal';
import { SpatialHotspotMap } from '@/components/urbanIntelligence/SpatialHotspotMap';
import { WhatIfSimulatorView } from '@/components/urbanIntelligence/WhatIfSimulatorView';
import { FairnessMonitorView } from '@/components/urbanIntelligence/FairnessMonitorView';
import { AIDispatcherView } from '@/components/urbanIntelligence/AIDispatcherView';
import { ComplaintIntakeIntelligence } from '@/components/urbanIntelligence/ComplaintIntakeIntelligence';
import { Open311Modal } from '@/components/urbanIntelligence/Open311Modal';
import { ContractorPerformancePanel } from '@/components/urbanIntelligence/ContractorPerformancePanel';

import {
  ListOrdered,
  MapPin,
  Sliders,
  Scale,
  Send,
  Sparkles,
  Layers,
  Building2
} from 'lucide-react';

export const OfficerPortal: React.FC = () => {
  const [incidents, setIncidents] = useState<UnifiedIncident[]>(getStoredIncidents);
  const [complaints, setComplaints] = useState<Complaint[]>(getStoredComplaints);
  const [wards] = useState<WardEquityMetric[]>(INITIAL_WARDS);
  const [teams, setTeams] = useState<FieldTeam[]>(INITIAL_FIELD_TEAMS);

  // Sync with citizen complaints registered in real time
  useEffect(() => {
    const handleSync = () => {
      setIncidents(getStoredIncidents());
      setComplaints(getStoredComplaints());
    };
    window.addEventListener('quickfix-data-updated', handleSync);
    return () => window.removeEventListener('quickfix-data-updated', handleSync);
  }, []);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'queue' | 'map' | 'what_if' | 'fairness' | 'dispatch' | 'intake' | 'contractors'>('queue');

  // Modal states
  const [selectedIncident, setSelectedIncident] = useState<UnifiedIncident | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isOpen311ModalOpen, setIsOpen311ModalOpen] = useState(false);

  // Merge state
  const [mergeSourceIncident, setMergeSourceIncident] = useState<UnifiedIncident | null>(null);

  // Incident status change handler
  const handleStatusChange = (incidentId: string, status: IncidentStatus) => {
    setIncidents(prev => {
      const updated = prev.map(inc => (inc.id === incidentId ? { ...inc, status, lastUpdatedAt: new Date().toISOString() } : inc));
      saveStoredIncidents(updated);
      return updated;
    });
    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident(prev => (prev ? { ...prev, status, lastUpdatedAt: new Date().toISOString() } : null));
    }
  };

  // Human priority override handler
  const handleOverridePriority = (incidentId: string, newScore: number, reason: string) => {
    setIncidents(prev => {
      const updated = prev.map(inc => {
        if (inc.id === incidentId) {
          const up = applyHumanPriorityOverride(inc, newScore, reason, 'City Command Officer');
          if (selectedIncident && selectedIncident.id === incidentId) {
            setSelectedIncident(up);
          }
          return up;
        }
        return inc;
      });
      saveStoredIncidents(updated);
      return updated;
    });
  };

  // Dispatch field crew handler
  const handleDispatchTeam = (incidentId: string, teamId: string, teamName: string) => {
    setIncidents(prev => {
      const updated = prev.map(inc =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'assigned' as IncidentStatus,
              assignedTeamId: teamId,
              assignedTeamName: teamName,
              lastUpdatedAt: new Date().toISOString()
            }
          : inc
      );
      saveStoredIncidents(updated);
      return updated;
    });
    setTeams(prev =>
      prev.map(t => (t.id === teamId ? { ...t, currentStatus: 'dispatched', activeAssignments: t.activeAssignments + 1 } : t))
    );
    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident(prev =>
        prev ? { ...prev, status: 'assigned' as IncidentStatus, assignedTeamId: teamId, assignedTeamName: teamName } : null
      );
    }
  };

  // Split complaint handler
  const handleSplitComplaint = (parentIncident: UnifiedIncident, complaintToSplit: Complaint) => {
    const { updatedParent, newIncident } = splitComplaintFromIncident(
      parentIncident,
      complaintToSplit,
      'Officer Administrator'
    );

    setIncidents(prev => {
      const updated = [newIncident, ...prev.map(i => (i.id === updatedParent.id ? updatedParent : i))];
      saveStoredIncidents(updated);
      return updated;
    });
    setSelectedIncident(updatedParent);
  };

  // Merge incidents handler
  const handleInitiateMerge = (source: UnifiedIncident) => {
    if (!mergeSourceIncident) {
      setMergeSourceIncident(source);
    } else if (mergeSourceIncident.id === source.id) {
      setMergeSourceIncident(null);
    } else {
      // Merge source into target
      const target = source;
      const merged = mergeIncidents(target, mergeSourceIncident, 'Officer Administrator');

      setIncidents(prev => {
        const updated = [merged, ...prev.filter(i => i.id !== target.id && i.id !== mergeSourceIncident.id)];
        saveStoredIncidents(updated);
        return updated;
      });
      setMergeSourceIncident(null);
    }
  };

  // Add new complaint handler
  const handleAddNewComplaint = (newComp: Complaint) => {
    setComplaints(prev => [newComp, ...prev]);

    // If linked to an incident, update its complaint count
    if (newComp.incidentId) {
      setIncidents(prev =>
        prev.map(inc => {
          if (inc.id === newComp.incidentId) {
            return {
              ...inc,
              complaintCount: inc.complaintCount + 1,
              complaintIds: Array.from(new Set([...inc.complaintIds, newComp.id])),
              lastUpdatedAt: new Date().toISOString()
            };
          }
          return inc;
        })
      );
    }
  };

  const criticalCount = incidents.filter(i => i.urgency === 'critical').length;
  const fairnessReport = analyzeCityFairness(wards);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Officer Portal Banner Header */}
      <OfficerPortalHeader
        activeIncidentsCount={incidents.length}
        criticalCount={criticalCount}
        avgWaitHours={fairnessReport.cityAvgWaitHours}
        fairnessScore={fairnessReport.fairnessIndexScore}
        onExportOpen311={() => setIsOpen311ModalOpen(true)}
        onOpenIntakeTester={() => setActiveTab('intake')}
      />

      {/* Merge floating banner */}
      {mergeSourceIncident && (
        <div className="bg-purple-900 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-300" />
            <span>
              Merge Mode Active: Click <strong>"Merge"</strong> on any other incident to fuse with{' '}
              <strong>{mergeSourceIncident.incidentNumber}</strong> ({mergeSourceIncident.title}).
            </span>
          </div>
          <button
            onClick={() => setMergeSourceIncident(null)}
            className="underline font-semibold hover:text-purple-200"
          >
            Cancel Merge
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'queue'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-card border border-border text-foreground font-semibold hover:bg-muted'
            }`}
          >
            <ListOrdered className="h-4 w-4" />
            Ranked Incident Queue ({incidents.length})
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'map'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-card border border-border text-foreground font-semibold hover:bg-muted'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Spatial Hotspot Map
          </button>

          <button
            onClick={() => setActiveTab('what_if')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'what_if'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-card border border-border text-foreground font-semibold hover:bg-muted'
            }`}
          >
            <Sliders className="h-4 w-4" />
            What-If Simulator
          </button>

          <button
            onClick={() => setActiveTab('fairness')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'fairness'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-card border border-border text-foreground font-semibold hover:bg-muted'
            }`}
          >
            <Scale className="h-4 w-4" />
            Fairness & Service Equity
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'dispatch'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-card border border-border text-foreground font-semibold hover:bg-muted'
            }`}
          >
            <Send className="h-4 w-4" />
            Crew Dispatcher ({teams.length})
          </button>

          <button
            onClick={() => setActiveTab('intake')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'intake'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-card border border-border text-foreground font-semibold hover:bg-muted'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Intake & NLP Tester
          </button>

          <button
            onClick={() => setActiveTab('contractors')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'contractors'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-card border border-border text-foreground font-semibold hover:bg-muted'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Contractor SLA & Work Orders
          </button>
        </div>

        {/* Tab Content Views */}
        <div>
          {activeTab === 'queue' && (
            <RankedIncidentQueue
              incidents={incidents}
              onSelectIncident={inc => {
                setSelectedIncident(inc);
                setIsDetailModalOpen(true);
              }}
              onStatusChange={handleStatusChange}
              onInitiateMerge={handleInitiateMerge}
            />
          )}

          {activeTab === 'map' && (
            <SpatialHotspotMap
              incidents={incidents}
              onSelectIncident={inc => {
                setSelectedIncident(inc);
                setIsDetailModalOpen(true);
              }}
            />
          )}

          {activeTab === 'what_if' && (
            <WhatIfSimulatorView
              incidents={incidents}
              onSelectIncident={inc => {
                setSelectedIncident(inc);
                setIsDetailModalOpen(true);
              }}
            />
          )}

          {activeTab === 'fairness' && (
            <FairnessMonitorView wards={wards} />
          )}

          {activeTab === 'dispatch' && (
            <AIDispatcherView
              teams={teams}
              incidents={incidents}
              onDispatchTeam={handleDispatchTeam}
            />
          )}

          {activeTab === 'intake' && (
            <ComplaintIntakeIntelligence
              existingIncidents={incidents}
              onAddNewComplaint={handleAddNewComplaint}
            />
          )}

          {activeTab === 'contractors' && (
            <ContractorPerformancePanel />
          )}
        </div>
      </main>

      {/* Incident Detail and Evidence Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        allComplaints={complaints}
        allTeams={teams}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onStatusChange={handleStatusChange}
        onOverridePriority={handleOverridePriority}
        onAssignTeam={handleDispatchTeam}
        onSplitComplaint={handleSplitComplaint}
      />

      {/* Open311 Export Modal */}
      <Open311Modal
        incidents={incidents}
        isOpen={isOpen311ModalOpen}
        onClose={() => setIsOpen311ModalOpen(false)}
      />
    </div>
  );
};

export default OfficerPortal;
