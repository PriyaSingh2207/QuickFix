import { motion } from "framer-motion";
import {
    AlertTriangle,
    Shield,
    Users,
    Radio,
    MapPin,
    HeartHandshake,
    Siren
} from "lucide-react";

interface IllustrationBlockProps {
    type: 1 | 2 | 3 | 4;
}

export function IllustrationBlock({ type }: IllustrationBlockProps) {

    // Slide 1: Awareness - Simple Alert Center
    if (type === 1) {
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Background Shapes */}
                <div className="absolute inset-0 bg-red-500/5 rounded-full blur-3xl scale-125" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-48 h-48 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-700"
                >
                    <div className="absolute top-4 right-4 animate-bounce">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <Siren className="w-20 h-20 text-slate-800 dark:text-slate-200" />

                    {/* Simulated pulse ring */}
                    <div className="absolute inset-0 border-4 border-red-500/20 rounded-[2.5rem] animate-ping" />
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -left-4 bottom-10 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/30 flex items-center gap-2"
                >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-600">SOS Active</span>
                </motion.div>
            </div>
        );
    }

    // Slide 2: Connection - Network Node
    if (type === 2) {
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl scale-125" />

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative z-10 w-64 h-40 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 overflow-hidden"
                >
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 opacity-10">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className="bg-slate-900 dark:bg-white rounded-sm" />
                        ))}
                    </div>

                    <div className="relative z-20 flex items-center gap-8">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="h-1 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>
                        <Radio className="w-8 h-8 text-teal-500 animate-pulse" />
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="h-1 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Slide 3: Features - Staggered Cards
    if (type === 3) {
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-teal-500/5 rounded-full blur-3xl scale-125" />

                <div className="relative z-10 grid grid-cols-2 gap-3 w-64">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-2 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-md border border-slate-100 flex items-center gap-3"
                    >
                        <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="h-2 w-20 bg-slate-100 rounded-full" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center gap-2"
                    >
                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div className="h-1.5 w-12 bg-slate-100 rounded-full" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center gap-2"
                    >
                        <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                            <HeartHandshake className="w-5 h-5" />
                        </div>
                        <div className="h-1.5 w-12 bg-slate-100 rounded-full" />
                    </motion.div>
                </div>
            </div>
        );
    }

    // Slide 4: Unified - The App Icon/Hero
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl scale-125" />

            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="relative z-10"
            >
                <div className="w-32 h-32 bg-gradient-to-tr from-teal-500 to-blue-600 rounded-[2rem] shadow-2xl flex items-center justify-center transform rotate-3">
                    <Shield className="w-16 h-16 text-white" />
                </div>
                {/* Floating tags */}
                <div className="absolute -top-4 -right-8 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-lg text-[10px] font-bold text-slate-600 border border-slate-100">
                    Trusted
                </div>
                <div className="absolute -bottom-4 -left-8 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-lg text-[10px] font-bold text-slate-600 border border-slate-100">
                    Secure
                </div>
            </motion.div>
        </div>
    );
}
