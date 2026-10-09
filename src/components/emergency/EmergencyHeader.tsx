import { useState, useEffect, useRef } from "react";
import { Phone, Clock, ArrowLeft, RefreshCw, MapPin, AlertTriangle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function EmergencyHeader() {
    const [time, setTime] = useState(new Date());
    const [sosPressed, setSosPressed] = useState(false);
    const [sosProgress, setSosProgress] = useState(0);
    const sosIntervalRef = useRef<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // SOS Long Press Logic
    const handleSosDown = () => {
        setSosPressed(true);
        let progress = 0;
        sosIntervalRef.current = setInterval(() => {
            progress += 5;
            // Use local variable 'progress' for check to avoid state dependency lag
            if (progress >= 100) {
                setSosProgress(100);
                if (sosIntervalRef.current) clearInterval(sosIntervalRef.current);

                // Trigger Action
                setTimeout(() => {
                    alert("SOS DISTRESS SIGNAL SENT!");
                    handleSosUp();
                }, 100); // Small delay to let UI render 100%
                return;
            }
            setSosProgress(progress);
        }, 15);
    };

    const handleSosUp = () => {
        setSosPressed(false);
        setSosProgress(0);
        if (sosIntervalRef.current) {
            clearInterval(sosIntervalRef.current);
        }
    };

    // Removed useEffect [sosProgress] to avoid set-state-in-effect warning

    return (
        <TooltipProvider>
            <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-red-100 shadow-sm text-slate-900 transition-all duration-300">
                <div className="max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between gap-2">

                    {/* Left: Branding & Status */}
                    <div className="flex items-center gap-4 shrink-0">
                        {/* Mobile Back Icon */}
                        <div className="md:hidden">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Exit Emergency Mode?</DialogTitle>
                                        <DialogDescription>
                                            Live emergency data streaming will stop. You will return to the community dashboard.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => { }}>Cancel</Button>
                                        <Button variant="destructive" onClick={() => navigate('/')}>Exit Emergency</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="flex items-center gap-3">
                            <Tooltip>
                                <TooltipTrigger>
                                    <motion.div
                                        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)] ring-2 ring-red-100"
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Live Data Streaming Active</p>
                                </TooltipContent>
                            </Tooltip>

                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-lg tracking-wider text-red-600 leading-none">EMERGENCY</span>
                                    <Badge variant="outline" className="hidden sm:flex text-[10px] border-red-200 text-red-600 bg-red-50 font-bold px-1.5 py-0">
                                        LIVE ACTION
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-tight mt-0.5">
                                    <Tooltip>
                                        <TooltipTrigger className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-help">
                                            <MapPin className="w-3 h-3" />
                                            <span>Indore Sector 4</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-xs">
                                            <p className="font-bold">Ward 45: Vijay Nagar</p>
                                            <p>Jurisdiction: Central Command</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Segmented Critical Level - Visual Only */}
                                    <div className="hidden lg:flex items-center gap-0.5 ml-2 group cursor-help">
                                        <div className="w-2 h-3 bg-slate-200 rounded-sm" />
                                        <div className="w-2 h-3 bg-slate-200 rounded-sm" />
                                        <div className="w-2 h-3 bg-slate-200 rounded-sm" />
                                        <div className="w-2 h-3 bg-red-600 rounded-sm animate-pulse shadow-sm shadow-red-300" />
                                        <span className="ml-1 text-[10px] font-bold text-red-600 group-hover:underline decoration-red-200 underline-offset-2">Lvl 4</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center: Live Info (Desktop) */}
                    <div className="hidden xl:flex items-center gap-6 text-slate-600 text-sm font-medium bg-slate-50 px-6 py-2 rounded-full border border-slate-200 shadow-inner">
                        <div className="flex items-center gap-1 font-mono text-base text-slate-900">
                            <Clock className="w-4 h-4 text-slate-400 mr-1.5" />
                            <span>{time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="animate-pulse text-slate-400">:</span>
                            <span>{time.getSeconds().toString().padStart(2, '0')}</span>
                        </div>
                        <div className="w-[1px] h-4 bg-slate-300" />
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                            </motion.div>
                            <motion.span
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="text-xs uppercase font-semibold text-slate-500"
                            >
                                Updated just now
                            </motion.span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Desktop Back Button with Dialog */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hidden md:flex text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Exit Emergency
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="h-5 w-5" />
                                        Exit Emergency Mode?
                                    </DialogTitle>
                                    <DialogDescription className="py-2">
                                        You are about to leave the live command dashboard. Real-time incident updates will stop streaming.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="destructive"
                                        onClick={() => navigate('/')}
                                        className="w-full sm:w-auto"
                                    >
                                        Confirm Exit
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* SOS Long Press Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-red-200 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                                    <Button
                                        variant="destructive"
                                        className="relative overflow-hidden bg-red-600 hover:bg-red-700 font-bold shadow-xl shadow-red-200 hover:shadow-red-300 transition-all rounded-full pl-5 pr-6 h-11"
                                        onMouseDown={handleSosDown}
                                        onMouseUp={handleSosUp}
                                        onMouseLeave={handleSosUp}
                                        onTouchStart={handleSosDown}
                                        onTouchEnd={handleSosUp}
                                    >
                                        <div className="absolute inset-0 bg-black/10 z-0" style={{ width: `${sosProgress}%`, transition: 'width 0.1s linear' }} />

                                        <div className="relative z-10 flex items-center gap-2">
                                            <Phone className={`w-4 h-4 ${sosPressed ? 'animate-ping' : ''}`} />
                                            <span className="hidden md:inline">{sosPressed ? 'HOLD TO ALERT...' : 'SOS HELP'}</span>
                                            <span className="md:hidden">SOS</span>
                                        </div>
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Long-press for 2s to alert Control Center</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Severity Gradient Strip */}
                <div className="w-full h-[3px] bg-slate-100">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                        className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600"
                    />
                </div>
            </header>
        </TooltipProvider>
    );
}
