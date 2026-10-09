
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ChatBot = () => {
    const { messages, isLoading, isOpen, toggleChat, sendMessage } = useChat();
    const [inputValue, setInputValue] = React.useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Draggable viewport boundaries
    const [dragBounds, setDragBounds] = useState({
        left: -1000,
        right: 0,
        top: -800,
        bottom: 0
    });

    useEffect(() => {
        const calculateBounds = () => {
            const btnSize = 60;
            const margin = 24;
            setDragBounds({
                left: -(window.innerWidth - btnSize - margin),
                right: 0,
                top: -(window.innerHeight - btnSize - margin),
                bottom: 0
            });
        };

        calculateBounds();
        window.addEventListener("resize", calculateBounds);
        return () => window.removeEventListener("resize", calculateBounds);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            // Find the viewport element inside ScrollArea
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        sendMessage(inputValue);
        setInputValue("");
    };

    return (
        <>
            {/* Draggable Floating Toggle Button */}
            <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.08}
                dragConstraints={dragBounds}
                whileDrag={{ scale: 1.12, cursor: "grabbing" }}
                whileHover={{ scale: 1.06 }}
                className={cn(
                    "fixed bottom-6 right-6 z-50 touch-none select-none cursor-grab active:cursor-grabbing",
                    isOpen ? "pointer-events-none" : "pointer-events-auto"
                )}
            >
                <button
                    type="button"
                    onClick={toggleChat}
                    title="Quickfix Assistant (Drag anywhere to move)"
                    aria-label="Toggle Quickfix AI Assistant"
                    className={cn(
                        "h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border-2 border-white/30 backdrop-blur-sm",
                        isOpen ? "rotate-90 scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100",
                        "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30"
                    )}
                >
                    <MessageCircle className="h-7 w-7 text-white pointer-events-none drop-shadow" />
                </button>
            </motion.div>

            {/* Main Chat Window */}
            <div
                className={cn(
                    "fixed bottom-6 right-6 w-[380px] h-[600px] bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
                    isOpen
                        ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
                        : "scale-50 opacity-0 translate-y-10 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Quickfix Assistant</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={toggleChat}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Messages Map */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs ml-4 animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Quickfix AI is thinking...
                        </div>
                    )}
                </ScrollArea>

                {/* Input Area */}
                <form
                    onSubmit={handleSubmit}
                    className="p-4 border-t border-border/50 bg-background flex items-center gap-2"
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about complaints, services..."
                        className="flex-1 bg-muted/50 border-transparent focus:border-primary/50 focus:bg-background transition-all"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !inputValue.trim()}
                        className={cn("transition-all", inputValue.trim() ? "bg-primary" : "bg-muted text-muted-foreground")}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </>
    );
};
