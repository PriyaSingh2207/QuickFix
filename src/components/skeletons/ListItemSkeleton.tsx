import { Skeleton } from "@/components/ui/skeleton"

export function ListItemSkeleton() {
    return (
        <div className="relative pl-2 py-2">
            {/* Connector Line Placeholder */}
            <div className="absolute left-[2px] top-8 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800" />

            <div className="flex gap-4">
                {/* Dot */}
                <div className="relative z-10 pt-1">
                    <Skeleton className="h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700" />
                </div>

                {/* Card */}
                <div className="flex-1 ml-2">
                    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden p-0 mb-4">
                        {/* Image Area */}
                        <Skeleton className="h-32 w-full rounded-t-2xl rounded-b-none bg-slate-100 dark:bg-slate-800" />

                        <div className="p-4 space-y-3">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1 mr-4">
                                    <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-slate-700" />
                                    <Skeleton className="h-4 w-[85%] bg-slate-200 dark:bg-slate-700" />
                                </div>
                                <Skeleton className="h-5 w-12 rounded-full bg-slate-100 dark:bg-slate-800" />
                            </div>

                            {/* Body */}
                            <div className="space-y-1.5 pt-1">
                                <Skeleton className="h-3 w-full bg-slate-100 dark:bg-slate-800" />
                                <Skeleton className="h-3 w-[90%] bg-slate-100 dark:bg-slate-800" />
                            </div>

                            {/* Footer Actions */}
                            <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-50 dark:border-slate-800">
                                <Skeleton className="h-3 w-24 bg-slate-100 dark:bg-slate-800" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800" />
                                    <Skeleton className="h-7 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
