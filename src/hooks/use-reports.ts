import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type { Report } from '@/types';

// Use a fallback for development if Supabase isn't connected
const useMockData = !import.meta.env.VITE_SUPABASE_URL;

const mockReports: Report[] = [
    {
        id: "HZ-001",
        title: "Clogged Drain Causing Overflow",
        description: "Severe waterlogging due to clogged drain.",
        category: "Drainage",
        locationAddress: "Sector 4, Vijay Nagar",
        priority: "high",
        status: "pending",
        aiScore: 88,
        reporterId: "user-1",
        createdAt: new Date(Date.now() - 7200000),
        updatedAt: new Date()
    },
    {
        id: "HZ-002",
        title: "Fallen Tree Blocking Road",
        category: "Debris",
        locationAddress: "MG Road, Near TI Mall",
        priority: "medium",
        status: "assigned",
        aiScore: 75,
        reporterId: "user-2",
        createdAt: new Date(Date.now() - 14400000),
        updatedAt: new Date()
    },
];

export function useReports() {
    return useQuery({
        queryKey: ['reports'],
        queryFn: async () => {
            if (useMockData) return mockReports;

            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!data) return [];

            // Map Supabase 'complaints' to 'Report' type
            return data.map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                category: item.category,
                locationAddress: item.location,
                priority: item.priority || 'medium',
                status: item.status,
                aiScore: 0, // Default as DB doesn't have it yet
                reporterId: item.user_id,
                createdAt: new Date(item.created_at),
                updatedAt: new Date(item.created_at), // Default
                images: item.images
            })) as Report[];
        }
    });
}

export function useCreateReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (report: Partial<Report>) => {
            if (useMockData) {
                return { ...report, id: `HZ-${Math.floor(Math.random() * 1000)}` };
            }
            // Use the db.createComplaint function for consistency and RPC triggers
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            return await db.createComplaint({
                title: report.title!,
                category: report.category!,
                description: report.description!,
                location: report.locationAddress!,
                user_id: user.id,
                images: []
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        }
    });
}
