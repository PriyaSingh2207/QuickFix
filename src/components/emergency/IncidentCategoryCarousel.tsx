import { motion, AnimatePresence } from "framer-motion";
import { Flame, Droplets, Car, BriefcaseMedical, Zap, ChevronRight, Activity, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const categories = [
    { title: "Fire", count: 8, gradient: "from-orange-500 to-red-600", shadow: "shadow-orange-200", icon: Flame, text: "text-white" },
    { title: "Floods", count: 4, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-200", icon: Droplets, text: "text-white" },
    { title: "Accidents", count: 12, gradient: "from-slate-600 to-slate-800", shadow: "shadow-slate-200", icon: Car, text: "text-white" },
    { title: "Medical", count: 6, gradient: "from-red-500 to-pink-600", shadow: "shadow-red-200", icon: BriefcaseMedical, text: "text-white" },
    { title: "Power", count: 3, gradient: "from-yellow-500 to-amber-600", shadow: "shadow-yellow-200", icon: Zap, text: "text-white" },
];

export function IncidentCategoryCarousel() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    return (
        <section className="py-2">
            <div className="px-4 mb-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {selectedCategory ? `Filtering: ${selectedCategory}` : "Tactical Overview"}
                    </span>
                    {selectedCategory && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-2 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setSelectedCategory(null)}
                        >
                            <X className="w-3 h-3 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
                <div className="flex text-slate-400">
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>

            <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory perspective-1000">
                <AnimatePresence>
                    {categories.map((cat, i) => {
                        const isSelected = selectedCategory === cat.title;
                        const isDimmed = selectedCategory && !isSelected;

                        return (
                            <motion.div
                                key={cat.title}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{
                                    opacity: isDimmed ? 0.3 : 1,
                                    x: 0,
                                    scale: isSelected ? 1.05 : isDimmed ? 0.95 : 1
                                }}
                                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedCategory(isSelected ? null : cat.title)}
                                className="snap-start min-w-[150px] md:min-w-[200px]"
                            >
                                <div className={`relative h-28 md:h-36 rounded-2xl bg-gradient-to-br ${cat.gradient} p-4 flex flex-col justify-between shadow-lg ${cat.shadow} hover:shadow-xl transition-all overflow-hidden group cursor-pointer ${isSelected ? 'ring-4 ring-offset-2 ring-red-100 shadow-2xl' : ''}`}>

                                    {/* Decorative Icon */}
                                    <div className="absolute -right-6 -top-6 opacity-20 group-hover:opacity-30 transition-opacity rotate-12 scale-150">
                                        <cat.icon className="w-24 h-24 text-white" />
                                    </div>

                                    <div className="relative z-10 flex justify-between items-start">
                                        <div className={`p-2 backdrop-blur-sm rounded-full transition-colors ${isSelected ? 'bg-white text-slate-900' : 'bg-white/20 text-white'}`}>
                                            <cat.icon className="w-5 h-5" />
                                        </div>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="bg-white text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            >
                                                ACTIVE
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="relative z-10 text-white">
                                        <span className="text-3xl font-black block tracking-tight">{cat.count}</span>
                                        <span className="text-xs font-bold uppercase tracking-wide opacity-90">{cat.title}</span>
                                    </div>

                                    {/* Glass overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </section>
    );
}
