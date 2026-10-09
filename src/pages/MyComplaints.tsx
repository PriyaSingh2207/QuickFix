import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Star,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Bell,
  ArrowRight,
  ShieldAlert,
  ThumbsUp,
  RefreshCw,
  Building2,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { contractorStore } from '@/services/contractorPortal/contractorStore';
import type { WorkOrder, CitizenComplaintFeedback, InAppNotification } from '@/types/contractorPortal';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/common/LanguageSelector';

interface CitizenComplaintItem {
  id: string;
  ticketId: string;
  title: string;
  category: string;
  description: string;
  address: string;
  wardName: string;
  submittedAt: string;
  status: 'submitted' | 'under_review' | 'prioritized' | 'assigned' | 'in_progress' | 'inspection_requested' | 'awaiting_feedback' | 'resolved' | 'rework_required';
  priorityScore: number;
  assignedContractor?: string;
  workOrderRef?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  completionReport?: string;
}

const DEFAULT_COMPLAINTS: CitizenComplaintItem[] = [
  {
    id: 'cmp-01',
    ticketId: 'UPC-2026-000104',
    title: 'High-Voltage Snapped Cable Sparking at School Dismissal Gate',
    category: 'Electricity & Lighting',
    description: '11kV distribution line detached from transformer pole, hanging low across the primary pedestrian pathway outside Saraswati Bal Mandir School.',
    address: 'Lane 3, Outside Primary School, Sarafa Zone',
    wardName: 'Ward 9 - Rajwada Central',
    submittedAt: '2026-10-08T02:15:00Z',
    status: 'in_progress',
    priorityScore: 92.8,
    assignedContractor: 'Apex Urban Infra & Engineering Pvt Ltd',
    workOrderRef: 'WO-2026-IND-0104',
    beforePhotoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop'
  },
  {
    id: 'cmp-02',
    ticketId: 'UPC-2026-000098',
    title: 'Hospital Corridor Main Pipeline Burst & Collapsed Culvert',
    category: 'Water Supply & Sewerage',
    description: 'High-pressure 600mm potable water transmission line fractured beneath arterial link opposite District Hospital.',
    address: 'AB Road, Opposite District Hospital Emergency Wing',
    wardName: 'Ward 4 - Vijay Nagar North',
    submittedAt: '2026-10-06T09:00:00Z',
    status: 'awaiting_feedback',
    priorityScore: 88.7,
    assignedContractor: 'Apex Urban Infra & Engineering Pvt Ltd',
    workOrderRef: 'WO-2026-IND-0098',
    beforePhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=600&auto=format&fit=crop',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop',
    completionReport: 'Culvert structural reinforcement and pipeline welding completed with M30 RCC slabs.'
  },
  {
    id: 'cmp-03',
    ticketId: 'UPC-2026-000085',
    title: 'Deep Unbarricaded Road Cave-in on Sanwer Road Feeder',
    category: 'Roads & Infrastructure',
    description: 'Dangerous 1.2m pothole collapse impeding emergency vehicles along Sanwer Road commercial stretch.',
    address: 'Near Old Toll Gate, Sanwer Road Industrial Corridor',
    wardName: 'Ward 12 - Sanwer Link',
    submittedAt: '2026-10-02T11:00:00Z',
    status: 'resolved',
    priorityScore: 78.4,
    assignedContractor: 'Apex Urban Infra & Engineering Pvt Ltd',
    workOrderRef: 'WO-2026-IND-0077',
    beforePhotoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop'
  }
];

const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'prioritized', label: 'AI Prioritized' },
  { key: 'assigned', label: 'Contractor Assigned' },
  { key: 'in_progress', label: 'Work In Progress' },
  { key: 'awaiting_feedback', label: 'Work Completed' },
  { key: 'resolved', label: 'Resolved' }
];

