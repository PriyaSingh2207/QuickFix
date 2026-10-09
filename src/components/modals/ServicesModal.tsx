import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Droplets, Zap, Truck, Cone, ChevronRight } from "lucide-react";

interface ServicesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ServicesModal({ open, onOpenChange }: ServicesModalProps) {
    const navigate = useNavigate();

    const handleNavigate = (type: string) => {
        onOpenChange(false);
        navigate(`/services?type=${type}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm rounded-3xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Request Services</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 mt-2">
                    {[
                        { id: 'water', label: 'Water Supply', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { id: 'electricity', label: 'Electricity', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                        { id: 'garbage', label: 'Waste Collection', icon: Truck, color: 'text-green-500', bg: 'bg-green-50' },
                        { id: 'road', label: 'Road Works', icon: Cone, color: 'text-orange-500', bg: 'bg-orange-50' },
                    ].map((item) => (
                        <Button
                            key={item.id}
                            variant="ghost"
                            className="w-full justify-between h-16 rounded-2xl bg-slate-50 hover:bg-slate-100"
                            onClick={() => handleNavigate(item.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.bg}`}>
                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                </div>
                                <span className="font-semibold text-slate-700">{item.label}</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
