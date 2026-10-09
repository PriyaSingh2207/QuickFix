import { Radio } from "lucide-react";

export function EmergencyBanner() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-500 p-6 text-white shadow-lg animate-in fade-in zoom-in duration-500">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full animate-pulse">
                        <Radio className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold tracking-tight">Flash Flood Response</h2>
                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-800/50 rounded text-[10px] font-bold uppercase tracking-wider border border-red-400/30">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                                Live
                            </span>
                        </div>
                        <p className="text-red-100 font-medium">Sector 4, 5, and 6 affected • Command Center Active</p>
                    </div>
                </div>

                <div className="text-center md:text-right bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                    <p className="text-xs text-red-200 uppercase tracking-widest font-semibold">Elapsed Time</p>
                    <p className="text-3xl font-mono font-bold tracking-widest tabular-nums">02:14:35</p>
                </div>
            </div>
        </div>
    );
}
