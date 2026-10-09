
import { User, AlertTriangle, ShieldCheck, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_UPDATES } from "./data";
import { useState } from "react";
import { motion } from "framer-motion";

export function CommunityIntelFeed() {
    const [votes, setVotes] = useState<Record<string, number>>({});
    const [userVoted, setUserVoted] = useState<Record<string, boolean>>({});

    const handleVerify = (id: string) => {
        if (userVoted[id]) return;
        setVotes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
        setUserVoted(prev => ({ ...prev, [id]: true }));
    };

    return (
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-slate-900">
                    <User className="w-5 h-5 text-indigo-500" />
                    Community Intel
                </h3>
                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-600 border-indigo-200">
                    Crowdsourced
                </Badge>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[500px] p-2 space-y-3">
                {MOCK_UPDATES.map(update => {
                    const currentVotes = (votes[update.id] || 0) + update.helpful_count;
                    const isVoted = userVoted[update.id];

                    return (
                        <motion.div
                            key={update.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow relative overflow-hidden group"
                        >
                            {/* Credibility Sidebar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${update.user.credibility > 80 ? 'bg-emerald-400' : 'bg-amber-400'}`} />

                            <div className="flex gap-3 pl-2">
                                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${update.user.name}`} />
                                    <AvatarFallback>{update.user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                                                {update.user.name}
                                                {update.user.credibility > 85 && (
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <span className="font-medium text-slate-500">@{update.location}</span>
                                                <span>• 5m ago</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Trust Score</div>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-auto">
                                                <div
                                                    className={`h-full rounded-full ${update.user.credibility > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${update.user.credibility}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-700 mt-2 leading-snug">{update.message}</p>

                                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50">
                                        <Button
                                            size="sm"
                                            variant={isVoted ? "secondary" : "ghost"}
                                            className={`h-7 text-xs gap-1.5 ${isVoted ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                            onClick={() => handleVerify(update.id)}
                                        >
                                            <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-current' : ''}`} />
                                            Verify ({currentVotes})
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 ml-auto">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            Flag
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
