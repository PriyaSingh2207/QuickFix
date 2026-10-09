
import {
    HeartPulse, Activity, Zap, Waves, Flame, Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GuideIllustrationProps {
    guideId: string;
    stepIndex: number;
    className?: string;
}

export function GuideIllustration({ guideId, stepIndex, className }: GuideIllustrationProps) {
    // Dynamic background color based on guide type
    const bgColors: Record<string, string> = {
        'cpr': 'bg-rose-100 dark:bg-rose-900/30 text-rose-600',
        'fire': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
        'flood': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
        'bleeding': 'bg-red-100 dark:bg-red-900/30 text-red-600',
        'shock': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    };

    const colorClass = bgColors[guideId] || 'bg-slate-100 text-slate-600';

    return (
        <div className={cn(
            "w-full aspect-video rounded-3xl flex items-center justify-center relative overflow-hidden transition-all duration-500",
            colorClass,
            className
        )}>
            {/* Abstract Medical Background Shapes */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-current blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 rounded-full bg-current blur-2xl" />
            </div>

            {/* Central Illustrative Icon */}
            <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-500">
                {/* Specific Icon Login per Guide/Step could go here. For now, we show a large representative icon */}
                {guideId === 'cpr' && (
                    stepIndex === 3 ? <Activity className="w-32 h-32 animate-pulse" /> :
                        stepIndex === 5 ? <Zap className="w-32 h-32" /> :
                            <HeartPulse className="w-32 h-32" />
                )}

                {guideId === 'fire' && <Flame className="w-32 h-32 animate-bounce" />}
                {guideId === 'flood' && <Waves className="w-32 h-32" />}
                {guideId === 'bleeding' && <Stethoscope className="w-32 h-32" />}
                {guideId === 'shock' && <Zap className="w-32 h-32" />}

                {/* Decorative Elements */}
                <div className="mt-4 flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                    <span className="w-2 h-2 rounded-full bg-current opacity-30" />
                </div>
            </div>

            {/* Step Number Overlay */}
            <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/40 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                Step {stepIndex + 1} Visual
            </div>
        </div>
    );
}
