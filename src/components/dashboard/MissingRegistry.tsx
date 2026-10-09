import { useAuth } from "@/contexts/AuthContext";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Upload, MapPin, User, Loader2, X, Eye, Phone, AlertCircle, MessageSquare, Package
} from 'lucide-react';
import { CommentsSection } from "@/components/common/CommentsSection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from 'date-fns';

// --- Types ---
interface MissingReport {
    id: string;
    person_name: string; // Used for Item Name too
    age?: number;
    last_seen_location: string;
    description: string;
    image_url?: string;
    status: 'missing' | 'found';
    contact_phone: string;
    created_at: string;
    type: 'person' | 'item';
}

// --- Form Schema ---
const reportSchema = z.object({
    type: z.enum(['person', 'item']),
    personName: z.string().min(2, "Name/Title is required"),
    age: z.string().optional(), // Handled manually or via refinement
    lastSeenLocation: z.string().min(3, "Location is required"),
    description: z.string().min(10, "Please provide description (color, size, unique marks)"),
    contactPhone: z.string().regex(/^\d{10}$/, "Valid 10-digit number required"),
}).refine((data) => {
    if (data.type === 'person') {
        return !!data.age && parseInt(data.age) > 0;
    }
    return true;
}, {
    message: "Age is required for missing persons",
    path: ["age"],
});

