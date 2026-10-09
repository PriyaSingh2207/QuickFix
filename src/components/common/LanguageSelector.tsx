import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Languages, Check, Sparkles } from 'lucide-react';

import { toast } from 'sonner';

interface LanguageSelectorProps {
  variant?: 'outline' | 'ghost' | 'default';
  size?: 'sm' | 'default';
  showText?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'outline',
  size = 'sm',
  showText = true,
  className = '',
}) => {
  const { currentLanguage, setLanguage, supportedLanguages, languageInfo, isTranslating } = useLanguage();

  const handleSelectLanguage = (lang: typeof supportedLanguages[0]) => {
    if (lang.code === currentLanguage) return;
    setLanguage(lang.code);
    toast.success(`Language set to ${lang.nativeName} (${lang.name})`, {
      description: 'Powered by Sarvam AI Indic Engine',
      duration: 2500
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`h-9 px-3 rounded-full gap-2 border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all font-semibold text-xs ${className}`}
          title="Select Language (Sarvam AI Multilingual)"
        >
          {isTranslating ? (
            <Sparkles className="h-4 w-4 text-amber-500 animate-spin" />
          ) : (
            <Languages className="h-4 w-4 text-blue-600" />
          )}
          {showText && (
            <span className="flex items-center gap-1.5 font-bold">
              <span>{languageInfo.nativeName}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 font-mono font-bold">
                {languageInfo.scriptBadge}
              </span>
              {isTranslating && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 p-1.5 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 text-xs"
      >
        <DropdownMenuLabel className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Choose Language</span>
          <span className="flex items-center gap-1 text-[9px] text-blue-600 font-semibold normal-case bg-blue-50 px-1.5 py-0.5 rounded-full">
            <Sparkles className="w-2.5 h-2.5" />
            Sarvam AI
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1 bg-slate-100" />

        <div className="max-h-72 overflow-y-auto py-0.5 space-y-0.5 custom-scrollbar">
          {supportedLanguages.map(lang => {
            const isSelected = currentLanguage === lang.code;
            return (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleSelectLanguage(lang)}
                className={`cursor-pointer rounded-xl px-2.5 py-2 flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold font-mono">
                    {lang.scriptBadge}
                  </span>
                  <div>
                    <span className="block text-xs leading-none">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400 leading-none">{lang.name}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="my-1 bg-slate-100" />
        <div className="px-2.5 py-1.5 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Indic AI Translation</span>
          <span className="text-blue-600 font-bold">Sarvam Mayura & Saaras</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
