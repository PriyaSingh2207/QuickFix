
import { Card } from "@/components/ui/card";
import { Copy, Gift } from "lucide-react";
import type { Redemption } from "./data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MyRewardsProps {
    redemptions: Redemption[];
}

export function MyRewards({ redemptions }: MyRewardsProps) {
    if (redemptions.length === 0) return null;

    return (
        <div className="mb-12 animate-in slide-in-from-top-8 duration-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                <Gift className="w-6 h-6 text-indigo-500" />
                My Vouchers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {redemptions.map(r => (
                    <Card key={r.id} className="p-4 flex gap-4 items-center bg-indigo-50/50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 border-dashed border-2">
                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
                            <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm truncate">{r.title}</h4>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-2 truncate">{r.brand}</p>

                            <div className="flex items-center gap-2">
                                <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded text-xs font-mono font-bold text-slate-600 border border-indigo-200 select-all">
                                    {r.code}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-white"
                                    onClick={() => {
                                        navigator.clipboard.writeText(r.code);
                                        toast.success('Copied!');
                                    }}
                                >
                                    <Copy className="w-3 h-3 text-indigo-400" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
