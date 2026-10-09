
import { Card } from '@/components/ui/card';
import { ChevronRight, Bookmark } from 'lucide-react';
import { EMERGENCY_GUIDES, type EmergencyGuide } from './data';
import { cn } from '@/lib/utils';

interface EmergencyGuideCardsProps {
    onSelectGuide: (guide: EmergencyGuide) => void;
}

export function EmergencyGuideCards({ onSelectGuide }: EmergencyGuideCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700">
            {EMERGENCY_GUIDES.map((guide) => {
                const Icon = guide.icon;
                return (
                    <Card
                        key={guide.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6"
                    >
                        {/* Card Header */}
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-3 rounded-full bg-slate-50 transition-colors group-hover:bg-slate-100 dark:bg-slate-800",
                                    guide.color.replace('bg-', 'text-').split(' ')[0] // Extract color for icon text
                                )}>
                                    <Icon className={cn("w-6 h-6", guide.color.split(' ')[0])} />
                                </div>
                                <div className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                                    {/* Using a bookmark icon as visual filler similar to reference */}
                                    <Bookmark className="w-5 h-5 text-slate-300" />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                                {guide.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 line-clamp-2">
                                {guide.description}
                            </p>
                        </div>

                        {/* Card Footer */}
                        <div
                            className="flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline decoration-2 underline-offset-4 cursor-pointer"
                            onClick={() => onSelectGuide(guide)}
                        >
                            View Steps <ChevronRight className="w-4 h-4 ml-1" />
                        </div>

                        {/* Top Border Accent */}
                        <div className={cn("absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity", guide.color.split(' ')[1])} />
                    </Card>
                );
            })}
        </div>
    );
}
