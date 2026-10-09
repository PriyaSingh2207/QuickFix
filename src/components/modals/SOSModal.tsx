import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Ambulance, Shield, Flame } from "lucide-react";

interface SOSModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SOSModal({ open, onOpenChange }: SOSModalProps) {
    const handleCall = (number: string) => {
        window.location.href = `tel:${number}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm rounded-3xl p-6">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-2xl font-bold text-red-600">EMERGENCY SOS</DialogTitle>
                    <p className="text-sm text-slate-500">Tap to call or activate tracking</p>
                </DialogHeader>

                <div className="mb-6">
                    <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white animate-pulse"
                        onClick={() => {
                            const event = new CustomEvent('quickfix-sos-toggle', { detail: { active: true } });
                            window.dispatchEvent(event);
                            onOpenChange(false);
                            // Maybe show a toast
                        }}
                    >
                        <div className="h-3 w-3 rounded-full bg-white mr-2 animate-ping" />
                        ACTIVATE LIVE TRACKING
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center gap-2 h-32 hover:bg-red-50 hover:text-red-600 border-2 hover:border-red-600 rounded-2xl transition-all"
                        onClick={() => handleCall('100')}
                    >
                        <Shield className="h-8 w-8" />
                        <span className="font-bold text-lg">Police</span>
                        <span className="text-xs text-muted-foreground">100</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center gap-2 h-32 hover:bg-blue-50 hover:text-blue-600 border-2 hover:border-blue-600 rounded-2xl transition-all"
                        onClick={() => handleCall('108')}
                    >
                        <Ambulance className="h-8 w-8" />
                        <span className="font-bold text-lg">Ambulance</span>
                        <span className="text-xs text-muted-foreground">108</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center gap-2 h-32 hover:bg-orange-50 hover:text-orange-600 border-2 hover:border-orange-600 rounded-2xl transition-all"
                        onClick={() => handleCall('101')}
                    >
                        <Flame className="h-8 w-8" />
                        <span className="font-bold text-lg">Fire</span>
                        <span className="text-xs text-muted-foreground">101</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center gap-2 h-32 hover:bg-slate-50 hover:text-slate-900 border-2 hover:border-slate-900 rounded-2xl transition-all"
                        onClick={() => handleCall('112')}
                    >
                        <Phone className="h-8 w-8" />
                        <span className="font-bold text-lg">General</span>
                        <span className="text-xs text-muted-foreground">112</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
