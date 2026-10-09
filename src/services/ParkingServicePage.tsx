import { useState, useEffect } from "react";
import { ServiceLayout } from "./components/ServiceLayout";
import { HistoryList } from "./components/HistoryList";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Car, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";

export function ParkingServicePage() {
    const { profile } = useAuth();
    const [permit, setPermit] = useState<any>(null);
    const [renewals, setRenewals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!profile?.id) return;
        fetchData();

        const sub = supabase.channel(`parking:${profile.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_renewals', filter: `user_id=eq.${profile.id}` }, () => {
                fetchData();
                toast.info("Renewal status updated");
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_permits', filter: `user_id=eq.${profile.id}` }, () => {
                fetchData();
            })
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, [profile?.id]);

    const fetchData = async () => {
        // Get Active Permit
        const { data: pData } = await supabase
            .from('parking_permits')
            .select('*')
            .eq('user_id', profile?.id)
            .eq('status', 'active')
            .maybeSingle(); // Assumes one active permit max

        setPermit(pData);

        // Get History
        const { data: rData } = await supabase
            .from('parking_renewals')
            .select('*, parking_permits(permit_no)')
            .eq('user_id', profile?.id)
            .order('created_at', { ascending: false });

        if (rData) setRenewals(rData);
    };

    const handleApply = async () => {
        setLoading(true);
        try {
            // Check pending
            const list = renewals.filter(r => r.status === 'pending');
            if (list.length > 0) return toast.error("You already have a pending application.");

            // Create Renewal (which acts as Application for new if no permit_id, but schema links permit_id. 
            // WAIT: Schema `parking_renewals` has `permit_id` NOT NULL. 
            // So this table is ONLY for renewals of EXISTING permits? 
            // User prompt: `parking_renewals` -> `permit_id`, `user_id`.
            // How do I get a NEW permit? 
            // Schema limitation. I'll modify schema or logic.
            // Let's assume for this demo, we auto-generate a "Mock Permit" for everyone to renew, 
            // OR I allow `permit_id` to be nullable in MY logic (but SQL enforces it).
            // Let's check schema I wrote: `permit_id uuid references ... on delete cascade not null`.
            // Okay, I strictly followed the prompt which implied `parking_renewals` is for `parking_permits`. 
            // I will assume the user has a permit seeded or I can create one "Active" for demo.
            // OR I can insert a `parking_permits` directly? "Users can insert their own records" -> prompt policies: "Users can... insert their own records". 
            // The prompt says "parking_permits -> id, user_id...". And "parking_renewals -> permit_id...".
            // So maybe I just insert into `parking_permits` directly for "New"? 
            // Let's try inserting into `parking_permits`.

            // Actually, "Renew button -> creates renewal request". 
            // I'll add a "New Permit" button that inserts `parking_permits` with status 'active' (simulating instant approval for demo)
            // Or `status` 'expired' then renew?

            // Let's go with: "Request New Permit" -> Inserts `parking_permits` (active).
            // "Renew" -> Inserts `parking_renewals` (pending).

            const permitNumber = `PERMIT-${Math.floor(Math.random() * 10000)}`;
            const expiry = new Date();
            expiry.setFullYear(expiry.getFullYear() + 1); // 1 year

            const { error } = await supabase.from('parking_permits').insert({
                user_id: profile?.id,
                permit_no: permitNumber,
                expiry_date: expiry.toISOString(),
                status: 'active'
            });

            if (error) throw error;
            toast.success("New Permit Issued!");
            fetchData();

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRenew = async () => {
        if (!permit) return;
        setLoading(true);
        try {
            // Check pending
            const pending = renewals.find(r => r.permit_id === permit.id && r.status === 'pending');
            if (pending) throw new Error("Renewal already in progress");

            const { error } = await supabase.from('parking_renewals').insert({
                permit_id: permit.id,
                user_id: profile?.id,
                status: 'pending'
            });

            if (error) throw error;
            toast.success("Renewal requested successfully");
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ServiceLayout title="Parking Permits" subtitle="Manage your city parking permits.">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Active Permit Card */}
                    {permit ? (
                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <CardHeader className="relative z-10 pb-2">
                                <CardTitle className="flex justify-between items-center text-lg">
                                    <span>Resident Permit</span>
                                    <Car className="h-6 w-6 text-emerald-400" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10 space-y-6">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest">Permit Number</p>
                                    <p className="text-3xl font-mono font-bold tracking-wider">{permit.permit_no}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest">Expires</p>
                                        <p className="font-bold flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {format(new Date(permit.expiry_date), 'PPP')}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="border-emerald-500 text-emerald-400">active</Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-white/5 border-t border-white/10 p-3">
                                <Button
                                    className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold"
                                    onClick={handleRenew}
                                    disabled={loading || renewals.some((r: any) => r.status === 'pending')}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Renewal"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card className="border-dashed border-2 bg-slate-50/50">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                <div className="p-4 bg-white rounded-full shadow-sm">
                                    <CreditCard className="h-8 w-8 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">No Active Permit</h3>
                                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
                                        Apply for a resident parking permit to park in designated city zones.
                                    </p>
                                    <Button onClick={handleApply} disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Apply for Permit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800">Renewal History</h3>
                    <HistoryList
                        items={renewals.map((r: any) => ({
                            id: r.id,
                            title: `Renewal Request`,
                            subtitle: r.permit_id, // Could use permit number if joined right
                            status: r.status,
                            date: r.created_at
                        }))}
                        emptyMessage="No renewal history."
                    />
                </div>
            </div>
        </ServiceLayout>
    );
}
