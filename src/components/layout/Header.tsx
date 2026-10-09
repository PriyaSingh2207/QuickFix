import { useState, useEffect } from 'react';
import { formatDistanceToNow } from "date-fns";
import {
    Menu,
    Bell,
    Shield,
    User,
    Settings,
    LogOut,
    Flame,
    CheckCircle2,
    CalendarClock,
    Trophy,
    ShieldAlert,
    ClipboardCheck,
    Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { AppMode } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { getAvatarUrl } from "@/lib/avatars";

interface HeaderProps {
    mode: AppMode;
    onMenuToggle: () => void;
}

export function Header({ mode, onMenuToggle }: HeaderProps) {
    const { profile, signOut } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const isEmergency = mode === 'emergency';

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const getNotificationStyle = (type: string) => {
        switch (type) {
            case 'resolved': return { icon: CheckCircle2, color: 'text-green-500' };
            case 'reminder': return { icon: CalendarClock, color: 'text-blue-500' };
            case 'reward': return { icon: Trophy, color: 'text-amber-500' };
            case 'alert': return { icon: Flame, color: 'text-red-500' };
            default: return { icon: Bell, color: 'text-slate-500' };
        }
    };

    const fetchNotifications = async () => {
        if (!profile?.id) return;
        try {
            const data = await db.getNotifications(profile.id);
            // Transform for UI
            const mapped = data.map((n: any) => ({
                id: n.id,
                title: n.title,
                desc: n.message,
                type: n.type,
                read: n.read,
                time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
                // Visuals based on type
                ...getNotificationStyle(n.type)
            }));
            setNotifications(mapped);
            setUnreadCount(mapped.filter((n: any) => !n.read).length);
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error(error);
        }
    };

    useEffect(() => {
        if (profile?.id) {
            fetchNotifications();

            // Subscribe
            const channel = supabase
                .channel(`notifications:${profile.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${profile.id}`
                }, () => {
                    fetchNotifications();
                    // Optional: Play sound or show toast
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [profile?.id]);

    const markAsRead = async () => {
        if (unreadCount === 0) return;
        // Optimistic
        setUnreadCount(0);
        // We'd need a bulk update or just loop. For now, we assume user opening calls individual or bulk.
        // Let's mark all loaded specific ids as read logic if we had a button, but mostly we mark on click or open?
        // For simplicity: "Mark all as read" button will loop.
        notifications.forEach(n => {
            if (!n.read) db.markNotificationRead(n.id);
        });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <header className={cn(
            "sticky top-0 z-30 w-full h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-shadow duration-300",
            isEmergency && "bg-slate-900/90 border-red-900/50"
        )}>
            <div className="container mx-auto h-full px-4 flex items-center justify-between gap-4">

                {/* 1. LEFT SECTION - Logo & Name */}
                <div className="flex items-center gap-3 md:gap-4 shrink-0 cursor-pointer group" onClick={() => window.location.href = '/'}>
                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-foreground hover:bg-muted/50"
                        onClick={(e) => { e.stopPropagation(); onMenuToggle(); }}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div data-no-translate="true" className="notranslate flex items-center gap-3">
                        <div className={cn(
                            "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow",
                            isEmergency ? "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)]" : "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30"
                        )}>
                            <Shield className="h-6 w-6 text-white fill-current relative z-10" />
                            <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span data-no-translate="true" className={cn(
                            "notranslate text-2xl font-bold tracking-tight hidden min-[350px]:inline-block bg-clip-text text-transparent bg-gradient-to-r animate-shimmer bg-[length:200%_auto]",
                            isEmergency
                                ? "from-white to-red-200"
                                : "from-blue-600 via-teal-500 to-blue-600"
                        )}>
                            Quickfix
                        </span>
                    </div>
                </div>

                {/* 2. CENTER SECTION - Spacer */}
                <div className="flex-1" />

                {/* 3. RIGHT SECTION - Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Multilingual Selector Powered by Sarvam AI */}
                    <LanguageSelector />

                    {/* Citizen Complaint Tracking */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/my-complaints')}
                        className="hidden xl:inline-flex items-center gap-1.5 h-9 rounded-full px-3 text-xs font-bold border-blue-500/40 text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 shadow-sm transition-all"
                    >
                        <ClipboardCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        {t('nav.myComplaints', 'My Complaints')}
                    </Button>

                    {/* City Officer Portal Button - Only visible for Officer role */}
                    {(profile?.role === 'officer' || profile?.role === 'admin') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/officer-portal')}
                            className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-full px-3 text-xs font-bold border-teal-500/50 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 shadow-sm transition-all"
                        >
                            <ShieldAlert className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                            {t('nav.officerPortal', 'Officer Portal')}
                        </Button>
                    )}

                    {/* Contractor Portal Button - Only visible for Contractor role */}
                    {profile?.role === 'contractor' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/contractor-portal')}
                            className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-full px-3 text-xs font-bold border-amber-500/50 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-sm transition-all"
                        >
                            <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            Contractor Desk
                        </Button>
                    )}

                    {/* Notification Bell */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted/50 h-10 w-10">
                                <Bell className={cn("h-5 w-5 transition-colors", isEmergency ? "text-slate-300" : "text-foreground")} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background animate-bounce" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden border-border/50 shadow-xl backdrop-blur-xl bg-background/95">
                            <div className="bg-muted/50 p-3 border-b flex items-center justify-between">
                                <span className="font-semibold text-sm">Notifications</span>
                                {unreadCount > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length > 0 ? notifications.map((n) => (
                                    <DropdownMenuItem key={n.id} className={cn("flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-muted/50 focus:bg-muted/50 border-b last:border-0 border-border/40", !n.read && "bg-blue-50/50 dark:bg-blue-900/10")}>
                                        <div className="flex items-start gap-3 w-full">
                                            <div className={cn("mt-1 p-2 rounded-full bg-opacity-10 shrink-0", n.color.replace('text-', 'bg-'))}>
                                                <n.icon className={cn("h-4 w-4", n.color)} />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className={cn("font-medium text-sm", !n.read ? "text-foreground" : "text-muted-foreground")}>{n.title}</span>
                                                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {n.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                )) : (
                                    <div className="p-8 text-center text-sm text-slate-500">
                                        No notifications
                                    </div>
                                )}
                            </div>
                            <div className="p-2 bg-muted/30 border-t text-center">
                                <Button variant="ghost" size="sm" className="w-full text-xs h-8" onClick={markAsRead} disabled={unreadCount === 0}>
                                    Mark all as read
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-0 border border-border/50 bg-background shadow-sm hover:shadow-md transition-all ml-1">
                                <Avatar className="h-full w-full ring-2 ring-offset-2 ring-offset-background ring-transparent group-hover:ring-primary/20 transition-all">
                                    <AvatarImage src={getAvatarUrl(profile?.avatar_url, profile?.name || 'User')} />
                                    <AvatarFallback>{profile?.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl backdrop-blur-xl bg-background/95 border-border/50">
                            {/* Mini Dashboard Card */}
                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 mb-2 border border-primary/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                        <AvatarImage src={getAvatarUrl(profile?.avatar_url, profile?.name || 'User')} />
                                        <AvatarFallback>{profile?.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-sm">{profile?.name || 'Citizen'}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{profile?.role || 'Guest'} • {profile?.city || 'Indore'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-background/50 rounded p-1.5 shadow-sm">
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Reports</p>
                                        <p className="font-bold text-sm text-primary">{profile?.reports_count || 0}</p>
                                    </div>
                                    <div className="bg-background/50 rounded p-1.5 shadow-sm">
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Solved</p>
                                        <p className="font-bold text-sm text-green-600">{profile?.resolved_count || 0}</p>
                                    </div>
                                    <div className="bg-background/50 rounded p-1.5 shadow-sm">
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Points</p>
                                        <p className="font-bold text-sm text-amber-600">{profile?.points || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <DropdownMenuItem onClick={() => navigate('/my-complaints')} className="cursor-pointer rounded-md focus:bg-blue-50 dark:focus:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold mb-1">
                                <ClipboardCheck className="mr-2 h-4 w-4 text-blue-600" />
                                <span>{t('nav.trackComplaints', 'Track My Complaints')}</span>
                            </DropdownMenuItem>

                            {(profile?.role === 'officer' || profile?.role === 'admin') && (
                                <DropdownMenuItem onClick={() => navigate('/officer-portal')} className="cursor-pointer rounded-md focus:bg-teal-50 dark:focus:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold mb-1">
                                    <ShieldAlert className="mr-2 h-4 w-4 text-teal-600" />
                                    <span>{t('nav.officerPortal', 'City Officer Portal')}</span>
                                </DropdownMenuItem>
                            )}

                            {(profile?.role === 'contractor' || profile?.role === 'admin') && (
                                <DropdownMenuItem onClick={() => navigate('/contractor-portal')} className="cursor-pointer rounded-md focus:bg-amber-50 dark:focus:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold mb-1">
                                    <Building2 className="mr-2 h-4 w-4 text-amber-600" />
                                    <span>Contractor & Tenders Portal</span>
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer rounded-md focus:bg-primary/5 mb-1">
                                <User className="mr-2 h-4 w-4 text-primary" />
                                <span>Full Profile</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer rounded-md focus:bg-primary/5 mb-1">
                                <Settings className="mr-2 h-4 w-4 text-primary" />
                                <span className="w-full">{t('nav.settings', 'Settings')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-border/50" />
                            <DropdownMenuItem
                                onClick={async () => {
                                    await signOut();
                                    navigate('/login');
                                }}
                                className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer rounded-md"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{t('nav.signOut', 'Log out')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Active Mode Indicator Line */}
            <div className={cn(
                "absolute bottom-0 left-0 w-full h-[1px] transition-colors duration-300",
                isEmergency ? "bg-red-500/50" : "bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            )} />
        </header>
    );
}
