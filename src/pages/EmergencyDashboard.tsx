
import { motion } from "framer-motion";
import { EmergencyHeader } from "@/components/emergency/EmergencyHeader";
import { LiveMetricsGrid } from "@/components/emergency/LiveMetricsGrid";
import { IncidentCategoryCarousel } from "@/components/emergency/IncidentCategoryCarousel";
import { TacticalMapPanel } from "@/components/emergency/TacticalMapPanel";
import { IncidentTimeline } from "@/components/emergency/IncidentTimeline";
import { ActionHub } from "@/components/emergency/ActionHub";
import { ResourceTabs } from "@/components/emergency/ResourceTabs";
import { OfficialBroadcasts } from "@/components/emergency/OfficialBroadcasts";
import { CommunityIntelFeed } from "@/components/emergency/CommunityIntelFeed";
import { SafetyToolkitDock } from "@/components/emergency/SafetyToolkitDock";

export default function EmergencyDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-slate-50 font-sans text-slate-900 pb-20 overflow-x-hidden">
            <EmergencyHeader />

            <motion.main
                className="max-w-[1800px] mx-auto space-y-4 md:space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Zone 2: Real-time Stats */}
                <LiveMetricsGrid />

                {/* Zone 3: Categories Carousel */}
                <IncidentCategoryCarousel />

                {/* Zone 4: Map & Timeline Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 h-auto lg:h-[600px]">
                    <div className="lg:col-span-2 h-[400px] lg:h-full">
                        <TacticalMapPanel />
                    </div>
                    <div className="lg:col-span-1 h-[400px] lg:h-full">
                        <IncidentTimeline />
                    </div>
                </div>

                {/* Zone 5: Quick Actions */}
                <ActionHub />

                {/* Zone 6, 7, 8: Lower Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 px-4 pb-8">
                    {/* Resources */}
                    <div className="md:col-span-4 space-y-4">
                        <h3 className="font-bold text-lg px-1">Resource Coordination</h3>
                        <ResourceTabs />
                    </div>

                    {/* Broadcasts */}
                    <div className="md:col-span-4 space-y-4">
                        <OfficialBroadcasts />
                    </div>

                    {/* Community Feed */}
                    <div className="md:col-span-4 space-y-4">
                        <CommunityIntelFeed />
                    </div>
                </div>
            </motion.main>

            <SafetyToolkitDock />
        </div>
    );
}
