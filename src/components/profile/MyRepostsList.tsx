import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { PostCard } from "@/components/complaints/PostCard";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Complaint } from "@/components/complaints/types";

export function MyRepostsList({ userId }: { userId: string }) {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        db.getUserReposts(userId)
            .then((data: any[]) => {
                if (active) {
                    const transformed = data.map(item => transformComplaint(item));
                    setComplaints(transformed);
                }
            })
            .catch(console.error)
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [userId]);

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
    if (complaints.length === 0) return <div className="text-center p-8 text-slate-500">You haven't reposted any complaints yet.</div>;

    return (
        <div className="space-y-6">
            {complaints.map(c => (
                <PostCard key={c.id} complaint={c} />
            ))}
        </div>
    );
}

function transformComplaint(item: any): Complaint {
    return {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        lat: item.lat,
        lng: item.lng,
        images: item.images || [],
        status: item.status,
        priority: item.priority || "Medium",
        timeline: calculateTimeline(item.status),
        postedAt: formatDistanceToNow(new Date(item.created_at), { addSuffix: true }),
        created_at: item.created_at,
        author: item.author,
        stats: {
            supports: item.supports_count,
            comments: item.comments_count,
            shares: 0
        },
        isSupported: item.user_has_supported,
        isFollowed: false
    };
}

function calculateTimeline(status: string): number {
    switch (status?.toLowerCase()) {
        case 'submitted': return 10;
        case 'pending': return 10;
        case 'verified': return 35;
        case 'assigned': return 60;
        case 'in_progress': return 80;
        case 'resolved': return 100;
        default: return 0;
    }
}
