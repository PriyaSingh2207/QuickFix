import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { CalendarClock } from "lucide-react";

interface HistoryItem {
    id: string;
    title: string;
    subtitle?: string;
    status: string;
    date: string;
}

export function HistoryList({ items, emptyMessage = "No history found." }: { items: HistoryItem[], emptyMessage?: string }) {
    if (items.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                            {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
                        </div>
                        <StatusBadge status={item.status} />
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex items-center text-xs text-slate-400">
                        <CalendarClock className="mr-1 h-3 w-3" />
                        {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
