import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Login } from "@/pages/Login";

export function LoginGuard() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if onboarding is complete
        const completed = localStorage.getItem("quickfix_onboarding_completed_v2");

        if (!completed) {
            // If not completed, redirect to /onboarding
            navigate("/onboarding", { replace: true });
        }
        // If completed, do nothing, just render Login
    }, [navigate]);

    // If we are redirecting, this might flash briefly. 
    // Ideally we render null if navigating, but useEffect happens after render.
    // However, since we replace, it should be fast. we can check synchronously too.

    // Synchronous check to avoid flash
    const completed = typeof window !== 'undefined' ? localStorage.getItem("quickfix_onboarding_completed_v2") : "true";
    if (!completed) return null; // Wait for redirect

    return <Login />;
}
