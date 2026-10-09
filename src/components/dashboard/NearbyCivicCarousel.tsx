import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/db";
import { Calendar, AlertTriangle, Search, ChevronRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryData {
    id: string;
    title: string;
    count: number | null;
    description: string;
    icon: any;
    accentBorder: string;
    gradient: string;
    actionLabel: string;
    route: string;
}

export function NearbyCivicCarousel() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const { data: stats = { events: 0, missing: 0, complaints: 0 }, isLoading: loading } = useQuery({
        queryKey: ['civic-pulse'],
        queryFn: async () => {
            const [events, missing, complaints] = await Promise.all([
                db.getEvents().catch(() => []),
                db.getMissingReports().catch(() => []),
                db.getComplaintsFeed().catch(() => [])
            ]);

            return {
                events: events.length,
                missing: missing.length,
                complaints: complaints.length,
            };
        }
    });

    const categories: CategoryData[] = [
        {
            id: 'events',
            title: t('pulse.events', 'Events Near You'),
            count: stats.events,
            description: t('pulse.eventsSub', 'Community drives, workshops & meetups.'),
            icon: Calendar,
            accentBorder: 'border-t-blue-500',
            gradient: 'gradient-icon-blue',
            actionLabel: t('pulse.viewEvents', 'View Events'),
            route: '/events'
        },
        {
            id: 'missing',
            title: t('pulse.missing', 'Missing Reports'),
            count: stats.missing,
            description: t('pulse.missingSub', 'Help locate missing neighbors.'),
            icon: Search,
            accentBorder: 'border-t-amber-500',
            gradient: 'gradient-icon-orange',
            actionLabel: t('pulse.helpSearch', 'Help Search'),
            route: '/missing'
        },
        {
            id: 'complaints',
            title: t('pulse.issues', 'Active Issues'),
            count: stats.complaints,
            description: t('pulse.issuesSub', 'Local problems reported nearby.'),
            icon: AlertTriangle,
            accentBorder: 'border-t-red-500',
            gradient: 'gradient-icon-red',
            actionLabel: t('pulse.viewIssues', 'View Issues'),
            route: '/complaints'
        }
    ];

    if (loading) {
        return (
            <section className="w-full space-y-4">
                <div className="space-y-1 px-1">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                    <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/50 rounded-md animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card h-[200px] animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="space-y-1">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {t('pulse.title', 'Civic Pulse')}
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                        </span>
                    </h3>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {t('pulse.subtitle', 'Happening nearby')}
                    </p>
                </div>
            </div>

            {/* 3 Bento Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {categories.map((cat, idx) => (
                    <div
                        key={cat.id}
                        className={cn(
                            "glass-card border-t-[3px] p-5 flex flex-col group hover:-translate-y-1.5 transition-all duration-300 cursor-pointer",
                            cat.accentBorder
                        )}
                        style={{ animationDelay: `${idx * 80}ms` }}
                        onClick={() => navigate(cat.route)}
                    >
                        {/* Top Row: Icon & Count */}
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-3 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3", cat.gradient)}>
                                <cat.icon className="h-5 w-5" />
                            </div>

                            {cat.count !== null && (
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-1",
                                    cat.gradient
                                )}>
                                    <Activity className="h-3 w-3" />
                                    {cat.count > 0 ? cat.count : '0'}
                                </span>
                            )}
                        </div>

                        {/* Text */}
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-50 mb-1 group-hover:text-blue-600 transition-colors">{cat.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4 leading-relaxed">{cat.description}</p>

                        {/* CTA */}
                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/50">
                            <Button
                                variant="ghost"
                                className="w-full justify-between rounded-xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-all h-10 font-bold text-sm border-0 shadow-none"
                            >
                                {cat.actionLabel}
                                <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
