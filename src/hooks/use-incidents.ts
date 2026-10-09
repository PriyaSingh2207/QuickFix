import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Incident } from '@/types';

// Fallback for development
const useMockData = !import.meta.env.VITE_SUPABASE_URL;

const mockIncidents: Incident[] = [
    {
        id: "INC-2024-001",
        title: "Flash Flood in Sector 4",
        type: "flood",
        severity: "critical",
        locationAddress: "Sector 4, Vijay Nagar",
        status: "active",
        affectedPopulation: 1200,
        assignedResources: ["res-1", "res-2"],
        assignedVolunteers: ["vol-1", "vol-2"],
        startedAt: new Date(Date.now() - 7200000), // 2 hours ago
        eta: "Active"
    },
    {
        id: "INC-2024-002",
        title: "Structural Damage at Bridge",
        type: "structural",
        severity: "high",
        locationAddress: "MR-10 Overpass",
        status: "active",
        affectedPopulation: 0,
        assignedResources: ["res-3"],
        assignedVolunteers: ["vol-3"],
        startedAt: new Date(Date.now() - 2700000), // 45 mins ago
        eta: "15m ETA"
    }
];

export function useIncidents() {
    return useQuery({
        queryKey: ['incidents'],
        queryFn: async () => {
            if (useMockData) return mockIncidents;

            const { data, error } = await supabase
                .from('incidents')
                .select('*')
                .eq('status', 'active')
                .order('started_at', { ascending: false });
            if (error) throw error;
            return data as Incident[];
        }
    });
}

export function useCreateIncident() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (incident: Partial<Incident>) => {
            if (useMockData) {
                console.log("Mock create incident", incident);
                return { ...incident, id: `INC-${Math.floor(Math.random() * 1000)}` };
            }
            const { data, error } = await supabase
                .from('incidents')
                .insert(incident)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
        }
    });
}
