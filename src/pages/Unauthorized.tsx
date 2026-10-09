import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Unauthorized() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                <div className="inline-flex justify-center mb-4">
                    <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-8 w-8 text-red-600" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Access Denied
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    You don't have permission to access this page.
                </p>
                <div className="space-y-2">
                    <Button
                        onClick={() => navigate("/")}
                        className="w-full"
                    >
                        Go to Dashboard
                    </Button>
                    <p className="text-xs text-slate-500">
                        Need access? Contact your administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}
