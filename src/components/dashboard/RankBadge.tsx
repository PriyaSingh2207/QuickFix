
import { cn } from "@/lib/utils";
import { Medal, Star, Trophy } from "lucide-react";

export type Rank = 'Bronze' | 'Silver' | 'Gold';

interface RankBadgeProps {
    rank: Rank;
    size?: 'sm' | 'md' | 'lg';
    showTitle?: boolean;
}

const rankConfig = {
    Bronze: {
        color: "text-amber-700",
        bg: "bg-amber-100/50",
        border: "border-amber-200",
        icon: Medal,
        gradient: "from-amber-700 to-orange-400"
    },
    Silver: {
        color: "text-slate-500",
        bg: "bg-slate-100/50",
        border: "border-slate-200",
        icon: Star,
        gradient: "from-slate-400 to-slate-200"
    },
    Gold: {
        color: "text-yellow-600",
        bg: "bg-yellow-100/50",
        border: "border-yellow-200",
        icon: Trophy,
        gradient: "from-yellow-500 to-amber-300"
    }
};

export function RankBadge({ rank, size = 'md', showTitle = true }: RankBadgeProps) {
    const config = rankConfig[rank];
    const Icon = config.icon;

    const sizeClasses = {
        sm: "h-8 w-8 p-1.5",
        md: "h-12 w-12 p-2.5",
        lg: "h-16 w-16 p-3"
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={cn(
                "rounded-full border shadow-sm flex items-center justify-center relative group overflow-hidden",
                config.bg,
                config.border,
                sizeClasses[size]
            )}>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-10" />

                <Icon className={cn("w-full h-full fill-current drop-shadow-sm", config.color)} />
            </div>
            {showTitle && (
                <span className={cn("font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r", config.gradient, size === 'sm' ? 'text-[10px]' : 'text-xs')}>
                    {rank} Citizen
                </span>
            )}
        </div>
    );
}
