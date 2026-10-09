
import { Progress } from "@/components/ui/progress";
import { Sparkles, Trophy, ChevronRight } from "lucide-react";

interface PointsBannerProps {
    points: number;
    onOpenGuide: () => void;
}

export function PointsBanner({ points, onOpenGuide }: PointsBannerProps) {
    // Level logic
    const nextLevel = Math.ceil((points + 1) / 500) * 500;
    const progress = (points % 500) / 500 * 100;
    const level = Math.floor(points / 500) + 1;

    return (
        <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 p-6 mb-8 transition-all duration-300 shadow-sm animate-in slide-in-from-top-2">
            <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">

                {/* Points Display */}
                <div className="flex items-center gap-5 w-full md:w-auto group">
                    <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 flex items-center justify-center shadow-lg shadow-yellow-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        <Trophy className="w-8 h-8 fill-yellow-100 text-yellow-800 drop-shadow-sm" />
                        <div className="absolute inset-0 bg-white/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Balance</div>
                        <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                            {points.toLocaleString()}
                            <span className="text-sm font-bold text-teal-700 bg-teal-100/80 border border-teal-200 px-2 py-0.5 rounded-full transform translate-y-1">PTS</span>
                        </div>
                    </div>
                </div>

                {/* Level Progress */}
                <div className="flex-1 w-full md:max-w-xl group cursor-default bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold mb-3 px-1">
                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                            Level {level} Citizen
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                            {points} / {nextLevel} PTS
                        </span>
                    </div>
                    <div className="relative h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner ring-1 ring-black/5 dark:ring-white/5">
                        <Progress value={progress} className="h-full bg-transparent" indicatorClassName="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out" />
                    </div>
                    <div className="flex justify-between items-center mt-2 px-1">
                        <p className="text-[10px] font-medium text-slate-400">
                            Current Tier
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">
                            {nextLevel - points} pts to <span className="underline decoration-indigo-300">Level {level + 1}</span>
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center justify-end">
                    <button
                        className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 px-5 py-3 rounded-xl transition-all border border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-md"
                        onClick={onOpenGuide}
                    >
                        <Sparkles className="w-5 h-5 text-orange-400 group-hover:rotate-12 transition-transform" />
                        <span>Earn More</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </button>
                </div>

            </div>
        </div>
    );
}
