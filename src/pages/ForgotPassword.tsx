
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await resetPassword(email);
            setSubmitted(true);
            toast.success("Reset link sent!", {
                description: "Check your email for the password reset link."
            });
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to send reset link", {
                description: error.message || "Please check your email and try again."
            });
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
                <Card className="w-full max-w-md border-0 shadow-lg bg-white/50 backdrop-blur-xl dark:bg-slate-900/50">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Check your mail</CardTitle>
                        <CardDescription>
                            We have sent a password recover instructions to your email.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center pb-8">
                        <Link to="/login">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Forgot password?</CardTitle>
                        <CardDescription className="text-center">
                            No worries, we'll send you reset instructions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-9 dark:bg-slate-950 dark:border-slate-800"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </Link>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
