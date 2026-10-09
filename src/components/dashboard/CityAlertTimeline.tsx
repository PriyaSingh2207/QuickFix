import { useState } from "react";
import {
    MapPin, Share2, ChevronRight, RefreshCw, Radio
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCityAlerts, type AlertType } from "@/hooks/use-city-alerts";
import { ListItemSkeleton } from "@/components/skeletons/ListItemSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";

export function CityAlertTimeline() {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<'All' | AlertType>('All');
    const { alerts, loading, refresh } = useCityAlerts();

    const filteredAlerts = filter === 'All' ? alerts : alerts.filter(a => a.type === filter);

    return (
        <div className="glass-card p-5 h-[600px] flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-xl text-slate-800 dark:text-gray-100 leading-none">
                            {t('alerts.title', 'City Alerts')}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                            {loading ? t('alerts.updating', 'Updating...') : t('alerts.liveFeed', 'Live Feed')}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => refresh()}
                    className={cn("h-9 w-9 rounded-xl glass-card !border-0 text-slate-400 hover:text-blue-600", loading && "animate-spin")}
                >
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 px-1 hide-scrollbar snap-x relative z-10">
                {['All', 'Emergency', 'Traffic', 'Weather', 'Utility', 'News'].map(tag => (
                    <Badge
                        key={tag}
                        variant={filter === tag ? 'default' : 'outline'}
                        className={cn(
                            "cursor-pointer snap-start flex-shrink-0 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all",
                            filter === tag
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200/30 hover:bg-blue-700 border-transparent"
                                : "glass-card !border-slate-200 dark:!border-slate-700 text-slate-500 hover:text-blue-600"
                        )}
                        onClick={() => setFilter(tag as any)}
                    >
                        {tag === 'All' ? t('feed.showAll', 'All') :
                         tag === 'Emergency' ? t('quick.emergency', 'Emergency') :
                         tag === 'Traffic' ? t('cat.traffic', 'Traffic') :
                         t(`alerts.${tag.toLowerCase()}`, tag)}
                    </Badge>
                ))}
            </div>

            {/* Timeline Feed */}
            <ScrollArea className="flex-1 -mx-4 px-4 relative z-10">
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-3 pt-2 pb-6">
                    {loading && (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <ListItemSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {filteredAlerts.length === 0 && !loading && (
                        <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center">
                            <Radio className="w-8 h-8 mb-2 opacity-50" />
                            {t('alerts.noAlerts', 'No active alerts in this category.')}
                        </div>
                    )}

                    {!loading && filteredAlerts.map((alert, idx) => (
                        <div
                            key={alert.id}
                            className="relative group anim-fade-up pl-2"
                            style={{ animationDelay: `${idx * 80}ms` }}
                        >
                            {/* Severity Dot */}
                            <div className={cn(
                                "absolute left-[-5px] top-5 w-3.5 h-3.5 rounded-full border-[3px] border-white dark:border-slate-900 z-10 transition-all duration-300",
                                "group-hover:scale-125",
                                alert.severity === 'critical' ? "bg-red-500" :
                                    alert.severity === 'high' ? "bg-orange-500" :
                                        alert.severity === 'medium' ? "bg-blue-500" : "bg-slate-300"
                            )} />

                            {/* Card */}
                            <div
                                className={cn(
                                    "ml-6 glass-card overflow-hidden hover:-translate-y-1 cursor-default transition-all duration-300",
                                    alert.severity === 'critical' && "glass-glow-red"
                                )}
                                onClick={() => window.open(alert.link, '_blank')}
                            >
                                {/* Optional Image */}
                                {alert.imageUrl && (
                                    <div className="h-32 w-full overflow-hidden relative">
                                        <img src={alert.imageUrl} alt="News" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                            <Badge variant="secondary" className="bg-white/90 text-slate-900 backdrop-blur-sm text-[10px] font-bold h-5 px-2 border-0">
                                                {alert.type}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4">
                                    <div className="flex justify-between items-start gap-3 mb-2">
                                        <div className="flex-1">
                                            {!alert.imageUrl && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider",
                                                        alert.severity === 'critical' ? "text-red-500" : "text-slate-500"
                                                    )}>{alert.type}</span>
                                                    {/* Source Badge */}
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-400">
                                                        {alert.type === 'Weather' ? 'OpenMeteo' : 'News'}
                                                    </span>
                                                </div>
                                            )}
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {alert.title}
                                            </h4>
                                        </div>
                                        {/* Time ago */}
                                        <span className="shrink-0 text-[10px] font-semibold text-slate-400 bg-slate-50/80 dark:bg-slate-800/80 px-2 py-1 rounded-full whitespace-nowrap backdrop-blur-sm">
                                            {alert.time}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
                                        {alert.desc}
                                    </p>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800 mt-2">
                                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            {alert.location}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 rounded-full p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(alert.link || "");
                                                    toast.success("Link copied!");
                                                }}
                                            >
                                                <Share2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-7 rounded-full px-3 text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-none"
                                            >
                                                Read
                                                <ChevronRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
