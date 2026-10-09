
import React from 'react';
import { cn } from "@/lib/utils";
import type { Message } from "@/hooks/useChat";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isBot = message.role === 'bot';

    return (
        <div
            className={cn(
                "flex w-full gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2",
                isBot ? "flex-row" : "flex-row-reverse"
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-center min-w-[32px] w-8 h-8 rounded-full border shadow-sm",
                    isBot ? "bg-primary/20 border-primary/30 text-primary" : "bg-muted border-border text-foreground"
                )}
            >
                {isBot ? <Bot size={16} /> : <User size={16} />}
            </div>

            <div
                className={cn(
                    "p-3 rounded-2xl text-sm max-w-[80%] shadow-sm",
                    isBot
                        ? "bg-card border border-border/50 rounded-tl-sm text-card-foreground"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                )}
            >
                {message.content}
            </div>
        </div>
    );
};
