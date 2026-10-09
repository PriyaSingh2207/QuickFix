
import { useState } from 'react';
import { CheckCircle2, PhoneCall, ChevronRight } from 'lucide-react';

interface EmergencyChecklistProps {
    items: string[];
    guideId: string;
}

export function EmergencyChecklist({ items }: EmergencyChecklistProps) {
    const [checked, setChecked] = useState<Record<number, boolean>>({});

    const handleCheck = (idx: number) => {
        setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const completed = Object.values(checked).filter(Boolean).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Emergency Checklist</h3>
                <span className="text-xs font-semibold text-slate-400">{completed} of {items.length} done</span>
            </div>

            {items.map((item, idx) => {
                const isUrgent = item.toLowerCase().includes('call') || item.toLowerCase().includes('emergency');

                return (
                    <div
                        key={idx}
                        className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${isUrgent
                            ? 'bg-white border-rose-500 shadow-lg shadow-rose-100 dark:bg-slate-900 dark:border-rose-500/50'
                            : checked[idx]
                                ? 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                : 'bg-white border-slate-100 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800'
                            }`}
                    >
                        <div
                            className="flex items-center gap-4 p-4 cursor-pointer"
                            onClick={() => handleCheck(idx)}
                        >
                            {/* Custom Checkbox */}
                            <div className={`
                                h-8 w-8 rounded-[10px] flex items-center justify-center border-2 transition-all duration-300 shrink-0
                                ${checked[idx]
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : isUrgent ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'
                                }
                            `}>
                                {checked[idx] && <CheckCircle2 className="w-5 h-5 text-white" />}
                            </div>

                            <div className="flex-1">
                                <p className={`font-bold text-base ${isUrgent ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {item}
                                </p>
                                {isUrgent && (
                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-0.5">Urgent Priority</p>
                                )}
                            </div>

                            {/* Action Icon */}
                            {isUrgent ? (
                                <div className="h-10 w-10 rounded-full bg-rose-500 flex items-center justify-center shadow-md animate-pulse">
                                    <PhoneCall className="w-5 h-5 text-white fill-current" />
                                </div>
                            ) : (
                                <ChevronRight className={`w-5 h-5 text-slate-300 transition-transform ${checked[idx] ? 'opacity-0' : 'group-hover:translate-x-1'}`} />
                            )}
                        </div>
                    </div>
                );
            })}

            {completed === items.length && (
                <div className="w-full bg-emerald-500 text-white p-4 rounded-2xl font-bold text-center animate-in zoom-in spin-in-3 duration-500">
                    <CheckCircle2 className="w-6 h-6 inline-block mr-2 mb-1" />
                    All Steps Completed!
                </div>
            )}
        </div>
    );
}
