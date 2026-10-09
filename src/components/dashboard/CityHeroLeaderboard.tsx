import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeaderboardRow } from "./LeaderboardRow";
import { LeaderboardTabs } from "./LeaderboardTabs";
import { Trophy, Crown, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";

interface HeroProfile {
    id: string;
    name: string;
    avatar_url: string;
    city: string;
    points: number;
    reports_count: number;
    resolved_count: number;
    rank_change?: 'up' | 'down' | 'same';
}

function PodiumItem({ hero, rank }: { hero: HeroProfile, rank: number }) {
    if (!hero) return null;

    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const isThird = rank === 3;

    const medalGradient = isFirst
        ? "from-yellow-400 to-amber-600"
        : isSecond
            ? "from-slate-300 to-slate-500"
            : "from-amber-600 to-amber-800";

    const medalShadow = isFirst
        ? "shadow-yellow-200/50"
        : isSecond
            ? "shadow-slate-200/50"
            : "shadow-amber-200/50";

    return (
        <div
            className={cn(
                "relative flex flex-col items-center anim-fade-up",
                isFirst ? "order-2 -mt-6 z-10" :
                    isSecond ? "order-1 mt-4" :
                        "order-3 mt-8"
            )}
            style={{ animationDelay: `${rank * 100}ms` }}
        >
            {/* Crown/Medal */}
            <div className="mb-2">
                {isFirst && <Crown className="w-8 h-8 text-yellow-500 fill-yellow-200 drop-shadow-lg" style={{ animation: 'fadeUp 0.6s ease-out 0.3s both' }} />}
                {isSecond && <div className="text-2xl">🥈</div>}
                {isThird && <div className="text-2xl">🥉</div>}
            </div>

            {/* Avatar with Gradient Ring */}
            <div className={cn(
                "relative rounded-full p-1 bg-gradient-to-b shadow-xl",
                medalGradient,
                medalShadow
            )}>
                <Avatar className={cn(
                    "border-4 border-white dark:border-slate-900",
                    isFirst ? "w-24 h-24" : "w-16 h-16"
                )}>
                    <AvatarImage src={hero.avatar_url} />
                    <AvatarFallback className="text-lg font-bold">{hero.name[0]}</AvatarFallback>
                </Avatar>

                {/* Rank Badge */}
                <div className={cn(
                    "absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white text-white",
                    isFirst ? "bg-yellow-500" :
                        isSecond ? "bg-slate-500" :
                            "bg-amber-600"
                )}>
                    {rank}
                </div>
            </div>

            {/* Name & Stats */}
            <div className="text-center mt-3">
                <h3 className={cn("font-extrabold text-slate-900 dark:text-white line-clamp-1 max-w-[120px]", isFirst ? "text-lg" : "text-sm")}>
                    {hero.name}
                </h3>
                <div className="flex items-center justify-center gap-1 font-bold text-blue-600">
                    <Sparkles className="w-3 h-3" />
                    <span className="count-animate">{hero.points}</span>
                </div>
            </div>
        </div>
    );
}

export function CityHeroLeaderboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
    const { data: heroes = [], isLoading: loading } = useQuery({
        queryKey: ['heroes', 'leaderboard', activeTab],
        queryFn: () => db.getHeroesSimple(10),
    });

    const podiumHeroes = heroes.slice(0, 3);

    return (
        <div className="glass-card p-6 overflow-hidden relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="gradient-icon-orange p-2 rounded-xl text-white">
                            <Trophy className="w-5 h-5" />
                        </div>
                        City Heroes
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Top contributors making Indore safer</p>
                </div>
                <LeaderboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            ) : heroes.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-slate-400">
                    <Trophy className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">No heroes found.</p>
                    <p className="text-xs opacity-70">Be the first to earn points!</p>
                </div>
            ) : (
                <>
                    {/* Podium */}
                    <div className="flex justify-center items-end gap-2 md:gap-8 mb-10 min-h-[180px]">
                        {podiumHeroes[1] && <PodiumItem hero={podiumHeroes[1]} rank={2} />}
                        {podiumHeroes[0] && <PodiumItem hero={podiumHeroes[0]} rank={1} />}
                        {podiumHeroes[2] && <PodiumItem hero={podiumHeroes[2]} rank={3} />}
                    </div>

                    {/* Compact List for 4-7 */}
                    <div className="glass-card p-4 !rounded-2xl">
                        <div className="space-y-1">
                            {heroes.slice(3, 7).map((hero, index) => {
                                const rank = index + 4;
                                return (
                                    <div key={hero.id} className="anim-fade-up" style={{ animationDelay: `${rank * 50}ms` }}>
                                        <LeaderboardRow
                                            rank={rank}
                                            name={hero.name}
                                            avatar={hero.avatar_url}
                                            points={hero.points}
                                            reports={hero.reports_count}
                                            resolved={hero.resolved_count}
                                            isCurrentUser={hero.id === user?.id}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Decorative Background Gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/8 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/8 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        </div>
    );
}
