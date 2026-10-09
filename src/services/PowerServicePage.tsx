import { useState, useEffect } from "react";
import { ServiceLayout } from "./components/ServiceLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const AREAS = ["Downtown", "West End", "North Hills", "Industrial District", "Suburbs"];

export function PowerServicePage() {
    const { profile } = useAuth();
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [area, setArea] = useState("");
    const [desc, setDesc] = useState("");

    useEffect(() => {
        fetchIssues();

        const channel = supabase.channel('power_issues_public')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'power_issues' }, () => {
                fetchIssues();
                toast.warning("Grid status updated");
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchIssues = async () => {
        const { data } = await supabase
            .from('power_issues')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) setIssues(data);
    };

    const handleReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!area) return toast.error("Select area");
        if (!profile) return toast.error("Login required");

        setLoading(true);
        try {
            const { error } = await supabase.from('power_issues').insert({
                area,
                description: desc,
                reported_by: profile.id,
                status: 'reported'
            });

            if (error) throw error;
            toast.success("Outage reported. Technicians notified.");
            setDesc("");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Group issues by area
    const areaStatus = AREAS.map(a => {
        const active = issues.filter(i => i.area === a && i.status !== 'resolved');
        const count = active.length;
        return {
            name: a,
            status: count > 3 ? 'Critical' : count > 0 ? 'Warning' : 'Normal',
            count,
            reports: active
        };
    });

    return (
        <ServiceLayout title="Electricity & Grid" subtitle="View outages and report power issues.">
            <div className="grid md:grid-cols-12 gap-8">
                {/* Status Board */}
                <div className="md:col-span-8 space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-500 fill-amber-500" /> Live Grid Status
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {areaStatus.map((stat) => (
                            <Card key={stat.name} className={cn(
                                "border-l-4 transition-all hover:shadow-md",
                                stat.status === 'Critical' ? "border-l-red-500 bg-red-50/30" :
                                    stat.status === 'Warning' ? "border-l-amber-500 bg-amber-50/30" :
                                        "border-l-emerald-500 bg-emerald-50/30"
                            )}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-900">{stat.name}</h4>
                                        <Badge variant="outline" className={cn(
                                            "font-bold",
                                            stat.status === 'Critical' ? "text-red-600 bg-red-100 border-red-200 animate-pulse" :
                                                stat.status === 'Warning' ? "text-amber-600 bg-amber-100 border-amber-200" :
                                                    "text-emerald-600 bg-emerald-100 border-emerald-200"
                                        )}>
                                            {stat.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {stat.count === 0
                                            ? "No active reports."
                                            : `${stat.count} active reports in this sector.`}
                                    </p>
                                    {stat.count > 0 && (
                                        <div className="mt-3 space-y-1">
                                            {stat.reports.slice(0, 2).map((r: any) => (
                                                <div key={r.id} className="text-[10px] bg-white p-1.5 rounded border text-slate-600 truncate">
                                                    {r.description || "Power fluctuation reported"}
                                                </div>
                                            ))}
                                            {stat.count > 2 && (
                                                <div className="text-[10px] text-slate-400 pl-1">+{stat.count - 2} more</div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Report Form */}
                <div className="md:col-span-4">
                    <Card className="sticky top-4">
                        <CardHeader className="bg-slate-50 border-b pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-slate-500" /> Report Outage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <form onSubmit={handleReport} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Affected Area</Label>
                                    <Select onValueChange={setArea} value={area}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select area" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        placeholder="Describe the issue (e.g. Total blackout, voltage fluctuation)..."
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                        className="h-32"
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-slate-900" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Report Issue
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ServiceLayout>
    );
}
