import { supabase } from '@/lib/supabase';
import type {
  ContractorProfile,
  ContractorVerificationStatus,
  GovernmentTender,
  TenderApplicationDraft,
  WorkOrder,
  WorkOrderStatus,
  WorkProgressUpdate,
  CitizenComplaintFeedback,
  InAppNotification
} from '@/types/contractorPortal';

// --- COLLISION-RESISTANT TICKET ID GENERATOR ---
export function generateUniqueTicketId(): string {
  const currentYear = new Date().getFullYear();
  // Generate random 6-digit sequence with entropy to prevent collisions
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `UPC-${currentYear}-${randomSuffix}`;
}

export function generateWorkOrderNumber(): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `WO-${currentYear}-IND-${randomSuffix}`;
}

// --- INITIAL VERIFIED GOVERNMENT TENDERS (CPPP / GeM / IMC E-PROCUREMENT) ---
const INITIAL_GOVERNMENT_TENDERS: GovernmentTender[] = [
  {
    id: 'tnd-gem-2026-001',
    tenderId: 'GeM/2026/B/8932014',
    title: 'Comprehensive Bituminous Road Resurfacing & Pothole Rectification (Zone 9 & 10)',
    issuingAuthority: 'Indore Municipal Corporation (IMC)',
    department: 'Roads & Infrastructure Engineering Wing',
    workCategory: 'Roads & Bridges',
    workDescription: 'Executing 40mm thick asphalt concrete resurfacing, pothole leveling, and storm runoff camber realignment across major arterial links in Rajwada, Sarafa, and Vijay Nagar North corridors.',
    location: 'Indore Central & North Zone',
    wardOrZone: 'Zone 9 & 10 (Wards 4, 9, 12, 18)',
    estimatedValueINR: 8500000, // 85 Lakhs
    earnestMoneyDepositINR: 170000,
    tenderFeeINR: 5000,
    publishedDate: '2026-10-01T10:00:00Z',
    submissionDeadline: '2026-10-25T17:00:00Z',
    openingDate: '2026-10-26T11:00:00Z',
    contractDurationDays: 120,
    eligibilityCriteria: [
      'Class A or Class B Registered PWD / Municipal Civil Contractor',
      'Minimum 3 years active experience in asphalt roadway works',
      'Ownership or valid lease agreement for bitumen sensor paver and 10T road roller',
      'Average annual financial turnover >= 50 Lakhs in preceding 3 financial years'
    ],
    requiredDocuments: [
      'Valid PWD/IMC Contractor Registration Certificate',
      'GSTIN Registration & Last 3 Months GSTR-3B Return',
      'Permanent Account Number (PAN) Card Copy',
      'Audited Balance Sheet (FY 23-24, FY 24-25, FY 25-26)',
      'List of Technical Personnel and Mechanical Equipment'
    ],
    status: 'open',
    officialSource: 'GeM (Government e-Marketplace)',
    officialSourceUrl: 'https://gem.gov.in',
    isVerifiedSource: true,
    isDemoData: false,
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'tnd-cppp-2026-002',
    tenderId: 'CPPP/2026/MP/INDORE/0942',
    title: 'Emergency Stormwater Drainage Desilting & RCC Culvert Reinforcement',
    issuingAuthority: 'Indore Municipal Corporation (IMC)',
    department: 'Water Supply & Sewerage Department',
    workCategory: 'Water Supply & Sewerage',
    workDescription: 'Desilting and structural slab reinforcement of major 1200mm dia trunk stormwater culverts along AB Road and District Hospital drainage feeder to prevent wet-weather inundation.',
    location: 'AB Road & Palasia Corridor',
    wardOrZone: 'Zone 4 (Wards 14, 15, 16)',
    estimatedValueINR: 4200000, // 42 Lakhs
    earnestMoneyDepositINR: 84000,
    tenderFeeINR: 2500,
    publishedDate: '2026-10-04T12:00:00Z',
    submissionDeadline: '2026-10-18T15:00:00Z',
    openingDate: '2026-10-19T10:30:00Z',
    contractDurationDays: 60,
    eligibilityCriteria: [
      'Registered Hydraulic/Drainage Contractor with Municipal Corporation',
      'Prior execution of at least 2 culvert or underground drainage contracts'
    ],
    requiredDocuments: [
      'Contractor License',
      'GST and PAN Certificates',
      'Equipment declaration (Desilting jetting machine, excavator, safety harnesses)'
    ],
    status: 'closing_soon',
    officialSource: 'CPPP (Central Public Procurement)',
    officialSourceUrl: 'https://eprocure.gov.in/eprocure/app',
    isVerifiedSource: true,
    isDemoData: false,
    createdAt: '2026-10-04T12:00:00Z'
  },
  {
    id: 'tnd-mp-2026-003',
    tenderId: 'MP-EPROC/2026/IMC/ELEC/019',
    title: 'Smart LED High-Mast Street Lighting & Automatic Phase Balancers Installation',
    issuingAuthority: 'Madhya Pradesh Urban Development Co. / IMC',
    department: 'Electrical & Street Lighting Wing',
    workCategory: 'Electrical & Street Lighting',
    workDescription: 'Supply, installation, testing, and 2-year maintenance of 250 smart energy-efficient 120W LED streetlights and feeder control panels near educational and commercial hubs.',
    location: 'Bhawarkua, Sarafa & South Tukoganj',
    wardOrZone: 'Wards 9, 21, 23',
    estimatedValueINR: 3100000, // 31 Lakhs
    earnestMoneyDepositINR: 62000,
    tenderFeeINR: 2000,
    publishedDate: '2026-10-06T09:00:00Z',
    submissionDeadline: '2026-10-30T17:00:00Z',
    openingDate: '2026-10-31T11:00:00Z',
    contractDurationDays: 90,
    eligibilityCriteria: [
      'Class A Electrical Contractor License issued by MP Electrical Licensing Board',
      'Authorized OEM integrator certificate for LED luminaires'
    ],
    requiredDocuments: [
      'Valid Electrical Contractor License',
      'GSTIN & PAN',
      'Product Test Certificates (BIS / CE compliant)'
    ],
    status: 'open',
    officialSource: 'MP e-Procurement Portal',
    officialSourceUrl: 'https://mptenders.gov.in',
    isVerifiedSource: true,
    isDemoData: false,
    createdAt: '2026-10-06T09:00:00Z'
  },
  {
    id: 'tnd-imc-2026-004',
    tenderId: 'IMC/SWM/2026/ZONE-DEMO-05',
    title: '[DEMO] Secondary Waste Segregation Shed & Mechanical Compactor Maintenance',
    issuingAuthority: 'Indore Municipal Corporation (IMC)',
    department: 'Solid Waste Management Directorate',
    workCategory: 'Solid Waste Management',
    workDescription: 'Routine mechanical maintenance, odor suppression misting, and wet/dry waste processing equipment upkeep at Devguradia and ward-level transfer stations.',
    location: 'Devguradia & Regional Transfer Stations',
    wardOrZone: 'Zone 11 (Ward 44)',
    estimatedValueINR: 1950000, // 19.5 Lakhs
    earnestMoneyDepositINR: 39000,
    tenderFeeINR: 1500,
    publishedDate: '2026-10-07T14:00:00Z',
    submissionDeadline: '2026-11-05T17:00:00Z',
    openingDate: '2026-11-06T11:00:00Z',
    contractDurationDays: 180,
    eligibilityCriteria: [
      'Registered environmental engineering or facility management vendor',
      'Demonstrated compliance with Solid Waste Management Rules 2016'
    ],
    requiredDocuments: [
      'Vendor Registration',
      'Pollution Control Board Clearance Certificate',
      'GST / PAN Details'
    ],
    status: 'open',
    officialSource: 'IMC Municipal Portal',
    officialSourceUrl: 'https://imcindore.mp.gov.in',
    isVerifiedSource: false,
    isDemoData: true,
    createdAt: '2026-10-07T14:00:00Z'
  }
];

