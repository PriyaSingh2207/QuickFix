import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share2, Link, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShareMenuProps {
    complaintId: string;
    title: string;
}

export function ShareMenu({ complaintId, title }: ShareMenuProps) {
    const { t } = useLanguage();
    const shareUrl = `${window.location.origin}/complaints/${complaintId}`;
    const shareText = `Check out this civic issue: ${title}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, '_blank');
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Civic Issue',
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            handleCopy();
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-slate-600 hover:bg-white hover:shadow-sm transition-all h-9">
                    <Share2 className="h-4 w-4" />
                    <span className="text-xs font-medium">{t('card.share', 'Share')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopy}>
                    <Link className="mr-2 h-4 w-4" /> Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleWhatsApp}>
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleNativeShare}>
                    <Share2 className="mr-2 h-4 w-4" /> Other Apps
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
