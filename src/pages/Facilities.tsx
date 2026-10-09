import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Stethoscope, Shield, Flame } from "lucide-react";

export function FacilitiesPage() {
    const navigate = useNavigate();

    const FACILITIES = [
        { name: "City Hospital", type: "Health", icon: Stethoscope, address: "Sector 3, Main Road", contact: "0731-2555555" },
        { name: "Central Police Station", type: "Security", icon: Shield, address: "MG Road, Near High Court", contact: "100" },
        { name: "Fire Station HQ", type: "Emergency", icon: Flame, address: "AB Road, Vijay Nagar", contact: "101" },
        { name: "Community Shelter", type: "Social", icon: Building2, address: "Rau Circle", contact: "0731-2444444" },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <h1 className="text-3xl font-bold mb-6">Public Facilities</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {FACILITIES.map((facility, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6 flex gap-4">
                            <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                <facility.icon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{facility.name}</h3>
                                <p className="text-sm font-medium text-slate-500 mb-1">{facility.type}</p>
                                <p className="text-sm text-muted-foreground">{facility.address}</p>
                                <p className="text-sm font-bold text-slate-700 mt-2">📞 {facility.contact}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
