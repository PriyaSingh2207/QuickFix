import { useState } from "react";
import { AlertTriangle, Asterisk, Briefcase, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SOSModal } from "@/components/modals/SOSModal";
import { ServicesModal } from "@/components/modals/ServicesModal";
import { FacilitiesModal } from "@/components/modals/FacilitiesModal";
import { SmartCitizenComplaintModal } from "@/components/complaints/SmartCitizenComplaintModal";

function QuickActionItem({
    icon: Icon,
    title,
    subtitle,
    gradient,
    hoverGradient,
    onClick
}: {
    icon: any;
    title: string;
    subtitle: string;
    gradient: string;
    hoverGradient: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="group flex h-full w-full flex-col items-start glass-card p-5 text-left relative overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
        >
            {/* Gradient icon container */}
            <div className={cn(
                "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                gradient
            )}>
                <Icon className="h-7 w-7" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 relative z-10 mb-1">{title}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 relative z-10 font-medium">{subtitle}</p>

            {/* Hover gradient reveal */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 rounded-[20px]",
                hoverGradient
            )} />

            {/* Decorative corner gradient */}
            <div className={cn(
                "absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 transition-all duration-300 group-hover:scale-150 group-hover:opacity-20 blur-xl",
                gradient
            )} />
        </button>
    );
}

import { useLanguage } from "@/contexts/LanguageContext";

export function QuickActions() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [sosOpen, setSosOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [facilitiesOpen, setFacilitiesOpen] = useState(false);
    const [hazardModalOpen, setHazardModalOpen] = useState(false);

    return (
        <div>
            <h3 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-slate-400 pl-1">
                {t('quick.title', 'Quick Actions')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <QuickActionItem
                    icon={AlertTriangle}
                    title={t('quick.hazards', 'Hazards')}
                    subtitle={t('quick.reportIssue', 'Report issue')}
                    gradient="gradient-icon-red"
                    hoverGradient="bg-gradient-to-br from-red-500 to-red-600"
                    onClick={() => setHazardModalOpen(true)}
                />
                <QuickActionItem
                    icon={Asterisk}
                    title={t('quick.emergency', 'Emergency')}
                    subtitle={t('quick.sosAlert', 'SOS Alert')}
                    gradient="gradient-icon-orange"
                    hoverGradient="bg-gradient-to-br from-orange-500 to-amber-500"
                    onClick={() => setSosOpen(true)}
                />
                <QuickActionItem
                    icon={Briefcase}
                    title={t('quick.services', 'Services')}
                    subtitle={t('quick.request', 'Request')}
                    gradient="gradient-icon-teal"
                    hoverGradient="bg-gradient-to-br from-teal-500 to-emerald-500"
                    onClick={() => setServicesOpen(true)}
                />
                <QuickActionItem
                    icon={Calendar}
                    title={t('quick.facilities', 'Facilities')}
                    subtitle={t('quick.booking', 'Booking')}
                    gradient="gradient-icon-blue"
                    hoverGradient="bg-gradient-to-br from-blue-500 to-indigo-500"
                    onClick={() => setFacilitiesOpen(true)}
                />
            </div>

            <SOSModal open={sosOpen} onOpenChange={setSosOpen} />
            <ServicesModal open={servicesOpen} onOpenChange={setServicesOpen} />
            <FacilitiesModal open={facilitiesOpen} onOpenChange={setFacilitiesOpen} />
            <SmartCitizenComplaintModal
                isOpen={hazardModalOpen}
                onClose={() => setHazardModalOpen(false)}
                defaultCategory="Disaster Management"
            />
        </div>
    );
}
