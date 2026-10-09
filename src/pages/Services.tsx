import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Droplets, Zap, Truck, Cone, Car, Wifi } from "lucide-react";

const SERVICES = [
    {
        id: 'garbage',
        title: 'Sanitation & Waste',
        icon: Truck,
        description: 'Schedule pickups, report overflowing bins or hazards.',
        route: '/services/waste'
    },
    {
        id: 'parking',
        title: 'Parking Permits',
        icon: Car,
        description: 'Apply for resident permits, renew existing ones.',
        route: '/services/parking'
    },
    {
        id: 'electricity',
        title: 'Electricity & Grid',
        icon: Zap,
        description: 'Report power outages, voltage issues, or broken meters.',
        route: '/services/electricity'
    },
    {
        id: 'wifi',
        title: 'Community WiFi',
        icon: Wifi,
        description: 'Report connectivity issues in public zones.',
        route: '/services/wifi'
    },
    {
        id: 'water',
        title: 'Water Supply',
        icon: Droplets,
        description: 'Report leaks, shortages, or quality issues.',
        route: '/complaints?category=Water'
    },
    {
        id: 'road',
        title: 'Roads & Traffic',
        icon: Cone,
        description: 'Potholes, broken streetlights, or blocks.',
        route: '/complaints?category=Roads'
    },
];

export function ServicesPage() {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 pl-0 hover:bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>

            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">City Services</h1>
                <p className="text-muted-foreground mt-2">Select a service to request support, apply for permits, or report issues.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {SERVICES.map((service) => (
                    <Card
                        key={service.id}
                        className={`cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01] duration-200 border-slate-200 ${type === service.id ? 'ring-2 ring-indigo-500' : ''}`}
                        onClick={() => navigate(service.route)}
                    >
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                                <service.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{service.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
