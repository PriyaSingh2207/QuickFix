import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ServiceLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

export function ServiceLayout({ title, subtitle, children, action }: ServiceLayoutProps) {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800"
                        onClick={() => navigate('/services')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
                    </Button>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        {title}
                    </h1>
                    <p className="text-muted-foreground">{subtitle}</p>
                </div>
                {action && (
                    <div className="flex-shrink-0">
                        {action}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="grid gap-6">
                {children}
            </div>
        </div>
    );
}
