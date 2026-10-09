import { useState, useEffect } from "react";
import { ServiceLayout } from "./components/ServiceLayout";
import { HistoryList } from "./components/HistoryList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export function WasteServicePage() {
    const { profile } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [issueType, setIssueType] = useState("");
    const [desc, setDesc] = useState("");
    const [image, setImage] = useState<File | null>(null);

    // Fetch History
    useEffect(() => {
        if (!profile?.id) return;

        fetchHistory();

        // Realtime Subscription
        const channel = supabase
            .channel(`waste:${profile.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'waste_requests',
                filter: `user_id=eq.${profile.id}`
            }, () => {
                fetchHistory();
                toast.info("Waste request updated");
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [profile?.id]);

    const fetchHistory = async () => {
        const { data } = await supabase
            .from('waste_requests')
            .select('*')
            .eq('user_id', profile?.id)
            .order('created_at', { ascending: false });

        if (data) setHistory(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!issueType) return toast.error("Select issue type");

        setLoading(true);
        try {
            let imageUrl = null;

            if (image) {
                const fileName = `waste-${Date.now()}-${image.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('service-images')
                    .upload(fileName, image);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('service-images')
                    .getPublicUrl(fileName);

                imageUrl = data.publicUrl;
            }

            const { error } = await supabase.from('waste_requests').insert({
                user_id: profile?.id,
                issue_type: issueType,
                description: desc,
                image_url: imageUrl,
                status: 'pending'
            });

            if (error) throw error;

            toast.success("Request submitted successfully");
            setIssueType("");
            setDesc("");
            setImage(null);
            fetchHistory(); // Optimistic update handled by realtime usually, but safety fetch
        } catch (err: any) {
            toast.error(err.message || "Failed to submit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ServiceLayout
            title="Waste Management"
            subtitle="Schedule pickups or report sanitation issues."
        >
            <div className="grid md:grid-cols-2 gap-8">
                {/* Form Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">New Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Issue Type</Label>
                                <Select onValueChange={setIssueType} value={issueType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="missed_pickup">Missed Pickup</SelectItem>
                                        <SelectItem value="overflowing">Overflowing Bin</SelectItem>
                                        <SelectItem value="bulky">Bulky Item Pickup</SelectItem>
                                        <SelectItem value="hazardous">Hazardous Waste</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Details about location or items..."
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Photo (Optional)</Label>
                                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                                    />
                                    {image ? (
                                        <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                                            <Upload className="h-4 w-4" /> {image.name}
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 text-sm">
                                            <Upload className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                            Click to upload image
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-slate-900" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History Section */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800">Your Requests</h3>
                    <HistoryList
                        items={history.map(h => ({
                            id: h.id,
                            title: h.issue_type.replace('_', ' '),
                            subtitle: h.description,
                            status: h.status,
                            date: h.created_at
                        }))}
                    />
                </div>
            </div>
        </ServiceLayout>
    );
}
