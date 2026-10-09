import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateIncident } from "@/hooks/use-incidents";
import { toast } from "sonner";
import { MapPin, Loader2, AlertTriangle } from "lucide-react";

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    type: z.enum(['flood', 'fire', 'structural', 'transport', 'medical']),
    severity: z.enum(['critical', 'high', 'medium']),
    locationAddress: z.string().min(5, "Location is required"),
    description: z.string().optional(),
});

export function IncidentForm() {
    const createIncident = useCreateIncident();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            type: "flood",
            severity: "medium",
            locationAddress: "",
            description: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        createIncident.mutate({
            ...values,
            status: 'active',
            startedAt: new Date(),
            affectedPopulation: 0, // Default, can be updated later
        }, {
            onSuccess: () => {
                toast.success("Incident reported successfully! Command Center notified.");
                form.reset();
            },
            onError: () => {
                toast.error("Failed to report incident.");
            }
        });
    }

    return (
        <Card className="border-red-500/20 shadow-lg shadow-red-500/5">
            <CardHeader>
                <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <CardTitle>Report Emergency Incident</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Incident Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Flash Flood in Sector 4" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="flood">Flood</SelectItem>
                                                <SelectItem value="fire">Fire</SelectItem>
                                                <SelectItem value="structural">Structural</SelectItem>
                                                <SelectItem value="transport">Transport</SelectItem>
                                                <SelectItem value="medical">Medical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="severity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Severity</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Severity" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="critical">Critical</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="locationAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input placeholder="Enter location manually" {...field} />
                                        </FormControl>
                                        <Button type="button" variant="outline" size="icon">
                                            <MapPin className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={createIncident.isPending}>
                            {createIncident.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Report Incident
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
