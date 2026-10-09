import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
  ShieldCheck,
  Upload,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Eye,
  Check,
  X,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { contractorStore } from '@/services/contractorPortal/contractorStore';
import type { WorkOrder } from '@/types/contractorPortal';

export function ContractorPerformancePanel() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(contractorStore.getWorkOrders());
  const [analytics, setAnalytics] = useState(contractorStore.getMunicipalContractorAnalytics());
  const [selectedInspectionOrder, setSelectedInspectionOrder] = useState<WorkOrder | null>(null);
  const [reworkNotes, setReworkNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const refresh = () => {
    setWorkOrders(contractorStore.getWorkOrders());
    setAnalytics(contractorStore.getMunicipalContractorAnalytics());
  };

  const handleApproveWork = (woId: string) => {
    setIsProcessing(true);
    try {
      contractorStore.updateWorkOrderStatus(woId, 'awaiting_feedback');
      refresh();
      setSelectedInspectionOrder(null);
      toast.success('Work approved! Citizen has been invited to submit resolution feedback.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRework = (woId: string) => {
    if (!reworkNotes.trim()) {
      toast.error('Please specify the reason for rework');
      return;
    }
    setIsProcessing(true);
    try {
      contractorStore.updateWorkOrderStatus(woId, 'rework_required', { reworkNotes });
      refresh();
      setSelectedInspectionOrder(null);
      setReworkNotes('');
      toast.warning('Rework required. Work order flagged back to contractor.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <span className="text-[11px] text-slate-500 font-semibold">Avg Citizen Satisfaction</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-black text-amber-500">{analytics.avgRating}</span>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[10px] text-emerald-700 font-medium mt-1 block">Based on verified citizen feedback</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <span className="text-[11px] text-slate-500 font-semibold">On-Time Completion</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-600">{analytics.onTimeCompletionRate}%</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Within municipal SLA deadline</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <span className="text-[11px] text-slate-500 font-semibold">Avg Resolution Speed</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-black text-blue-600">{analytics.avgResolutionHours} hrs</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">From dispatch to inspection</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <span className="text-[11px] text-slate-500 font-semibold">Reopened Complaint Rate</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-black text-teal-600">{analytics.reopenedRatePercent}%</span>
            </div>
            <span className="text-[10px] text-teal-700 font-medium mt-1 block">Low citizen dispute index</span>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Work Orders & Inspection Queue */}
      <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            Contractor Work Orders & Resolution Inspection Queue
          </CardTitle>
          <Button size="sm" variant="outline" onClick={refresh} className="h-7 text-xs bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100">
          {workOrders.map(wo => (
            <div key={wo.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-teal-600">{wo.workOrderNumber}</span>
                  <Badge variant="outline" className="text-[10px] bg-slate-100 border-slate-200 text-slate-700">
                    Ticket: {wo.complaintTicketId}
                  </Badge>
                  <Badge className="text-[10px] bg-slate-100 text-slate-700 border-slate-200">
                    {wo.category}
                  </Badge>
                  <Badge
                    className={`text-[10px] uppercase font-bold ${
                      wo.status === 'inspection_requested' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      wo.status === 'awaiting_feedback' || wo.status === 'closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      wo.status === 'rework_required' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {wo.status.replace('_', ' ')}
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{wo.title}</h4>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1">
                  <span>Contractor: <strong className="text-slate-800">{wo.contractorName}</strong></span>
                  <span>•</span>
                  <span>Budget: <strong className="text-emerald-600">Rs. {wo.budgetApprovedINR.toLocaleString('en-IN')}</strong></span>
                  <span>•</span>
                  <span>Location: <strong className="text-slate-800">{wo.wardName}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {wo.status === 'inspection_requested' && (
                  <Button
                    size="sm"
                    onClick={() => setSelectedInspectionOrder(wo)}
                    className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Inspect Evidence
                  </Button>
                )}

                {wo.status === 'in_progress' && (
                  <span className="text-[11px] text-amber-800 font-semibold px-2 py-1 rounded bg-amber-50 border border-amber-200">
                    Execution in Progress
                  </span>
                )}

                {wo.citizenFeedbackSubmitted && (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                    <span>Rated {wo.citizenRating}★</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Inspection Evidence Modal */}
      {selectedInspectionOrder && (
        <Dialog open={!!selectedInspectionOrder} onOpenChange={() => setSelectedInspectionOrder(null)}>
          <DialogContent className="max-w-xl bg-white border-slate-200 text-slate-900 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="font-mono text-teal-600 text-xs font-bold">{selectedInspectionOrder.workOrderNumber}</span>
                <Badge variant="outline" className="text-[10px] bg-slate-100 border-slate-200 text-slate-700">
                  Inspection Docket
                </Badge>
              </div>
              <DialogTitle className="text-base font-bold text-slate-900 mt-1">
                Inspect Resolution Proof: {selectedInspectionOrder.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-1">
              {/* Before and After Photos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-600 font-semibold block mb-1">Before Work (Initial Defect):</span>
                  <div className="rounded-lg overflow-hidden border border-slate-200 h-40">
                    <img
                      src={selectedInspectionOrder.beforePhotoUrls[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop'}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 font-semibold block mb-1">After Work (Contractor Proof):</span>
                  <div className="rounded-lg overflow-hidden border border-emerald-300 h-40">
                    <img
                      src={selectedInspectionOrder.completionPhotoUrls[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop'}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Completion Report Summary */}
              {selectedInspectionOrder.completionReportSummary && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-600 font-bold block mb-1">Contractor Engineering Summary:</span>
                  <p className="text-slate-800 leading-relaxed italic">
                    "{selectedInspectionOrder.completionReportSummary}"
                  </p>
                </div>
              )}

              {/* Rework Reason Input if needed */}
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Rework Instructions (Only if rejecting):</label>
                <Textarea
                  rows={2}
                  value={reworkNotes}
                  onChange={e => setReworkNotes(e.target.value)}
                  placeholder="Specify remaining debris, required asphalt compaction, or defect re-inspection details..."
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white text-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRequestRework(selectedInspectionOrder.id)}
                  disabled={isProcessing}
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Request Rework
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedInspectionOrder(null)}
                    className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApproveWork(selectedInspectionOrder.id)}
                    disabled={isProcessing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Approve Resolution
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
