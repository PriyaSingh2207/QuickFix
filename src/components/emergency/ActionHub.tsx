
import { motion, AnimatePresence } from "framer-motion";
import { HandHelping, Megaphone, Truck, Home, CheckCircle2, MapPin, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const actions = [
    { title: "Request Rescue", icon: HandHelping, color: "bg-red-600", colorText: "text-red-600", desc: "Immediate help needed", tag: "Critical" },
    { title: "Report Hazard", icon: Megaphone, color: "bg-orange-600", colorText: "text-orange-600", desc: "Flood, fire, debris", tag: "Alert" },
    { title: "Offer Transport", icon: Truck, color: "bg-blue-600", colorText: "text-blue-600", desc: "Help evacuate others", tag: "Volunteer" },
    { title: "Provide Shelter", icon: Home, color: "bg-emerald-600", colorText: "text-emerald-600", desc: "Open your home", tag: "Support" },
];

function ActionWizard({ action }: { action: any }) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else handleSubmit();
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                <div className={`w-16 h-16 rounded-full ${action.color} flex items-center justify-center shadow-lg shadow-green-100`}>
                    <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-xl text-slate-900">Request Sent!</h3>
                    <p className="text-sm text-slate-500">ID: {new Date().getTime().toString(36).toUpperCase()}</p>
                </div>
                <DrawerClose asChild>
                    <Button variant="outline" className="mt-4">Close</Button>
                </DrawerClose>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-2">
            {/* Stepper */}
            <div className="flex justify-between relative px-2">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {s}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[160px]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            <h4 className="font-bold text-lg">Confirm Action Type</h4>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-4">
                                <div className={`p-3 rounded-full ${action.color} text-white`}>
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{action.title}</p>
                                    <Badge variant="outline" className="mt-1">{action.tag}</Badge>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">
                                This will generate a high-priority ticket in the command center triage queue.
                            </p>
                        </motion.div>
                    )}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            <h4 className="font-bold text-lg">Verify Location</h4>
                            <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-200">
                                <MapPin className="w-8 h-8 text-red-500 mb-2 animate-bounce" style={{ animationDuration: '2s' }} />
                                {/* Label simulation */}
                                <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur p-2 rounded-lg text-xs font-mono shadow-sm border border-slate-100 flex items-center justify-between">
                                    <span>LAT: 22.7196 | LNG: 75.8577</span>
                                    <Badge variant="secondary" className="text-[10px] h-4">Precise</Badge>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 text-center">Using device GPS • Accuracy: 5m</p>
                        </motion.div>
                    )}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            <h4 className="font-bold text-lg">Summary</h4>
                            <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Type</span>
                                    <span className="font-bold">{action.title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Urgency</span>
                                    <span className={`font-bold ${action.colorText}`}>{action.tag}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Location</span>
                                    <span className="font-bold">Sector 7, Indore</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between items-center mt-2">
                                    <span className="text-slate-500 text-xs">Est. Response</span>
                                    <Badge>~8 Mins</Badge>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <DrawerClose asChild>
                    <Button variant="ghost" className="flex-1" disabled={isSubmitting}>Cancel</Button>
                </DrawerClose>
                <Button
                    className={`flex-[2] ${action.color.replace('bg-', 'bg-')} hover:opacity-90`}
                    onClick={handleNext}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                        </>
                    ) : step === 3 ? (
                        "Submit Request"
                    ) : (
                        <>
                            Next Step <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

export function ActionHub() {
    return (
        <section className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                {actions.map((action) => (
                    <Drawer key={action.title}>
                        <DrawerTrigger asChild>
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex flex-col items-start text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all relative overflow-hidden group"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 ${action.color} opacity-5 group-hover:opacity-10 transition-opacity rounded-full -mr-10 -mt-10 blur-2xl`} />

                                <div className={`w-12 h-12 rounded-xl ${action.color} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                    <action.icon className="w-6 h-6" />
                                </div>

                                <h3 className="font-black text-slate-900 text-base md:text-lg leading-tight mb-1">{action.title}</h3>
                                <p className="text-xs font-medium text-slate-500 mb-3">{action.desc}</p>

                                <Badge variant="secondary" className={`bg-slate-100 border-slate-200 ${action.tag === 'Critical' ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-600'}`}>
                                    {action.tag}
                                </Badge>
                            </motion.button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <div className="mx-auto w-full max-w-sm pb-8">
                                <DrawerHeader>
                                    <DrawerTitle className="text-center text-xl">Action Protocol</DrawerTitle>
                                    <DrawerDescription className="text-center">Initiating command sequence for {action.title}</DrawerDescription>
                                </DrawerHeader>
                                <div className="px-4">
                                    <ActionWizard action={action} />
                                </div>
                            </div>
                        </DrawerContent>
                    </Drawer>
                ))}
            </div>
        </section>
    );
}
