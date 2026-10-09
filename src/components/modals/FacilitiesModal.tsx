import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Stethoscope, Shield, Flame } from "lucide-react";

interface FacilitiesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FacilitiesModal({ open, onOpenChange }: FacilitiesModalProps) {
    const navigate = useNavigate();

    const handleNavigate = () => {
        onOpenChange(false);
        navigate('/facilities');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm rounded-3xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Public Facilities</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mt-2">
                    {[
                        { label: 'Hospitals', icon: Stethoscope, color: 'text-red-500', bg: 'bg-red-50' },
                        { label: 'Police', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: 'Shelters', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50' },
                        { label: 'Fire Stn', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
                    ].map((item, idx) => (
                        <Button
                            key={idx}
                            variant="outline"
                            className="flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            onClick={handleNavigate}
                        >
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.bg}`}>
                                <item.icon className={`h-5 w-5 ${item.color}`} />
                            </div>
                            <span className="font-medium text-slate-700">{item.label}</span>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
