
import { WifiOff } from "lucide-react";
import { useState, useEffect } from "react";

export function OfflineNotice() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:bg-amber-900/10 dark:border-amber-900/50 flex items-start gap-3">
            <WifiOff className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
                <h5 className="mb-1 font-bold leading-none tracking-tight text-amber-800 dark:text-amber-500">
                    Offline Mode Active
                </h5>
                <div className="text-sm text-amber-700 dark:text-amber-400">
                    You can still access all Emergency Guides. Live alerts and maps are disabled.
                </div>
            </div>
        </div>
    );
}
