import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Users, MessageSquare, UserPlus, Sparkles
} from "lucide-react";
import { JoinSquadModal } from "./JoinSquadModal";
import { cn } from "@/lib/utils";

// Dummy Volunteers Data
const NEARBY_VOLUNTEERS = [
    { id: 1, name: "Rahul S.", role: "First Aid", status: "online", img: "https://i.pravatar.cc/150?u=1", points: 1250 },
    { id: 2, name: "Priya M.", role: "Rescue", status: "busy", img: "https://i.pravatar.cc/150?u=2", points: 980 },
    { id: 3, name: "Amit K.", role: "Cleanup", status: "offline", img: "https://i.pravatar.cc/150?u=3", points: 750 },
    { id: 4, name: "Sneha L.", role: "Medical", status: "online", img: "https://i.pravatar.cc/150?u=4", points: 1540 },
    { id: 5, name: "Vikram R.", role: "Traffic", status: "online", img: "https://i.pravatar.cc/150?u=5", points: 890 },
    { id: 6, name: "Neha P.", role: "Supply", status: "online", img: "https://i.pravatar.cc/150?u=6", points: 670 },
    { id: 7, name: "Ravi T.", role: "Patrol", status: "busy", img: "https://i.pravatar.cc/150?u=7", points: 520 },
];

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
    const displayVolunteers = NEARBY_VOLUNTEERS.slice(0, 5);
    const overflowCount = NEARBY_VOLUNTEERS.length - displayVolunteers.length;

    return (
        <div className="space-y-6">

            {/* 1. Squad Members — Avatar Stack */}
            <div className="glass-card p-6 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

                <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="gradient-icon-blue p-2.5 rounded-xl text-white">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 leading-tight">
                                Squad Members
                            </h3>
                            <p className="text-xs font-medium text-slate-400">Active near you</p>
                        </div>
                    </div>
                    <JoinSquadModal>
                        <Button size="sm" className="h-9 rounded-full px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/30 dark:shadow-none transition-all hover:scale-105">
                            <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Join
                        </Button>
                    </JoinSquadModal>
                </div>

                {/* Horizontal Avatar Stack */}
                <div className="flex items-center gap-1 relative z-10">
                    <div className="flex -space-x-3">
                        {displayVolunteers.map((vol) => (
                            <div key={vol.id} className="relative group">
                                <div className={cn(
                                    "rounded-full p-0.5 transition-transform hover:scale-110 hover:z-10",
                                    vol.status === 'online' ? "bg-gradient-to-tr from-blue-400 to-blue-600" :
                                        vol.status === 'busy' ? "bg-gradient-to-tr from-amber-400 to-amber-600" :
                                            "bg-slate-200"
                                )}>
                                    <Avatar className="w-12 h-12 border-[3px] border-white dark:border-slate-900">
                                        <AvatarImage src={vol.img} />
                                        <AvatarFallback>{vol.name[0]}</AvatarFallback>
                                    </Avatar>
                                </div>
                                {/* Active Pulse Dot */}
                                {vol.status === 'online' && (
                                    <span className="absolute bottom-0.5 right-0.5 flex h-3 w-3 z-20">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                                    </span>
                                )}

                                {/* Tooltip on hover */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass-card px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                                    {vol.name}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* +N Overflow */}
                    {overflowCount > 0 && (
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 border-[3px] border-white dark:border-slate-900 flex items-center justify-center text-sm font-bold text-blue-600 -ml-3 z-10 hover:scale-110 transition-transform cursor-pointer">
                            +{overflowCount}
                        </div>
                    )}
                </div>

                {/* Role Tags */}
                <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                    {displayVolunteers.slice(0, 3).map(vol => (
                        <Badge key={vol.id} variant="secondary" className="text-[9px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 border-0 px-2 py-0.5">
                            {vol.name.split(' ')[0]} · {vol.role}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* 2. Community Poll */}
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
