import React, { useRef, useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, Sparkles, Move } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ChatBot = () => {
    const { messages, isLoading, isOpen, toggleChat, sendMessage } = useChat();
    const [inputValue, setInputValue] = React.useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Draggable position state for floating button
    const [btnPos, setBtnPos] = useState<{ x: number; y: number }>(() => {
        try {
            const saved = localStorage.getItem("quickfix_chat_btn_pos");
            if (saved) return JSON.parse(saved);
        } catch {}
        return { x: 0, y: 0 };
    });
    const [isBtnDragging, setIsBtnDragging] = useState(false);
    const btnPosRef = useRef(btnPos);
    btnPosRef.current = btnPos;

    // Draggable position state for chat window
    const [winPos, setWinPos] = useState<{ x: number; y: number }>(() => {
        try {
            const saved = localStorage.getItem("quickfix_chat_win_pos");
            if (saved) return JSON.parse(saved);
        } catch {}
        return { x: 0, y: 0 };
    });
    const [isWinDragging, setIsWinDragging] = useState(false);
    const winPosRef = useRef(winPos);
    winPosRef.current = winPos;

    // Clamp positions within viewport on resize
    useEffect(() => {
        const handleResize = () => {
            // Clamp button
            const minBtnX = -(window.innerWidth - 72);
            const minBtnY = -(window.innerHeight - 72);
            setBtnPos(prev => ({
                x: Math.min(10, Math.max(minBtnX, prev.x)),
                y: Math.min(10, Math.max(minBtnY, prev.y))
            }));

            // Clamp window
            const minWinX = -(window.innerWidth - 400);
            const minWinY = -(window.innerHeight - 620);
            setWinPos(prev => ({
                x: Math.min(10, Math.max(minWinX, prev.x)),
                y: Math.min(10, Math.max(minWinY, prev.y))
            }));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Pointer Event Handlers for Floating Button Drag
    const handleBtnPointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return; // Left mouse click or touch only
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const initX = btnPosRef.current.x;
        const initY = btnPosRef.current.y;
        let moved = false;

        setIsBtnDragging(true);

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
                moved = true;
            }

            const rawX = initX + deltaX;
            const rawY = initY + deltaY;

            // Clamping bounds: 56px button, bottom-6 right-6 base (24px)
            const minX = -(window.innerWidth - 72);
            const maxX = 12;
            const minY = -(window.innerHeight - 72);
            const maxY = 12;

            const clampedX = Math.min(maxX, Math.max(minX, rawX));
            const clampedY = Math.min(maxY, Math.max(minY, rawY));

            btnPosRef.current = { x: clampedX, y: clampedY };
            setBtnPos({ x: clampedX, y: clampedY });
        };

        const handlePointerUp = () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);

            setIsBtnDragging(false);

            if (moved) {
                try {
                    localStorage.setItem("quickfix_chat_btn_pos", JSON.stringify(btnPosRef.current));
                } catch {}
            } else {
                toggleChat();
            }
        };

        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);
    };

    // Pointer Event Handlers for Chat Window Header Drag
    const handleWinPointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        // Don't drag if clicking buttons inside the header
        if ((e.target as HTMLElement).closest("button")) return;

        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const initX = winPosRef.current.x;
        const initY = winPosRef.current.y;

        setIsWinDragging(true);

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            const rawX = initX + deltaX;
            const rawY = initY + deltaY;

            // Clamping bounds: 380px window width, 600px height
            const minX = -(window.innerWidth - 400);
            const maxX = 12;
            const minY = -(window.innerHeight - 620);
            const maxY = 12;

            const clampedX = Math.min(maxX, Math.max(minX, rawX));
            const clampedY = Math.min(maxY, Math.max(minY, rawY));

            winPosRef.current = { x: clampedX, y: clampedY };
            setWinPos({ x: clampedX, y: clampedY });
        };

        const handlePointerUp = () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);

            setIsWinDragging(false);

            try {
                localStorage.setItem("quickfix_chat_win_pos", JSON.stringify(winPosRef.current));
            } catch {}
        };

        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);
    };

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (scrollRef.current) {
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
            <div
                className={cn(
                    "fixed bottom-6 right-6 z-50 select-none touch-none",
                    isOpen ? "pointer-events-none" : "pointer-events-auto"
                )}
                style={{
                    transform: `translate3d(${btnPos.x}px, ${btnPos.y}px, 0)`,
                    transition: isBtnDragging ? "none" : "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)"
                }}
            >
                <div
                    role="button"
                    tabIndex={0}
                    onPointerDown={handleBtnPointerDown}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleChat();
                        }
                    }}
                    title="Quickfix Assistant (Drag anywhere to move, click to chat)"
                    aria-label="Toggle Quickfix AI Assistant"
                    className={cn(
                        "relative h-14 w-14 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/40 group",
                        "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-blue-500/40 select-none",
                        isBtnDragging
                            ? "cursor-grabbing scale-110 ring-4 ring-blue-400/50 shadow-2xl"
                            : "cursor-grab hover:scale-105 active:scale-95 shadow-xl transition-transform",
                        isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
                    )}
                >
                    <MessageCircle className="h-7 w-7 text-white pointer-events-none drop-shadow" />
                    {/* Visual drag indicator hint */}
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
                        <Move className="h-2.5 w-2.5" />
                    </span>
                </div>
            </div>

            {/* Main Chat Window (Movable by Header) */}
            <div
                className={cn(
                    "fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-24px)] h-[600px] max-h-[calc(100vh-32px)] bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden origin-bottom-right",
                    isOpen
                        ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
                        : "scale-50 opacity-0 translate-y-10 pointer-events-none"
                )}
                style={{
                    transform: `translate3d(${winPos.x}px, ${winPos.y}px, 0)`,
                    transition: isWinDragging
                        ? "none"
                        : "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s, scale 0.3s"
                }}
            >
                {/* Header (Draggable Handle) */}
                <div
                    onPointerDown={handleWinPointerDown}
                    className={cn(
                        "flex items-center justify-between p-4 border-b border-border/50 bg-muted/30 select-none touch-none",
                        isWinDragging ? "cursor-grabbing" : "cursor-grab"
                    )}
                    title="Drag header to move chat window"
                >
                    <div className="flex items-center gap-2 pointer-events-none">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm flex items-center gap-1.5">
                                Quickfix Assistant
                                <Move className="h-3 w-3 text-muted-foreground opacity-50" />
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleChat();
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Messages Area */}
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
