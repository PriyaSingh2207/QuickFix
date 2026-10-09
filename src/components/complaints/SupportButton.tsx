import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface SupportButtonProps {
    isSupported: boolean;
    count: number;
    onClick: () => void;
    isLoading?: boolean;
}

export function SupportButton({ isSupported, count, onClick, isLoading }: SupportButtonProps) {
    const { t } = useLanguage();
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            disabled={isLoading}
            className={cn(
                "flex items-center gap-2 hover:bg-white hover:shadow-sm transition-all h-9 group",
                isSupported ? "text-blue-600 bg-blue-50/50" : "text-slate-600"
            )}
        >
            <ThumbsUp className={cn("h-4 w-4 transition-transform group-active:scale-125", isSupported && "fill-current")} />
            <span className="text-xs font-medium">{count} {count === 1 ? t('card.support', 'Support') : t('card.supports', 'Supports')}</span>
        </Button>
    );
}
