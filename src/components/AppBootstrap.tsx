import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

interface AppBootstrapProps {
    children: React.ReactNode;
}

export function AppBootstrap({ children }: AppBootstrapProps) {
    const { loading } = useAuth();
    const [showFallback, setShowFallback] = useState(false);

    // If loading takes too long (e.g. 8s), we show a "taking longer than usual" message
    // Note: AuthContext already has a safety timeout at 5s, so this is just a backup visual
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => setShowFallback(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center z-[9999]">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative flex items-center justify-center"
                >
                    <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="h-20 w-20 bg-gradient-to-tr from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl z-10">
                        <Shield className="h-10 w-10 text-white fill-white/20" />
                    </div>
                </motion.div>

                <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white">Quickfix</h2>
                <p className="text-slate-500 font-medium mt-2 animate-pulse">Initializing Secure Environment...</p>

                {showFallback && (
                    <p className="mt-4 text-xs text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                        Connecting to server is taking longer than usual...
                    </p>
                )}

                <div className="mt-12 flex gap-2">
                    <div className="h-2 w-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 bg-teal-500 rounded-full animate-bounce" />
                </div>

                {showFallback && (
                    <button
                        onClick={() => {
                            localStorage.clear();
                            sessionStorage.clear();
                            window.location.reload();
                        }}
                        className="mt-8 text-xs text-red-500 hover:text-red-600 underline cursor-pointer"
                    >
                        Stuck? Reset App Data
                    </button>
                )}
            </div>
        );
    }

    return <>{children}</>;
}
