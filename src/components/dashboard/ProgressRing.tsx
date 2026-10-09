
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressRingProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: string; // Tailwind text color class e.g. "text-emerald-500"
    trackColor?: string;
    children?: React.ReactNode;
}

export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 8,
    color = "text-emerald-500",
    trackColor = "text-slate-100 dark:text-slate-800",
    children
}: ProgressRingProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        // Simple animation delay
        const timer = setTimeout(() => {
            setAnimatedProgress(progress);
        }, 300);
        return () => clearTimeout(timer);
    }, [progress]);

    const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90 transition-all duration-300"
            >
                {/* Track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className={trackColor}
                    stroke="currentColor"
                />
                {/* Progress */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={cn(color, "transition-all duration-1500 ease-out")}
                    stroke="currentColor"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
