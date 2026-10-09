import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

export function JoinSquadPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("You must be logged in to join.");
                return;
            }

            await db.createSquadRequest({
                user_id: user.id,
                experience: formData.get("experience") as string,
                motivation: formData.get("motivation") as string,
                skills: formData.get("skills") as string,
            });

            toast.success("Request Submitted!", {
                description: "We will review your application and get back to you."
            });
            navigate('/profile');
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit request.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <Card className="border-t-4 border-t-indigo-600 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Join the Quickfix Squad</CardTitle>
                    <CardDescription>
                        Become a verified volunteer and help your community during emergencies.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="experience">Relevant Experience</Label>
                            <Textarea
                                id="experience"
                                name="experience"
                                placeholder="Describe any past volunteering, medical, or emergency response experience..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="skills">Key Skills</Label>
                            <Input
                                id="skills"
                                name="skills"
                                placeholder="e.g. First Aid, Driving, Swimming, HAM Radio"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="motivation">Why do you want to join?</Label>
                            <Textarea
                                id="motivation"
                                name="motivation"
                                placeholder="Tell us what drives you to help..."
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                            {isLoading ? "Submitting..." : (
                                <>Apply Now <Send className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
