import { Maximize2, Shield, AlertTriangle, Plus, Minus, Navigation, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TacticalMapPanel() {
    return (
        <div className="h-[400px] md:h-full bg-slate-100 rounded-3xl overflow-hidden relative border border-slate-200 shadow-xl group">
            {/* Map Placeholder Graphic - Light Theme */}
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/75.8577,22.7196,11,0/800x600@2x?access_token=pk.mock')] bg-cover bg-center grayscale opacity-60 mix-blend-multiply">
                {/* Fallback CSS Grid if image fails */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.3)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
            </div>

            {/* Overlay Gradient - Soft White */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/40 pointer-events-none" />

            {/* Map Controls (Right Side) */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
                <Button size="icon" variant="secondary" className="bg-white/90 text-slate-700 hover:bg-white shadow-sm border border-slate-200" title="Recenter Map">
                    <Navigation className="w-4 h-4" />
                </Button>

                <div className="flex flex-col rounded-lg bg-white/90 shadow-sm border border-slate-200 overflow-hidden">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none hover:bg-slate-100 border-b border-slate-100">
                        <Plus className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none hover:bg-slate-100">
                        <Minus className="w-4 h-4 text-slate-600" />
                    </Button>
                </div>

                <div className="flex flex-col rounded-lg bg-white/90 shadow-sm border border-slate-200 overflow-hidden mt-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none hover:bg-slate-100 border-b border-slate-100" title="Layers">
                        <Maximize2 className="w-4 h-4 text-slate-600" />
                    </Button>
                </div>
            </div>

            {/* Pulsing Hotspots - Pure CSS UI */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none text-xs">
                {/* Zone 1 - Critical Fire - Now with Interactive Popover */}
                <div className="absolute top-[40%] left-[30%] group/marker cursor-pointer pointer-events-auto transition-transform hover:scale-110 duration-200">
                    <span className="relative flex h-8 w-8">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-8 w-8 bg-red-500 border-4 border-white shadow-lg items-center justify-center ring-2 ring-red-100">
                            <AlertTriangle className="w-4 h-4 text-white" />
                        </span>
                    </span>

                    {/* Hover Info Card */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-red-100 shadow-xl text-left w-max opacity-0 group-hover/marker:opacity-100 transition-all transform translate-y-4 group-hover/marker:translate-y-0 z-20 pointer-events-none">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Critical Alert</p>
                        </div>
                        <p className="font-bold text-slate-900 text-sm leading-none mb-0.5">Industrial Fire</p>
                        <p className="text-[10px] text-slate-500">Sector 7 • 12 Units On-site</p>

                        {/* Connecting Arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-b border-r border-red-100"></div>
                    </div>
                </div>

                {/* Zone 2 - Safe Zone */}
                <div className="absolute top-[60%] right-[35%] group/marker cursor-pointer pointer-events-auto hover:z-20">
                    <span className="relative flex h-10 w-10 transition-transform group-hover/marker:scale-110">
                        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 duration-1000"></span>
                        <Shield className="relative z-10 w-10 h-10 text-emerald-500 fill-emerald-50 drop-shadow-md" />
                    </span>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-emerald-100 shadow-lg text-emerald-600 font-bold whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-all transform translate-y-2 group-hover/marker:translate-y-0 z-10">
                        <div className="text-center">
                            <span className="block text-xs uppercase text-emerald-600/70 tracking-widest">Safe Zone</span>
                            Community Center
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b border-r border-emerald-100"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Status Panel */}
            <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-md border border-white/50 shadow-lg p-3 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl">
                            <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Live Satellite Feed</p>
                            <p className="text-xs font-mono font-bold text-slate-700">CONNECTED • LAT 22.7196 N</p>
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200" />
                        <span className="w-2 h-2 bg-slate-200 rounded-full" />
                        <span className="w-2 h-2 bg-slate-200 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
