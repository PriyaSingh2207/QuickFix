import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Shield, User, Heart } from "lucide-react";
import { IllustrationBlock } from "./IllustrationBlock";

interface SlideProps {
    data: any;
}

export function OnboardingSlide({ data }: SlideProps) {
    return (
        <div className="flex flex-col items-center px-6 max-w-md mx-auto w-full h-full pt-4 pb-20 overflow-y-auto hide-scrollbar">

            {/* Top Illustration Area - Mobile Card Style */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-64 shrink-0 mb-8 relative"
            >
                <IllustrationBlock type={data.id} />
            </motion.div>

            {/* Content Card */}
            <div className="w-full flex flex-col items-center text-center">
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3"
                >
                    {data.title}
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed mb-6 max-w-[300px]"
                >
                    {data.subtitle}
                </motion.p>

                {/* Feature Cards (Slide 3) */}
                {data.features && (
                    <div className="w-full space-y-3">
                        {data.features.map((feature: string, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3 text-left w-full"
                            >
                                <div className={cn("p-1.5 rounded-full shrink-0", data.bg)}>
                                    <Check className={cn("w-3.5 h-3.5", data.color)} />
                                </div>
                                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{feature}</span>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Role Cards (Slide 4) */}
                {data.roles && (
                    <div className="w-full grid grid-cols-1 gap-2.5">
                        {data.roles.map((role: string, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-md transition-all cursor-pointer w-full"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-xl transition-colors shrink-0",
                                        idx === 0 ? "bg-blue-50 text-blue-600" :
                                            idx === 1 ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"
                                    )}>
                                        {idx === 0 && <User className="w-4 h-4" />}
                                        {idx === 1 && <Heart className="w-4 h-4" />}
                                        {idx === 2 && <Shield className="w-4 h-4" />}
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{role}</span>
                                </div>
                                <div className="h-4 w-4 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-teal-500" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
