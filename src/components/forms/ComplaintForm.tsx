import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Camera, Loader2, Upload, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";

// --- Types ---

// --- Form Schema ---
const complaintSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    category: z.string().min(1, "Select a category"),
    location: z.string().min(1, "Select a location"),
    description: z.string().min(10, "Please provide more details"),
});

export function ComplaintForm({ onSuccess }: { onSuccess?: () => void }) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof complaintSchema>>({
        resolver: zodResolver(complaintSchema),
        defaultValues: {
            title: "",
            category: "",
            location: "",
            description: "",
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: z.infer<typeof complaintSchema>) => {
        if (!user) {
            toast.error("Please login to submit a complaint");
            return;
        }

        setIsSubmitting(true);
        try {
            let imageUrl = null;
            if (imageFile) {
                try {
                    imageUrl = await db.uploadImage(imageFile);
                } catch (uploadError) {
                    console.error("Image upload failed", uploadError);
                    toast.error("Failed to upload image, submitting without it.");
                }
            }

            await db.createComplaint({
                title: data.title,
                category: data.category,
                description: data.description,
                location: data.location,
                images: imageUrl ? [imageUrl] : [],
                user_id: user.id
            });

            toast.success("Complaint Registered Successfully", {
                description: "Authorities have been notified."
            });

            form.reset();
            setImageFile(null);
            setImagePreview(null);

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error(error);
            toast.error("Failed to submit complaint. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = ["Garbage", "Road", "Drainage", "Electricity", "Water", "Other"];
    const locations = ["Vijay Nagar", "Palasia", "Bhawarkua", "Rajwada", "Annapurna"];

    return (
        <Card className="border-t-4 border-t-indigo-500 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    📝 Report a Civic Issue
                </CardTitle>
                <CardDescription>
                    Submit issues directly to authorities. Track progress in real-time.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Issue Title</label>
                        <Input placeholder="e.g. Broken Street Light" {...form.register("title")} />
                        {form.formState.errors.title && <span className="text-xs text-red-500">{form.formState.errors.title.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Category</label>
                            <Select onValueChange={(val) => form.setValue("category", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.category && <span className="text-xs text-red-500">{form.formState.errors.category.message}</span>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Location</label>
                            <Select onValueChange={(val) => form.setValue("location", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Area" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.location && <span className="text-xs text-red-500">{form.formState.errors.location.message}</span>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea placeholder="Describe the issue in detail..." className="resize-none h-24" {...form.register("description")} />
                        {form.formState.errors.description && <span className="text-xs text-red-500">{form.formState.errors.description.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Evidence (Optional)</label>
                        <div
                            className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-slate-50 cursor-pointer transition-colors relative"
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
                                <div className="relative w-full h-32">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                    <button
                                        type="button"
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-6 w-6 mb-1 text-slate-400" />
                                    <span className="text-xs">Drop image here or click to upload</span>
                                </>
                            )}
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                        {isSubmitting ? "Submitting..." : "Submit Complaint"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
