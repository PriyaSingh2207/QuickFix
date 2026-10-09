import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

interface NavigationButtonsProps {
    current: number;
    total: number;
    onNext: () => void;
    onSkip: () => void;
}

export function NavigationButtons({ current, total, onNext, onSkip }: NavigationButtonsProps) {
    const isLast = current === total - 1;

    return (
        <div className="w-full max-w-md flex items-center justify-between px-6 pb-10">
            <Button
                variant="ghost"
                onClick={onSkip}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
                {isLast ? "" : "Skip"}
            </Button>

            <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                    onClick={onNext}
                    size="lg"
                    className="rounded-full px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-500/30"
                >
                    {isLast ? (
                        <>Get Started <Check className="ml-2 h-4 w-4" /></>
                    ) : (
                        <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                </Button>
            </motion.div>
        </div>
    );
}
