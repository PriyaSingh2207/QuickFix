import {
    Flag,
    CheckCircle2,
    HeartHandshake,
    Zap,
    MapPin,
    AlertTriangle,
    LifeBuoy
} from "lucide-react";
import { RankBadge, type Rank } from "./RankBadge";
import { StatCounter } from "./StatCounter";
import { AchievementBadge } from "./AchievementBadge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Profile } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

interface ImpactStats {
    points: number;
    reports: number;
    resolved: number;
    helped: number;
}

interface ImpactPanelProps {
    profile: Profile | null;
}

export function ImpactPanel({ profile }: ImpactPanelProps) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [helpedCount, setHelpedCount] = useState(0);

    useEffect(() => {
        const fetchHelps = async () => {
            if (!profile?.id) return;
            const { count } = await supabase
                .from('supports')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id);
            setHelpedCount(count || 0);
        };
        fetchHelps();
    }, [profile?.id]);

    const stats: ImpactStats = {
        points: profile?.points || 0,
        reports: profile?.reports_count || 0,
        resolved: profile?.resolved_count || 0,
        helped: helpedCount
    };

    const getRankInfo = (points: number): { current: Rank, next: Rank, max: number } => {
        if (points < 100) return { current: 'Bronze', next: 'Silver', max: 100 };
        if (points < 300) return { current: 'Silver', next: 'Gold', max: 300 };
        return { current: 'Gold', next: 'Gold', max: 1000 };
    };

    const rankInfo = getRankInfo(stats.points);
    const progressPercent = Math.min(100, Math.round((stats.points / rankInfo.max) * 100));
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    const rankGradient = rankInfo.current === 'Gold'
        ? { from: '#D97706', to: '#FBBF24' }
        : rankInfo.current === 'Silver'
            ? { from: '#64748B', to: '#94A3B8' }
            : { from: '#92400E', to: '#D97706' };

    return (
        <div className="glass-card relative overflow-hidden">
            {/* Decorative Background Gradients */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-500/8 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/8 blur-[80px] rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 md:p-8">

                {/* LEFT: Progress Circle & Rank */}
                <div className="md:col-span-4 flex flex-row md:flex-col items-center justify-between md:justify-center relative gap-4">
                    <div className="relative shrink-0">
                        <div className="scale-75 md:scale-100 origin-left md:origin-center">
                            {/* Custom SVG Progress Ring with Gradient */}
                            <div className="relative flex h-[160px] w-[160px] items-center justify-center">
                                <svg className="h-full w-full" viewBox="0 0 128 128">
                                    <defs>
                                        <linearGradient id="impactGrad" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={rankGradient.from} />
                                            <stop offset="100%" stopColor={rankGradient.to} />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="64" cy="64" r="52" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                    <circle cx="64" cy="64" r="52" stroke="url(#impactGrad)" strokeWidth="12" fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center gap-1">
                                    <RankBadge rank={rankInfo.current} size="lg" showTitle={false} />
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-slate-800 dark:text-white leading-none count-animate">
                                            <StatCounter value={stats.points} />
                                        </p>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">XP Points</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next Rank Badge Bubble */}
                        {rankInfo.current !== 'Gold' && (
                            <div className="absolute -bottom-2 -right-2 glass-card p-1.5 rounded-full !border-slate-100 dark:!border-slate-700 scale-75 md:scale-100"
                                style={{ animation: 'fadeUp 0.6s ease-out 0.5s both' }}>
                                <div className="text-[8px] font-bold text-center mb-0.5 text-slate-400">NEXT</div>
                                <RankBadge rank={rankInfo.next} size="sm" showTitle={false} />
                            </div>
                        )}
                    </div>

                    {/* Rank Title & CTA */}
                    <div className="text-left md:text-center flex-1 flex flex-col items-start md:items-center">
                        <h3 className="text-xl font-black text-gradient-blue mb-1">
                            {rankInfo.current} {t('impact.guardian', 'Guardian')}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-[180px] md:max-w-none mb-4">
                            <span className="font-bold text-slate-900 dark:text-white">{rankInfo.max - stats.points} XP</span> to unlock <span className="font-bold text-blue-600">{rankInfo.next}</span>
                        </p>

                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 text-xs font-bold shadow-lg shadow-blue-200/30 active:scale-95 transition-all"
                            onClick={() => navigate('/incidents')}
                        >
                            {t('impact.reportIssueBonus', 'Report Issue +50 XP')}
                        </Button>
                    </div>
                </div>

                {/* RIGHT: Stats Grid & Badges */}
                <div className="md:col-span-8 flex flex-col justify-between gap-6">

                    {/* 3-Col Pill Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="glass-card p-4 flex flex-col items-center justify-center hover:-translate-y-1 transition-transform duration-300">
                            <div className="gradient-icon-blue text-white p-2 rounded-full mb-2">
                                <Flag className="h-5 w-5" />
                            </div>
                            <span className="text-2xl font-black text-slate-800 dark:text-white count-animate">
                                <StatCounter value={stats.reports} />
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-400">{t('hub.reports', 'Reports')}</span>
                        </div>

                        <div className="glass-card p-4 flex flex-col items-center justify-center hover:-translate-y-1 transition-transform duration-300">
                            <div className="gradient-icon-green text-white p-2 rounded-full mb-2">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <span className="text-2xl font-black text-slate-800 dark:text-white count-animate">
                                <StatCounter value={stats.resolved} />
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-400">{t('hub.resolved', 'Resolved')}</span>
                        </div>

                        <div className="glass-card p-4 flex flex-col items-center justify-center hover:-translate-y-1 transition-transform duration-300">
                            <div className="gradient-icon-indigo text-white p-2 rounded-full mb-2">
                                <HeartHandshake className="h-5 w-5" />
                            </div>
                            <span className="text-2xl font-black text-slate-800 dark:text-white count-animate">
                                <StatCounter value={stats.helped} />
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-400">{t('impact.helped', 'Helped')}</span>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="glass-card p-4 !border-dashed">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('impact.recentBadges', 'Recent Badges')}</span>
                            <span className="text-[10px] text-blue-500 font-bold cursor-pointer hover:underline" onClick={() => navigate('/profile')}>{t('impact.viewAll', 'View All')}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar py-2">
                            <AchievementBadge icon={Zap} title="First Report" description="You filed your first civic report." isUnlocked={stats.reports > 0} dateUnlocked="Jan 2024" />
                            <AchievementBadge icon={MapPin} title="Local Guide" description="Reported issues in 3 different zones." isUnlocked={stats.reports >= 3} />
                            <AchievementBadge icon={AlertTriangle} title="Spotter" description="Reported 10+ active hazards." isUnlocked={stats.reports >= 10} />
                            <AchievementBadge icon={LifeBuoy} title="Samaritan" description="Helped 50+ citizens." isUnlocked={stats.helped >= 50} />
                            <AchievementBadge icon={CheckCircle2} title="Fixer" description="Had 5 reports marked resolved." isUnlocked={stats.resolved >= 5} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
