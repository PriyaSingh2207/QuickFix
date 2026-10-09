import type { AppMode } from "@/types";
import { CommunityDashboard } from "./CommunityDashboard";
import { EmergencyDashboard } from "./EmergencyDashboard";

interface DashboardProps {
    mode: AppMode;
}

export function Dashboard({ mode }: DashboardProps) {
    if (mode === 'emergency') {
        return <EmergencyDashboard />;
    }
    return <CommunityDashboard />;
}
