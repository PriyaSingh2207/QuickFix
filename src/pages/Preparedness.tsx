
import { useState } from 'react';
import { OfflineNotice } from '@/components/preparedness/OfflineNotice';
import { EmergencyGuideCards } from '@/components/preparedness/EmergencyGuideCards';
import { GuideStepViewer } from '@/components/preparedness/GuideStepViewer';
import type { EmergencyGuide } from '@/components/preparedness/data';
import { ShieldAlert, BookOpen } from 'lucide-react';

export default function Preparedness() {
    const [activeGuide, setActiveGuide] = useState<EmergencyGuide | null>(null);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Offline Badge */}
                <OfflineNotice />

                {/* Header (Only show when not in guide mode for cleaner focus, or keep minimal) */}
                {!activeGuide && (
                    <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
                        {/* Hero Section */}
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1E293B] shadow-2xl mb-12">
                            {/* Blue Gradient/Image Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/50 z-0" />
                            <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />

                            <div className="relative z-10 p-8 lg:p-16 text-white max-w-3xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold uppercase tracking-wider mb-6 text-indigo-200">
                                    <ShieldAlert className="w-3 h-3" /> Civic Safety Initiative
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
                                    Be Prepared. <span className="text-indigo-400">Save Lives.</span>
                                </h1>
                                <p className="text-lg text-slate-300 max-w-xl mb-8 leading-relaxed">
                                    Disasters don't warn you, but preparation can save you. Learn what to do before, during, and after emergencies.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg transition-all flex items-center gap-2">
                                        <BookOpen className="w-5 h-5" /> View Emergency Guides
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">What To Do In Emergency</h2>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                {activeGuide ? (
                    <GuideStepViewer
                        guide={activeGuide}
                        onBack={() => setActiveGuide(null)}
                    />
                ) : (
                    <EmergencyGuideCards onSelectGuide={setActiveGuide} />
                )}

            </div>
        </div>
    );
}
