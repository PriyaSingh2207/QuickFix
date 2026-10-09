import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export function SplashScreen() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative flex items-center justify-center mb-8"
            >
                <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="h-24 w-24 bg-gradient-to-tr from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl z-10">
                    <Shield className="h-12 w-12 text-white fill-white/20" />
                </div>
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight"
            >
                Quickfix
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg text-slate-500 dark:text-slate-400 font-medium tracking-wide"
            >
                Respond Faster. Save Lives.
            </motion.p>
        </motion.div>
    );
}
