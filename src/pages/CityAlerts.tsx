import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, CloudRain, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CityAlertsPage() {
    const navigate = useNavigate();

    const ALERTS = [
        { title: "Water Supply Shutdown", type: "Utility", serverity: "Medium", icon: Ban, color: "text-orange-500", date: "Today, 10 AM - 4 PM", msg: "Maintenance work at Narmada pipeline." },
        { title: "Heavy Rain Warning", type: "Weather", serverity: "High", icon: CloudRain, color: "text-blue-500", date: "Tomorrow", msg: "Red alert issued for Indore district." },
        { title: "Road Closure", type: "Traffic", serverity: "Low", icon: AlertTriangle, color: "text-yellow-500", date: "Current", msg: "AB Road underpass closed due to repairs." },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                City Alerts
            </h1>

            <div className="space-y-4">
                {ALERTS.map((alert, idx) => (
                    <Card key={idx} className="border-l-4 border-l-slate-900 shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <alert.icon className={`h-5 w-5 ${alert.color}`} />
                                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                                </div>
                                <Badge variant={alert.serverity === 'High' ? 'destructive' : 'secondary'}>
                                    {alert.serverity} Priority
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 mb-2">{alert.msg}</p>
                            <p className="text-xs text-muted-foreground font-medium">{alert.date}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
