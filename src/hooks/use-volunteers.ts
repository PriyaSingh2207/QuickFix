import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Volunteer } from '@/types';

// Fallback
const useMockData = !import.meta.env.VITE_SUPABASE_URL;

const mockVolunteers: Volunteer[] = [
    { id: "1", userId: "u1", name: "Rahul Sharma", role: "Field Responder", status: "on-task", tasksCompleted: 12, reliability: 98 },
    { id: "2", userId: "u2", name: "Priya Patel", role: "Medical Aide", status: "available", tasksCompleted: 5, reliability: 100 },
    { id: "3", userId: "u3", name: "Amit Singh", role: "Driver", status: "offline", tasksCompleted: 8, reliability: 95 },
];

export function useVolunteers() {
    return useQuery({
        queryKey: ['volunteers'],
        queryFn: async () => {
            if (useMockData) return mockVolunteers;

            const { data, error } = await supabase
                .from('volunteers')
                .select('*');
            if (error) throw error;
            if (!data) return [];
            return data as Volunteer[];
        }
    });
}
