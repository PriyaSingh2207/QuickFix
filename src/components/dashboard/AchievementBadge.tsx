
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface AchievementBadgeProps {
    icon: LucideIcon;
    title: string;
    description: string;
    isUnlocked: boolean;
    dateUnlocked?: string;
}

export function AchievementBadge({ icon: Icon, title, description, isUnlocked, dateUnlocked }: AchievementBadgeProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "relative h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-help",
                        isUnlocked
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent shadow-lg shadow-indigo-500/30 hover:scale-110"
                            : "bg-slate-100 border-slate-200 grayscale opacity-60"
                    )}>
                        <Icon className={cn("h-6 w-6", isUnlocked ? "text-white" : "text-slate-400")} />

                        {/* Glow for unlocked */}
                        {isUnlocked && (
                            <div className="absolute inset-0 rounded-full bg-indigo-500 blur-md opacity-20 animate-pulse" />
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-slate-800">
                    <div className="space-y-1">
                        <p className="font-bold text-xs flex items-center gap-2">
                            {title}
                            {isUnlocked && <span className="text-emerald-400 text-[10px]">✓ Unlocked</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 max-w-[150px]">{description}</p>
                        {dateUnlocked && <p className="text-[9px] text-slate-500">Earned: {dateUnlocked}</p>}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
