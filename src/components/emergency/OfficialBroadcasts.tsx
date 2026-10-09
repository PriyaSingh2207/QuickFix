
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, Info, CheckCircle2, Radio } from "lucide-react";
import { useState } from "react";
import { MOCK_ALERTS } from "./data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function OfficialBroadcasts() {
    const [expanded, setExpanded] = useState<string | null>(MOCK_ALERTS[0].id);
    const [acknowledged, setAcknowledged] = useState<string[]>([]);

    const toggleAck = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (acknowledged.includes(id)) return;
        setAcknowledged(prev => [...prev, id]);
    };

    return (
        <section className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                    Official Channels
                </h3>
                <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">
                    LIVE
                </Badge>
            </div>

            <div className="space-y-0 relative pl-4">
                {/* Timeline Connector */}
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />

                {MOCK_ALERTS.map((alert, index) => {
                    const isAck = acknowledged.includes(alert.id);
                    return (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pb-6"
                        >
                            {/* Timeline Node */}
                            <div className={`absolute -left-[29px] top-0 w-6 h-6 rounded-full border-4 border-white dark:border-slate-950 z-10 flex items-center justify-center ${alert.priority === 'critical' ? 'bg-red-500 shadow-red-200 shadow-lg' : 'bg-blue-500 shadow-blue-200'
                                }`}>
                                {alert.priority === 'critical' ? (
                                    <AlertTriangle className="w-3 h-3 text-white" />
                                ) : (
                                    <Info className="w-3 h-3 text-white" />
                                )}
                            </div>

                            <div
                                className={`rounded-xl border shadow-sm transition-all overflow-hidden ${isAck ? 'opacity-60 grayscale-[0.5]' : ''
                                    } ${alert.priority === 'critical'
                                        ? 'bg-white border-red-100 dark:border-red-900/50 shadow-red-50'
                                        : 'bg-white border-slate-200 dark:border-slate-800'
                                    }`}
                            >
                                <div
                                    className="p-4 cursor-pointer"
                                    onClick={() => setExpanded(expanded === alert.id ? null : alert.id)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className={`text-[10px] uppercase border-0 ${alert.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {alert.issuer}
                                                </Badge>
                                                <span className="text-[10px] text-slate-400 font-mono">14:02 IST</span>
                                            </div>
                                            <h4 className="font-bold text-sm text-slate-900 leading-tight">
                                                {alert.title}
                                            </h4>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded === alert.id ? 'rotate-180' : ''}`} />
                                    </div>

                                    <AnimatePresence>
                                        {expanded === alert.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-sm text-slate-600 mt-2 pb-3 leading-relaxed border-b border-slate-100">
                                                    {alert.message}
                                                </p>
                                                <div className="pt-3 flex justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant={isAck ? "outline" : "default"}
                                                        className={`h-8 text-xs gap-2 ${isAck ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'bg-slate-900'}`}
                                                        onClick={(e) => toggleAck(alert.id, e)}
                                                    >
                                                        {isAck ? (
                                                            <>
                                                                <CheckCircle2 className="w-3 h-3" /> Acknowledged
                                                            </>
                                                        ) : (
                                                            "Acknowledge Receipt"
                                                        )}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
