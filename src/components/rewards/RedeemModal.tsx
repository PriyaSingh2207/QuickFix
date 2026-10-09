
import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Reward } from './data';
import { Coins, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface RedeemModalProps {
    reward: Reward | null;
    currentPoints: number;
    onClose: () => void;
    onRedeem: (reward: Reward, code: string) => void;
}

export function RedeemModal({ reward, currentPoints, onClose, onRedeem }: RedeemModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'confirm' | 'success'>('confirm');
    const [voucherCode, setVoucherCode] = useState('');

    if (!reward) return null;

    const canAfford = currentPoints >= reward.points;

    const handleRedeem = async () => {
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            const code = `QUICKFIX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            setVoucherCode(code);
            setStep('success');
            setIsLoading(false);
            onRedeem(reward, code);
        }, 1500);
    };

    return (
        <Dialog open={!!reward} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md border-0 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden p-0 gap-0">
                {step === 'confirm' ? (
                    <>
                        <div className="relative h-40 w-full">
                            <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-4 left-6 text-white p-2">
                                <Badge className="mb-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border-0 text-white">
                                    {reward.brand}
                                </Badge>
                                <h3 className="text-xl font-bold leading-tight">{reward.title}</h3>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="text-sm font-medium text-slate-500">Total Cost</div>
                                <div className="flex items-center text-xl font-bold text-teal-600">
                                    <Coins className="w-5 h-5 mr-2 fill-current" />
                                    {reward.points} Pts
                                </div>
                            </div>

                            {!canAfford && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium text-center">
                                    Insufficient points. You need {reward.points - currentPoints} more.
                                </div>
                            )}

                            <div className="text-sm text-slate-500 text-center px-4">
                                By redeeming, {reward.points} points will be deducted from your account. The voucher code will be valid for 30 days.
                            </div>

                            <Button
                                className="w-full h-12 text-lg font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200/50 disabled:opacity-50"
                                disabled={isLoading || !canAfford}
                                onClick={handleRedeem}
                            >
                                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Confirm Redemption'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                        <div className="h-20 w-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6">
                            <div className="relative">
                                <CheckCircle2 className="w-10 h-10" />
                                <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20"></span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Redeemed Successfully!</h2>
                        <p className="text-slate-500 mb-6">Here is your voucher code for {reward.brand}.</p>

                        <div className="w-full bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 mb-6 relative group cursor-pointer"
                            onClick={() => {
                                navigator.clipboard.writeText(voucherCode);
                                toast.success('Code copied to clipboard!');
                            }}>
                            <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Voucher Code</div>
                            <div className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-widest">
                                {voucherCode}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                <span className="bg-white text-xs font-bold px-2 py-1 rounded shadow-sm">Click to Copy</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 rounded-xl"
                            variant="outline"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
