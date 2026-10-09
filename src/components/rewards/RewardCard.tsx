
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Lock } from "lucide-react";
import type { Reward } from "./data";
import { cn } from "@/lib/utils";

interface RewardCardProps {
    reward: Reward;
    userPoints: number;
    onRedeem: (reward: Reward) => void;
}

export function RewardCard({ reward, userPoints, onRedeem }: RewardCardProps) {
    const isLocked = userPoints < reward.points;
    const Icon = reward.icon;

    return (
        <div className="group relative">
            <Card className={cn(
                "overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col",
                isLocked && "opacity-90 grayscale-[0.3]"
            )}>
                {/* Image Header */}
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        src={reward.image}
                        alt={reward.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

                    <div className="absolute top-4 right-4">
                        <Badge className="bg-white/90 text-slate-900 backdrop-blur font-bold shadow-sm hover:bg-white text-xs py-1 px-3 rounded-full">
                            {reward.category}
                        </Badge>
                    </div>

                    <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-2 mb-1 opacity-90">
                            <Icon className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{reward.brand}</span>
                        </div>
                        <h3 className="font-bold text-lg leading-tight line-clamp-2">{reward.title}</h3>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col">
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                        {reward.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cost</span>
                            <span className={cn(
                                "text-lg font-bold flex items-center",
                                isLocked ? "text-rose-500" : "text-teal-600"
                            )}>
                                <Coins className="w-4 h-4 mr-1 fill-current" />
                                {reward.points}
                            </span>
                        </div>

                        <Button
                            className={cn(
                                "rounded-xl font-bold shadow-md transition-all",
                                isLocked
                                    ? "bg-slate-100 text-slate-400 hover:bg-slate-200 cursor-not-allowed shadow-none"
                                    : "bg-slate-900 text-white hover:bg-teal-600 hover:shadow-teal-200/50"
                            )}
                            disabled={isLocked}
                            onClick={() => onRedeem(reward)}
                        >
                            {isLocked ? <Lock className="w-4 h-4 mr-2" /> : 'Redeem'}
                            {isLocked ? 'Locked' : 'Now'}
                        </Button>
                    </div>
                </div>
            </Card>

            {isLocked && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white text-xs font-bold py-2 px-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm whitespace-nowrap z-10">
                    Need {reward.points - userPoints} more points
                </div>
            )}
        </div>
    );
}
