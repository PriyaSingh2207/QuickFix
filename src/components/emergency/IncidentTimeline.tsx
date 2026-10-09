
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Clock, MapPin, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MOCK_INCIDENTS } from "./data";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function IncidentTimeline() {
    const [filter, setFilter] = useState<'all' | 'critical'>('all');

    // Simulate sorting: Critical first if filtered
    const sortedIncidents = [...MOCK_INCIDENTS].sort((a, b) => {
        if (filter === 'critical') {
            return (a.severity === 'critical' ? -1 : 1) - (b.severity === 'critical' ? -1 : 1);
        }
        return 0; // Default order (mock data assumed sorted by time)
    });

    return (
        <div className="h-full flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Header with Filters */}
            <div className="p-3 border-b border-slate-200 bg-white flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2 text-slate-800">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        Live Feed
                    </h3>
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 flex items-center gap-1">
                        <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        {MOCK_INCIDENTS.length} Active
                    </Badge>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        className={`h-7 text-xs rounded-full ${filter === 'all' ? 'bg-slate-800' : 'bg-white border-slate-200 text-slate-500'}`}
                        onClick={() => setFilter('all')}
                    >
                        All Updates
                    </Button>
                    <Button
                        variant={filter === 'critical' ? 'default' : 'outline'}
                        size="sm"
                        className={`h-7 text-xs rounded-full ${filter === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-white border-slate-200 text-slate-500'}`}
                        onClick={() => setFilter('critical')}
                    >
                        Critical Only
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-3 bg-slate-50/50">
                <div className="space-y-3 pb-4">
                    <AnimatePresence mode="popLayout">
                        {sortedIncidents.map((inc, i) => (
                            <motion.div
                                key={inc.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                className="group bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all relative overflow-hidden"
                            >
                                {/* SLA Timer / Status Strip */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1",
                                    inc.severity === 'critical' ? "bg-red-500" : "bg-amber-400"
                                )} />

                                {/* Header Line */}
                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className={cn(
                                                "uppercase text-[10px] h-5 px-1.5 font-bold tracking-wider",
                                                inc.severity === 'critical' ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                            )}>
                                                {inc.type}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center">
                                                ID-{inc.id.slice(0, 4)}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 leading-tight text-sm">{inc.title}</h4>
                                    </div>

                                    {/* Action Trigger */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                                        <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-slate-100">
                                            <ArrowRight className="w-3 h-3 text-slate-400" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Timer & Location */}
                                <div className="flex items-center gap-4 pl-2 text-xs text-slate-500 mb-3">
                                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                        <Clock className="w-3 flex-shrink-0 h-3" />
                                        <span>{formatDistanceToNow(inc.timestamp, { addSuffix: true })}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{inc.location}</span>
                                    </div>
                                </div>

                                {/* Footer Action Bar */}
                                <div className="pl-2 pt-2 border-t border-slate-50 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-1.5">
                                            {/* Dummy Avatar Stack */}
                                            <div className="w-5 h-5 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[8px] font-bold text-blue-700">A</div>
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 border border-white flex items-center justify-center text-[8px] font-bold text-emerald-700">M</div>
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-600">
                                            {inc.units_deployed} Response Units
                                        </span>
                                    </div>

                                    {/* SLA Status Indicator */}
                                    {inc.severity === 'critical' ? (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 animate-pulse">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                            ACTION REQ
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                            <CheckCircle2 className="w-3 h-3" />
                                            DISPATCHED
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </div>
    );
}
