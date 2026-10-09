import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressDotsProps {
    total: number;
    current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
    return (
        <div className="flex gap-2">
            {Array.from({ length: total }).map((_, i) => (
                <motion.div
                    key={i}
                    className={cn(
                        "h-2 rounded-full bg-slate-200 dark:bg-slate-800",
                    )}
                    initial={false}
                    animate={{
                        width: i === current ? 32 : 8,
                        backgroundColor: i === current ? "#0d9488" : "var(--slate-200)" // teal-600
                    }}
                    transition={{ duration: 0.3 }}
                />
            ))}
        </div>
    );
}
