
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface StatusMetricCardProps {
    icon: LucideIcon;
    value: number;
    label: string;
    subLabel?: string;
    isCritical?: boolean; // For red pulse/glow
    suffix?: string;      // e.g. "min" or "%"
    color?: string;       // Text/Icon color class, e.g. "text-emerald-500"
    bgColor?: string;     // Icon bg color class
}

export function StatusMetricCard({
    icon: Icon,
    value,
    label,
    subLabel,
    isCritical = false,
    suffix = "",
    color = "text-slate-700",
    bgColor = "bg-white/20"
}: StatusMetricCardProps) {
    // Animation state
    const [displayValue, setDisplayValue] = useState(0);

    // Simple count-up effect
    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        const duration = 2000; // 2s duration
        const incrementTime = 20; // update every 20ms
        const totalSteps = duration / incrementTime;
        const stepValue = (end - start) / totalSteps;

        // If updating from a previous non-zero value, we could animate from there,
        // but for now animating from 0 or just handling the 'value' change is fine.
        // Let's animate from current displayValue to new value for smoother updates?
        // Actually the component might re-mount or value might change.
        // Let's just do a simple transition logic:

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= totalSteps) {
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                setDisplayValue(prev => {
                    const next = prev + stepValue;
                    return end > prev ? Math.min(next, end) : Math.max(next, end);
                });
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className={cn(
            "group relative flex flex-col items-center justify-center p-3 md:p-4 rounded-[2rem] transition-all duration-300 overflow-hidden",
            "backdrop-blur-md border border-white/10 shadow-lg hover:-translate-y-1 hover:shadow-xl",
            isCritical ? "bg-red-500/10 border-red-500/30" : "bg-white/10 hover:bg-white/20"
        )}>
            {/* Critical Pulse Glow */}
            {isCritical && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 animate-pulse bg-red-500/20 blur-xl" />
                </div>
            )}

            <div className={cn(
                "relative z-10 p-3 rounded-full mb-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                bgColor,
                isCritical && "animate-shake" // We might need to define this animation or standard pulse
            )}>
                <Icon className={cn("h-6 w-6", color, isCritical && "text-red-100")} />
                {isCritical && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <span className={cn("text-3xl font-black tabular-nums tracking-tight drop-shadow-sm", color, isCritical && "text-white")}>
                    {Math.round(displayValue)}{suffix}
                </span>
                <span className={cn("text-xs font-bold uppercase tracking-wider", isCritical ? "text-red-100" : "text-slate-200")}>
                    {label}
                </span>
                {subLabel && (
                    <span className="text-[10px] text-white/60 mt-0.5">{subLabel}</span>
                )}
            </div>
        </div>
    );
}
