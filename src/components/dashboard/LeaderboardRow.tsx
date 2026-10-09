
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardRowProps {
    rank: number;
    name: string;
    avatar: string;
    points: number;
    reports: number;
    resolved: number;
    isCurrentUser?: boolean;
}

export function LeaderboardRow({ rank, name, avatar, points, reports, resolved, isCurrentUser }: LeaderboardRowProps) {
    return (
        <div
            className={cn(
                "group flex items-center gap-4 p-3 rounded-xl transition-all duration-300",
                isCurrentUser
                    ? "bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900 shadow-sm transform scale-[1.01]"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
            )}
        >
            <div className={cn(
                "w-8 h-8 flex items-center justify-center font-black text-sm rounded-full",
                rank === 1 ? "bg-yellow-100 text-yellow-700" :
                    rank === 2 ? "bg-slate-100 text-slate-700" :
                        rank === 3 ? "bg-amber-100 text-amber-700" :
                            "text-slate-400"
            )}>
                {rank}
            </div>

            <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                <AvatarImage src={avatar} />
                <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <h4 className={cn("font-bold text-sm truncate", isCurrentUser ? "text-teal-900 dark:text-teal-100" : "text-slate-900 dark:text-slate-100")}>
                    {name} {isCurrentUser && <span className="ml-2 text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                </h4>
                <p className="text-xs text-slate-500 truncate flex items-center gap-2">
                    <span>{reports} reports</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{resolved} resolved</span>
                </p>
            </div>

            <div className="text-right">
                <div className="font-black text-slate-900 dark:text-white flex items-center justify-end gap-1">
                    {points} <span className="text-[10px] text-slate-400 font-bold uppercase">Pts</span>
                </div>
                {rank <= 3 && (
                    <div className="flex justify-end mt-0.5">
                        {rank === 1 && <Trophy className="w-3 h-3 text-yellow-500 fill-current" />}
                        {rank === 2 && <Medal className="w-3 h-3 text-slate-400 fill-current" />}
                        {rank === 3 && <Award className="w-3 h-3 text-amber-600 fill-current" />}
                    </div>
                )}
            </div>
        </div>
    );
}
