import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles } from "lucide-react";

export function CommunityZone() {
    const [voted, setVoted] = useState<string | null>(null);
    const [votes, setVotes] = useState({
        "Vijay Nagar": 45,
        "Palasia": 30,
        "Rajwada": 15,
        "Bhawarkua": 10
    });

    const handleVote = (option: string) => {
        if (voted) return;
        setVoted(option);
        setVotes(prev => ({
            ...prev,
            [option as keyof typeof votes]: prev[option as keyof typeof votes] + 1
        }));
    };

    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6">
            {/* Community Live Poll */}
            <div className="glass-card p-6 !bg-gradient-to-br !from-blue-600 !to-indigo-700 text-white relative overflow-hidden !border-blue-500/20">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-[0.03] rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                            <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-100">Live Poll</span>
                        <Badge className="ml-auto bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Active
                        </Badge>
                    </div>

                    <h4 className="text-lg font-bold text-white leading-snug mb-6">
                        Where should we focus our next <span className="text-amber-300">Community Cleanup</span>?
                    </h4>

                    <div className="space-y-3">
                        {Object.entries(votes).map(([option, count]) => {
                            const percent = Math.round((count / totalVotes) * 100);
                            const isSelected = voted === option;

                            return (
                                <div
                                    key={option}
                                    onClick={() => handleVote(option)}
                                    className={`group relative h-12 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${voted
                                        ? 'bg-black/20'
                                        : 'bg-white/10 hover:bg-white/20 active:scale-[0.98]'
                                        }`}
                                >
                                    {voted && (
                                        <div
                                            className="absolute inset-y-0 left-0 bg-white/20 backdrop-blur-md z-0 transition-all duration-1000 ease-out"
                                            style={{ width: `${percent}%` }}
                                        />
                                    )}

                                    {isSelected && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 z-20" />
                                    )}

                                    <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-amber-400 bg-amber-400' : 'border-white/40 group-hover:border-white/60'
                                                }`}>
                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />}
                                            </div>
                                            <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-blue-50'}`}>
                                                {option}
                                            </span>
                                        </div>

                                        {voted && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-1.5 opacity-60">
                                                    {[...Array(Math.min(3, Math.ceil(count / 10)))].map((_, i) => (
                                                        <Avatar key={i} className="w-5 h-5 border border-blue-900/50">
                                                            <AvatarImage src={`https://i.pravatar.cc/100?u=${i + option}`} />
                                                        </Avatar>
                                                    ))}
                                                </div>
                                                <span className="text-sm font-bold text-white">
                                                    {percent}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-5 flex items-center justify-between text-blue-200 text-xs font-medium px-1">
                        <span>{totalVotes} citizens voted</span>
                        <span>Ends in 14h 32m</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
