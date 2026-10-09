import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface RepostButtonProps {
    isReposted: boolean;
    count: number;
    onClick: () => void;
    isLoading?: boolean;
}

export function RepostButton({ isReposted, count, onClick, isLoading }: RepostButtonProps) {
    const { t } = useLanguage();
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            disabled={isLoading}
            className={cn(
                "flex items-center gap-2 hover:bg-white hover:shadow-sm transition-all h-9 group",
                isReposted ? "text-green-600 bg-green-50/50" : "text-slate-600"
            )}
        >
            <Repeat className={cn("h-4 w-4 transition-transform group-active:rotate-180", isReposted ? "text-green-600" : "")} />
            <span className="text-xs font-medium">{count} {isReposted ? t('card.reposted', 'Reposted') : t('card.repost', 'Repost')}</span>
        </Button>
    );
}