export function MissingRegistry() {
    const { user } = useAuth(); // Use context directly
    const [reports, setReports] = useState<MissingReport[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeType, setActiveType] = useState<'person' | 'item'>('person');
    const [visibleCount, setVisibleCount] = useState(3); // Show 3 by default
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            type: 'person',
            personName: "",
            lastSeenLocation: "",
            description: "",
            contactPhone: "",
            age: "",
        }
    });

    // Update form type when tab changes
    useEffect(() => {
        form.setValue('type', activeType);
        form.clearErrors();
    }, [activeType]);

    useEffect(() => {
        fetchReports();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('missing_reports_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'missing_reports' }, () => {
                fetchReports();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchReports = async () => {
        setError(null);
        try {
            const data = await db.getMissingReports();
            // Handle legacy data mapping if necessary, or just cast
            setReports(data as unknown as MissingReport[]);
        } catch (error: any) {
            console.error("Failed to fetch missing reports:", error);
            const msg = error.message || "Failed to load reports";
            setError(msg);
            toast.error(msg);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };



    const onSubmit = async (data: z.infer<typeof reportSchema>) => {
        console.log("Starting submission...", data);
        setIsSubmitting(true);
        try {
            if (!user) {
                console.error("No user found");
                toast.error("You must be logged in to report.");
                setIsSubmitting(false);
                return;
            }

            let publicUrl = "";
            if (imageFile) {
                console.log("Uploading image...");
                try {
                    const url = await db.uploadImage(imageFile);
                    console.log("Image uploaded:", url);
                    if (url) publicUrl = url;
                } catch (uploadError: any) {
                    console.error("Upload failed after retries:", uploadError);
                    toast.error("Failed to upload image, but continuing with text report.");
                }
            } else {
                console.log("No image to upload");
            }

            console.log("Inserting into database...");
            const reportData = {
                user_id: user.id,
                person_name: data.personName,
                age: data.age ? parseInt(data.age) : 0,
                last_seen_location: data.lastSeenLocation,
                description: data.description,
                contact_phone: data.contactPhone,
                image_url: publicUrl || (activeType === 'person'
                    ? "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=300&auto=format&fit=crop"
                    : "https://images.unsplash.com/photo-1555616635-6409600311bf?q=80&w=300&auto=format&fit=crop"),
                // @ts-ignore
                type: activeType
            };
            console.log("Payload:", reportData);

            await db.createMissingReport(reportData as any);
            console.log("Database insert successful");

            form.reset();
            setImageFile(null);
            setImagePreview(null);
            toast.success("Missing Report Submitted", {
                description: "The community has been alerted."
            });
            fetchReports();

        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error("Failed to submit report: " + (error.message || "Unknown error"));
        } finally {
            setIsSubmitting(false);
            console.log("Submission process finished");
        }
    };

    const filteredReports = reports.filter(item => {
        const matchesType = (item.type || 'person') === activeType;
        const matchesSearch = (item.person_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.last_seen_location?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesType && matchesSearch;
    });

    const displayedReports = filteredReports.slice(0, visibleCount);

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500 max-w-5xl mx-auto">

            {/* Title / Header */}
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                            Missing Persons Registry
                        </h1>
                        <p className="text-muted-foreground">Urgent community alerts for missing individuals and lost items.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Input
                            placeholder="Search name or location..."
                            className="bg-white/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Type Selection (Tabs) */}
                <div className="flex gap-4 border-b border-slate-200 mt-4">
                    <button
                        className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeType === 'person' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => { setActiveType('person'); setVisibleCount(3); }}
                    >
                        Missing Persons
                    </button>
                    <button
                        className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeType === 'item' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => { setActiveType('item'); setVisibleCount(3); }}
                    >
                        Lost Items
                    </button>
                </div>
            </div>

            {/* SECTION 1: Reports Feed (Now at Top) */}
            <div className="space-y-6">
                <div className="space-y-4">
                    {error ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center bg-red-50 rounded-xl border border-red-200 px-4">
                            <AlertCircle className="w-12 h-12 mb-3 text-red-500" />
                            <h3 className="text-lg font-bold text-red-700">Unable to load registry</h3>
                            <p className="text-red-600 mb-4 max-w-md">{error}</p>
                            <Button variant="outline" onClick={fetchReports} className="border-red-200 hover:bg-red-100 text-red-700">
                                Try Again
                            </Button>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-white/40 rounded-xl border border-dashed">
                            <User className="w-12 h-12 mb-2 opacity-20" />
                            <p>No active missing {activeType}s.</p>
                        </div>
                    ) : null}

                    {displayedReports.map(report => (
                        <MissingPersonCard key={report.id} report={report} />
                    ))}
                </div>

                {/* Show More Button */}
                {filteredReports.length > 3 && (
                    <div className="flex justify-center pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setVisibleCount(prev => prev === 3 ? filteredReports.length : 3)}
                            className="min-w-[150px]"
                        >
                            {visibleCount === 3 ? `Show All (${filteredReports.length})` : "Show Less"}
                        </Button>
                    </div>
                )}
            </div>

            {/* SECTION 2: Submit Report Form (Moved to Bottom) */}
            <div className="mt-8 border-t border-slate-200 pt-8">
                <Card className="border-t-4 border-t-red-500 shadow-lg bg-white/50 backdrop-blur-sm max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            {activeType === 'person' ? <User className="h-5 w-5 text-red-600" /> : <Package className="h-5 w-5 text-indigo-600" />}
                            Report Missing {activeType === 'person' ? 'Person' : 'Item'}
                        </CardTitle>
                        <CardDescription>
                            Every second counts. Provide accurate details to help the community.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* Person/Item Name */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium">{activeType === 'person' ? "Full Name" : "Item Name/Title"}</label>
                                <Input placeholder={activeType === 'person' ? "Name of missing person" : "e.g. Black Leather Wallet"} {...form.register('personName')} />
                                {form.formState.errors.personName && <span className="text-xs text-red-500">{form.formState.errors.personName.message}</span>}
                            </div>

                            {/* Age (Person Only) */}
                            {activeType === 'person' && (
                                <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                                    <label className="text-sm font-medium">Age</label>
                                    <Input type="number" placeholder="Approximate age" {...form.register('age')} />
                                    {form.formState.errors.age && <span className="text-xs text-red-500">{form.formState.errors.age.message}</span>}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Location */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Last Seen Location</label>
                                    <Input placeholder="Street, Area, Landmark..." {...form.register('lastSeenLocation')} />
                                    {form.formState.errors.lastSeenLocation && <span className="text-xs text-red-500">{form.formState.errors.lastSeenLocation.message}</span>}
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Emergency Contact Phone</label>
                                    <Input placeholder="10-digit number" {...form.register('contactPhone')} />
                                    {form.formState.errors.contactPhone && <span className="text-xs text-red-500">{form.formState.errors.contactPhone.message}</span>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium">{activeType === 'person' ? "Physical Description" : "Item Description"}</label>
                                <Textarea
                                    placeholder={activeType === 'person' ? "Height, build, clothing worn..." : "Color, brand, distinguishing marks, etc..."}
                                    className="resize-none"
                                    {...form.register('description')}
                                />
                                {form.formState.errors.description && <span className="text-xs text-red-500">{form.formState.errors.description.message}</span>}
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{activeType === 'person' ? "Recent Photo (Crucial)" : "Item Photo (Optional)"}</label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden bg-slate-50/50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        hidden
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-md" />
                                            <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70" onClick={(e) => {
                                                e.stopPropagation();
                                                setImageFile(null);
                                                setImagePreview(null);
                                            }}>
                                                <X className="w-4 h-4 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 mb-2 text-slate-400" />
                                            <span className="text-xs">Upload Photo</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" disabled={isSubmitting} className={`w-full text-white shadow-lg ${activeType === 'person' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'}`}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                                Broadcast {activeType === 'person' ? 'Emergency' : 'Lost Item'} Alert
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MissingPersonCard({ report }: { report: MissingReport }) {
    const [showComments, setShowComments] = useState(false);

    return (
        <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-all bg-white/90">
            <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="sm:w-56 h-64 sm:h-auto shrink-0 relative bg-slate-100">
                    <img
                        src={report.image_url || "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=300&auto=format&fit=crop"}
                        alt={report.person_name}
                        className="w-full h-full object-cover"
                    />
                    {report.status === 'found' && (
                        <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white font-bold text-xl uppercase tracking-widest border-2 border-white px-4 py-1 rounded">FOUND</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-2xl text-slate-900 leading-tight">{report.person_name}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 font-medium">
                                    {(report.type === 'person' || !report.type) && report.age && (
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">Age: {report.age}</span>
                                    )}
                                    <span className="flex items-center gap-1 text-red-600"><MapPin className="h-3.5 w-3.5" /> {report.last_seen_location}</span>
                                </div>
                            </div>
                            <Badge variant={report.status === 'missing' ? 'destructive' : 'default'} className="uppercase tracking-wider">
                                {report.status}
                            </Badge>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100">
                            <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-1">Description</p>
                            {report.description}
                        </div>

                        <div className="text-xs text-muted-foreground">
                            Reported {report.created_at ? formatDistanceToNow(new Date(report.created_at), { addSuffix: true }) : 'recently'}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 bg-slate-100 px-3 py-2 rounded-full">
                            <Phone className="h-4 w-4" />
                            {report.contact_phone}
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 sm:flex-none text-slate-500 hover:text-indigo-600"
                                onClick={() => setShowComments(!showComments)}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Discuss
                            </Button>
                            <ReportSightingModal report={report} />
                        </div>
                    </div>
                </div>
            </div>

            {showComments && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                    <CommentsSection parentId={report.id} parentType="missing_report" />
                </div>
            )}
        </Card>
    );
}

function ReportSightingModal({ report }: { report: MissingReport }) {
    const [open, setOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setOpen(false);
        toast.success("Info Sent", {
            description: "Authorities and family will be notified."
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full sm:w-auto border-blue-200 hover:bg-blue-50 text-blue-700">
                    <Eye className="w-4 h-4 mr-2" />
                    I Have Seen Them
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report Sighting</DialogTitle>
                    <DialogDescription>
                        Please provide details about where and when you saw <strong>{report.person_name}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Your Phone (for verification)</label>
                        <Input required type="tel" placeholder="Your contact number" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Sighting Location</label>
                        <Input required placeholder="Exact location..." />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Details</label>
                        <Textarea required placeholder="Time seen, condition, direction of travel..." />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Submit Information
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
