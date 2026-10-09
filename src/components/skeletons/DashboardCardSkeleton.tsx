import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function DashboardCardSkeleton() {
    return (
        <Card className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border-0 shadow-sm h-full overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 z-10 relative">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-3 w-20 bg-slate-100 dark:bg-slate-800/50" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>

            {/* Content */}
            <div className="space-y-4 z-10 relative">
                <Skeleton className="h-4 w-full bg-slate-100 dark:bg-slate-800" />
                <Skeleton className="h-4 w-[90%] bg-slate-100 dark:bg-slate-800" />
                <Skeleton className="h-32 w-full rounded-xl bg-slate-50 dark:bg-slate-800/30 mt-4" />
            </div>
        </Card>
    )
}