export function MyComplaints() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const ticketParam = searchParams.get('ticket');

  const [searchQuery, setSearchQuery] = useState(ticketParam || '');
  const [complaints, setComplaints] = useState<CitizenComplaintItem[]>(DEFAULT_COMPLAINTS);
  const [selectedTicket, setSelectedTicket] = useState<CitizenComplaintItem | null>(null);

  // Feedback Modal state
  const [feedbackModalTicket, setFeedbackModalTicket] = useState<CitizenComplaintItem | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Timeliness', 'Work Quality']);
  const [comments, setComments] = useState('');
  const [isResolvedToggle, setIsResolvedToggle] = useState<boolean>(true);
  const [reopenReason, setReopenReason] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<InAppNotification[]>(contractorStore.getNotifications('citizen'));
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (ticketParam) {
      const found = complaints.find(c => c.ticketId.toLowerCase() === ticketParam.toLowerCase());
      if (found) {
        setSelectedTicket(found);
      }
    }
  }, [ticketParam, complaints]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = complaints.find(
      c => c.ticketId.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
           c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (found) {
      setSelectedTicket(found);
    } else {
      toast.error(`No complaint found matching "${searchQuery}"`);
    }
  };

  const getStepIndex = (status: string): number => {
    switch (status) {
      case 'submitted': return 0;
      case 'under_review': return 1;
      case 'prioritized': return 2;
      case 'assigned': return 3;
      case 'in_progress': return 4;
      case 'inspection_requested':
      case 'awaiting_feedback': return 5;
      case 'resolved': return 6;
      case 'rework_required': return 4;
      default: return 0;
    }
  };

  const handleSubmitFeedback = () => {
    if (!feedbackModalTicket) return;
    setIsSubmittingFeedback(true);

    try {
      contractorStore.submitCitizenFeedback({
        complaintTicketId: feedbackModalTicket.ticketId,
        citizenId: 'current-citizen',
        citizenName: 'Priya Sharma (Verified Citizen)',
        ratingStars: isResolvedToggle ? ratingStars : 1,
        satisfactionQuestion: 'How satisfied are you with this municipal resolution?',
        writtenComments: comments,
        qualityTags: selectedTags as any,
        isIssueResolved: isResolvedToggle,
        reopenReason: !isResolvedToggle ? reopenReason : undefined
      });

      // Update local state
      setComplaints(prev => prev.map(c => {
        if (c.ticketId === feedbackModalTicket.ticketId) {
          return {
            ...c,
            status: isResolvedToggle ? 'resolved' : 'rework_required'
          };
        }
        return c;
      }));

      if (selectedTicket?.ticketId === feedbackModalTicket.ticketId) {
        setSelectedTicket(prev => prev ? {
          ...prev,
          status: isResolvedToggle ? 'resolved' : 'rework_required'
        } : null);
      }

      toast.success(
        isResolvedToggle 
          ? 'Thank you! Your feedback has been recorded.' 
          : 'Issue reported as unresolved. Ticket reopened and escalated to municipal supervisor.'
      );

      setFeedbackModalTicket(null);
      setComments('');
      setReopenReason('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-md text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">My Complaints & Ticket Tracker</span>
                <Badge variant="outline" className="text-[10px] bg-blue-50 border-blue-200 text-blue-700 font-bold">
                  Live Resolution Timeline
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                Track status, contractor assignment, inspect resolution photos, and rate service satisfaction.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Multilingual Selector Powered by Sarvam AI */}
            <LanguageSelector />

            {/* Notification Bell */}
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNotifications(!showNotifications)}
                className="h-8 w-8 p-0 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </Button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 space-y-2 text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                    <span>Notifications ({notifications.length})</span>
                    <button
                      onClick={() => {
                        contractorStore.markAllNotificationsAsRead('citizen');
                        setNotifications(contractorStore.getNotifications('citizen'));
                      }}
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          contractorStore.markNotificationAsRead(n.id);
                          setNotifications(contractorStore.getNotifications('citizen'));
                          if (n.ticketId) {
                            const found = complaints.find(c => c.ticketId === n.ticketId);
                            if (found) setSelectedTicket(found);
                          }
                          setShowNotifications(false);
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                          n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-blue-50 text-slate-900 font-medium border border-blue-200'
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/">
              <Button size="sm" className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold">
                {t('nav.backToDashboard', 'Back to Dashboard')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Ticket Lookup Search Bar */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                placeholder="Enter unique ticket ID (e.g. UPC-2026-000098) or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-slate-50 border-slate-200 text-sm text-slate-900 font-mono focus:bg-white"
              />
            </div>
            <Button type="submit" className="h-10 text-xs bg-blue-600 hover:bg-blue-700 text-white px-6 w-full sm:w-auto font-bold">
              Track Ticket
            </Button>
          </form>
        </div>

        {/* Selected Complaint Detail & Visual Timeline Banner */}
        {selectedTicket && (
          <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/40 via-white to-teal-50/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-blue-700">{selectedTicket.ticketId}</span>
                    <Badge variant="outline" className="text-xs bg-slate-100 border-slate-200 text-slate-700">
                      {selectedTicket.category}
                    </Badge>
                    <Badge
                      className={`text-xs font-bold uppercase ${
                        selectedTicket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        selectedTicket.status === 'awaiting_feedback' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        selectedTicket.status === 'rework_required' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {selectedTicket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1.5">{selectedTicket.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    {selectedTicket.address} ({selectedTicket.wardName})
                  </p>
                </div>

                {selectedTicket.status === 'awaiting_feedback' && (
                  <Button
                    onClick={() => setFeedbackModalTicket(selectedTicket)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shrink-0 shadow-sm"
                  >
                    <Star className="w-3.5 h-3.5 mr-1.5 fill-white" />
                    Rate Resolution & Close
                  </Button>
                )}
              </div>

              {/* Visual Progress Timeline */}
              <div className="mt-6 pt-4 border-t border-slate-200/80">
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute left-0 right-0 top-3 h-0.5 bg-slate-200 -z-0" />
                  <div
                    className="absolute left-0 top-3 h-0.5 bg-blue-600 transition-all duration-500 -z-0"
                    style={{
                      width: `${(getStepIndex(selectedTicket.status) / (TIMELINE_STEPS.length - 1)) * 100}%`
                    }}
                  />

                  {TIMELINE_STEPS.map((step, idx) => {
                    const currentIdx = getStepIndex(selectedTicket.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step.key} className="flex flex-col items-center z-10">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            isCompleted
                              ? 'bg-blue-600 text-white ring-4 ring-white shadow-xs'
                              : 'bg-slate-200 text-slate-500'
                          } ${isCurrent ? 'ring-2 ring-blue-500 scale-110' : ''}`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] mt-1.5 hidden sm:block ${
                            isCurrent ? 'font-bold text-blue-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Before and After Evidence Photos */}
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Complaint Details & Initial Evidence
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedTicket.description}</p>
                {selectedTicket.beforePhotoUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 relative h-48 shadow-xs">
                    <img src={selectedTicket.beforePhotoUrl} alt="Initial Defect" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] text-white font-bold">
                      Before (Citizen Report)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Contractor Resolution Proof
                </h4>
                {selectedTicket.assignedContractor ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Assigned Agency:</span>
                        <span className="font-bold text-slate-900">{selectedTicket.assignedContractor}</span>
                      </div>
                      {selectedTicket.completionReport && (
                        <p className="text-[11px] text-teal-800 mt-2 italic font-medium">
                          "{selectedTicket.completionReport}"
                        </p>
                      )}
                    </div>

                    {selectedTicket.afterPhotoUrl ? (
                      <div className="rounded-xl overflow-hidden border border-emerald-300 relative h-48 shadow-xs">
                        <img src={selectedTicket.afterPhotoUrl} alt="Resolution Evidence" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-900/90 text-emerald-200 text-[10px] font-bold">
                          After (Resolution Evidence)
                        </span>
                      </div>
                    ) : (
                      <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                        Work in progress. Contractor resolution photos will appear here upon completion.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    Awaiting contractor dispatch from Municipal Command Center.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* List of All My Complaints */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">All Active & Historical Civic Tickets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {complaints.map(item => (
              <Card
                key={item.id}
                onClick={() => setSelectedTicket(item)}
                className={`cursor-pointer transition-all bg-white border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md rounded-2xl ${
                  selectedTicket?.id === item.id ? 'border-blue-500 ring-2 ring-blue-500/20' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-600">{item.ticketId}</span>
                    <Badge
                      className={`text-[9px] uppercase font-bold border ${
                        item.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        item.status === 'awaiting_feedback' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                    <span className="truncate">{item.wardName}</span>
                    <span className="text-blue-600 font-semibold hover:text-blue-700">View Timeline →</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Citizen Feedback & Satisfaction Rating Modal */}
      {feedbackModalTicket && (
        <Dialog open={!!feedbackModalTicket} onOpenChange={() => setFeedbackModalTicket(null)}>
          <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="font-mono text-blue-600 text-xs font-bold">{feedbackModalTicket.ticketId}</span>
                <Badge variant="outline" className="text-[10px] bg-blue-50 border-blue-200 text-blue-700 font-semibold">
                  Citizen Feedback
                </Badge>
              </div>
              <DialogTitle className="text-base font-bold text-slate-900 mt-1">
                Rate Service Resolution Satisfaction
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-1">
              <p className="text-slate-600">
                Work on <strong className="text-slate-900">{feedbackModalTicket.title}</strong> has been submitted as completed by {feedbackModalTicket.assignedContractor}.
              </p>

              {/* Resolved Toggle */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Is the problem fully resolved on-site?</span>
                  <span className="text-[11px] text-slate-500">Select 'No' if work is incomplete or defective.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsResolvedToggle(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      isResolvedToggle ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResolvedToggle(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      !isResolvedToggle ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {isResolvedToggle ? (
                <>
                  {/* Star Rating */}
                  <div>
                    <label className="text-slate-700 block mb-1.5 font-semibold">How satisfied are you with this service?</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingStars(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-600 ml-2">{ratingStars} / 5 Stars</span>
                    </div>
                  </div>

                  {/* Quality Tags */}
                  <div>
                    <label className="text-slate-700 block mb-1.5 font-semibold">Service Quality Highlights:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Timeliness', 'Work Quality', 'Staff Behaviour', 'Cleanliness', 'Communication'].map(tag => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setSelectedTags(prev =>
                                isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                              );
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                              isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Written comments */}
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">Optional Comments / Remarks:</label>
                    <Textarea
                      rows={2}
                      value={comments}
                      onChange={e => setComments(e.target.value)}
                      placeholder="Share your experience with the resolution crew..."
                      className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 text-xs rounded-xl"
                    />
                  </div>
                </>
              ) : (
                /* Reopen reason */
                <div>
                  <label className="text-rose-700 block mb-1 font-semibold">Please explain why the issue is still unresolved:</label>
                  <Textarea
                    rows={3}
                    value={reopenReason}
                    onChange={e => setReopenReason(e.target.value)}
                    placeholder="Describe remaining defect, safety hazard, or incomplete cleanup..."
                    className="bg-rose-50/50 border-rose-300 text-slate-900 placeholder:text-rose-400 focus:bg-white focus:border-rose-500 text-xs rounded-xl"
                  />
                  <p className="text-[10px] text-rose-600 mt-1 font-medium">
                    ⚠️ Submitting will immediately reopen the ticket, mark rework required, and alert municipal supervisors.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFeedbackModalTicket(null)}
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitFeedback}
                  disabled={isSubmittingFeedback || (!isResolvedToggle && !reopenReason.trim())}
                  className={`${
                    isResolvedToggle ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  } text-white font-bold rounded-xl shadow-xs`}
                >
                  {isSubmittingFeedback ? 'Submitting...' : isResolvedToggle ? 'Submit & Resolve' : 'Reopen Ticket'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
