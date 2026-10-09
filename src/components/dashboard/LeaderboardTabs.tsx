
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeaderboardTabsProps {
    activeTab: 'weekly' | 'monthly';
    onTabChange: (tab: 'weekly' | 'monthly') => void;
}

export function LeaderboardTabs({ activeTab, onTabChange }: LeaderboardTabsProps) {
    return (
        <div className="flex p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl w-fit border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange('weekly')}
                className={cn(
                    "rounded-lg px-4 text-xs font-bold transition-all hover:bg-white/50",
                    activeTab === 'weekly'
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                )}
            >
                Weekly
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange('monthly')}
                className={cn(
                    "rounded-lg px-4 text-xs font-bold transition-all hover:bg-white/50",
                    activeTab === 'monthly'
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                )}
            >
                Monthly
            </Button>
        </div>
    );
}
