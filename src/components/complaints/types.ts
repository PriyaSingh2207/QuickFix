export type ComplaintStatus = "submitted" | "pending" | "verified" | "assigned" | "in_progress" | "resolved";

export interface Complaint {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    lat?: number;
    lng?: number;
    images: string[];
    status: ComplaintStatus;
    priority: "Low" | "Medium" | "High" | "Critical";
    timeline: number; // 0 to 100
    postedAt: string; // Relative time string or Date
    created_at: string;
    author: {
        name: string;
        avatar: string;
        role: string;
    };
    stats: {
        supports: number;
        comments: number;
        shares: number;
    };
    isSupported: boolean;
    isFollowed: boolean;
    // New fields
    supports_count?: number;
    reposts_count?: number;
    comments_count?: number;
    user_has_supported?: boolean;
    user_has_reposted?: boolean;
}
