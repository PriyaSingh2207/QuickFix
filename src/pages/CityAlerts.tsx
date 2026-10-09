import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    AlertTriangle,
    CloudRain,
    Ban,
    Zap,
    Megaphone,
    BellRing,
    RefreshCw,
    Share2,
    ShieldAlert,
    Radio,
    Clock,
    MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCityAlerts } from "@/hooks/use-city-alerts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CityAlertsPage() {
    const navigate = useNavigate();
    const { alerts: liveAlerts, loading, refresh } = useCityAlerts();
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    const OFFICIAL_ALERTS = [
        {
            id: "muni-1",
            title: "Water Supply Shutdown",
            type: "Utility",
            severity: "Medium",
            icon: Ban,
            color: "text-amber-500",
            bgLight: "bg-amber-500/10 border-amber-500/20",
            location: "Zone 4 & 5 (Vijay Nagar, Palasia)",
            date: "Today, 10:00 AM - 04:00 PM",
            msg: "Scheduled pipeline maintenance work at Narmada Phase-3 junction. Citizens are advised to store sufficient water.",
            department: "Indore Municipal Corporation (Water Works)"
        },
        {
            id: "muni-2",
            title: "Heavy Rainfall & Thunderstorm Advisory",
            type: "Weather",
            severity: "High",
            icon: CloudRain,
            color: "text-blue-500",
            bgLight: "bg-blue-500/10 border-blue-500/20",
            location: "Entire Indore District",
            date: "Next 24 Hours",
            msg: "IMD has issued an orange alert for moderate to heavy precipitation. Avoid low-lying underpasses and open waterlogged zones.",
            department: "Disaster Management Cell"
        },
        {
            id: "muni-3",
            title: "AB Road Underpass Temporary Diversion",
            type: "Traffic",
            severity: "Low",
            icon: AlertTriangle,
            color: "text-amber-600",
            bgLight: "bg-amber-500/10 border-amber-500/20",
            location: "AB Road Underpass Near LIG Square",
            date: "Active until 8:00 PM",
            msg: "Pothole patch work and storm drain grating replacement underway. Please use Ring Road service lane alternative.",
            department: "Traffic Police & Smart City Ltd."
        },
        {
            id: "muni-4",
            title: "Substation Transformer Overhaul",
            type: "Utility",
            severity: "Medium",
            icon: Zap,
            color: "text-indigo-500",
            bgLight: "bg-indigo-500/10 border-indigo-500/20",
            location: "Rau & Silicon City Feeder",
            date: "Tomorrow, 01:00 PM - 03:00 PM",
            msg: "Scheduled routine transformer maintenance by MPPKVVCL. Power will be restored sequentially.",
            department: "MP Electricity Distribution Co."
        }
    ];

    const categories = ["All", "High Priority", "Utility", "Weather", "Traffic"];

    const filteredAlerts = OFFICIAL_ALERTS.filter(alert => {
        if (selectedCategory === "All") return true;
        if (selectedCategory === "High Priority") return alert.severity === "High";
        return alert.type === selectedCategory;
    });

    const handleShare = (title: string, desc: string) => {
        if (navigator.share) {
            navigator.share({
                title: `QuickFix City Alert: ${title}`,
                text: desc,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(`[QuickFix City Alert] ${title}: ${desc}`);
            toast.success("Alert details copied to clipboard!");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-foreground py-6 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Top Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="rounded-xl glass-card hover:bg-white/80 dark:hover:bg-slate-800 transition-all gap-2 text-slate-700 dark:text-slate-300"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                refresh();
                                toast.success("City broadcast alerts updated!");
                            }}
                            className="rounded-xl glass-card gap-1.5 text-xs font-semibold"
                            disabled={loading}
                        >
                            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                            Refresh Feeds
                        </Button>
                    </div>
                </div>

                {/* Hero Header */}
                <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
                    <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
                        <Megaphone className="w-56 h-56" />
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex h-2.5 w-2.5 rounded-full bg-red-400 animate-ping" />
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                                    Official Municipal Broadcast
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
                                <Megaphone className="h-7 w-7 text-amber-300" />
                                City Alerts & Notices
                            </h1>
                            <p className="text-sm text-blue-100/90 mt-1.5 max-w-xl">
                                Real-time municipal advisories, utility shutdown schedules, severe weather alerts, and public safety announcements.
                            </p>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-blue-400/30 pt-3 sm:pt-0">
                            <span className="text-xs text-blue-200 font-medium">Active Bulletins</span>
                            <span className="text-2xl font-black text-white">{OFFICIAL_ALERTS.length} Notices</span>
                        </div>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "rounded-xl text-xs font-bold transition-all px-4 py-2 shrink-0",
                                selectedCategory === cat
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                                    : "glass-card text-slate-600 dark:text-slate-400 hover:text-blue-600"
                            )}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    {filteredAlerts.map((alert) => {
                        const Icon = alert.icon;
                        const isHigh = alert.severity === "High";
                        return (
                            <Card
                                key={alert.id}
                                className={cn(
                                    "rounded-2xl transition-all duration-200 hover:shadow-lg border bg-white dark:bg-slate-900 overflow-hidden",
                                    isHigh ? "border-l-4 border-l-red-500 shadow-sm" : "border-slate-200 dark:border-slate-800"
                                )}
                            >
                                <CardHeader className="pb-3 pt-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3.5">
                                            <div className={cn("p-2.5 rounded-xl shrink-0 mt-0.5", alert.bgLight)}>
                                                <Icon className={cn("h-5 w-5", alert.color)} />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                        {alert.title}
                                                    </CardTitle>
                                                </div>
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                    {alert.department}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge
                                                variant={
                                                    alert.severity === "High"
                                                        ? "destructive"
                                                        : alert.severity === "Medium"
                                                        ? "secondary"
                                                        : "outline"
                                                }
                                                className="rounded-lg text-[11px] font-bold px-2.5 py-0.5"
                                            >
                                                {alert.severity} Priority
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-0">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {alert.msg}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                {alert.location}
                                            </span>
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                {alert.date}
                                            </span>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleShare(alert.title, alert.msg)}
                                            className="h-8 px-2.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                                        >
                                            <Share2 className="h-3.5 w-3.5 mr-1.5" />
                                            Share Alert
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Live News & Weather Feed Section */}
                {liveAlerts.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
                                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
                                    Live Automated Sensor & News Feed
                                </h2>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Indore Live Stream</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {liveAlerts.slice(0, 4).map((feedItem) => (
                                <div
                                    key={feedItem.id}
                                    className="p-4 rounded-xl glass-card border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-all space-y-1.5"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">
                                            {feedItem.type}
                                        </Badge>
                                        <span className="text-[11px] text-slate-400">{feedItem.time}</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                                        {feedItem.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {feedItem.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