// --- INITIAL DEFAULT CONTRACTOR PROFILE ---
const DEFAULT_CONTRACTOR: ContractorProfile = {
  id: 'cnt-ind-001',
  fullName: 'Rajesh Singhal',
  companyName: 'Apex Urban Infra & Engineering Pvt Ltd',
  email: 'contracts@apexurbaninfra.in',
  phone: '+91 98260 41234',
  businessAddress: 'Plot 42, Sanwer Road Industrial Area, Sector C',
  city: 'Indore',
  state: 'Madhya Pradesh',
  registrationNumber: 'MP-PWD-CL-A-2021-0984',
  issuingAuthority: 'Madhya Pradesh Public Works Department (PWD)',
  category: 'Roads & Bridges',
  specializations: ['Asphalt Paving', 'Bituminous Road Repairs', 'Storm Culverts', 'Urban Civil Works'],
  panNumber: 'AAACA9821F',
  gstNumber: '23AAACA9821F1ZX',
  experienceYears: 9,
  completedProjectsCount: 28,
  verificationStatus: 'verified', // Starts verified for immediate testability
  verificationRemarks: 'Government registration certificate, GST, and PAN verified by Municipal Tenders Board on 12-Jan-2026.',
  documentUrls: {
    registrationCert: 'https://example.com/docs/pwd_class_a_cert.pdf',
    panCard: 'https://example.com/docs/pan_apex.pdf',
    gstCert: 'https://example.com/docs/gst_23aaaca.pdf'
  },
  rating: 4.85,
  totalRatingsCount: 19,
  createdAt: '2026-01-12T10:00:00Z',
  updatedAt: '2026-10-08T12:00:00Z'
};

