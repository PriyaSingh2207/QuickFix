
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StatCounterProps {
    value: number;
    duration?: number; // ms
    className?: string;
    prefix?: string;
    suffix?: string;
}

export function StatCounter({ value, duration = 2000, className, prefix = "", suffix = "" }: StatCounterProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const startValue = 0;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            setCount(Math.floor(startValue + (value - startValue) * ease));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <span className={cn("tabular-nums", className)}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}
