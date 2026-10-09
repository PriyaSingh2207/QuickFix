import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export function Login() {
    const navigate = useNavigate();
    const { user, profile, loading: authLoading, signIn, loginAsDemo } = useAuth();
    const [loading, setLoading] = useState(false);
    const isSubmittingRef = useRef(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Redirect authenticated users with loaded profiles
    useEffect(() => {
        if (!authLoading && user && profile) {
            navigate('/', { replace: true });
        }
    }, [user, profile, authLoading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmittingRef.current || loading) return;
        isSubmittingRef.current = true;
        setLoading(true);

        try {
            await signIn(email, password);
            toast.success("Login successful!");
            // No direct navigate - useEffect waits for profile
        } catch (error: any) {
            console.error("Login error:", error);
            // Handle specific Supabase errors if needed
            if (error.message.includes("Email not confirmed")) {
                toast.error("Please confirm your email address before logging in.");
            } else if (error.message.includes("Invalid login credentials")) {
                toast.error("Invalid email or password.");
            } else {
                toast.error(error.message || "Failed to login");
            }
        } finally {
            setLoading(false);
            setTimeout(() => {
                isSubmittingRef.current = false;
            }, 1000);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 relative z-10"
            >
                <div className="flex justify-center mb-6">
                    <div className="h-12 w-12 bg-gradient-to-tr from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <Shield className="h-7 w-7 text-white" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
                    <p className="text-slate-500 dark:text-slate-400">Sign in to continue your civic journey</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="citizen@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link to="/forgot-password" className="text-xs font-medium text-teal-600 hover:text-teal-700">Forgot?</Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 rounded-lg"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>

                    <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">Or Quick Test</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            loginAsDemo('citizen');
                            navigate('/', { replace: true });
                        }}
                        className="w-full h-11 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                        ⚡ Explore Citizen Dashboard (Demo Citizen)
                    </Button>
                </form>

                <div className="mt-5 text-center text-sm text-slate-500">
                    Don't have an account?
                    <Link to="/signup" className="ml-1 font-bold text-teal-600 hover:underline">
                        Join Now
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
