import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Comment {
    id: string;
    message: string;
    created_at: string;
    author_name: string;
}

interface CommentsSectionProps {
    parentId: string;
    parentType: 'complaint' | 'missing_report';
    onCommentAdded?: () => void;
}

export function CommentsSection({ parentId, parentType, onCommentAdded }: CommentsSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchComments = useCallback(async () => {
        try {
            let data;
            if (parentType === 'complaint') {
                data = await db.getComplaintComments(parentId);
            } else {
                data = await db.getComments(parentId);
            }
            setComments(data);
            setLoading(false);
            // Scroll to bottom on initial load
            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);
        } catch (error) {
            console.error("Failed to load comments", error);
            setLoading(false);
        }
    }, [parentId, parentType]);

    useEffect(() => {
        fetchComments();

        // Realtime subscription
        const table = parentType === 'complaint' ? 'complaint_comments' : 'u_comments';
        const filter = parentType === 'complaint' ? `complaint_id=eq.${parentId}` : `parent_id=eq.${parentId}`;

        const channel = supabase
            .channel(`comments-${parentId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: table,
                filter: filter
            }, () => {
                fetchComments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [parentId, parentType, fetchComments]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setSending(true);
        try {
            if (parentType === 'complaint') {
                // Optimistic Update
                const newCommentOptimistic: Comment = {
                    id: `temp-${Date.now()}`,
                    message: newMessage.trim(),
                    created_at: new Date().toISOString(),
                    author_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Me'
                };
                setComments(prev => [...prev, newCommentOptimistic]);
                setNewMessage("");

                await db.createComplaintComment({
                    user_id: user.id,
                    complaint_id: parentId,
                    comment: newMessage.trim()
                });
            } else {
                await db.createComment({
                    user_id: user.id,
                    parent_id: parentId,
                    parent_type: parentType,
                    message: newMessage.trim()
                });
            }
            // Fetch will be triggered by subscription, but we can optimistically add or wait
            if (onCommentAdded) onCommentAdded();
        } catch (error) {
            toast.error("Failed to post comment");
            // Revert optimistic update if needed? (Fetching will correct it anyway)
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                <h3 className="font-semibold text-sm">Community Discussion</h3>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{comments.length}</span>
            </div>

            {/* List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[300px]"
            >
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No comments yet. Be the first to start the discussion!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8 mt-1 border border-white shadow-sm">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author_name}`} />
                                <AvatarFallback>{comment.author_name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{comment.author_name}</span>
                                    <span className="text-[10px] text-slate-400">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-r-xl rounded-bl-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    {comment.message}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={user ? "Write a comment..." : "Log in to comment"}
                        disabled={!user || sending}
                        className="flex-1 bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!user || sending || !newMessage.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
