import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();

    let colorClass = "bg-slate-100 text-slate-600 border-slate-200";

    if (['resolved', 'active', 'approved', 'found'].includes(s)) {
        colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
    } else if (['pending', 'reported', 'investigating', 'assigned'].includes(s)) {
        colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
    } else if (['rejected', 'expired', 'critical'].includes(s)) {
        colorClass = "bg-red-100 text-red-700 border-red-200";
    }

    return (
        <Badge variant="outline" className={cn("capitalize font-bold", colorClass)}>
            {status.replace('_', ' ')}
        </Badge>
    );
}
