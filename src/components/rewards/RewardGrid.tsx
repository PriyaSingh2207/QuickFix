
import { useState, useMemo } from 'react';
import { REWARDS, type Reward, type RewardCategory } from './data';
import { RewardCard } from './RewardCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RewardGridProps {
    userPoints: number;
    onRedeem: (reward: Reward) => void;
}

const CATEGORIES: RewardCategory[] = ['All', 'Transport', 'Food', 'Events', 'Essentials'];

export function RewardGrid({ userPoints, onRedeem }: RewardGridProps) {
    const [selectedCategory, setSelectedCategory] = useState<RewardCategory>('All');

    const filteredRewards = useMemo(() => {
        if (selectedCategory === 'All') return REWARDS;
        return REWARDS.filter(r => r.category === selectedCategory);
    }, [selectedCategory]);

    return (
        <div className="space-y-8">
            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {CATEGORIES.map(cat => (
                    <Button
                        key={cat}
                        variant="ghost"
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            "rounded-full px-6 transition-all",
                            selectedCategory === cat
                                ? "bg-slate-900 text-white shadow-lg hover:bg-slate-800"
                                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
                        )}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                {filteredRewards.map((reward) => (
                    <div
                        key={reward.id}
                        className="animate-in fade-in zoom-in duration-300"
                    >
                        <RewardCard
                            reward={reward}
                            userPoints={userPoints}
                            onRedeem={onRedeem}
                        />
                    </div>
                ))}
            </div>

            {filteredRewards.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    No rewards found in this category.
                </div>
            )}
        </div>
    );
}
