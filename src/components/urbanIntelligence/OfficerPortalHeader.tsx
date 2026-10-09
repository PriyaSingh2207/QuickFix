import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  Clock,
  Scale,
  Users,
  Download,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';

interface OfficerPortalHeaderProps {
  activeIncidentsCount: number;
  criticalCount: number;
  avgWaitHours: number;
  fairnessScore: number;
  onExportOpen311: () => void;
  onOpenIntakeTester: () => void;
}

export const OfficerPortalHeader: React.FC<OfficerPortalHeaderProps> = ({
  activeIncidentsCount,
  criticalCount,
  avgWaitHours,
  fairnessScore,
  onExportOpen311,
  onOpenIntakeTester
}) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200/80 px-4 py-3 sm:px-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Branding & Portal Identity */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-slate-900">
                <span data-no-translate="true" className="notranslate">Quickfix</span> <span className="text-teal-600 font-semibold text-sm">Urban Intelligence</span>
              </span>
              <Badge variant="outline" className="border-teal-300 bg-teal-50 text-teal-800 text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full font-bold">
                Officer Command Desk
              </Badge>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Tagline: Fix the most urgent city problems first.
            </p>
          </div>
        </div>

        {/* Live City Intelligence KPI Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200 rounded-full px-3 py-1 shadow-xs">
            <Activity className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-slate-600 font-medium">Active:</span>
            <span className="font-bold text-blue-900">{activeIncidentsCount}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-red-50/90 border border-red-200 rounded-full px-3 py-1 shadow-xs">
            <AlertOctagon className="h-3.5 w-3.5 text-red-600 animate-pulse" />
            <span className="text-red-700 font-medium">Life-Safety:</span>
            <span className="font-bold text-red-900">{criticalCount}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200 rounded-full px-3 py-1 shadow-xs">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-slate-600 font-medium">City Avg Wait:</span>
            <span className="font-bold text-amber-900">{avgWaitHours}h</span>
          </div>

          <div className="flex items-center gap-1.5 bg-teal-50/80 border border-teal-200 rounded-full px-3 py-1 shadow-xs">
            <Scale className="h-3.5 w-3.5 text-teal-600" />
            <span className="text-slate-600 font-medium">Equity Index:</span>
            <span className={`font-bold ${fairnessScore >= 75 ? 'text-teal-800' : 'text-amber-700'}`}>
              {fairnessScore}/100
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto md:ml-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenIntakeTester}
              className="h-8 text-xs bg-white border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full shadow-xs"
            >
              <Users className="h-3.5 w-3.5 mr-1 text-teal-600" />
              Intake AI
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onExportOpen311}
              className="h-8 text-xs bg-white border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full shadow-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-blue-600" />
              Open311
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await signOut();
                navigate('/login?role=officer');
              }}
              className="h-8 text-xs bg-white border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 rounded-full shadow-xs flex items-center gap-1"
              title="Sign out of City Officer Portal"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </Button>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </div>
  );
};
