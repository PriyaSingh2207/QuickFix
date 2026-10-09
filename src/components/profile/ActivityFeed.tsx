import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { Loader2, AlertTriangle, FileText, CheckCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface Activity {
    id: string;
    action_type: string;
    created_at: string;
    reference_id?: string;
}

export function ActivityFeed({ userId }: { userId: string }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        const loadActivities = async () => {
            try {
                const data = await db.getRecentActivities(userId);
                if (isActive) {
                    setActivities(data || []);
                }
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                console.error("Failed to load activities", err);
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        if (userId) {
            loadActivities();
        }

        return () => {
            isActive = false;
        };
    }, [userId]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'created_complaint': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'resolved_complaint': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'created_missing_report': return <Search className="h-4 w-4 text-red-500" />;
            default: return <FileText className="h-4 w-4 text-slate-400" />;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'created_complaint': return "Reported a new issue";
            case 'resolved_complaint': return "Issue resolved";
            case 'created_missing_report': return "Posted missing person report";
            case 'joined_volunteer': return "Joined volunteer squad";
            default: return "Activity logged";
        }
    };

    if (loading) return <div className="p-4 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>;

    if (activities.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
                {activities.map((activity) => (
                    <div key={activity.id} className="relative pl-6 pb-6 last:pb-0 border-l border-slate-200 dark:border-slate-700 ml-2">
                        {/* Timeline dot */}
                        <div className="absolute top-0 -left-1.5 h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-950" />

                        <div className="flex flex-col gap-1 -mt-1.5">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                                {getIcon(activity.action_type)}
                                {getLabel(activity.action_type)}
                            </div>
                            <span className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
