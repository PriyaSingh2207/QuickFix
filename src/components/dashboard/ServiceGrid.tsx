import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Droplets, Zap, TreePine, Construction, Stethoscope, School, Landmark } from "lucide-react";

const services = [
    { title: "Waste Pickup", icon: Truck, color: "text-green-600", bg: "bg-green-100" },
    { title: "Water Supply", icon: Droplets, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Electricity", icon: Zap, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Horticulture", icon: TreePine, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Road Works", icon: Construction, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Health", icon: Stethoscope, color: "text-red-600", bg: "bg-red-100" },
    { title: "Education", icon: School, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Property Tax", icon: Landmark, color: "text-purple-600", bg: "bg-purple-100" },
];

export function ServiceGrid() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Municipal Services</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {services.map((service, index) => (
                    <button key={index} className="flex flex-col items-center justify-center p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors gap-3 group">
                        <div className={`p-3 rounded-full ${service.bg} group-hover:scale-110 transition-transform`}>
                            <service.icon className={`h-6 w-6 ${service.color}`} />
                        </div>
                        <span className="text-sm font-medium text-center">{service.title}</span>
                    </button>
                ))}
            </CardContent>
        </Card>
    );
}
