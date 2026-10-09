import { useState } from 'react';
import { EarnGuideModal } from '@/components/rewards/EarnGuideModal';
import { PointsBanner } from '@/components/rewards/PointsBanner';
import { RewardGrid } from '@/components/rewards/RewardGrid';
import { RedeemModal } from '@/components/rewards/RedeemModal';
import { MyRewards } from '@/components/rewards/MyRewards';
import type { Reward, Redemption } from '@/components/rewards/data';

export default function RewardsPage() {
    const [points, setPoints] = useState(320); // Starting dummy points
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [showGuide, setShowGuide] = useState(false);

    const handleRedeem = (reward: Reward, code: string) => {
        // ... (existing logic)
        // Logic to deduct points
        if (points >= reward.points) {
            setPoints(prev => prev - reward.points);

            // Add to redemptions
            const newRedemption: Redemption = {
                id: Math.random().toString(36),
                reward_id: reward.id,
                code: code,
                redeemed_at: new Date().toISOString(),
                image: reward.image,
                title: reward.title,
                brand: reward.brand,
                expiry: '30 days'
            };

            setRedemptions(prev => [newRedemption, ...prev]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <PointsBanner
                points={points}
                onOpenGuide={() => setShowGuide(true)}
            />

            <div className="container max-w-6xl mx-auto px-4 md:px-8">
                {/* ... (existing content) */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                        Reward Marketplace
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Redeem your hard-earned civic points for real-world benefits.
                    </p>
                </div>

                <MyRewards redemptions={redemptions} />

                <RewardGrid
                    userPoints={points}
                    onRedeem={setSelectedReward}
                />
            </div>

            <RedeemModal
                reward={selectedReward}
                currentPoints={points}
                onClose={() => setSelectedReward(null)}
                onRedeem={handleRedeem}
            />

            <EarnGuideModal
                open={showGuide}
                onOpenChange={setShowGuide}
            />
        </div>
    );
}
