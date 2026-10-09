import React, { useState, useRef } from 'react';
import {
  Building2,
  FileText,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  Filter,
  Download,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Upload,
  Calendar,
  MapPin,
  IndianRupee,
  Star,
  Check,
  FileDown,
  RefreshCw,
  Plus,
  MessageSquare,
  Eye,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Info,
  LogOut,
  Camera,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { contractorStore } from '@/services/contractorPortal/contractorStore';
import {
  explainTenderClauseWithAI,
  generateTechnicalMethodologyWithAI,
  validateTenderDraft,
  exportTenderApplicationPDF,
  exportTenderApplicationDOCX
} from '@/services/contractorPortal/tenderDraftService';
import type {
  ContractorProfile,
  GovernmentTender,
  TenderApplicationDraft,
  WorkOrder,
  WorkOrderStatus,
  ContractorCategory
} from '@/types/contractorPortal';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';

export function ContractorPortal() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<ContractorProfile>(contractorStore.getContractorProfile());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tenders' | 'generator' | 'work_orders' | 'profile'>('dashboard');
  
  // Tenders state
  const [tenders, setTenders] = useState<GovernmentTender[]>(contractorStore.getTenders());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTender, setSelectedTender] = useState<GovernmentTender | null>(null);

  // Work Orders state
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(contractorStore.getWorkOrders(profile.id));
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [completionSummary, setCompletionSummary] = useState('');
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState('');
  const [completionFileName, setCompletionFileName] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSubmittingInspection, setIsSubmittingInspection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCompletionPhotoUrl(result);
      setCompletionFileName(file.name);
      toast.success(`Photo attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please drop an image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCompletionPhotoUrl(result);
      setCompletionFileName(file.name);
      toast.success(`Photo attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setCompletionPhotoUrl('');
    setCompletionFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // AI Generator state
  const [genTender, setGenTender] = useState<GovernmentTender>(tenders[0]);
  const [methodology, setMethodology] = useState('');
  const [financialBid, setFinancialBid] = useState<number>(tenders[0] ? Math.round(tenders[0].estimatedValueINR * 0.96) : 500000);
  const [timelineWeeks, setTimelineWeeks] = useState(12);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiClauseQuery, setAiClauseQuery] = useState('');
  const [aiClauseAnswer, setAiClauseAnswer] = useState('');
  const [isExplainingClause, setIsExplainingClause] = useState(false);
  const [declarations, setDeclarations] = useState({
    nonBlacklisted: true,
    validGstAndTax: true,
    acceptedTerms: true,
    siteInspected: true
  });

  const refreshData = () => {
    setProfile(contractorStore.getContractorProfile());
    setTenders(contractorStore.getTenders());
    setWorkOrders(contractorStore.getWorkOrders(profile.id));
  };

  // Toggle Verification for testing
  const handleToggleVerification = () => {
    const nextStatus = profile.verificationStatus === 'verified' ? 'pending_verification' : 'verified';
    const updated = contractorStore.setVerificationStatus(
      nextStatus,
      nextStatus === 'verified' 
        ? 'Verified by Municipal Procurement Cell (Admin Demo Toggle)' 
        : 'Awaiting Document Review by Municipal Tenders Board'
    );
    setProfile(updated);
    toast.success(`Contractor status changed to: ${nextStatus.replace('_', ' ').toUpperCase()}`);
  };

  // Filtered tenders
  const filteredTenders = tenders.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.workCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // AI Clause Explainer Handler
  const handleAskClauseAI = async () => {
    if (!aiClauseQuery.trim()) return;
    setIsExplainingClause(true);
    try {
      const answer = await explainTenderClauseWithAI(genTender, aiClauseQuery);
      setAiClauseAnswer(answer);
    } catch {
      setAiClauseAnswer('Could not generate explanation at this moment. Please check tender document guidelines.');
    } finally {
      setIsExplainingClause(false);
    }
  };

  // AI Methodology Handler
  const handleGenerateMethodology = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await generateTechnicalMethodologyWithAI(genTender, profile, timelineWeeks);
      setMethodology(result);
      toast.success('AI technical methodology and execution strategy drafted!');
    } catch {
      toast.error('AI drafting failed.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Prepare Draft Object
  const currentDraft: TenderApplicationDraft = {
    id: `app-${genTender.id}`,
    contractorId: profile.id,
    tenderId: genTender.id,
    tenderRefNumber: genTender.tenderId,
    status: 'draft',
    companyDetailsSnapshot: {
      companyName: profile.companyName,
      registrationNumber: profile.registrationNumber,
      gstNumber: profile.gstNumber,
      panNumber: profile.panNumber,
      authorizedSignatory: profile.fullName
    },
    experienceSummary: `${profile.experienceYears} years in ${profile.category} with ${profile.completedProjectsCount} completed public contracts.`,
    pastProjectHighlights: [],
    technicalMethodology: methodology || 'Standard PWD execution plan.',
    equipmentAndResources: profile.specializations,
    keyPersonnel: [{ name: profile.fullName, role: 'Chief Project Engineer', qualification: 'B.E. Civil' }],
    proposedTimelineWeeks: timelineWeeks,
    milestones: [],
    financialBidINR: financialBid,
    complianceDeclarations: declarations,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const validation = validateTenderDraft(currentDraft, genTender);

  // Submit Work Order for Inspection
  const handleSubmitInspection = (woId: string) => {
    if (!completionSummary.trim()) {
      toast.error('Please enter an engineering completion summary');
      return;
    }
    setIsSubmittingInspection(true);
    try {
      const photos = completionPhotoUrl ? [completionPhotoUrl] : [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop'
      ];
      contractorStore.updateWorkOrderStatus(woId, 'inspection_requested', {
        completionReportSummary: completionSummary,
        completionPhotoUrls: photos
      });
      refreshData();
      setSelectedWorkOrder(null);
      setCompletionSummary('');
      setCompletionPhotoUrl('');
      setCompletionFileName('');
      setShowUrlInput(false);
      toast.success('Work submitted for Municipal Inspection! Citizen has been notified.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingInspection(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-md text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  <span data-no-translate="true" className="notranslate">Quickfix</span> Contractor Portal
                </span>
                <Badge variant="outline" className="text-[10px] bg-teal-50 border-teal-200 text-teal-800 font-bold">
                  Government Tenders & Public Works
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                Authorized Municipal Contracting, GeM/CPPP Tenders & Public Work Orders
              </p>
            </div>
          </div>

          {/* Verification Status Pill & Navigation Links */}
          <div className="flex items-center gap-3">
            {profile.verificationStatus === 'verified' ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Govt Contractor</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Verification Pending</span>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleVerification}
              className="hidden md:inline-flex h-8 text-xs bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              title="Demo toggle to test verified vs unverified tender access"
            >
              <RefreshCw className="w-3 h-3 mr-1 text-teal-600" />
              Toggle Demo Status
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await signOut();
                navigate('/login?role=contractor');
              }}
              className="h-8 text-xs border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center gap-1.5"
              title="Sign out of Contractor Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </Button>

            <LanguageSelector />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 border-t border-slate-200/80 bg-white/70 overflow-x-auto text-xs py-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('tenders')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'tenders' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Government Tenders ({tenders.length})
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'generator' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AI Tender Generator
          </button>

          <button
            onClick={() => setActiveTab('work_orders')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'work_orders' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Assigned Work Orders ({workOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Company Profile & Reg
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Verification Warning Banner if Pending */}
        {profile.verificationStatus !== 'verified' && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Contractor Verification in Progress</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Your government registration number <span className="font-mono font-bold text-slate-900">{profile.registrationNumber}</span> is under review by the Indore Municipal Tenders Board. You can browse public tenders and prepare AI bid drafts, but official portal submission requires verification.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleToggleVerification}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
            >
              Verify Now (Demo)
            </Button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. DASHBOARD TAB */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Available Tenders</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{tenders.length}</h3>
                    <p className="text-[11px] text-teal-700 font-medium mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-600" /> GeM & CPPP verified
                    </p>
                  </div>
                  <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-600">
                    <FileText className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Active Work Orders</p>
                    <h3 className="text-2xl font-black text-amber-600 mt-1">{workOrders.length}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Assigned civic complaints</p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Citizen Quality Rating</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-1">
                      {profile.rating} <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">{profile.totalRatingsCount} verified ratings</p>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                    <Star className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Completed Contracts</p>
                    <h3 className="text-2xl font-black text-blue-600 mt-1">{profile.completedProjectsCount}</h3>
                    <p className="text-[11px] text-blue-700 font-medium mt-1">9 years experience</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Two-Column Grid: Active Work Orders & Tenders Closing Soon */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Work Orders */}
              <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Assigned Public Complaints (Work Orders)
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTab('work_orders')}
                    className="text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50 h-7"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 divide-y divide-slate-100">
                  {workOrders.slice(0, 3).map(wo => (
                    <div key={wo.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-teal-600">{wo.workOrderNumber}</span>
                            <Badge variant="outline" className="text-[10px] bg-slate-100 border-slate-200 text-slate-700">
                              Ticket: {wo.complaintTicketId}
                            </Badge>
                            <Badge
                              className={`text-[10px] ${
                                wo.urgency === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              Priority: {wo.priorityScore}
                            </Badge>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 mt-1">{wo.title}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-red-500" /> {wo.locationAddress}
                          </p>
                        </div>
                        <Badge
                          className={`text-[10px] uppercase font-bold shrink-0 ${
                            wo.status === 'in_progress' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            wo.status === 'inspection_requested' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {wo.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tenders Closing Soon */}
              <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    High-Priority Tenders
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTab('tenders')}
                    className="text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50 h-7"
                  >
                    Explore Marketplace <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 divide-y divide-slate-100">
                  {tenders.slice(0, 3).map(t => (
                    <div key={t.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-blue-600">{t.tenderId}</span>
                            <Badge variant="outline" className="text-[10px] bg-slate-100 border-slate-200 text-slate-700">
                              {t.officialSource}
                            </Badge>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{t.title}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="text-emerald-700 font-bold">
                              INR {(t.estimatedValueINR / 100000).toFixed(1)} Lakhs
                            </span>
                            <span>•</span>
                            <span className="text-amber-700 font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-600" /> Due {new Date(t.submissionDeadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setGenTender(t);
                            setActiveTab('generator');
                          }}
                          className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white shrink-0 font-semibold"
                        >
                          Draft Bid
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. TENDER MARKETPLACE TAB */}
        {/* ======================================================== */}
        {activeTab === 'tenders' && (
          <div className="space-y-6">
            {/* Search and Category Filter Bar */}
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <Input
                  placeholder="Search by tender title, ID, or zone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
                {['all', 'Roads & Bridges', 'Water Supply & Sewerage', 'Electrical & Street Lighting', 'Solid Waste Management'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                      categoryFilter === cat ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tender Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTenders.map(t => (
                <Card key={t.id} className="bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all rounded-2xl">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-teal-600">{t.tenderId}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              t.isDemoData ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold' : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                            }`}
                          >
                            {t.isDemoData ? 'DEMO DATA' : 'OFFICIAL TENDER'}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 border-slate-200">
                            {t.officialSource}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1.5">{t.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{t.workDescription}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2">
                    <div className="grid grid-cols-2 gap-2 text-xs py-2.5 my-2 border-y border-slate-100 bg-slate-50/70 p-2.5 rounded-xl">
                      <div>
                        <span className="text-[11px] text-slate-500">Estimated Value:</span>
                        <div className="font-bold text-emerald-700">
                          Rs. {t.estimatedValueINR.toLocaleString('en-IN')} ({(t.estimatedValueINR / 100000).toFixed(1)}L)
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">EMD Required:</span>
                        <div className="font-bold text-slate-900">
                          Rs. {t.earnestMoneyDepositINR.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">Location:</span>
                        <div className="font-medium text-slate-700 truncate">{t.location}</div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">Submission Due:</span>
                        <div className="font-bold text-amber-700">
                          {new Date(t.submissionDeadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTender(t)}
                        className="h-8 text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        <Info className="w-3.5 h-3.5 mr-1" />
                        Details & Docs
                      </Button>

                      <div className="flex items-center gap-2">
                        <a
                          href={t.officialSourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs text-slate-500 hover:text-teal-600 p-1.5"
                          title="Open official portal"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <Button
                          size="sm"
                          onClick={() => {
                            setGenTender(t);
                            setActiveTab('generator');
                          }}
                          className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
                          Draft Bid Proposal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. AI TENDER DRAFT GENERATOR TAB */}
        {/* ======================================================== */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  AI-Assisted Government Tender Draft Generator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prepares compliant bid proposals, technical execution methodology, and exports official PDF/DOCX dockets.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => exportTenderApplicationPDF(currentDraft, genTender)}
                  className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Export PDF
                </Button>
                <Button
                  size="sm"
                  onClick={() => exportTenderApplicationDOCX(currentDraft, genTender)}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  <FileDown className="w-3.5 h-3.5 mr-1" />
                  Export Word (.docx)
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Inputs (Left 2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                {/* 1. Tender Selection */}
                <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                      1. Selected Tender Target
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <select
                      value={genTender.id}
                      onChange={e => {
                        const t = tenders.find(item => item.id === e.target.value);
                        if (t) {
                          setGenTender(t);
                          setFinancialBid(Math.round(t.estimatedValueINR * 0.96));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:bg-white"
                    >
                      {tenders.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.tenderId} — {t.title} (Rs. {(t.estimatedValueINR / 100000).toFixed(1)}L)
                        </option>
                      ))}
                    </select>
                  </CardContent>
                </Card>

                {/* 2. Bidder Profile Snapshot */}
                <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                      2. Bidder Verified Identity (Auto-Mapped)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Company:</span>
                      <p className="font-bold text-slate-900">{profile.companyName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Govt Registration No:</span>
                      <p className="font-mono font-bold text-teal-700">{profile.registrationNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">GSTIN:</span>
                      <p className="font-mono text-slate-800">{profile.gstNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">PAN:</span>
                      <p className="font-mono text-slate-800">{profile.panNumber}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Technical Methodology (With AI Generate) */}
                <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                      3. Technical Methodology & Execution Plan
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={handleGenerateMethodology}
                      disabled={isGeneratingAI}
                      className="h-7 text-xs bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-semibold"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isGeneratingAI ? 'Drafting with AI...' : 'Draft with Gemini AI'}
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <Textarea
                      rows={6}
                      value={methodology}
                      onChange={e => setMethodology(e.target.value)}
                      placeholder="Click 'Draft with Gemini AI' or write your step-by-step mobilization, machinery deployment, and safety methodology..."
                      className="bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white"
                    />
                  </CardContent>
                </Card>

                {/* 4. Financial Bid & Timeline */}
                <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                      4. Financial Bid Quote & Execution Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-slate-600 block mb-1">Financial Bid Offer (INR):</label>
                      <Input
                        type="number"
                        value={financialBid}
                        onChange={e => setFinancialBid(Number(e.target.value))}
                        className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus:bg-white"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Official Est: Rs. {genTender.estimatedValueINR.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1">Proposed Execution Time (Weeks):</label>
                      <Input
                        type="number"
                        value={timelineWeeks}
                        onChange={e => setTimelineWeeks(Number(e.target.value))}
                        className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus:bg-white"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Contract Ceiling: {Math.round(genTender.contractDurationDays / 7)} Weeks
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar: AI Clause Explainer & Submission Checklist */}
              <div className="space-y-4">
                {/* AI Assistant Clause Explainer */}
                <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-bold text-amber-700 flex items-center gap-1.5 uppercase">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      Tender Clause AI Explainer
                    </CardTitle>
                    <p className="text-[11px] text-slate-500">Ask questions about clauses, EMD rules, or penalty terms.</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2">
                    <Input
                      placeholder="e.g. What are the EMD exemption rules?"
                      value={aiClauseQuery}
                      onChange={e => setAiClauseQuery(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white"
                    />
                    <Button
                      size="sm"
                      onClick={handleAskClauseAI}
                      disabled={isExplainingClause}
                      className="w-full h-8 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      {isExplainingClause ? 'Analyzing Tender...' : 'Explain with AI'}
                    </Button>

                    {aiClauseAnswer && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 mt-2 whitespace-pre-line leading-relaxed">
                        {aiClauseAnswer}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pre-Submission Validation Checklist */}
                <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                      Pre-Submission Validation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-700">Contractor Verification</span>
                      {profile.verificationStatus === 'verified' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="text-amber-700 font-semibold text-[11px]">Pending</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-700">Technical Methodology</span>
                      {methodology.length > 50 ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="text-red-600 font-semibold text-[11px]">Required</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-700">Financial Bid Value</span>
                      {financialBid > 0 ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="text-red-600 font-semibold text-[11px]">Missing</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-700">Statutory Declarations</span>
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>

                    <div className="pt-3">
                      <a
                        href={genTender.officialSourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full"
                      >
                        <Button
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9"
                          disabled={profile.verificationStatus !== 'verified'}
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                          Submit on Official Portal
                        </Button>
                      </a>
                      <p className="text-[10px] text-slate-500 text-center mt-1.5">
                        Export your generated PDF/DOCX and upload to the official {genTender.officialSource} portal.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. ASSIGNED WORK ORDERS (PUBLIC COMPLAINTS) TAB */}
        {/* ======================================================== */}
        {activeTab === 'work_orders' && (
          <div className="space-y-6">
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  Assigned Public Complaints & Resolution Evidence
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Execute municipal work orders, log engineering progress, upload before/after photographic proof, and review citizen satisfaction ratings.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workOrders.map(wo => (
                <Card key={wo.id} className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-teal-600">{wo.workOrderNumber}</span>
                          <Badge variant="outline" className="text-[10px] bg-slate-100 border-slate-200 text-slate-700">
                            Ticket Ref: {wo.complaintTicketId}
                          </Badge>
                          <Badge
                            className={`text-[10px] uppercase font-bold ${
                              wo.status === 'in_progress' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              wo.status === 'inspection_requested' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {wo.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">{wo.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{wo.scopeOfWork}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2">
                    <div className="grid grid-cols-2 gap-2 text-xs py-2.5 my-2 border-y border-slate-100 bg-slate-50/70 p-2.5 rounded-xl">
                      <div>
                        <span className="text-[11px] text-slate-500">Location:</span>
                        <p className="font-medium text-slate-700 truncate">{wo.locationAddress}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">Approved Budget:</span>
                        <p className="font-bold text-emerald-700">Rs. {wo.budgetApprovedINR.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">Assigned Date:</span>
                        <p className="text-slate-700">{new Date(wo.assignedDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">Target Deadline:</span>
                        <p className="font-bold text-amber-700">{new Date(wo.deadlineDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Photos Preview */}
                    <div className="flex items-center gap-2 my-2">
                      {wo.beforePhotoUrls.length > 0 && (
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 w-16 h-12 shadow-xs">
                          <img src={wo.beforePhotoUrls[0]} alt="Before" className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-[8px] text-center text-white">Before</span>
                        </div>
                      )}
                      {wo.completionPhotoUrls.length > 0 && (
                        <div className="relative rounded-lg overflow-hidden border border-emerald-300 w-16 h-12 shadow-xs">
                          <img src={wo.completionPhotoUrls[0]} alt="After" className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-emerald-900/70 text-[8px] text-center text-emerald-200">After</span>
                        </div>
                      )}
                    </div>

                    {/* Citizen Feedback Banner if available */}
                    {wo.citizenFeedbackSubmitted && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 my-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-800 flex items-center gap-1">
                            Citizen Rating: {wo.citizenRating} <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">Verified Citizen Response</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                      {wo.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedWorkOrder(wo)}
                          className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Submit Completion Proof
                        </Button>
                      )}

                      {wo.status === 'inspection_requested' && (
                        <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 text-xs font-semibold">
                          Pending Officer Approval
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. COMPANY PROFILE & REGISTRATION TAB */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl">
              <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    Government Contractor Profile & Licenses
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official registration, certifications, and compliance credentials on record.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleVerification}
                  className="text-xs bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  <RefreshCw className="w-3 h-3 mr-1 text-teal-600" />
                  Toggle Status: {profile.verificationStatus.toUpperCase()}
                </Button>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-600 block mb-1">Company / Firm Name:</label>
                    <Input
                      value={profile.companyName}
                      onChange={e => {
                        const updated = contractorStore.updateContractorProfile({ companyName: e.target.value });
                        setProfile(updated);
                      }}
                      className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Authorized Signatory Name:</label>
                    <Input
                      value={profile.fullName}
                      onChange={e => {
                        const updated = contractorStore.updateContractorProfile({ fullName: e.target.value });
                        setProfile(updated);
                      }}
                      className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Government Registration Number:</label>
                    <Input
                      value={profile.registrationNumber}
                      onChange={e => {
                        const updated = contractorStore.updateContractorProfile({ registrationNumber: e.target.value });
                        setProfile(updated);
                      }}
                      className="bg-slate-50 border-slate-200 font-mono text-teal-700 text-xs focus:bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Issuing Authority:</label>
                    <Input
                      value={profile.issuingAuthority}
                      onChange={e => {
                        const updated = contractorStore.updateContractorProfile({ issuingAuthority: e.target.value });
                        setProfile(updated);
                      }}
                      className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">GSTIN Number:</label>
                    <Input
                      value={profile.gstNumber}
                      onChange={e => {
                        const updated = contractorStore.updateContractorProfile({ gstNumber: e.target.value });
                        setProfile(updated);
                      }}
                      className="bg-slate-50 border-slate-200 font-mono text-slate-800 text-xs focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">PAN Number:</label>
                    <Input
                      value={profile.panNumber}
                      onChange={e => {
                        const updated = contractorStore.updateContractorProfile({ panNumber: e.target.value });
                        setProfile(updated);
                      }}
                      className="bg-slate-50 border-slate-200 font-mono text-slate-800 text-xs focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-slate-600 block mb-1">Registered Business Address:</label>
                  <Textarea
                    rows={2}
                    value={profile.businessAddress}
                    onChange={e => {
                      const updated = contractorStore.updateContractorProfile({ businessAddress: e.target.value });
                      setProfile(updated);
                    }}
                    className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus:bg-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Completion Evidence Submission Modal */}
      {selectedWorkOrder && (
        <Dialog open={!!selectedWorkOrder} onOpenChange={(open) => {
          if (!open) {
            setSelectedWorkOrder(null);
            setCompletionSummary('');
            setCompletionPhotoUrl('');
            setCompletionFileName('');
            setShowUrlInput(false);
          }
        }}>
          <DialogContent className="max-w-md bg-white border-slate-200 text-slate-900 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-600" />
                Submit Resolution Evidence: {selectedWorkOrder.workOrderNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs pt-2">
              <div>
                <label className="text-slate-600 block mb-1">Engineering Completion Report Summary:</label>
                <Textarea
                  rows={3}
                  value={completionSummary}
                  onChange={e => setCompletionSummary(e.target.value)}
                  placeholder="Detail work done, materials applied (e.g. M30 concrete / 40mm bitumen), and clearance status..."
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-700 font-semibold block">
                    Resolution Evidence Photo (After Proof):
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-teal-600 hover:text-teal-700 font-medium hover:underline"
                  >
                    {showUrlInput ? 'Switch to Device Upload' : 'Or Paste Image URL'}
                  </button>
                </div>

                {/* Hidden File Input for Device Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleDeviceFileUpload}
                  className="hidden"
                />

                {!showUrlInput ? (
                  <>
                    {!completionPhotoUrl ? (
                      /* Device Upload Dropzone */
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDropFile}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-teal-300 dark:border-teal-700 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/80 rounded-xl p-4 text-center cursor-pointer transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform text-teal-600">
                          <Camera className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to upload from device or drag photo here
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Camera photo, gallery image (JPG, PNG, WEBP up to 10MB)
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="mt-2.5 h-7 text-[11px] bg-white border-teal-300 text-teal-700 hover:bg-teal-100 font-semibold rounded-lg pointer-events-none"
                        >
                          <Upload className="w-3 h-3 mr-1" /> Choose from Device
                        </Button>
                      </div>
                    ) : (
                      /* Image Preview Card */
                      <div className="relative rounded-xl border border-teal-200 bg-slate-50 overflow-hidden p-2">
                        <div className="relative h-40 w-full rounded-lg overflow-hidden bg-slate-900/10">
                          <img
                            src={completionPhotoUrl}
                            alt="Resolution Evidence Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute top-2 right-2 bg-slate-900/70 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-colors"
                            title="Remove Photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2 px-1">
                          <span className="text-[11px] text-slate-600 truncate max-w-[220px] font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            {completionFileName || 'Device Photo Attached'}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-6 px-2 text-[11px] text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          >
                            Replace Photo
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Fallback URL Input */
                  <div className="space-y-1.5">
                    <Input
                      value={completionPhotoUrl}
                      onChange={e => {
                        setCompletionPhotoUrl(e.target.value);
                        setCompletionFileName('');
                      }}
                      placeholder="Paste image URL (e.g. https://...)..."
                      className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus:bg-white h-9"
                    />
                    {completionPhotoUrl && (
                      <div className="relative h-28 w-full rounded-lg overflow-hidden border border-slate-200 mt-1.5">
                        <img
                          src={completionPhotoUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <p>⚠️ Upon submission, this evidence will be queued for Municipal Officer inspection and dispatched to the reporting citizen for service feedback.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedWorkOrder(null)}
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSubmitInspection(selectedWorkOrder.id)}
                  disabled={isSubmittingInspection}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  {isSubmittingInspection ? 'Submitting...' : 'Submit Evidence'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Tender Details Modal */}
      {selectedTender && (
        <Dialog open={!!selectedTender} onOpenChange={() => setSelectedTender(null)}>
          <DialogContent className="max-w-xl bg-white border-slate-200 text-slate-900 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="font-mono text-teal-600 text-xs font-bold">{selectedTender.tenderId}</span>
                <Badge variant="outline" className="text-[10px] bg-slate-100 border-slate-200 text-slate-700">
                  {selectedTender.officialSource}
                </Badge>
              </div>
              <DialogTitle className="text-base font-bold text-slate-900 mt-1">
                {selectedTender.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs pt-1">
              <p className="text-slate-600 leading-relaxed">{selectedTender.workDescription}</p>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500">Issuing Authority:</span>
                  <p className="font-bold text-slate-900">{selectedTender.issuingAuthority}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Estimated Value:</span>
                  <p className="font-bold text-emerald-700">Rs. {selectedTender.estimatedValueINR.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">EMD Deposit:</span>
                  <p className="font-bold text-slate-900">Rs. {selectedTender.earnestMoneyDepositINR.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Submission Due:</span>
                  <p className="font-bold text-amber-700">{new Date(selectedTender.submissionDeadline).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-teal-700 mb-1">Eligibility Criteria:</h5>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                  {selectedTender.eligibilityCriteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-teal-700 mb-1">Required Mandatory Documents:</h5>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                  {selectedTender.requiredDocuments.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <a
                  href={selectedTender.officialSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View on {selectedTender.officialSource}
                </a>

                <Button
                  size="sm"
                  onClick={() => {
                    setGenTender(selectedTender);
                    setSelectedTender(null);
                    setActiveTab('generator');
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
                  Start AI Bid Draft
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
