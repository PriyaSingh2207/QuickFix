import { useRef } from "react";
import {
    Megaphone,
    TrendingUp,
    Plus,
    Users,
    Gift,
    ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { QuickComplaint } from "./QuickComplaint";

import { CityStatusBar } from "./CityStatusBar";
import { ImpactPanel } from "./ImpactPanel";
import { CityAlertTimeline } from "./CityAlertTimeline";
import { CommunityZone } from "./CommunityZone";
import { JoinSquadModal } from "./JoinSquadModal";
import { CityHeroLeaderboard } from "./CityHeroLeaderboard";
import { AnnouncementsPanel } from "./AnnouncementsPanel";
import { NearbyCivicCarousel } from "./NearbyCivicCarousel";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAvatarUrl } from "@/lib/avatars";

// --- City Skyline SVG ---
function CitySkyline() {
    return (
        <svg viewBox="0 0 1200 200" fill="none" className="w-full h-full opacity-30" preserveAspectRatio="xMidYMax slice">
            <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.05" />
                </linearGradient>
            </defs>
            {/* Buildings */}
            <rect x="40" y="80" width="50" height="120" rx="4" fill="url(#skyGrad)">
                <animate attributeName="height" values="120;115;120" dur="4s" repeatCount="indefinite" />
            </rect>
            <rect x="100" y="40" width="40" height="160" rx="4" fill="url(#skyGrad)">
                <animate attributeName="height" values="160;155;160" dur="5s" repeatCount="indefinite" />
            </rect>
            <rect x="150" y="90" width="60" height="110" rx="4" fill="url(#skyGrad)" />
            <rect x="220" y="20" width="35" height="180" rx="4" fill="url(#skyGrad)">
                <animate attributeName="height" values="180;175;180" dur="3.5s" repeatCount="indefinite" />
            </rect>
            <rect x="265" y="60" width="55" height="140" rx="4" fill="url(#skyGrad)" />
            <rect x="330" y="100" width="45" height="100" rx="4" fill="url(#skyGrad)" />
            <rect x="385" y="30" width="50" height="170" rx="4" fill="url(#skyGrad)">
                <animate attributeName="height" values="170;165;170" dur="4.5s" repeatCount="indefinite" />
            </rect>
            <rect x="445" y="70" width="40" height="130" rx="4" fill="url(#skyGrad)" />
            <rect x="495" y="50" width="55" height="150" rx="4" fill="url(#skyGrad)" />
            <rect x="560" y="85" width="35" height="115" rx="4" fill="url(#skyGrad)">
                <animate attributeName="height" values="115;110;115" dur="3s" repeatCount="indefinite" />
            </rect>
            <rect x="605" y="35" width="50" height="165" rx="4" fill="url(#skyGrad)" />
            <rect x="665" y="75" width="45" height="125" rx="4" fill="url(#skyGrad)" />
            <rect x="720" y="45" width="40" height="155" rx="4" fill="url(#skyGrad)">
                <animate attributeName="height" values="155;150;155" dur="5.5s" repeatCount="indefinite" />
            </rect>
            <rect x="770" y="90" width="55" height="110" rx="4" fill="url(#skyGrad)" />
            <rect x="835" y="25" width="35" height="175" rx="4" fill="url(#skyGrad)" />
            <rect x="880" y="60" width="50" height="140" rx="4" fill="url(#skyGrad)">
                <animate attributeName="height" values="140;135;140" dur="4s" repeatCount="indefinite" />
            </rect>
            <rect x="940" y="80" width="40" height="120" rx="4" fill="url(#skyGrad)" />
            <rect x="990" y="40" width="55" height="160" rx="4" fill="url(#skyGrad)" />
            <rect x="1055" y="70" width="45" height="130" rx="4" fill="url(#skyGrad)" />
            <rect x="1110" y="50" width="50" height="150" rx="4" fill="url(#skyGrad)">
                <animate attributeName="height" values="150;145;150" dur="3.8s" repeatCount="indefinite" />
            </rect>
        </svg>
    );
}


