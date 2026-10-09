import { useEffect, useState } from 'react';
import { useWatchLocation } from "@/services/locationService";
import { supabase } from "@/lib/supabase";

import { Radio } from "lucide-react";

interface LiveLocationStreamerProps {
    isActive: boolean;
    emergencyId?: string; // If linked to specific emergency report
}

export function LiveLocationStreamer({ isActive, emergencyId }: LiveLocationStreamerProps) {
    const location = useWatchLocation(isActive);
    const [lastSent, setLastSent] = useState<Date | null>(null);

    useEffect(() => {
        if (!isActive || !location.lat || !location.lng) return;

        // Throttle updates: Send max once every 10 seconds
        if (lastSent && (new Date().getTime() - lastSent.getTime() < 10000)) return;

        const sendLocation = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Generate a temp emergency ID if none provided (e.g. panic button pure mode)
            const eId = emergencyId || '00000000-0000-0000-0000-000000000000'; // Placeholder or handle appropriately

            const { error } = await supabase
                .from('emergency_locations')
                .insert({
                    user_id: user.id,
                    emergency_id: eId,
                    latitude: location.lat,
                    longitude: location.lng,
                    accuracy: location.accuracy
                });

            if (error) {
                console.error("Failed to stream location", error);
            } else {
                setLastSent(new Date());
            }
        };

        sendLocation();

    }, [isActive, location.lat, location.lng, lastSent, emergencyId]);

    if (!isActive) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse flex items-center gap-2">
            <Radio className="h-4 w-4 animate-ping" />
            <span className="text-xs font-bold">SOS LIVE TRACKING ON</span>
        </div>
    );
}
