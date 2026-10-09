import { Skeleton } from "@/components/ui/skeleton"

export function CarouselCardSkeleton() {
    return (
        <div className="h-[340px] rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">

            {/* Background Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
                <Skeleton className="absolute inset-0 bg-transparent" />
            </div>

            <div className="relative z-10 flex justify-between items-start">
                <Skeleton className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-700 shadow-sm" />
                <Skeleton className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            <div className="relative z-10 space-y-4 mt-auto">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-3/4 bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-full bg-slate-100 dark:bg-slate-800" />
                        <Skeleton className="h-4 w-[80%] bg-slate-100 dark:bg-slate-800" />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Skeleton className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
                </div>
            </div>
        </div>
    )
}
