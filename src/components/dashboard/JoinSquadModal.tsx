
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Heart } from "lucide-react";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

const volunteerSchema = z.object({
    fullName: z.string().min(2, "Name required"),
    phone: z.string().min(10, "Valid phone required"),
    area: z.string().min(2, "Area required"),
    skills: z.array(z.string()).min(1, "Select at least one skill"),
    availability: z.string().min(1, "Select availability"),
    isEmergencyTrained: z.boolean(),
    reason: z.string().min(10, "Please briefly explain why")
});

export function JoinSquadModal({ children, onSuccess }: { children: React.ReactNode, onSuccess?: () => void }) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof volunteerSchema>>({
        resolver: zodResolver(volunteerSchema),
        defaultValues: {
            fullName: "",
            phone: "",
            area: "",
            skills: [],
            availability: "Weekends",
            isEmergencyTrained: false,
            reason: ""
        }
    });

    const onSubmit = async (data: z.infer<typeof volunteerSchema>) => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login to join the squad");
                return;
            }

            await db.createVolunteerRequest({
                user_id: user.id,
                full_name: data.fullName,
                phone: data.phone,
                area: data.area,
                skills: data.skills,
                availability: data.availability,
                is_emergency_trained: data.isEmergencyTrained,
                reason: data.reason
            });

            toast.success("Application Submitted!", {
                description: "We'll review your profile and get back to you shortly."
            });
            setOpen(false);
            onSuccess?.();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to submit: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSkill = (skill: string) => {
        const current = form.getValues("skills");
        if (current.includes(skill)) {
            form.setValue("skills", current.filter(s => s !== skill));
        } else {
            form.setValue("skills", [...current, skill]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <ShieldCheck className="w-6 h-6 text-teal-600" />
                        {t('squad.modalTitle', 'Join the Rescue Squad')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('squad.modalDesc', 'Become a verified community volunteer. Help your neighbors during emergencies and civic events.')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('squad.fullName', 'Full Name')}</Label>
                            <Input {...form.register("fullName")} placeholder="Your Name" />
                            {form.formState.errors.fullName && <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>{t('squad.phone', 'Phone')}</Label>
                            <Input {...form.register("phone")} placeholder="98765..." />
                            {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('squad.area', 'Area / Locality')}</Label>
                        <Input {...form.register("area")} placeholder="e.g. Vijay Nagar, Scheme 54" />
                        {form.formState.errors.area && <p className="text-xs text-red-500">{form.formState.errors.area.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>{t('squad.skills', 'Skills')}</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {["First Aid", "Traffic Control", "Search & Rescue", "Logistics", "Medical Pro", "Social Support"].map(skill => (
                                <div key={skill} className="flex items-center space-x-2 border p-2 rounded hover:bg-slate-50">
                                    <Checkbox
                                        id={skill}
                                        checked={form.watch("skills").includes(skill)}
                                        onCheckedChange={() => toggleSkill(skill)}
                                    />
                                    <label htmlFor={skill} className="text-sm cursor-pointer w-full font-medium">{skill}</label>
                                </div>
                            ))}
                        </div>
                        {form.formState.errors.skills && <p className="text-xs text-red-500">{form.formState.errors.skills.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('squad.availability', 'Availability')}</Label>
                            <Select onValueChange={(val) => form.setValue("availability", val)} defaultValue="Weekends">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Weekdays">Weekdays</SelectItem>
                                    <SelectItem value="Weekends">Weekends Only</SelectItem>
                                    <SelectItem value="Anytime">Anytime (Emergency)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2 md:mt-8">
                            <Checkbox
                                id="emergency"
                                checked={form.watch("isEmergencyTrained")}
                                onCheckedChange={(c) => form.setValue("isEmergencyTrained", c as boolean)}
                            />
                            <Label htmlFor="emergency" className="leading-tight">Emergency Trained?</Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('squad.whyJoin', 'Why do you want to join?')}</Label>
                        <Textarea {...form.register("reason")} placeholder="I want to help because..." className="min-h-[80px]" />
                        {form.formState.errors.reason && <p className="text-xs text-red-500">{form.formState.errors.reason.message}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-700 hover:bg-teal-800 text-white">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4 mr-2" />}
                        {t('squad.submitApp', 'Submit Application')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