// --- Activity Hub ---
function ActivityHub({ stats }: { stats: { points: number, reports: number, resolved: number } }) {
    const total = stats.reports || 1;
    const rate = Math.round((stats.resolved / total) * 100) || 0;
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (rate / 100) * circumference;
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />

            <div className="mb-6 flex items-center justify-between relative z-10">
                <div>
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{t('hub.title', 'Activity Hub')}</h3>
                    <p className="text-xs text-slate-400 font-medium">{t('hub.subtitle', 'Personal performance')}</p>
                </div>
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/30 p-2.5">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
            </div>

            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-around relative z-10">
                {/* Progress Ring with Gradient Stroke */}
                <div className="relative flex h-36 w-36 items-center justify-center shrink-0">
                    <svg className="h-full w-full" viewBox="0 0 128 128">
                        <defs>
                            <linearGradient id="activityGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#2563EB" />
                                <stop offset="100%" stopColor="#6366F1" />
                            </linearGradient>
                        </defs>
                        <circle cx="64" cy="64" r="52" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                        <circle cx="64" cy="64" r="52" stroke="url(#activityGrad)" strokeWidth="10" fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black text-gradient-blue count-animate">{stats.points}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{t('hub.xp', 'XP Points')}</span>
                    </div>
                </div>

                {/* Stats Pills */}
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-3 glass-card px-5 py-3 cursor-pointer hover:-translate-y-1" onClick={() => navigate('/rewards')}>
                        <Gift className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('hub.impact', 'Total Impact')}</p>
                            <p className="text-lg font-black text-blue-600 count-animate">{stats.points} {t('hub.points', 'Points')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="glass-card px-4 py-3 text-center">
                            <p className="text-2xl font-black text-slate-700 dark:text-slate-200 count-animate">{stats.reports}</p>
                            <p className="text-[10px] font-bold uppercase text-slate-400">{t('hub.reports', 'Reports')}</p>
                        </div>
                        <div className="glass-card px-4 py-3 text-center">
                            <p className="text-2xl font-black text-emerald-600 count-animate">{stats.resolved}</p>
                            <p className="text-[10px] font-bold uppercase text-slate-400">{t('hub.resolved', 'Resolved')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Join Squad Card ---
function JoinSquadCard({ count }: { count: number }) {
    const { t } = useLanguage();
    return (
        <JoinSquadModal>
            <div className="relative overflow-hidden rounded-[20px] shadow-xl group cursor-pointer w-full text-left">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80"
                        alt="Volunteers"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-900/85 group-hover:bg-slate-900/75 transition-colors" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col p-8 text-white h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-3xl font-black">
                                <span className="text-gradient-blue" style={{ WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                                    {t('squad.title', 'Join the Squad')}
                                </span>
                            </h3>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {[1, 5, 8, 12].map(i => (
                                        <Avatar key={i} className="border-2 border-slate-900 w-9 h-9">
                                            <AvatarImage src={`https://i.pravatar.cc/100?img=${i}`} />
                                            <AvatarFallback>V</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                                        +{count - 4}
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-slate-300">{count}+ {t('squad.activeLocals', 'locals active')}</span>
                            </div>
                        </div>
                    </div>

                    <Button className="mt-auto w-full rounded-xl bg-blue-600 py-6 text-white hover:bg-blue-700 border-none shadow-xl btn-glow transition-all">
                        <span className="text-sm font-bold uppercase tracking-widest">{t('squad.volunteer', 'Volunteer Now')}</span>
                        <Users className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </JoinSquadModal>
    );
}

// =========== MAIN DASHBOARD ===========
export function CommunityDashboard() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);

    const greeting = (() => {
        const hour = new Date().getHours();
        if (hour < 12) return t('greeting.goodMorning', 'Good Morning') + ', ';
        if (hour < 18) return t('greeting.goodAfternoon', 'Good Afternoon') + ', ';
        return t('greeting.goodEvening', 'Good Evening') + ', ';
    })();

    const level = profile ? Math.floor(profile.points / 100) + 1 : 1;
    const rankTitle = level >= 10 ? 'Platinum Guardian' : level >= 5 ? 'Gold Guardian' : level >= 3 ? 'Silver Guardian' : 'Bronze Guardian';

    return (
        <div className="min-h-screen page-bg pb-24 pt-4 md:pt-6 font-sans selection:bg-blue-100">
            <div ref={containerRef} className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8">

                {/* ===== 1. GREETING SECTION ===== */}
                <div className="anim-fade-up anim-delay-0">
                    {/* Glassmorphic Hero Banner */}
                    <div className="glass-card p-6 md:p-8 relative overflow-hidden">
                        {/* Animated Skyline Background */}
                        <div className="absolute inset-0 flex items-end pointer-events-none overflow-hidden">
                            <CitySkyline />
                        </div>

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Animated Gradient Avatar Ring */}
                                <div className="avatar-ring cursor-pointer" onClick={() => navigate('/profile')}>
                                    <Avatar className="h-14 w-14 border-[3px] border-white dark:border-slate-900 bg-white dark:bg-slate-800">
                                        <AvatarImage src={getAvatarUrl(profile?.avatar_url, profile ? profile.name : 'Citizen')} />
                                        <AvatarFallback className="text-lg font-bold">{profile ? profile.name[0] : 'C'}</AvatarFallback>
                                    </Avatar>
                                </div>

                                <div onClick={() => navigate('/profile')} className="cursor-pointer group">
                                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        {greeting}
                                        <span className="text-gradient-blue">
                                            {profile ? profile.name.split(' ')[0] : 'Citizen'}
                                        </span>
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        {/* Shimmer Rank Badge Pill */}
                                        <span className="shimmer-badge px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            LVL {level}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                                            {rankTitle}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/city-alerts')}
                                title="View City Broadcasts & Alerts"
                                aria-label="City Alerts & Announcements"
                                className="relative rounded-xl glass-card border-0 hover:bg-white/80 dark:hover:bg-slate-800/80 h-11 w-11 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
                            >
                                <span className="absolute right-2.5 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                                <Megaphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ===== 2. CIVIC COMPLAINT REGISTRATION HUB (GPS & AI CLUSTERING) ===== */}
                <div className="anim-fade-up anim-delay-1">
                    <QuickComplaint />
                </div>

                {/* ===== 3. LIVE STATUS ===== */}
                <div className="anim-fade-up anim-delay-2">
                    <CityStatusBar />
                </div>

                {/* ===== 4. Announcements ===== */}
                <div className="anim-fade-up anim-delay-3">
                    <AnnouncementsPanel />
                </div>

                {/* ===== 5. IMPACT PANEL ===== */}
                <div className="anim-fade-up anim-delay-4">
                    <ImpactPanel profile={profile} />
                </div>

                {/* ===== 5. CIVIC PULSE ===== */}
                <div className="anim-fade-up anim-delay-5">
                    <NearbyCivicCarousel />
                </div>

                {/* ===== 6. ACTIVITY HUB ===== */}
                <div className="anim-fade-up anim-delay-6">
                    <ActivityHub stats={{
                        points: profile ? profile.points : 0,
                        reports: profile ? profile.reports_count : 0,
                        resolved: profile ? profile.resolved_count : 0
                    }} />
                </div>

                {/* ===== 7. CONTENT GRID (Alerts + Community) ===== */}
                <div className="anim-fade-up anim-delay-7 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-8">
                        <CityAlertTimeline />
                    </div>
                    <div className="lg:col-span-5 space-y-6">
                        <CommunityZone />
                    </div>
                </div>

                {/* ===== 10. CITY HEROES ===== */}
                <div className="anim-fade-up anim-delay-9">
                    <CityHeroLeaderboard />
                </div>

                {/* ===== 11. JOIN SQUAD CTA ===== */}
                <div className="anim-fade-up anim-delay-10">
                    <JoinSquadCard count={250} />
                </div>

                {/* Floating Action Button for Mobile */}
                <div className="fixed bottom-24 right-6 z-40 md:hidden pointer-events-none">
                    <div className="pointer-events-auto">
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200/50 border-none"
                            onClick={() => navigate('/complaints')}
                        >
                            <Plus className="h-6 w-6 text-white" />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
