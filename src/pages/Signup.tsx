import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, User, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function Signup() {
    const navigate = useNavigate();
    const { user, profile, loading: authLoading, signUp } = useAuth();
    const [loading, setLoading] = useState(false);
    const isSubmittingRef = useRef(false); // DOM-level lock
    const [step, setStep] = useState(1);

    // Form State
    const [role, setRole] = useState<'citizen' | 'volunteer'>('citizen');
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        city: "Indore"
    });

    // Only redirect if we are ALREADY authenticated when entering the page
    // or if auto-login happened and profile is fully loaded.
    useEffect(() => {
        if (!authLoading && user && profile) {
            navigate('/', { replace: true });
        }
    }, [user, profile, authLoading, navigate]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prevent double-submission before React state updates
        if (isSubmittingRef.current || loading) return;
        
        isSubmittingRef.current = true;
        setLoading(true);

        try {
            const metaData = {
                full_name: formData.fullName,
                city: formData.city,
                role: role,
                phone: formData.phone // Pass phone in metadata so trigger can pick it up if updated
            };

            // Use the centralized signUp method
            // This handles the redirect URL and metadata
            await signUp(formData.email, formData.password, metaData);

            toast.success("Account created successfully!", {
                description: "Please check your email to confirm your account before logging in."
            });

            // Redirect to login page to prevent auto-login confusion
            navigate('/login');

        } catch (error: any) {
            toast.error(error.message || "Failed to create account");
        } finally {
            setLoading(false);
            // Add a small cooldown before allowing another submission attempt
            setTimeout(() => {
                isSubmittingRef.current = false;
            }, 1000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex justify-center mb-4">
                        <div className="h-12 w-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
                            <Shield className="h-7 w-7 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Join the Movement</h1>
                    <p className="text-slate-500 dark:text-slate-400">Create your account to start making a difference</p>
                </div>

                {/* Role Selection Step */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <Label className="text-base">I want to join as a...</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => setRole('citizen')}
                                className={cn(
                                    "cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-3",
                                    role === 'citizen' ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                )}
                            >
                                <div className={cn("p-3 rounded-full", role === 'citizen' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500")}>
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Citizen</h3>
                                    <p className="text-xs text-slate-500 mt-1">Report issues & earn rewards</p>
                                </div>
                            </div>

                            <div
                                onClick={() => setRole('volunteer')}
                                className={cn(
                                    "cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-3",
                                    role === 'volunteer' ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                )}
                            >
                                <div className={cn("p-3 rounded-full", role === 'volunteer' ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500")}>
                                    <HeartHandshake className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Volunteer</h3>
                                    <p className="text-xs text-slate-500 mt-1">Help resolve incidents</p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full h-11 mt-6" onClick={() => setStep(2)}>
                            Continue as {role === 'citizen' ? 'Citizen' : 'Volunteer'}
                        </Button>
                    </motion.div>
                )}

                {/* Form Step */}
                {step === 2 && (
                    <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSignup} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                                Back
                            </Button>
                            <Button type="submit" className="flex-[2] bg-slate-900 text-white" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                            </Button>
                        </div>
                    </motion.form>
                )}

                <div className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?
                    <Link to="/login" className="ml-1 font-bold text-indigo-600 hover:underline">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
