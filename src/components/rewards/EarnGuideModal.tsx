
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Camera,
    CheckCircle2,
    Share2,
    Trophy,
    Gift,
    QrCode,
    ShieldCheck,
    Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EarnGuideModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EarnGuideModal({ open, onOpenChange }: EarnGuideModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-3xl">
                <div className="relative h-32 bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="relative z-10 text-center text-white">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-2 backdrop-blur-sm">
                            <Trophy className="w-6 h-6 text-yellow-300 fill-current" />
                        </div>
                        <h2 className="text-2xl font-bold">Civic Rewards Guide</h2>
                    </div>
                </div>

                <div className="p-6">
                    <Tabs defaultValue="earn" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                            <TabsTrigger value="earn" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm font-bold">How to Earn</TabsTrigger>
                            <TabsTrigger value="redeem" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm font-bold">How to Redeem</TabsTrigger>
                        </TabsList>

                        <TabsContent value="earn" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Complete Actions, Earn Points</h3>
                                        <p className="text-sm text-slate-500">Every contribution helps make our city better.</p>
                                    </div>

                                    {/* Action List */}
                                    <div className="grid gap-4">
                                        <ActionCard
                                            icon={Camera}
                                            color="text-blue-500 bg-blue-50"
                                            title="Report an Issue"
                                            points={50}
                                            desc="Submit a verified photo complaint about civic issues like potholes or garbage."
                                        />
                                        <ActionCard
                                            icon={CheckCircle2}
                                            color="text-green-500 bg-green-50"
                                            title="Verify a Report"
                                            points={10}
                                            desc="Confirm issues reported by others in your neighborhood."
                                        />
                                        <ActionCard
                                            icon={ShieldCheck}
                                            color="text-indigo-500 bg-indigo-50"
                                            title="Complete Safety Drill"
                                            points={100}
                                            desc="Participate in preparedness quizzes or mock drills."
                                        />
                                        <ActionCard
                                            icon={Share2}
                                            color="text-purple-500 bg-purple-50"
                                            title="Share Alerts"
                                            points={5}
                                            desc="Share critical city alerts with friends and family."
                                        />
                                    </div>

                                    <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 flex gap-4">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                            <Trophy className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-yellow-800">Level Up Bonuses</h4>
                                            <p className="text-xs text-yellow-700 mt-1">
                                                Reach new citizen levels (Silver, Gold, Platinum) to unlock exclusive rewards and earn point multipliers!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="redeem" className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Simple Redemption Process</h3>
                                <p className="text-sm text-slate-500">Turn your points into real benefits in 3 steps.</p>
                            </div>

                            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                                <StepItem
                                    number={1}
                                    title="Browse & Select"
                                    desc="Explore the marketplace and choose a reward you have enough points for."
                                    icon={Gift}
                                />
                                <StepItem
                                    number={2}
                                    title="Activiate Voucher"
                                    desc="Click 'Redeem', confirm the point deduction, and generate your unique code."
                                    icon={Coins}
                                />
                                <StepItem
                                    number={3}
                                    title="Use Instantly"
                                    desc="Show the code at the store or enter it depending of the service."
                                    icon={QrCode}
                                    isLast
                                />
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center mt-6">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    Vouchers are valid for 30 days after redemption.
                                </p>
                            </div>

                            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl" onClick={() => onOpenChange(false)}>
                                Got it, let's start!
                            </Button>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ActionCard({ icon: Icon, color, title, points, desc }: any) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 dark:text-white">{title}</h4>
                    <span className="inline-flex items-center px-2 py-1 rounded bg-teal-50 text-teal-700 text-xs font-bold">
                        +{points} Pts
                    </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function StepItem({ number, title, desc, icon: Icon }: any) {
    return (
        <div className="relative pl-12">
            <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center z-10 shadow-sm">
                <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                    <span className="text-indigo-600">0{number}.</span> {title}
                </h4>
                <p className="text-slate-500 mt-1 leading-relaxed">
                    {desc}
                </p>
            </div>
        </div>
    );
}
