import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function NotFound() {
    const navigate = useNavigate();
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-muted-foreground">Page not found</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
    )
}
