import { motion, useSpring, useTransform, useMotionValue, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertTriangle, Users, ShieldCheck, Navigation, ArrowUp, ArrowDown, Activity, Map, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Animated Counter Component
function Counter({ value }: { value: number }) {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
    const rounded = useTransform(springValue, (latest) => Math.round(latest));

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    return <motion.span>{rounded}</motion.span>;
}

const metrics = [
    {
        label: "Active Incidents",
        value: 12,
        trend: "+3",
        trendUp: true,
        color: "text-red-600",
        icon: AlertTriangle,
        bg: "bg-red-50",
        border: "border-red-100",
        shadow: "shadow-red-100",
        gradient: "from-red-500/10 to-red-500/5",
        actions: [
            { label: "View on Map", icon: Map },
            { label: "Details", icon: ArrowRight }
        ]
    },
    {
        label: "Units Deployed",
        value: 45,
        trend: "+8",
        trendUp: true,
        color: "text-blue-600",
        icon: Navigation,
        bg: "bg-blue-50",
        border: "border-blue-100",
        shadow: "shadow-blue-100",
        gradient: "from-blue-500/10 to-blue-500/5",
        actions: [
            { label: "Track Units", icon: Map },
            { label: "Dispatch", icon: ArrowRight }
        ]
    },
    {
        label: "Safe Zones",
        value: 8,
        trend: "Stable",
        trendUp: null, // Stable
        color: "text-emerald-600",
        icon: ShieldCheck,
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        shadow: "shadow-emerald-100",
        gradient: "from-emerald-500/10 to-emerald-500/5",
        actions: [
            { label: "Locate", icon: Map },
            { label: "Capacity", icon: ArrowRight }
        ]
    },
    {
        label: "Volunteers",
        value: 120,
        trend: "+14",
        trendUp: true,
        color: "text-amber-600",
        icon: Users,
        bg: "bg-amber-50",
        border: "border-amber-100",
        shadow: "shadow-amber-100",
        gradient: "from-amber-500/10 to-amber-500/5",
        actions: [
            { label: "Contact", icon: Users },
            { label: "List", icon: ArrowRight }
        ]
    },
];

export function LiveMetricsGrid() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 p-4">
            {metrics.map((m, i) => (
                <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onHoverStart={() => setHoveredIndex(i)}
                    onHoverEnd={() => setHoveredIndex(null)}
                    className="relative group h-full"
                >
                    <Card className={`relative bg-white/90 backdrop-blur-sm border ${m.border} shadow-lg hover:shadow-2xl hover:-translate-y-1 ${m.shadow} transition-all duration-300 overflow-hidden h-full`}>
                        {/* Interactive Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        {/* Background Icon */}
                        <div className={`absolute -right-8 -top-8 p-3 opacity-[0.05] group-hover:opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                            <m.icon className={`w-32 h-32 ${m.color}`} />
                        </div>

                        <CardContent className="p-4 md:p-6 relative z-10 flex flex-col justify-between h-full min-h-[140px]">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-slate-500 text-[10px] md:text-xs uppercase font-extrabold tracking-widest">{m.label}</p>
                                <div className={`p-2 rounded-xl ${m.bg} ring-1 ring-inset ring-black/5`}>
                                    <m.icon className={`w-4 h-4 ${m.color}`} />
                                </div>
                            </div>

                            {/* Main Value & Trend */}
                            <div className="flex items-end gap-3 mt-auto">
                                <span className={`text-4xl md:text-5xl font-black ${m.color} tabular-nums tracking-tighter leading-none`}>
                                    <Counter value={m.value} />
                                </span>

                                <div className="flex flex-col mb-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${m.trendUp === true ? 'bg-red-100 text-red-600' : m.trendUp === false ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {m.trendUp === true && <ArrowUp className="w-3 h-3 mr-1" />}
                                        {m.trendUp === false && <ArrowDown className="w-3 h-3 mr-1" />}
                                        {m.trendUp === null && <Activity className="w-3 h-3 mr-1" />}
                                        {m.trend}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions Overlay */}
                            <AnimatePresence>
                                {hoveredIndex === i && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute inset-x-0 bottom-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-100 flex gap-2 justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
                                    >
                                        {m.actions.map((action, idx) => (
                                            <Button
                                                key={idx}
                                                size="sm"
                                                variant="ghost"
                                                className={`h-8 text-xs font-bold ${m.color.replace('text-', 'hover:bg-').replace('600', '50')} hover:text-slate-900 w-full flex items-center justify-center gap-2`}
                                            >
                                                <action.icon className="w-3 h-3" />
                                                {action.label}
                                            </Button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>

                        {/* Animated Progress Line - Only shows when NOT hovering for cleaner look */}
                        <motion.div
                            animate={{ opacity: hoveredIndex === i ? 0 : 0.6 }}
                            className="absolute bottom-0 w-full h-1 bg-slate-100/50"
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                                className={`h-full ${m.color.replace('text-', 'bg-')}`}
                            />
                        </motion.div>
                    </Card>
                </motion.div>
            ))}
        </section>
    );
}
