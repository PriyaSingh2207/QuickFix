import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, ArrowLeft, PhoneCall, Info } from 'lucide-react';
import type { EmergencyGuide } from './data';
import { GuideIllustration } from './GuideIllustration';
import { CPRTrainer } from './CPRTrainer';
import { EmergencyChecklist } from './EmergencyChecklist';
import { motion, AnimatePresence } from 'framer-motion';

interface GuideStepViewerProps {
    guide: EmergencyGuide;
    onBack: () => void;
}

export function GuideStepViewer({ guide, onBack }: GuideStepViewerProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const totalSteps = guide.steps.length;
    const isCPR = guide.id === 'cpr';

    const nextStep = () => {
        if (currentStep < totalSteps - 1) setCurrentStep(c => c + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(c => c - 1);
    };

    return (
        <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
            {/* Minimal Header */}
            <header className="flex items-center justify-between mb-8 py-2 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full h-10 w-10 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all">
                        <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-none">{guide.title}</h2>

                    </div>
                </div>

                {/* Emergency Call Button */}
                <Button variant="destructive" className="rounded-full px-4 shadow-lg shadow-rose-200 dark:shadow-rose-900/20 animate-pulse bg-rose-500 hover:bg-rose-600">
                    <PhoneCall className="w-4 h-4 mr-2" /> Call 112
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* LEFT: Step Content (7 cols) */}
                <div className="lg:col-span-12 xl:col-span-8 flex flex-col">

                    {/* Main Step Card */}
                    <Card className="flex-1 overflow-hidden border-0 shadow-2xl rounded-[2.5rem] bg-white dark:bg-slate-900 relative">
                        {/* Top Progress Indicator */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800 z-10">
                            <motion.div
                                className="h-full bg-[#2A7F7F]"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>

                        <div className="relative h-full flex flex-col">
                            {/* Illustration Area */}
                            <div className="bg-slate-50 dark:bg-slate-950/50 flex items-center justify-center p-8 min-h-[320px] lg:min-h-[400px]">
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full max-w-md"
                                    >
                                        <GuideIllustration
                                            guideId={guide.id}
                                            stepIndex={currentStep}
                                            className="shadow-sm rounded-3xl"
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Content Area */}
                            <div className="p-8 lg:p-10 flex flex-col flex-1">
                                <span className="inline-block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    Step {currentStep + 1} of {totalSteps}
                                </span>

                                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-6 leading-tight">
                                    {guide.steps[currentStep].title}
                                </h3>

                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex gap-4">
                                        <Info className="w-6 h-6 text-[#2A7F7F] shrink-0 mt-1" />
                                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                            {guide.steps[currentStep].text}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-8 flex gap-4">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={prevStep}
                                        disabled={currentStep === 0}
                                        className="h-14 rounded-2xl px-8 text-base border-slate-200 text-slate-600 hover:bg-slate-50"
                                    >
                                        Back
                                    </Button>

                                    <Button
                                        size="lg"
                                        onClick={nextStep}
                                        disabled={currentStep === totalSteps - 1}
                                        className="flex-1 h-14 rounded-2xl bg-[#2A7F7F] hover:bg-[#236b6b] text-white text-base shadow-lg shadow-teal-200/50 font-bold"
                                    >
                                        {currentStep === totalSteps - 1 ? 'Complete Guide' : 'Continue'}
                                        {currentStep < totalSteps - 1 && <ChevronRight className="w-5 h-5 ml-2" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>


                </div>

                {/* RIGHT: Tools (4 cols) */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                    {/* CPR Trainer Injection (Always Visible for CPR guide) */}
                    {isCPR && (
                        <div className="animate-in slide-in-from-bottom-10 delay-100">
                            <CPRTrainer />
                        </div>
                    )}

                    <div className="sticky top-24">
                        <EmergencyChecklist items={guide.checklist} guideId={guide.id} />
                    </div>
                </div>

            </div>
        </div>
    );
}
