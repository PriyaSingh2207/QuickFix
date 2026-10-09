import { AlertTriangle, Users, Package, Home, Shield, Ambulance, Flame } from "lucide-react";
import { StatCard } from "./StatCard";
import { EmergencyBanner } from "@/components/emergency/EmergencyBanner";
import { IncidentPanel } from "@/components/emergency/IncidentPanel";
import { AIRecommendations } from "@/components/emergency/AIRecommendations";
import { ResourceOverview } from "./ResourceOverview";
import { VolunteerStatus } from "./VolunteerStatus";
import { LiveSOSMap } from "@/components/emergency/LiveSOSMap";
import { Button } from "@/components/ui/button";

export function EmergencyDashboard() {
    const triggerSOS = () => {
        const event = new CustomEvent('quickfix-sos-toggle', { detail: { active: true } });
        window.dispatchEvent(event);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
            {/* Quick Actions */}
            <div className="flex flex-col md:flex-row gap-4">
                <Button
                    variant="destructive"
                    size="lg"
                    className="flex-1 h-20 text-xl font-black bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-xl shadow-red-500/20 border-0 animate-pulse"
                    onClick={triggerSOS}
                >
                    <AlertTriangle className="mr-3 h-8 w-8" />
                    ACTIVATE SOS
                </Button>

                <div className="flex gap-2 shrink-0 overflow-x-auto no-scrollbar pb-2">
                    <Button variant="outline" className="h-20 w-24 flex flex-col gap-1 border-2 border-slate-200" onClick={() => window.location.href = 'tel:100'}>
                        <Shield className="h-6 w-6 text-blue-600" />
                        <span className="text-[10px] font-bold">POLICE</span>
                    </Button>
                    <Button variant="outline" className="h-20 w-24 flex flex-col gap-1 border-2 border-slate-200" onClick={() => window.location.href = 'tel:108'}>
                        <Ambulance className="h-6 w-6 text-red-600" />
                        <span className="text-[10px] font-bold">AMBULANCE</span>
                    </Button>
                    <Button variant="outline" className="h-20 w-24 flex flex-col gap-1 border-2 border-slate-200" onClick={() => window.location.href = 'tel:101'}>
                        <Flame className="h-6 w-6 text-orange-600" />
                        <span className="text-[10px] font-bold">FIRE</span>
                    </Button>
                </div>
            </div>

            {/* Banner */}
            <EmergencyBanner />

            {/* Emergency Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Active Incidents"
                    value="2"
                    icon={AlertTriangle}
                    trend="+1"
                    trendUp={false}
                    description="Critical Priority"
                    className="border-l-4 border-l-red-500 from-red-50/50 to-transparent bg-gradient-to-br"
                />
                <StatCard
                    title="Affected People"
                    value="1,240"
                    icon={Users}
                    trend="+50"
                    trendUp={false}
                    description="Evacuation needed"
                    className="border-l-4 border-l-orange-500 from-orange-50/50 to-transparent bg-gradient-to-br"
                />
                <StatCard
                    title="Resources Deployed"
                    value="18"
                    icon={Package}
                    trend="85%"
                    trendUp={true}
                    description="Total Utilization"
                    className="border-l-4 border-l-blue-500 from-blue-50/50 to-transparent bg-gradient-to-br"
                />
                <StatCard
                    title="Shelter Capacity"
                    value="64%"
                    icon={Home}
                    trend="Available"
                    trendUp={true}
                    description="3 Shelters Open"
                    className="border-l-4 border-l-emerald-500 from-emerald-50/50 to-transparent bg-gradient-to-br"
                />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col - Incidents & Map */}
                <div className="lg:col-span-1 space-y-6">
                    <LiveSOSMap />
                    <IncidentPanel />
                </div>

                {/* Middle Col - AI */}
                <div className="lg:col-span-1 min-h-[400px]">
                    <AIRecommendations />
                </div>

                {/* Right Col - Resources & Volunteers */}
                <div className="lg:col-span-1 space-y-6">
                    <ResourceOverview />
                    <VolunteerStatus />
                </div>
            </div>
        </div>
    );
}