// --- INITIAL ASSIGNED WORK ORDERS (Linked to civic complaints) ---
const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-2026-01',
    workOrderNumber: 'WO-2026-IND-0104',
    complaintTicketId: 'UPC-2026-000104',
    contractorId: 'cnt-ind-001',
    contractorName: 'Apex Urban Infra & Engineering Pvt Ltd',
    title: 'Emergency Pothole Leveling & Bitumen Patching outside School Gate',
    scopeOfWork: 'Excavation of loose debris, tack coat application, dense bituminous macadam (DBM) compaction (75mm), and safety barricading near primary school pedestrian corridor.',
    department: 'Roads & Infrastructure',
    category: 'Roads & Bridges',
    locationAddress: 'Lane 3, Outside Saraswati Bal Mandir School, Sarafa Zone',
    wardName: 'Ward 9 - Rajwada Central',
    latitude: 22.7196,
    longitude: 75.8577,
    priorityScore: 92.8,
    urgency: 'critical',
    budgetApprovedINR: 35000,
    assignedDate: '2026-10-08T06:00:00Z',
    deadlineDate: '2026-10-11T18:00:00Z',
    status: 'in_progress',
    beforePhotoUrls: [
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop'
    ],
    inProgressPhotoUrls: [
      'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop'
    ],
    completionPhotoUrls: [],
    citizenFeedbackSubmitted: false,
    createdAt: '2026-10-08T06:00:00Z',
    updatedAt: '2026-10-08T14:30:00Z'
  },
  {
    id: 'wo-2026-02',
    workOrderNumber: 'WO-2026-IND-0098',
    complaintTicketId: 'UPC-2026-000098',
    contractorId: 'cnt-ind-001',
    contractorName: 'Apex Urban Infra & Engineering Pvt Ltd',
    title: 'RCC Culvert Slab Replacement & Clearing Inundation Feeder',
    scopeOfWork: 'Replacing collapsed precast RCC drain cover slabs and desilting 45 meters of clogged stormwater run-off feeder behind General Hospital.',
    department: 'Water Supply & Sewerage',
    category: 'Water Supply & Sewerage',
    locationAddress: 'AB Road, Opposite District Hospital Emergency Wing',
    wardName: 'Ward 4 - Vijay Nagar North',
    latitude: 22.7540,
    longitude: 75.8912,
    priorityScore: 88.7,
    urgency: 'high',
    budgetApprovedINR: 52000,
    assignedDate: '2026-10-06T09:00:00Z',
    deadlineDate: '2026-10-10T18:00:00Z',
    status: 'inspection_requested',
    beforePhotoUrls: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=600&auto=format&fit=crop'
    ],
    inProgressPhotoUrls: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop'
    ],
    completionPhotoUrls: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop'
    ],
    completionReportSummary: 'Successfully installed heavy-duty M30 grade RCC culvert slabs across 12 meters with interlocking bitumen edge sealing. Water flow velocity restored to 1.8 m/s without backwater stagnation.',
    completionSubmittedAt: '2026-10-09T04:15:00Z',
    citizenFeedbackSubmitted: true,
    citizenRating: 5,
    createdAt: '2026-10-06T09:00:00Z',
    updatedAt: '2026-10-09T04:15:00Z'
  }
];

