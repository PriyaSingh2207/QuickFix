export type UserRole = 'citizen' | 'officer' | 'coordinator' | 'volunteer';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type ReportStatus = 'pending' | 'verified' | 'assigned' | 'resolved';
export type IncidentSeverity = 'critical' | 'high' | 'medium';
export type IncidentType = 'flood' | 'fire' | 'structural' | 'transport' | 'medical';
export type ResourceCategory = 'supplies' | 'medical' | 'transport' | 'shelter';
export type ResourceStatus = 'adequate' | 'low' | 'critical';
export type VolunteerStatus = 'available' | 'on-task' | 'offline';
export type RecommendationType = 'resource' | 'deployment' | 'evacuation';
export type AppMode = 'community' | 'emergency';

export interface User {
    id: string;
    name: string;
    phone?: string;
    role: UserRole;
    avatarUrl?: string;
    city: string;
    state: string;
}

export interface Report {
    id: string;
    title: string;
    description?: string;
    category: string;
    locationAddress: string;
    locationLat?: number;
    locationLng?: number;
    priority: Priority;
    status: ReportStatus;
    reporterId: string;
    assigneeId?: string;
    images?: string[];
    aiScore: number;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}

export interface Incident {
    id: string;
    title: string;
    type: IncidentType;
    severity: IncidentSeverity;
    locationAddress: string;
    locationSector?: string;
    locationLat?: number;
    locationLng?: number;
    affectedPopulation: number;
    status: 'active' | 'contained' | 'resolved';
    startedAt: Date;
    eta?: string;
    assignedResources?: string[];
    assignedVolunteers?: string[];
}

export interface Resource {
    id: string;
    name: string;
    category: ResourceCategory;
    available: number;
    total: number;
    unit: string;
    status: ResourceStatus;
    location?: string;
}

export interface Volunteer {
    id: string;
    userId: string;
    name: string;
    role: string;
    status: VolunteerStatus;
    skills?: string[];
    tasksCompleted: number;
    reliability: number;
    currentTaskId?: string;
}

export interface AIRecommendation {
    id: string;
    incidentId: string;
    type: RecommendationType;
    title: string;
    description: string;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    eta?: string;
    resources?: string[];
    status: 'pending' | 'approved' | 'rejected';
}
