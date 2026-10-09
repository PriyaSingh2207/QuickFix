import { useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function OfflineSyncManager() {
    const { isOnline } = useNetworkStatus();
    const { user } = useAuth();

    useEffect(() => {
        if (isOnline && user) {
            checkAndSyncReports(user.id);
        }
    }, [isOnline, user]);

    const checkAndSyncReports = async (userId: string) => {
        const stored = localStorage.getItem('offline_reports');
        if (!stored) return;

        try {
            const reports = JSON.parse(stored);
            if (!Array.isArray(reports) || reports.length === 0) return;

            toast.info(`Syncing ${reports.length} offline reports...`, {
                id: 'offline-sync',
                duration: Infinity,
                icon: <Loader2 className="animate-spin h-4 w-4" />
            });

            let syncedCount = 0;
            const remainingReports = [];

            for (const report of reports) {
                try {
                    await db.createComplaint({
                        user_id: userId,
                        title: report.title,
                        description: report.description,
                        category: report.category,
                        location: report.location,
                        lat: report.lat,
                        lng: report.lng,
                        images: [] // Images not supported in offline sync yet
                    });
                    syncedCount++;
                } catch (error) {
                    console.error("Failed to sync report:", report, error);
                    remainingReports.push(report); // Keep failed ones
                }
            }

            if (remainingReports.length === 0) {
                localStorage.removeItem('offline_reports');
                toast.dismiss('offline-sync');
                toast.success(`Synced ${syncedCount} reports successfully!`, {
                    icon: <CheckCircle2 className="text-green-500" />
                });
            } else {
                localStorage.setItem('offline_reports', JSON.stringify(remainingReports));
                toast.dismiss('offline-sync');
                toast.error(`Synced ${syncedCount} reports. ${remainingReports.length} failed.`);
            }

        } catch (error) {
            console.error("Error parsing offline reports:", error);
        }
    };

    return null; // Headless component
}
