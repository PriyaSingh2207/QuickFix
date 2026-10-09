export type ContractorVerificationStatus = 'pending_verification' | 'verified' | 'rejected' | 'suspended';

export type ContractorCategory = 
  | 'Roads & Bridges' 
  | 'Water Supply & Sewerage' 
  | 'Electrical & Street Lighting' 
  | 'Solid Waste Management' 
  | 'Public Buildings & Civil Works' 
  | 'Horticulture & Parks' 
  | 'Emergency Disaster Response';

export interface ContractorProfile {
  id: string;
  userId?: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  businessAddress: string;
  city: string;
  state: string;
  registrationNumber: string; // Government Registration No
  issuingAuthority: string;
  category: ContractorCategory;
  specializations: string[];
  panNumber: string;
  gstNumber: string;
  experienceYears: number;
  completedProjectsCount: number;
  verificationStatus: ContractorVerificationStatus;
  verificationRemarks?: string;
  documentUrls: {
    registrationCert?: string;
    panCard?: string;
    gstCert?: string;
    workExperience?: string;
  };
  rating: number; // 0.0 - 5.0
  totalRatingsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TenderStatus = 'open' | 'closing_soon' | 'closed' | 'awarded' | 'cancelled';

export interface GovernmentTender {
  id: string;
  tenderId: string; // e.g., CPPP/2026/MP/INDORE/0892
  title: string;
  issuingAuthority: string; // e.g. Indore Municipal Corporation (IMC)
  department: string;
  workCategory: ContractorCategory;
  workDescription: string;
  location: string;
  wardOrZone: string;
  estimatedValueINR: number; // in Rupees
  earnestMoneyDepositINR: number; // EMD
  tenderFeeINR: number;
  publishedDate: string;
  submissionDeadline: string;
  openingDate: string;
  contractDurationDays: number;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  status: TenderStatus;
  officialSource: 'CPPP (Central Public Procurement)' | 'GeM (Government e-Marketplace)' | 'MP e-Procurement Portal' | 'IMC Municipal Portal';
  officialSourceUrl: string;
  isVerifiedSource: boolean;
  isDemoData: boolean;
  attachments?: { name: string; url: string; size: string }[];
  createdAt: string;
}

export type TenderApplicationStatus = 
  | 'draft' 
  | 'validating' 
  | 'ready_to_submit' 
  | 'submitted' 
  | 'under_evaluation' 
  | 'shortlisted' 
  | 'awarded' 
  | 'rejected';

export interface TenderApplicationDraft {
  id: string;
  contractorId: string;
  tenderId: string;
  tenderRefNumber: string;
  status: TenderApplicationStatus;
  
  // Guided Form Inputs
  companyDetailsSnapshot: {
    companyName: string;
    registrationNumber: string;
    gstNumber: string;
    panNumber: string;
    authorizedSignatory: string;
  };
  
  experienceSummary: string;
  pastProjectHighlights: Array<{
    title: string;
    client: string;
    valueINR: number;
    yearCompleted: number;
  }>;
  
  technicalMethodology: string;
  equipmentAndResources: string[];
  keyPersonnel: Array<{ name: string; role: string; qualification: string }>;
  proposedTimelineWeeks: number;
  milestones: Array<{ phase: string; durationWeeks: number; deliverables: string }>;
  
  financialBidINR: number;
  complianceDeclarations: {
    nonBlacklisted: boolean;
    validGstAndTax: boolean;
    acceptedTerms: boolean;
    siteInspected: boolean;
  };
  
  // AI Assisted Enhancements
  aiGeneratedNarrative?: string;
  aiComplianceChecklist?: Array<{ item: string; satisfied: boolean; note?: string }>;
  
  // Handoff & Submission Details
  officialSubmissionAckNumber?: string;
  submissionTimestamp?: string;
  submissionPortalUsed?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderStatus = 
  | 'assigned' 
  | 'accepted' 
  | 'in_progress' 
  | 'inspection_requested' 
  | 'approved' 
  | 'rework_required' 
  | 'awaiting_feedback' 
  | 'closed';

export interface WorkOrder {
  id: string;
  workOrderNumber: string; // e.g. WO-2026-IND-0042
  complaintTicketId: string; // e.g. UPC-2026-000123
  complaintId?: string;
  incidentId?: string;
  contractorId: string;
  contractorName: string;
  title: string;
  scopeOfWork: string;
  department: string;
  category: ContractorCategory;
  locationAddress: string;
  wardName: string;
  latitude: number;
  longitude: number;
  priorityScore: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  budgetApprovedINR: number;
  assignedDate: string;
  deadlineDate: string;
  status: WorkOrderStatus;
  reworkNotes?: string;
  
  // Evidence
  beforePhotoUrls: string[];
  inProgressPhotoUrls: string[];
  completionPhotoUrls: string[];
  completionReportSummary?: string;
  completionSubmittedAt?: string;
  inspectionApprovedAt?: string;
  inspectorName?: string;
  
  // Rating link
  citizenFeedbackSubmitted: boolean;
  citizenRating?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface WorkProgressUpdate {
  id: string;
  workOrderId: string;
  contractorId: string;
  timestamp: string;
  progressPercent: number;
  statusMessage: string;
  photoUrls?: string[];
  materialsDeployed?: string;
  workersOnSiteCount?: number;
}

export interface CitizenComplaintFeedback {
  id: string;
  complaintTicketId: string;
  workOrderId?: string;
  citizenId: string;
  citizenName: string;
  ratingStars: number; // 1 - 5
  satisfactionQuestion: string; // e.g. "How satisfied are you with this municipal resolution?"
  writtenComments?: string;
  qualityTags: Array<'Timeliness' | 'Work Quality' | 'Staff Behaviour' | 'Cleanliness' | 'Communication'>;
  isIssueResolved: boolean; // false triggers "Reopened / Escalated"
  reopenReason?: string;
  submittedAt: string;
}

export interface InAppNotification {
  id: string;
  recipientId: string; // user or contractor
  recipientRole: 'citizen' | 'contractor' | 'officer';
  title: string;
  message: string;
  ticketId?: string;
  workOrderId?: string;
  photoUrl?: string;
  actionUrl?: string;
  type: 'work_completed' | 'assignment_new' | 'inspection_update' | 'feedback_received' | 'verification_status' | 'tender_update';
  isRead: boolean;
  createdAt: string;
}
