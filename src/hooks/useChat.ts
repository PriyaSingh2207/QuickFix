
import { useState, useCallback } from "react";
import { sendMessageToGemini, type ChatResponse } from "@/services/gemini";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export type Message = {
    id: string;
    role: "user" | "bot";
    content: string;
    timestamp: Date;
};

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "bot",
            content: "Hello! I'm your Quickfix Assistant. How can I help you today?",
            timestamp: new Date(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleChat = () => setIsOpen((prev) => !prev);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        // Add User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Prepare history for API (excluding the initial welcome message to keep prompt clean)
            const history = messages
                .filter((m) => m.id !== "1") // Skip initial welcome for context window efficiency
                .map((m) => ({
                    role: m.role === "user" ? ("user" as const) : ("model" as const),
                    parts: m.content,
                }));

            const response: ChatResponse = await sendMessageToGemini(history, content);

            // Add Bot Response
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "bot",
                content: response.reply,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);

            // Execute Action if present
            if (response.action) {
                if (response.action.type === 'NAVIGATE') {
                    console.log("Navigating to:", response.action.payload);
                    toast.info("Navigating you...", {
                        description: `Taking you to ${response.action.payload}`
                    });
                    navigate(response.action.payload);
                }
            }

        } catch (error) {
            console.error("Chat Error", error);
            toast.error("Failed to get response");
        } finally {
            setIsLoading(false);
        }
    }, [messages, navigate]);

    return {
        messages,
        isLoading,
        isOpen,
        toggleChat,
        sendMessage,
    };
};
