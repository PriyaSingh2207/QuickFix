import React, { useState, useEffect } from "react";
import { Plus, Filter, Flame, MapPin, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportForm } from "@/components/complaints/ReportForm";
import { PostCard } from "@/components/complaints/PostCard";
import type { Complaint } from "@/components/complaints/types";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { getHighPrecisionCoordinates } from "@/services/location/preciseGeolocation";
import { useLanguage } from "@/contexts/LanguageContext";

export function Complaints() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState("trending");
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(3);
    const [userLoc, setUserLoc] = useState<{ lat: number, lng: number } | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const isMounted = React.useRef(true);

    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await db.getComplaints(
                activeTab as any,
                userLoc?.lat,
                userLoc?.lng
            );

            if (!isMounted.current) return;

            // Load any local/offline reports as well so citizen immediately sees their submissions
            let localReports: any[] = [];
            try {
                const offline = JSON.parse(localStorage.getItem('offline_reports') || '[]');
                localReports = offline.map((rep: any) => ({
                    id: rep.id,
                    title: rep.title || 'Civic Issue',
                    description: rep.description,
                    category: rep.category || 'General',
                    location: rep.location,
                    lat: rep.lat,
                    lng: rep.lng,
                    images: rep.images || [],
                    status: 'Open',
                    priority: 'High',
                    timeline: calculateTimeline('Open'),
                    postedAt: 'Just now',
                    created_at: rep.created_at || new Date().toISOString(),
                    author: {
                        name: 'You (Citizen)',
                        role: 'Citizen',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'
                    },
                    stats: {
                        supports: 1,
                        comments: 0,
                        shares: 0
                    },
                    isSupported: true,
                    isFollowed: false
                }));
            } catch (e) {
                console.warn('Failed reading offline reports', e);
            }

            // Transform data to match Complaint interface
            const transformed: Complaint[] = [...localReports, ...(data || [])].map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                category: item.category,
                location: item.location,
                lat: item.lat,
                lng: item.lng,
                images: item.images || [],
                status: item.status || 'Open',
                priority: item.priority || "Medium",
                timeline: calculateTimeline(item.status),
                postedAt: item.postedAt || (item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : 'Recently'),
                created_at: item.created_at,
                author: item.author || {
                    name: 'Citizen',
                    role: 'Citizen',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`
                },
                stats: {
                    supports: item.supports_count || item.stats?.supports || 0,
                    comments: item.comments_count || item.stats?.comments || 0,
                    shares: 0
                },
                isSupported: item.user_has_supported || false,
                isFollowed: false
            }));

            setComplaints(transformed);
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.warn('[Complaints.tsx] Notice while fetching remote complaints:', error);
            if (isMounted.current) {
                // Ignore schema cache errors from showing alarming alerts
                if (error.message?.includes('schema cache') || error.message?.includes('Could not find')) {
                    setError(null);
                } else {
                    const msg = error.message || "Failed to load complaints";
                    setError(msg);
                }
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, userLoc]);

    // Realtime Subscriptions
    useEffect(() => {
        const channel = supabase
            .channel('complaints-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'complaints' }, (_payload) => {
                // Determine if we should optimistically add it based on tab
                if (activeTab === 'latest' || activeTab === 'all' || activeTab === 'trending') {
                    toast.info("New complaint reported!");
                    fetchData();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeTab]);

    const handleNearMe = async () => {
        try {
            toast.info("Acquiring high-precision GPS lock...");
            const pos = await getHighPrecisionCoordinates();
            setUserLoc({ lat: pos.latitude, lng: pos.longitude });
            setActiveTab("near_me");
            toast.success(`Position acquired (±${pos.accuracyMeters}m precision)`);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Unable to access location");
        }
    };

    const handleNewComplaint = () => {
        setIsMobileOpen(false);
        fetchData();
    };

    const displayedComplaints = complaints.slice(0, visibleCount);

    return (
        <div className="flex flex-col gap-8 min-h-screen pb-20 max-w-5xl mx-auto">

            {/* --- SECTION 1: Civic Feed (Now Top) --- */}
            <div className="space-y-6">

                {/* Header & Filters */}
                <div className="py-4 px-1 lg:px-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                                {t('feed.title', 'Civic Feed')}
                            </h1>
                            <p className="text-sm text-slate-500">{t('feed.subtitle', 'Real-time issues reported by citizens')}</p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                variant={activeTab === 'near_me' ? 'secondary' : 'outline'}
                                size="sm"
                                className="hidden sm:flex"
                                onClick={handleNearMe}
                            >
                                <MapPin className="mr-2 h-4 w-4" /> {t('feed.nearMe', 'Near Me')}
                            </Button>
                            <Button variant="outline" size="sm" className="hidden sm:flex">
                                <Filter className="mr-2 h-4 w-4" /> {t('feed.filter', 'Filter')}
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="trending" value={activeTab} onValueChange={(val) => { setActiveTab(val); setVisibleCount(3); }} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                            <TabsTrigger value="trending" className="text-xs sm:text-sm">
                                <Flame className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {t('feed.trending', 'Trending')}
                            </TabsTrigger>
                            <TabsTrigger value="latest" className="text-xs sm:text-sm">
                                <Clock className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {t('feed.latest', 'Latest')}
                            </TabsTrigger>
                            <TabsTrigger value="critical" className="text-xs sm:text-sm">
                                <AlertTriangle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {t('feed.critical', 'Critical')}
                            </TabsTrigger>
                            <TabsTrigger value="near_me" className="text-xs sm:text-sm lg:hidden">
                                <MapPin className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> {t('feed.near', 'Near')}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Feed Content */}
                <div className="space-y-6">
                    {isLoading ? (
                        // Skeletons
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
                        ))
                    ) : error ? (
                        <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
                            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-red-700">{t('feed.unableToLoad', 'Unable to load feed')}</h3>
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button variant="outline" onClick={fetchData} className="border-red-200 hover:bg-red-100 text-red-700">
                                {t('feed.retry', 'Retry')}
                            </Button>
                        </div>
                    ) : (
                        displayedComplaints.map((complaint) => (
                            <div key={complaint.id} className="animate-in slide-in-from-bottom-4 duration-500 fade-in fill-mode-backwards" style={{ animationDelay: `${Number(complaint.id.substring(0, 2)) * 10 || 100}ms` }}>
                                <PostCard complaint={complaint} />
                            </div>
                        ))
                    )}

                    {!isLoading && !error && complaints.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <p>{t('feed.noComplaints', 'No complaints found.')}</p>
                            {activeTab === 'near_me' && <p className="text-xs mt-2">{t('feed.adjustLocation', 'Try adjusting your location or checking other tabs.')}</p>}
                        </div>
                    )}
                </div>

                {/* Show More Button */}
                {!isLoading && complaints.length > 3 && (
                    <div className="flex justify-center pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setVisibleCount(prev => prev === 3 ? complaints.length : 3)}
                            className="min-w-[150px]"
                        >
                            {visibleCount === 3 ? `${t('feed.showAll', 'Show All')} (${complaints.length})` : t('feed.showLess', 'Show Less')}
                        </Button>
                    </div>
                )}
            </div>

            {/* --- SECTION 2: Form (Moved to Bottom) --- */}
            <div className="mt-8 border-t border-slate-200 pt-8">
                <div className="max-w-3xl mx-auto">
                    <ReportForm onSuccess={handleNewComplaint} />
                </div>
            </div>

        </div>
    );

    {/* --- MOBILE FAB (Floating Action Button) --- */ }
    <div className="lg:hidden fixed bottom-24 right-4 z-40">
        <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <DialogTrigger asChild>
                <Button className="h-14 w-14 rounded-full shadow-xl bg-indigo-600 hover:bg-indigo-700 transition-transform active:scale-95 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-white" />
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-none w-full h-[85vh] bottom-0 top-auto translate-y-0 data-[state=open]:slide-in-from-bottom-full rounded-t-2xl">
                <div className="bg-white h-full rounded-t-2xl overflow-y-auto p-4 shadow-2xl">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" /> {/* Handle */}
                    <ReportForm onSuccess={handleNewComplaint} />
                </div>
            </DialogContent>
        </Dialog>
    </div>

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
