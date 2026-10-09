import { useState, useEffect } from "react";
import { ServiceLayout } from "./components/ServiceLayout";
import { StatusBadge } from "./components/StatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Wifi, Signal, MapPin, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function WifiServicePage() {
    const { profile } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form
    const [location, setLocation] = useState("");
    const [issue, setIssue] = useState("");

    useEffect(() => {
        fetchReports();

        const channel = supabase.channel('wifi_reports_public')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'wifi_reports' }, () => {
                fetchReports();
                toast.info("Network reports updated");
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchReports = async () => {
        const { data } = await supabase
            .from('wifi_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) setReports(data);
    };

    const handleReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location || !issue) return toast.error("Fill all fields");
        if (!profile) return toast.error("Login required");

        setLoading(true);
        try {
            const { error } = await supabase.from('wifi_reports').insert({
                location,
                issue,
                user_id: profile.id,
                status: 'reported'
            });

            if (error) throw error;
            toast.success("Report submitted.");
            setLocation("");
            setIssue("");
            setIsDialogOpen(false);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r =>
        r.location.toLowerCase().includes(filter.toLowerCase()) ||
        r.issue.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <ServiceLayout title="Community WiFi" subtitle="Report connectivity issues in public zones.">

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Filter by location..."
                        className="pl-9"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                            <Signal className="mr-2 h-4 w-4" /> Report Issue
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Report Connectivity Issue</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleReport} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label>Location Name</Label>
                                <Input
                                    placeholder="e.g. Central Library, City Park..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Issue Details</Label>
                                <Textarea
                                    placeholder="Weak signal, cannot connect, slow speed..."
                                    value={issue}
                                    onChange={(e) => setIssue(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Reports Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                <Wifi className="h-5 w-5" />
                            </div>
                            <StatusBadge status={report.status} />
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-bold flex items-center gap-2 mb-1">
                                <MapPin className="h-3 w-3 text-slate-400" /> {report.location}
                            </h4>
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                {report.issue}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                                Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                            </p>
                        </CardContent>
                    </Card>
                ))}

                {filteredReports.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No reports matching your filter.
                    </div>
                )}
            </div>
        </ServiceLayout>
    );
}
