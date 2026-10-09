import { useState, useEffect, useRef } from "react";
import { ShieldCheck, AlertCircle, Siren, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface CityStats {
    safeZones: number;
    activeIssues: number;
    emergencies: number;
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (end === 0) { setDisplay(0); return; }

        const duration = 1200;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplay(end);
                clearInterval(timer);
            } else {
                setDisplay(Math.round(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return <span ref={ref} className="count-animate">{display}{suffix}</span>;
}

function MetricCard({ icon: Icon, value, label, subLabel, suffix, glowClass, dotColor, iconBg }: {
    icon: any; value: number; label: string; subLabel: string;
    suffix?: string; glowClass: string; dotColor: string; iconBg: string;
}) {
    return (
        <div className={cn("glass-card p-5 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300", glowClass)}>
            {/* Decorative glow blob */}
            <div className={cn("absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity", iconBg)} />

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={cn("p-2.5 rounded-xl text-white shadow-lg", iconBg)}>
                    <Icon className="h-5 w-5" />
                </div>
                {/* Live Pulse Dot */}
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColor)} />
                        <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", dotColor)} />
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Live</span>
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-3xl font-black text-slate-800 dark:text-white mb-1">
                    <AnimatedNumber value={value} suffix={suffix} />
                </p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{subLabel}</p>
            </div>
        </div>
    );
}

export function CityStatusBar() {
    const { t } = useLanguage();
    const [stats, setStats] = useState<CityStats>({
        safeZones: 98,
        activeIssues: 0,
        emergencies: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const { count: issueCount } = await supabase
                .from('complaints')
                .select('*', { count: 'exact', head: true })
                .neq('status', 'Resolved');

            const { count: emergencyCount } = await supabase
                .from('emergencies')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            setStats(prev => ({
                ...prev,
                activeIssues: issueCount || 0,
                emergencies: emergencyCount || 0,
                safeZones: Math.max(80, 100 - ((issueCount || 0) * 0.5)),
            }));
            setLoading(false);
        };

        fetchStats();

        const channel = supabase
            .channel('city-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => fetchStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'emergencies' }, () => fetchStats())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-5 h-[140px] animate-pulse">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
                        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                    {t('dashboard.liveStatus', 'LIVE STATUS')}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                    icon={ShieldCheck}
                    value={Math.round(stats.safeZones)}
                    label={t('dashboard.resolvedCases', 'Safety Score')}
                    subLabel="City-wide index"
                    suffix="%"
                    glowClass="glass-glow-green"
                    dotColor="bg-emerald-500"
                    iconBg="gradient-icon-green"
                />
                <MetricCard
                    icon={AlertCircle}
                    value={stats.activeIssues}
                    label={t('dashboard.activeIncidents', 'Active Issues')}
                    subLabel="Being resolved"
                    glowClass="glass-glow-blue"
                    dotColor="bg-blue-500"
                    iconBg="gradient-icon-blue"
                />
                <MetricCard
                    icon={Siren}
                    value={stats.emergencies}
                    label={t('nav.sosEmergency', 'Emergencies')}
                    subLabel={stats.emergencies > 0 ? "Action required" : "All clear"}
                    glowClass={stats.emergencies > 0 ? "glass-glow-red" : "glass-glow-green"}
                    dotColor={stats.emergencies > 0 ? "bg-red-500" : "bg-emerald-500"}
                    iconBg={stats.emergencies > 0 ? "gradient-icon-red" : "gradient-icon-green"}
                />
            </div>
        </div>
    );
}
