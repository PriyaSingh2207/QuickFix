

// Types
export interface Incident {
    id: string;
    type: 'Fire' | 'Flood' | 'Medical' | 'Accident' | 'Infrastructure';
    severity: 'critical' | 'high' | 'moderate' | 'low';
    title: string;
    location: string;
    coordinates: { lat: number, lng: number };
    timestamp: number;
    status: 'active' | 'contained' | 'resolved';
    affected_count: number;
    units_deployed: number;
}

export interface Resource {
    id: string;
    type: 'Medical' | 'Transport' | 'Shelter' | 'Supplies';
    name: string;
    location: string;
    capacity: number;
    available: number;
    distance: string; // Pre-calculated for mock
    status: 'available' | 'busy' | 'offline' | 'en_route';
}

export interface Alert {
    id: string;
    type: 'Evacuation' | 'Weather' | 'Government';
    priority: 'critical' | 'high' | 'info';
    title: string;
    message: string;
    timestamp: number;
    issuer: string;
}

export interface CommunityUpdate {
    id: string;
    user: {
        name: string;
        avatar?: string;
        credibility: number; // 0-100
    };
    message: string;
    location: string;
    timestamp: number;
    verified: boolean;
    helpful_count: number;
}

// Mock Data
export const MOCK_INCIDENTS: Incident[] = [
    {
        id: 'inc-001',
        type: 'Fire',
        severity: 'critical',
        title: 'Industrial Fire at Sector 3',
        location: 'Industrial Area, Pithampur',
        coordinates: { lat: 22.6, lng: 75.6 },
        timestamp: Date.now() - 1000 * 60 * 15,
        status: 'active',
        affected_count: 120,
        units_deployed: 8
    },
    {
        id: 'inc-002',
        type: 'Flood',
        severity: 'high',
        title: 'Waterlogging - Main Square',
        location: 'Rajwada, Indore',
        coordinates: { lat: 22.71, lng: 75.85 },
        timestamp: Date.now() - 1000 * 60 * 45,
        status: 'active',
        affected_count: 500,
        units_deployed: 4
    },
    {
        id: 'inc-003',
        type: 'Medical',
        severity: 'critical',
        title: 'Mass Casualty Incident',
        location: 'AB Road Highway',
        coordinates: { lat: 22.75, lng: 75.88 },
        timestamp: Date.now() - 1000 * 60 * 5,
        status: 'active',
        affected_count: 15,
        units_deployed: 3
    }
];

export const MOCK_RESOURCES: Resource[] = [
    {
        id: 'res-001',
        type: 'Medical',
        name: 'ALS Ambulance Unit 4',
        location: 'Vijay Nagar',
        capacity: 1,
        available: 1,
        distance: '1.2km',
        status: 'available'
    },
    {
        id: 'res-002',
        type: 'Shelter',
        name: 'Community Hall Relief Camp',
        location: 'Palasia',
        capacity: 200,
        available: 85,
        distance: '3.5km',
        status: 'available'
    },
    {
        id: 'res-003',
        type: 'Transport',
        name: 'Bus Fleet (Evacuation)',
        location: 'Depot 2',
        capacity: 500,
        available: 300,
        distance: '5.0km',
        status: 'busy'
    }
];

export const MOCK_ALERTS: Alert[] = [
    {
        id: 'alt-001',
        type: 'Evacuation',
        priority: 'critical',
        title: 'IMMEDIATE EVACUATION ORDER',
        message: 'Residents in Sector 3 must evacuate immediately due to toxic smoke. Move to South Relief Camp.',
        timestamp: Date.now(),
        issuer: 'District Collector'
    },
    {
        id: 'alt-002',
        type: 'Weather',
        priority: 'high',
        title: 'Heavy Rainfall Warning',
        message: 'Red alert issued for next 4 hours. Stay indoors.',
        timestamp: Date.now() - 1000 * 60 * 30,
        issuer: 'Met Department'
    }
];

export const MOCK_UPDATES: CommunityUpdate[] = [
    {
        id: 'com-001',
        user: { name: 'Rahul V.', credibility: 95 },
        message: 'Road blocked at Bombay Hospital square due to fallen tree.',
        location: 'Bombay Hospital',
        timestamp: Date.now() - 1000 * 60 * 10,
        verified: true,
        helpful_count: 45
    },
    {
        id: 'com-002',
        user: { name: 'Priya S.', credibility: 88 },
        message: 'Safe passage available via Ring Road for evacuation.',
        location: 'Ring Road',
        timestamp: Date.now() - 1000 * 60 * 5,
        verified: true,
        helpful_count: 32
    }
];
