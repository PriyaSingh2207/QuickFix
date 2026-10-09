import { useState, useEffect } from 'react';
import { Play, Square, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function CPRTrainer() {
    const [isActive, setIsActive] = useState(false);

    // Using beats counter purely for animation/logic if needed, but not displaying it in new design yet.
    // Keeping this state to trigger re-renders on interval.
    const [, setTick] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isActive) {
            // 110 BPM = ~545ms interval
            interval = setInterval(() => {
                setTick(t => t + 1);
                if (navigator.vibrate) navigator.vibrate(50);
            }, 545);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const toggleTrainer = () => {
        setIsActive(!isActive);
        if (!isActive) setTick(0);
    };

    return (
        <Card className="mt-8 p-8 border-0 shadow-xl rounded-[2.5rem] bg-white dark:bg-slate-900 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />

            <div className="flex flex-col items-center text-center relative z-10">
                <div className="flex items-center gap-2 mb-8">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Offline Ready</span>
                </div>

                {/* Circular BPM Indicator */}
                <div className="relative mb-8 group cursor-pointer" onClick={toggleTrainer}>
                    {/* Outer Rings */}
                    <div className={cn(
                        "absolute inset-0 rounded-full border-[3px] border-teal-100 dark:border-teal-900/30 transition-all duration-300",
                        isActive ? "scale-110 opacity-0" : "scale-100"
                    )} />

                    <div className={cn(
                        "w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 transition-all duration-300 relative z-10",
                        isActive ? "border-teal-500 shadow-[0_0_40px_-10px_rgba(20,184,166,0.4)]" : "border-slate-100 dark:border-slate-700"
                    )}>

                        {/* Heart Icon */}
                        <div className={cn(
                            "mb-2 text-teal-500 transition-all duration-200",
                            isActive ? "scale-125" : "scale-100"
                        )}>
                            <Heart className="w-8 h-8 fill-current" />
                        </div>

                        {/* BPM Text */}
                        <div className="text-5xl font-bold text-slate-800 dark:text-white tracking-tighter">
                            110
                        </div>
                        <div className="text-sm font-medium text-teal-600 dark:text-teal-400 uppercase tracking-widest mt-1">
                            BPM
                        </div>

                        {/* Pulse Ring Animation */}
                        {isActive && (
                            <div className="absolute inset-0 rounded-full border-2 border-teal-500 animate-ping opacity-20" />
                        )}
                    </div>
                </div>

                <div className="space-y-1 mb-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Push Hard and Fast</h3>
                    <p className="text-slate-500 text-sm">Maintain this rhythm for effective compressions</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 w-full max-w-xs">
                    <Button
                        size="lg"
                        className={cn(
                            "flex-1 h-14 rounded-2xl text-lg font-bold shadow-lg transition-all",
                            isActive
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" // Pause state style
                                : "bg-[#2A7F7F] hover:bg-[#236b6b] text-white shadow-teal-200/50" // Start state style matching image
                        )}
                        onClick={toggleTrainer}
                    >
                        {isActive ? (
                            <span className="flex items-center">
                                <Square className="w-5 h-5 mr-2 fill-current" /> Pause
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <Play className="w-5 h-5 mr-2 fill-current" /> Start CPR
                            </span>
                        )}
                    </Button>

                    {isActive && (
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-14 w-14 rounded-2xl bg-rose-100 text-rose-600 hover:bg-rose-200 shadow-none border-0"
                            onClick={() => { setIsActive(false); setTick(0); }}
                        >
                            <Square className="w-5 h-5 fill-current" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
