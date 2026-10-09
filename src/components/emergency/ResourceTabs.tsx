import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Truck, BriefcaseMedical, Home, Box, GripVertical, Signal, Battery, BatteryMedium, BatteryWarning } from "lucide-react";
import { MOCK_RESOURCES } from "./data";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const categories = [
    { id: "Medical", icon: BriefcaseMedical },
    { id: "Transport", icon: Truck },
    { id: "Shelter", icon: Home },
    { id: "Supplies", icon: Box },
];

function CapacityIndicator({ available, capacity }: { available: number, capacity: number }) {
    const percentage = (available / capacity) * 100;
    let Icon = Battery;

    if (percentage < 30) {
        Icon = BatteryWarning;
    } else if (percentage < 60) {
        Icon = BatteryMedium;
    }

    return (
        <div className="flex items-center gap-2 text-xs">
            <Icon className={`w-3 h-3 ${percentage < 30 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
            <Progress value={percentage} className="h-2 w-16" />
            <span className="font-mono text-[10px] text-slate-500">{Math.round(percentage)}%</span>
        </div>
    );
}

export function ResourceTabs() {
    return (
        <Tabs defaultValue="Medical" className="w-full">
            <TabsList className="w-full justify-start bg-transparent p-0 h-auto border-b border-slate-200 dark:border-slate-800 rounded-none mb-4 gap-4 overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                    <TabsTrigger
                        key={cat.id}
                        value={cat.id}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:shadow-none px-2 pb-2 bg-transparent h-auto"
                    >
                        <div className="flex items-center gap-2 text-slate-500 data-[state=active]:text-red-500 font-bold text-sm">
                            <cat.icon className="w-4 h-4" />
                            {cat.id}
                        </div>
                    </TabsTrigger>
                ))}
            </TabsList>

            {categories.map(cat => (
                <TabsContent key={cat.id} value={cat.id} className="mt-0 space-y-3 min-h-[300px]">
                    {MOCK_RESOURCES.filter(r => r.type === cat.id).length > 0 ? (
                        MOCK_RESOURCES.filter(r => r.type === cat.id).map((res, i) => (
                            <motion.div
                                key={res.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white border border-slate-200 p-3 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group relative pl-10"
                            >
                                {/* Drag Handle Simulation */}
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-400">
                                    <GripVertical className="w-4 h-4" />
                                </div>

                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-start gap-3">
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                                {res.name}
                                                {res.status === 'en_route' && (
                                                    <span className="flex h-2 w-2 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                <Signal className="w-3 h-3 text-emerald-500" />
                                                <span>{res.distance} away</span>
                                                <span className="text-slate-300">•</span>
                                                <span>{res.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 border-0 rounded-full ${res.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                            res.status === 'busy' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {res.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                                    <div className="flex flex-col gap-1 w-full mr-4">
                                        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                            <span>Operational Capacity</span>
                                            <span>{res.available}/{res.capacity} Units</span>
                                        </div>
                                        <CapacityIndicator available={res.available} capacity={res.capacity} />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3 border-2 border-dashed border-slate-100 rounded-xl">
                            <Box className="w-10 h-10 text-slate-200" />
                            <p className="text-sm font-medium">No {cat.id} resources active in this sector.</p>
                            <Button variant="outline" size="sm">Request Deployment</Button>
                        </div>
                    )}
                </TabsContent>
            ))}
        </Tabs>
    );
}
