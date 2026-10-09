export type EventCategory = 'health' | 'social' | 'environment' | 'emergency';
export type EventStatus = 'live' | 'upcoming';

export interface CivicEvent {
    id: string;
    title: string;
    category: EventCategory;
    status: EventStatus;
    startTime: string;
    endTime: string;
    location: string;
    lat: number;
    lng: number;
    image: string;
    organizer: string;
    description: string;
    participantCount: number;
    registerUrl?: string;
    helpline?: string;
    isFundraiser?: boolean;
    targetAmount?: number;
    raisedAmount?: number;
    volunteerSlots?: number;
    filledSlots?: number;
}

const MOCK_EVENTS: CivicEvent[] = [
    {
        id: "1",
        title: "Mega Blood Donation Camp",
        category: "health",
        status: "live",
        startTime: "2024-03-20T10:00:00",
        endTime: "2024-03-20T17:00:00",
        location: "Palasia Square, Indore",
        lat: 22.7196,
        lng: 75.8577,
        image: "https://images.unsplash.com/photo-1615461066841-6116e61058f5?q=80&w=1000&auto=format&fit=crop",
        organizer: "Indore Red Cross",
        description: "Join us to save lives. Urgent requirement for O+ and B- blood types. Refreshments provided.",
        participantCount: 128,
        helpline: "108"
    },
    {
        id: "2",
        title: "Flood Relief Fundraiser Marathon",
        category: "social",
        status: "upcoming",
        startTime: "2024-03-25T06:00:00",
        endTime: "2024-03-25T10:00:00",
        location: "Rajwada Palace, Indore",
        lat: 22.7188,
        lng: 75.8546,
        image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop",
        organizer: "Indore Runners Club",
        description: "Run for a cause! All proceeds go directly to flood relief efforts. 5k and 10k categories.",
        participantCount: 450,
        isFundraiser: true,
        targetAmount: 500000,
        raisedAmount: 325000
    },
    {
        id: "3",
        title: "Tree Plantation Drive 2024",
        category: "environment",
        status: "upcoming",
        startTime: "2024-03-28T08:00:00",
        endTime: "2024-03-28T11:00:00",
        location: "Vijay Nagar Park, Indore",
        lat: 22.7533,
        lng: 75.8937,
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5b43?q=80&w=1000&auto=format&fit=crop",
        organizer: "Green Indore Initiative",
        description: "Help us plant 500 saplings this weekend. Gloves and tools will be provided.",
        participantCount: 85,
        volunteerSlots: 50,
        filledSlots: 32
    },
    {
        id: "4",
        title: "Emergency Fire Drill",
        category: "emergency",
        status: "upcoming",
        startTime: "2024-03-30T11:00:00",
        endTime: "2024-03-30T13:00:00",
        location: "Collector Office Grounds",
        lat: 22.7196,
        lng: 75.8577,
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1000&auto=format&fit=crop",
        organizer: "Indore Fire Dept",
        description: "Learn essential fire safety skills. Open to all citizens.",
        participantCount: 200
    },
    {
        id: "5",
        title: "Clean Indore Campaign",
        category: "environment",
        status: "live",
        startTime: "2024-03-20T07:00:00",
        endTime: "2024-03-20T11:00:00",
        location: "Bhawarkua Main Road",
        lat: 22.6916,
        lng: 75.8672,
        image: "https://images.unsplash.com/photo-1616634358826-6136d8d85f8f?q=80&w=1000&auto=format&fit=crop",
        organizer: "Swachh Bharat Mission",
        description: "Let's keep our city No. 1! Join the weekly cleaning drive.",
        participantCount: 1500,
        volunteerSlots: 100,
        filledSlots: 85
    }
];

export async function fetchNearbyEvents(_lat?: number, _lng?: number, _radiusKm: number = 10): Promise<CivicEvent[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real app, we would query the backend with lat/lng
    // For now, allow all mock events regardless of location, 
    // maybe shuffle or filter slightly for realism

    return MOCK_EVENTS;
}
