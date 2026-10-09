import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Check, X, Truck, Home } from "lucide-react";

const aiRecommendations = [
    {
        id: "REC-001",
        type: "resource",
        title: "Deploy 2 Amphibious Vehicles",
        description: "Flood levels in Sector 4 exceeding 2ft. Wheeled vehicles at risk.",
        impact: "high",
        confidence: 94,
        eta: "15 mins",
        icon: Truck,
        color: "text-blue-600",
        bg: "bg-blue-100"
    },
    {
        id: "REC-002",
        type: "evacuation",
        title: "Evacuate Low-Lying Slums",
        description: "Water flow algorithm predicts inundation in next 45 mins.",
        impact: "critical",
        confidence: 88,
        eta: "Immediate",
        icon: Home,
        color: "text-red-600",
        bg: "bg-red-100"
    }
];

export function AIRecommendations() {
    return (
        <Card className="h-full border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-transparent shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">AI Recommendations</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {aiRecommendations.map((rec) => (
                    <div key={rec.id} className="p-4 rounded-lg border bg-white/80 backdrop-blur-sm shadow-sm space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className={`p-2 rounded-lg ${rec.bg} h-fit`}>
                                    <rec.icon className={`h-5 w-5 ${rec.color}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">{rec.title}</h4>
                                        <Badge variant={rec.impact === 'critical' ? 'destructive' : 'default'} className="text-[10px] px-1.5 uppercase">
                                            {rec.impact}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        {rec.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-lg font-bold text-purple-600">{rec.confidence}%</div>
                                <div className="text-[10px] text-muted-foreground uppercase">Confidence</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-medium text-muted-foreground">ETA: {rec.eta}</span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                    <X className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
                                    <Check className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
