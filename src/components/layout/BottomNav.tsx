import { Home, AlertTriangle, User } from 'lucide-react';
import type { AppMode } from '@/types';

interface BottomNavProps {
    mode: AppMode;
    onModeChange: (mode: AppMode) => void;
    onProfileClick?: () => void;
}

export function BottomNav({ mode, onModeChange, onProfileClick }: BottomNavProps) {
    const isEmergency = mode === 'emergency';

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-2 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-around h-16">
                <button
                    onClick={() => onModeChange('community')}
                    className={`flex flex-col items-center gap-1 p-2 ${!isEmergency ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <Home className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Home</span>
                </button>
                <button
                    onClick={() => onModeChange('emergency')}
                    className={`flex flex-col items-center gap-1 p-2 ${isEmergency ? 'text-red-600' : 'text-slate-400'}`}
                >
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Emergency</span>
                </button>
                <button
                    onClick={onProfileClick}
                    className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary"
                >
                    <User className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Profile</span>
                </button>
            </div>
        </div>
    );
}
