import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Package, Clock, ArrowRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIncidents } from "@/hooks/use-incidents";

const severityConfig = {
    critical: { label: "CRITICAL", bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
    high: { label: "HIGH", bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
    medium: { label: "MEDIUM", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
};

const incidentImages: Record<string, string> = {
    'flood': 'https://images.unsplash.com/photo-1547683905-f686c993aee5?auto=format&fit=crop&q=80&w=200',
    'fire': 'https://images.unsplash.com/photo-1494578379344-d6c7102ed142?auto=format&fit=crop&q=80&w=200',
    'structural': 'https://images.unsplash.com/photo-1588661642211-1a8585f67a6d?auto=format&fit=crop&q=80&w=200',
    'default': 'https://images.unsplash.com/photo-1584282470729-0524ba3acb8c?auto=format&fit=crop&q=80&w=200'
};

export function IncidentPanel() {
    const { data: incidents, isLoading } = useIncidents();

    if (isLoading) {
        return <div className="p-4">Loading Incidents...</div>
    }

    return (
        <Card className="h-full border-none shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-2 rounded-full dark:bg-red-900/20">
                        <Activity className="h-5 w-5 text-red-500" />
                    </div>
                    <CardTitle className="text-lg font-bold">Live Incidents</CardTitle>
                </div>
                <Badge variant="outline" className="animate-pulse bg-red-50 text-red-600 border-red-200">{incidents?.length || 0} Active</Badge>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {incidents?.map((incident) => (
                    <div key={incident.id} className="group flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:bg-slate-800">

                        {/* Image */}
                        <div className="relative w-full md:w-28 h-28 shrink-0 rounded-lg overflow-hidden">
                            <img
                                src={incidentImages[incident.type as string] || incidentImages.default}
                                alt={incident.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", severityConfig[incident.severity as keyof typeof severityConfig].bg, severityConfig[incident.severity as keyof typeof severityConfig].text, severityConfig[incident.severity as keyof typeof severityConfig].border)}>
                                            {severityConfig[incident.severity as keyof typeof severityConfig].label}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">{incident.id}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {incident.eta || 'Now'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-primary transition-colors">{incident.title}</h3>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {incident.locationAddress}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5" title="Affected Population">
                                        <Users className="h-3.5 w-3.5 text-slate-400" />
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{incident.affectedPopulation}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Deployed Resources">
                                        <Package className="h-3.5 w-3.5 text-slate-400" />
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{incident.assignedResources?.length || 0} Units</span>
                                    </div>
                                </div>

                                <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 -mr-2">
                                    Manage <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