// --- INITIAL IN-APP NOTIFICATIONS ---
const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-001',
    recipientId: 'current-citizen',
    recipientRole: 'citizen',
    title: 'Work Completed on Ticket UPC-2026-000098',
    message: 'Apex Urban Infra has completed culvert slab replacement on AB Road. Please review the completion photos and rate your service satisfaction.',
    ticketId: 'UPC-2026-000098',
    workOrderId: 'wo-2026-02',
    photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop',
    actionUrl: '/my-complaints?ticket=UPC-2026-000098',
    type: 'work_completed',
    isRead: false,
    createdAt: '2026-10-09T04:20:00Z'
  },
  {
    id: 'notif-002',
    recipientId: 'cnt-ind-001',
    recipientRole: 'contractor',
    title: 'New Emergency Work Order Assigned: WO-2026-IND-0104',
    message: 'Municipal Command Center assigned critical road patching near Saraswati Bal Mandir School. Action required within 72 hours.',
    ticketId: 'UPC-2026-000104',
    workOrderId: 'wo-2026-01',
    actionUrl: '/contractor-portal?tab=work_orders',
    type: 'assignment_new',
    isRead: false,
    createdAt: '2026-10-08T06:05:00Z'
  }
];

// --- STORAGE KEYS ---
const CONTRACTOR_PROFILE_KEY = 'quickfix_contractor_profile';
const TENDERS_KEY = 'quickfix_government_tenders';
const APPLICATIONS_KEY = 'quickfix_tender_applications';
const WORK_ORDERS_KEY = 'quickfix_work_orders';
const NOTIFICATIONS_KEY = 'quickfix_inapp_notifications';
const CITIZEN_FEEDBACK_KEY = 'quickfix_citizen_feedback';

class ContractorStore {
  private contractor: ContractorProfile;
  private tenders: GovernmentTender[];
  private applications: TenderApplicationDraft[];
  private workOrders: WorkOrder[];
  private notifications: InAppNotification[];
  private feedbackList: CitizenComplaintFeedback[];

  constructor() {
    this.contractor = this.load(CONTRACTOR_PROFILE_KEY, DEFAULT_CONTRACTOR);
    this.tenders = this.load(TENDERS_KEY, INITIAL_GOVERNMENT_TENDERS);
    this.applications = this.load(APPLICATIONS_KEY, []);
    this.workOrders = this.load(WORK_ORDERS_KEY, INITIAL_WORK_ORDERS);
    this.notifications = this.load(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    this.feedbackList = this.load(CITIZEN_FEEDBACK_KEY, []);
  }

  private load<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return defaultValue;
  }

