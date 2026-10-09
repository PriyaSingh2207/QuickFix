import {
    LayoutDashboard,
    FileText,
    UserSearch,
    Calendar,
    ShieldCheck,
    Radio,
    AlertTriangle,
    Package,
    Users,
    Home,
    Megaphone,
    Settings,
    Gift,
    X,
    LogOut,
    ShieldAlert,
    ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatars";
import { cn } from '@/lib/utils';
import type { AppMode } from '@/types';

interface SidebarProps {
    mode: AppMode;
    isOpen: boolean;
    activeItem: string;
    onItemClick: (item: string) => void;
    onClose: () => void;
}

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function Sidebar({ mode, isOpen, activeItem, onItemClick, onClose }: SidebarProps) {
    const isEmergency = mode === 'emergency';
    const { profile, signOut } = useAuth();
    const { t } = useLanguage();
    // Fetch removed - relying on context

    const isOfficer = profile?.role === 'officer' || profile?.role === 'admin';

    const communityItems = [
        { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
        { id: 'complaints', label: t('nav.complaints', 'शिकायत (Complaints)'), icon: FileText },
        { id: 'my-complaints', label: t('nav.trackComplaints', 'Track Complaints'), icon: ClipboardList },
        { id: 'missing', label: t('nav.missing', 'Missing Registry'), icon: UserSearch },
        { id: 'events', label: t('nav.events', 'Events'), icon: Calendar },
        { id: 'rewards', label: t('nav.rewards', 'Rewards'), icon: Gift },
        ...(isOfficer ? [{ id: 'officer-portal', label: t('nav.officerPortal', 'Urban Intelligence (Officer)'), icon: ShieldAlert }] : []),
    ];

    const emergencyItems = [
        { id: 'command', label: 'Command Center', icon: Radio },
        { id: 'incidents', label: 'Active Incidents', icon: AlertTriangle },
        { id: 'resources', label: 'Resources', icon: Package },
        { id: 'volunteers', label: 'Volunteers', icon: Users },
        { id: 'shelters', label: 'Shelters', icon: Home },
        { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
        ...(isOfficer ? [{ id: 'officer-portal', label: t('nav.officerPortal', 'Urban Intelligence (Officer)'), icon: ShieldAlert }] : []),
    ];

    const items = isEmergency ? emergencyItems : communityItems;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed left-0 z-40 h-[calc(100vh-64px)] w-[280px] bg-card border-r shadow-2xl transition-all duration-300 md:translate-x-0 ease-in-out",
                "top-16", // Adjusted for h-16 header
                isOpen ? "translate-x-0" : "-translate-x-full",
                // Mobile adjustments
                "md:shadow-none md:border-r border-border"
            )}>
                {/* Close button on mobile */}
                <div className="md:hidden absolute top-2 right-2 z-50">
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100 rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">

                    {/* Visual Header / Profile Section */}
                    <div className="relative p-6 px-5 pb-2">
                        <div className="absolute inset-0 h-32 bg-gradient-to-br from-teal-600/10 to-blue-600/5 dark:from-teal-900/20 dark:to-blue-900/10 pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-4 mb-6">
                            <div className="relative">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-2 ring-teal-50 transition-transform hover:scale-105">
                                    <AvatarImage src={getAvatarUrl(profile?.avatar_url, profile?.name || 'User')} />
                                    <AvatarFallback>{profile?.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100">{profile?.name || 'Citizen'}</h3>
                                <p className="text-xs font-medium text-teal-600 dark:text-teal-400 capitalize">{profile?.role || 'Guest'} • {profile?.city || 'Indore'}</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
                    </div>

                    {/* Navigation Items (Scrollable Area) */}
                    <div className="flex-1 overflow-y-auto py-2 px-3 custom-scrollbar space-y-6">
                        {/* Main Menu */}
                        <nav className="space-y-1">
                            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Menu</p>
                            {items.map((item) => {
                                const isActive = activeItem === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onItemClick(item.id)}
                                        className={cn(
                                            "group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden",
                                            isActive
                                                ? (isEmergency ? "bg-red-50 text-red-700 shadow-sm translate-x-1" : "bg-white text-blue-600 shadow-sm ring-1 ring-slate-100 translate-x-1")
                                                : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:translate-x-1"
                                        )}
                                    >
                                        {isActive && (
                                            <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all", isEmergency ? "bg-red-500" : "bg-blue-600")} />
                                        )}

                                        <item.icon className={cn(
                                            "h-5 w-5 transition-transform group-hover:scale-110",
                                            isActive ? (isEmergency ? "text-red-600" : "text-blue-600") : "text-slate-400 group-hover:text-slate-600"
                                        )} />

                                        <span className="relative z-10">{item.label}</span>

                                        {isActive && (
                                            <div className="ml-auto">
                                                <div className={cn("h-1.5 w-1.5 rounded-full animate-bounce", isEmergency ? "bg-red-500" : "bg-blue-600")} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Promo Card (Inside scrollable area to prevent overlap issues on small screens) */}
                        {!isEmergency && (
                            <div className="pt-2">
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all group hover:scale-[1.02]">
                                    {/* Decorative circles */}
                                    <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/20 blur-xl group-hover:scale-110 transition-transform" />
                                    <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-black/10 blur-xl" />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-100 bg-white/10 px-2 py-0.5 rounded-full">Coming Soon</p>
                                            <Gift className="h-4 w-4 text-white/70 animate-pulse" />
                                        </div>
                                        <h4 className="text-base font-bold mb-1 leading-tight">City Clean-up Drive</h4>
                                        <p className="text-xs text-indigo-100 mb-3 opacity-90">Join 500+ volunteers this Sunday!</p>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="w-full h-9 text-xs font-bold bg-white text-indigo-600 hover:bg-white/90 border-none shadow-sm transition-transform active:scale-95"
                                            onClick={() => onItemClick('events')}
                                        >
                                            Register Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Items */}
                    <div className="p-4 mt-auto border-t border-border/50 bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
                        <div className="space-y-1">
                            <button
                                onClick={() => onItemClick('settings')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            >
                                <Settings className="h-5 w-5 text-slate-400" />
                                {t('nav.settings', 'Settings')}
                            </button>
                            <button
                                onClick={() => signOut()}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="h-5 w-5 text-slate-400" />
                                {t('nav.signOut', 'Sign Out')}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
