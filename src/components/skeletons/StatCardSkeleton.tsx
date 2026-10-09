import { Skeleton } from "@/components/ui/skeleton"

export function StatCardSkeleton() {
    return (
        <div className="rounded-2xl bg-white/50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800/50 shadow-sm h-full min-h-[140px] flex flex-col justify-between backdrop-blur-sm">
            <div className="flex justify-between items-start mb-3">
                <Skeleton className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 shadow-sm" />
                <Skeleton className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800/50" />
            </div>
            <div className="space-y-2 mt-auto">
                <Skeleton className="h-8 w-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-3 w-20 rounded-md bg-slate-100 dark:bg-slate-800/50" />
            </div>
        </div>
    )
}
