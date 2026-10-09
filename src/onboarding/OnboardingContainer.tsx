import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SplashScreen } from "./SplashScreen";
import { OnboardingSlide } from "./OnboardingSlide";
import { ProgressDots } from "./ProgressDots";
import { NavigationButtons } from "./NavigationButtons";
import { slides } from "./slides";

import { useAuth } from "@/contexts/AuthContext";

export function OnboardingContainer() {
    const navigate = useNavigate();
    const { loginAsDemo } = useAuth();
    const [showSplash, setShowSplash] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Initial Splash Timer
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const finishOnboarding = () => {
        localStorage.setItem("quickfix_onboarding_completed_v2", "true");
        loginAsDemo('citizen');
        navigate("/", { replace: true });
    };

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            finishOnboarding();
        }
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
                {showSplash && <SplashScreen key="splash" />}
            </AnimatePresence>

            {!showSplash && (
                <motion.div
                    className="flex-1 flex flex-col items-center justify-between pt-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Top Indicator */}
                    <div className="w-full flex justify-center py-4">
                        <ProgressDots total={slides.length} current={currentSlide} />
                    </div>

                    {/* Slide Content */}
                    <div className="flex-1 w-full relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute inset-0"
                            >
                                <OnboardingSlide data={slides[currentSlide]} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Bottom Controls */}
                    <NavigationButtons
                        current={currentSlide}
                        total={slides.length}
                        onNext={handleNext}
                        onSkip={finishOnboarding}
                    />
                </motion.div>
            )}
        </div>
    );
}