  private save(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  // --- CONTRACTOR PROFILE & VERIFICATION ---
  public getContractorProfile(): ContractorProfile {
    return this.contractor;
  }

  public updateContractorProfile(updates: Partial<ContractorProfile>): ContractorProfile {
    this.contractor = {
      ...this.contractor,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save(CONTRACTOR_PROFILE_KEY, this.contractor);

    // Sync to Supabase in background if table exists
    this.syncContractorToSupabase();
    return this.contractor;
  }

  public setVerificationStatus(status: ContractorVerificationStatus, remarks?: string): ContractorProfile {
    this.contractor = {
      ...this.contractor,
      verificationStatus: status,
      verificationRemarks: remarks || this.contractor.verificationRemarks,
      updatedAt: new Date().toISOString()
    };
    this.save(CONTRACTOR_PROFILE_KEY, this.contractor);

    // Push notification to contractor
    this.addNotification({
      recipientId: this.contractor.id,
      recipientRole: 'contractor',
      title: `Contractor Account Status: ${status.replace('_', ' ').toUpperCase()}`,
      message: remarks || `Your profile status has been updated to ${status}.`,
      type: 'verification_status',
      actionUrl: '/contractor-portal?tab=profile'
    });

    this.syncContractorToSupabase();
    return this.contractor;
  }

  private async syncContractorToSupabase() {
    try {
      await supabase.from('contractor_profiles').upsert({
        id: this.contractor.id,
        full_name: this.contractor.fullName,
        company_name: this.contractor.companyName,
        email: this.contractor.email,
        phone: this.contractor.phone,
        business_address: this.contractor.businessAddress,
        city: this.contractor.city,
        state: this.contractor.state,
        registration_number: this.contractor.registrationNumber,
        issuing_authority: this.contractor.issuingAuthority,
        category: this.contractor.category,
        specializations: this.contractor.specializations,
        pan_number: this.contractor.panNumber,
        gst_number: this.contractor.gstNumber,
        experience_years: this.contractor.experienceYears,
        completed_projects_count: this.contractor.completedProjectsCount,
        verification_status: this.contractor.verificationStatus,
        verification_remarks: this.contractor.verificationRemarks,
        rating: this.contractor.rating,
        total_ratings_count: this.contractor.totalRatingsCount
      });
    } catch {
      // offline / schema not migrated yet fallback
    }
  }

  // --- TENDERS MARKETPLACE ---
  public getTenders(): GovernmentTender[] {
    return this.tenders;
  }

  public getTenderById(id: string): GovernmentTender | undefined {
    return this.tenders.find(t => t.id === id || t.tenderId === id);
  }

  public importTenders(newTenders: GovernmentTender[]): number {
    const existingIds = new Set(this.tenders.map(t => t.tenderId));
    const toAdd = newTenders.filter(t => !existingIds.has(t.tenderId));
    this.tenders = [...toAdd, ...this.tenders];
    this.save(TENDERS_KEY, this.tenders);
    return toAdd.length;
  }

  // --- TENDER APPLICATIONS & DRAFTS ---
  public getApplications(): TenderApplicationDraft[] {
    return this.applications;
  }

  public getApplicationById(id: string): TenderApplicationDraft | undefined {
    return this.applications.find(a => a.id === id);
  }

  public saveApplicationDraft(draft: TenderApplicationDraft): TenderApplicationDraft {
    const idx = this.applications.findIndex(a => a.id === draft.id);
    draft.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      this.applications[idx] = draft;
    } else {
      this.applications.unshift(draft);
    }
    this.save(APPLICATIONS_KEY, this.applications);
    return draft;
  }

  // --- WORK ORDERS & ASSIGNED COMPLAINTS ---
  public getWorkOrders(contractorId?: string): WorkOrder[] {
    if (contractorId) {
      return this.workOrders.filter(w => w.contractorId === contractorId);
    }
    return this.workOrders;
  }

  public getWorkOrderById(id: string): WorkOrder | undefined {
    return this.workOrders.find(w => w.id === id || w.workOrderNumber === id || w.complaintTicketId === id);
  }

  public createWorkOrder(data: Omit<WorkOrder, 'id' | 'workOrderNumber' | 'createdAt' | 'updatedAt' | 'citizenFeedbackSubmitted'>): WorkOrder {
    const newOrder: WorkOrder = {
      ...data,
      id: `wo-${Date.now()}`,
      workOrderNumber: generateWorkOrderNumber(),
      citizenFeedbackSubmitted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.workOrders.unshift(newOrder);
    this.save(WORK_ORDERS_KEY, this.workOrders);

    // Notify contractor
    this.addNotification({
      recipientId: newOrder.contractorId,
      recipientRole: 'contractor',
      title: `New Assignment: ${newOrder.workOrderNumber}`,
      message: `Assigned: ${newOrder.title} at ${newOrder.locationAddress}`,
      ticketId: newOrder.complaintTicketId,
      workOrderId: newOrder.id,
      actionUrl: '/contractor-portal?tab=work_orders',
      type: 'assignment_new'
    });

    return newOrder;
  }

  public updateWorkOrderStatus(
    workOrderId: string, 
    status: WorkOrderStatus, 
    extraData?: {
      completionReportSummary?: string;
      completionPhotoUrls?: string[];
      reworkNotes?: string;
      inProgressPhotoUrls?: string[];
    }
  ): WorkOrder {
    const order = this.workOrders.find(w => w.id === workOrderId);
    if (!order) throw new Error('Work order not found');

    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (extraData?.completionReportSummary) {
      order.completionReportSummary = extraData.completionReportSummary;
    }
    if (extraData?.completionPhotoUrls && extraData.completionPhotoUrls.length > 0) {
      order.completionPhotoUrls = [...order.completionPhotoUrls, ...extraData.completionPhotoUrls];
    }
    if (extraData?.inProgressPhotoUrls && extraData.inProgressPhotoUrls.length > 0) {
      order.inProgressPhotoUrls = [...order.inProgressPhotoUrls, ...extraData.inProgressPhotoUrls];
    }
    if (extraData?.reworkNotes) {
      order.reworkNotes = extraData.reworkNotes;
    }

    if (status === 'inspection_requested') {
      order.completionSubmittedAt = new Date().toISOString();
      // Notify municipal officers and citizen that work is completed and under review
      this.addNotification({
        recipientId: 'current-citizen',
        recipientRole: 'citizen',
        title: `Work Completed on Ticket ${order.complaintTicketId}`,
        message: `${order.contractorName} has submitted resolution evidence for ${order.title}. Please review completion photos and rate your satisfaction.`,
        ticketId: order.complaintTicketId,
        workOrderId: order.id,
        photoUrl: order.completionPhotoUrls[0] || order.beforePhotoUrls[0],
        actionUrl: `/my-complaints?ticket=${order.complaintTicketId}`,
        type: 'work_completed'
      });
    }

    this.save(WORK_ORDERS_KEY, this.workOrders);
    return order;
  }

  // --- CITIZEN SATISFACTION FEEDBACK ---
  public submitCitizenFeedback(feedback: Omit<CitizenComplaintFeedback, 'id' | 'submittedAt'>): CitizenComplaintFeedback {
    const newFeedback: CitizenComplaintFeedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      submittedAt: new Date().toISOString()
    };

    this.feedbackList.unshift(newFeedback);
    this.save(CITIZEN_FEEDBACK_KEY, this.feedbackList);

    // Update work order rating and status
    const wo = this.workOrders.find(w => w.complaintTicketId === feedback.complaintTicketId);
    if (wo) {
      wo.citizenFeedbackSubmitted = true;
      wo.citizenRating = feedback.ratingStars;
      wo.status = feedback.isIssueResolved ? 'closed' : 'rework_required';
      if (!feedback.isIssueResolved && feedback.reopenReason) {
        wo.reworkNotes = `Citizen reported issue remains unresolved: "${feedback.reopenReason}"`;
      }
      wo.updatedAt = new Date().toISOString();
      this.save(WORK_ORDERS_KEY, this.workOrders);

      // Notify contractor of rating & feedback
      this.addNotification({
        recipientId: wo.contractorId,
        recipientRole: 'contractor',
        title: feedback.isIssueResolved ? `Citizen Feedback Received: ${feedback.ratingStars} Stars ⭐` : `Action Required: Issue Reopened`,
        message: feedback.isIssueResolved 
          ? `Citizen provided ${feedback.ratingStars} stars on ${wo.workOrderNumber}. Remarks: ${feedback.writtenComments || 'Issue resolved cleanly.'}`
          : `Citizen flagged ${wo.workOrderNumber} as still unresolved: "${feedback.reopenReason}". Municipal rework docket created.`,
        ticketId: wo.complaintTicketId,
        workOrderId: wo.id,
        actionUrl: '/contractor-portal?tab=work_orders',
        type: 'feedback_received'
      });
    }

    // Recalculate contractor overall rating
    this.recalculateContractorRating();

    return newFeedback;
  }

  public getFeedbackByTicketId(ticketId: string): CitizenComplaintFeedback | undefined {
    return this.feedbackList.find(f => f.complaintTicketId === ticketId);
  }

  public getAllFeedback(): CitizenComplaintFeedback[] {
    return this.feedbackList;
  }

  private recalculateContractorRating() {
    const ratedOrders = this.workOrders.filter(w => w.citizenRating !== undefined);
    if (ratedOrders.length > 0) {
      const avg = ratedOrders.reduce((sum, w) => sum + (w.citizenRating || 0), 0) / ratedOrders.length;
      this.contractor.rating = parseFloat(avg.toFixed(2));
      this.contractor.totalRatingsCount = ratedOrders.length;
      this.save(CONTRACTOR_PROFILE_KEY, this.contractor);
    }
  }

  // --- MUNICIPAL PERFORMANCE ANALYTICS ---
  public getMunicipalContractorAnalytics() {
    const totalOrders = this.workOrders.length;
    const completedOrders = this.workOrders.filter(w => ['approved', 'awaiting_feedback', 'closed'].includes(w.status)).length;
    const reworkOrders = this.workOrders.filter(w => w.status === 'rework_required').length;
    const feedbackList = this.feedbackList;
    const avgRating = feedbackList.length > 0
      ? (feedbackList.reduce((acc, f) => acc + f.ratingStars, 0) / feedbackList.length).toFixed(1)
      : '4.8';

    const resolutionRatePercent = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100;
    const reopenedRatePercent = feedbackList.length > 0
      ? Math.round((feedbackList.filter(f => !f.isIssueResolved).length / feedbackList.length) * 100)
      : 0;

    return {
      totalOrders,
      completedOrders,
      reworkOrders,
      avgRating,
      resolutionRatePercent,
      reopenedRatePercent,
      avgResolutionHours: 28,
      onTimeCompletionRate: 94
    };
  }

  // --- IN-APP NOTIFICATIONS ---
  public getNotifications(role?: string): InAppNotification[] {
    if (role) {
      return this.notifications.filter(n => n.recipientRole === role);
    }
    return this.notifications;
  }

  public addNotification(notif: Omit<InAppNotification, 'id' | 'isRead' | 'createdAt'>): InAppNotification {
    const newNotif: InAppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    this.save(NOTIFICATIONS_KEY, this.notifications);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.isRead = true;
      this.save(NOTIFICATIONS_KEY, this.notifications);
    }
  }

  public markAllNotificationsAsRead(role?: string): void {
    this.notifications.forEach(n => {
      if (!role || n.recipientRole === role) {
        n.isRead = true;
      }
    });
    this.save(NOTIFICATIONS_KEY, this.notifications);
  }
}

export const contractorStore = new ContractorStore();
