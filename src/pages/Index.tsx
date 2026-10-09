import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { BottomNav } from "@/components/layout/BottomNav";
import { Complaints } from "@/pages/Complaints";
import { IncidentForm } from "@/components/forms/IncidentForm";
import { HelplineDirectory } from "@/components/dashboard/HelplineDirectory";
import RewardsPage from "@/pages/Rewards";
import { MissingRegistry } from "@/components/dashboard/MissingRegistry";
import { Events } from "@/pages/Events";
import Settings from "@/pages/Settings";
import ProfilePage from "@/pages/Profile";
import type { AppMode } from "@/types";

import { LiveLocationStreamer } from "@/components/sos/LiveLocationStreamer";

export function Index() {
    const [mode, setMode] = useState<AppMode>('community');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sosActive, setSosActive] = useState(false);

    // URL based navigation
    const location = useLocation();
    const navigate = useNavigate();

    // Derived State for Active Item
    const getActiveItem = (pathname: string) => {
        const path = pathname.endsWith('/') && pathname.length > 1
            ? pathname.slice(0, -1)
            : pathname;

        if (path === '/complaints') return 'complaints';
        if (path === '/incidents') return 'incidents';
        if (path === '/rewards') return 'rewards';
        if (path === '/profile') return 'profile';
        if (path === '/settings') return 'settings';
        if (path === '/events') return 'events';
        if (path === '/missing') return 'missing';
        if (path === '/helpline') return 'helpline';
        if (path === '/emergency') return 'command';
        if (path === '/') return 'dashboard';
        return 'dashboard';
    };

    const activeItem = getActiveItem(location.pathname);

    // Mode syncing
    useEffect(() => {
        if (location.pathname === '/emergency') {
            setMode('emergency');
        } else if (location.pathname === '/' || mode === 'emergency') {
            // Only switch back to community if we left emergency route and were in emergency mode
            if (location.pathname !== '/emergency') {
                setMode('community');
            }
        }
    }, [location.pathname, mode]);

    // Listen for SOS toggle events from anywhere
    useEffect(() => {
        const handleSosEvent = (e: CustomEvent) => {
            setSosActive(e.detail.active);
        };
        window.addEventListener('quickfix-sos-toggle' as any, handleSosEvent as any);
        return () => window.removeEventListener('quickfix-sos-toggle' as any, handleSosEvent as any);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-secondary/30 font-sans text-foreground">
            <LiveLocationStreamer isActive={sosActive} />

            {/* Fixed Sidebar */}
            <Sidebar
                mode={mode}
                isOpen={isSidebarOpen}
                activeItem={activeItem}
                onItemClick={(id) => {
                    setIsSidebarOpen(false);
                    if (id === 'dashboard') navigate('/');
                    else if (id === 'command') navigate('/emergency');
                    else navigate(`/${id}`);
                }}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Right column: header sticky + content scrolls */}
            <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden md:ml-[280px]">
                
                {/* Fixed Header */}
                <div className="sticky top-0 z-30 flex-shrink-0 w-full">
                    <Header
                        mode={mode}
                        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                </div>

                {/* Main Content Area - only this scrolls */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 w-full">
                    <div className="p-4 sm:p-6 lg:p-8 pb-24 max-w-[1600px] mx-auto w-full">
                        {(activeItem === 'dashboard' || activeItem === 'command') ? (
                            <Dashboard mode={mode} />
                        ) : activeItem === 'complaints' ? (
                            <Complaints />
                        ) : activeItem === 'incidents' ? (
                            <div className="max-w-2xl mx-auto">
                                <IncidentForm />
                            </div>
                        ) : activeItem === 'helpline' ? (
                            <div className="max-w-4xl mx-auto">
                                <HelplineDirectory />
                            </div>
                        ) : activeItem === 'missing' ? (
                            <MissingRegistry />
                        ) : activeItem === 'events' ? (
                            <Events />
                        ) : activeItem === 'rewards' ? (
                            <RewardsPage />
                        ) : activeItem === 'settings' ? (
                            <Settings />
                        ) : activeItem === 'profile' ? (
                            <ProfilePage />
                        ) : (
                            <div className="h-[60vh] flex items-center justify-center text-muted-foreground">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold capitalize">{activeItem}</h2>
                                    <p>This module is under development.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                    <BottomNav
                        mode={mode}
                        onModeChange={(m) => {
                            if (m === 'emergency') navigate('/emergency');
                            else navigate('/');
                        }}
                        onProfileClick={() => navigate('/profile')}
                    />
                </div>
            </div>
        </div>
    );
}
