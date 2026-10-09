import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package, Truck, BriefcaseMedical } from "lucide-react";

// Mock data
const resources = [
    { name: "Sandbags", category: "supplies", available: 450, total: 1000, color: "bg-blue-500", icon: Package },
    { name: "Ambulances", category: "transport", available: 8, total: 12, color: "bg-red-500", icon: Truck },
    { name: "First Aid Kits", category: "medical", available: 120, total: 200, color: "bg-emerald-500", icon: BriefcaseMedical },
];

export function ResourceOverview() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resource Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {resources.map((res, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <res.icon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{res.name}</span>
                            </div>
                            <span className="text-muted-foreground text-xs">{res.available} / {res.total}</span>
                        </div>
                        <Progress value={(res.available / res.total) * 100} className="h-1.5" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
