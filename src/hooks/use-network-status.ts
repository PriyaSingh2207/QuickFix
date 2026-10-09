import { useState, useEffect } from 'react';

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [connection, setConnection] = useState<any>(null);

    useEffect(() => {
        const updateOnlineStatus = () => setIsOnline(navigator.onLine);

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        const nav = navigator as any;
        if (nav.connection) {
            setConnection({
                effectiveType: nav.connection.effectiveType,
                saveData: nav.connection.saveData,
            });

            const updateConnectionStatus = () => {
                setConnection({
                    effectiveType: nav.connection.effectiveType,
                    saveData: nav.connection.saveData,
                });
            };

            nav.connection.addEventListener('change', updateConnectionStatus);
            return () => {
                window.removeEventListener('online', updateOnlineStatus);
                window.removeEventListener('offline', updateOnlineStatus);
                nav.connection.removeEventListener('change', updateConnectionStatus);
            };
        }

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    return { isOnline, ...connection };
}
