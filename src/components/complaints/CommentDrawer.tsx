import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { CommentsSection } from "@/components/common/CommentsSection";
import { useLanguage } from "@/contexts/LanguageContext";

interface CommentDrawerProps {
    complaintId: string;
    commentCount: number;
    disabled?: boolean;
    onCommentAdded?: () => void;
}

export function CommentDrawer({ complaintId, commentCount, disabled, onCommentAdded }: CommentDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <Button variant="ghost" disabled={disabled} className="flex items-center gap-2 text-slate-600 hover:bg-white hover:shadow-sm transition-all h-9">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">{commentCount} {t('card.comments', 'Comments')}</span>
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
                <DrawerHeader className="border-b pb-4">
                    <DrawerTitle>{t('card.comments', 'Comments')}</DrawerTitle>
                </DrawerHeader>

                <div className="h-full p-4 pb-10">
                    <CommentsSection parentId={complaintId} parentType="complaint" onCommentAdded={onCommentAdded} />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
