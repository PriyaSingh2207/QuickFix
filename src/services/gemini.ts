
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Missing VITE_GEMINI_API_KEY in .env file");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
});

export type ChatAction = {
    type: 'NAVIGATE';
    payload: string;
}

export type ChatResponse = {
    reply: string;
    action?: ChatAction;
}

const SYSTEM_PROMPT = `
You are Quickfix Assistant, a helpful civic AI. 
**ABOUT**: Quickfix is a civic safety platform for reporting issues, emergency help, and community squads.
**GOAL**: Help citizens with complaints, services, & emergencies.
**KEY RULES**:
1. **Emergency**: If user mentions "fire", "danger", "health" -> REPLY: "Please visit Emergency Dashboard!" & ACTION: \`/emergency\`.
2. **Complaints**: If user wants to report garbage, pothole, etc. -> REPLY: "Taking you to report section." & ACTION: \`/complaints\`.
3. **Services**: Waste(\`/services/waste\`), Parking(\`/services/parking\`), Power(\`/services/electricity\`).
4. **Community**: Events(\`/events\`), Squads(\`/join-squad\`), Missing(\`/missing\`).
5. **News**: If ask for "news/updates" -> REPLY: "Check Community Feed for local updates." & ACTION: \`/complaints\`.
6. **Output**: JSON ONLY. { "reply": "string", "action": { "type": "NAVIGATE", "payload": "/path" } (optional) }.
7. **Tone**: Helpful, concise (max 2 sentences).
`;

const offlineResponse = (message: string): ChatResponse => {
    const lower = message.toLowerCase();
    if (lower.match(/fire|accident|emergency|police|ambulance/)) return { reply: "🚨 For emergencies, please visit the Emergency Dashboard.", action: { type: 'NAVIGATE', payload: '/emergency' } };
    if (lower.match(/complaint|report|garbage|pothole/)) return { reply: "I can help report that. Opening complaints.", action: { type: 'NAVIGATE', payload: '/complaints' } };
    if (lower.match(/waste|dustbin/)) return { reply: "Opening Waste Services.", action: { type: 'NAVIGATE', payload: '/services/waste' } };
    if (lower.match(/park|car/)) return { reply: "Opening Parking.", action: { type: 'NAVIGATE', payload: '/services/parking' } };
    if (lower.match(/join|volunteer|squad/)) return { reply: "Join a squad!", action: { type: 'NAVIGATE', payload: '/join-squad' } };
    return { reply: "I'm offline but can navigate! Try 'Report issue' or 'Emergency'." };
};

export const sendMessageToGemini = async (history: { role: "user" | "model"; parts: string }[], message: string): Promise<ChatResponse> => {
    try {
        if (!API_KEY) {
            console.error("❌ Gemini API Key is missing in browser environment!");
            return offlineResponse(message);
        }

        // Limit history to last 6 turns (12 messages) to save tokens
        const recentHistory = history.slice(-6);

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Understood. JSON mode active." }] },
                ...recentHistory.map(h => ({
                    role: h.role,
                    parts: [{ text: h.parts }]
                }))
            ],
            generationConfig: {
                maxOutputTokens: 100, // Reduced token limit
                temperature: 0.7,
            }
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return { reply: text };
        }
    } catch (error) {
        console.error("❌ Gemini API Error Details:", error);

        // Fallback to offline mode for ANY error (especially 429/Quota)
        console.warn("⚠️ Falling back to offline mode due to API error.");

        // Base offline reply
        const offlineReply = offlineResponse(message);

        if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            if (msg.includes("429") || msg.includes("quota") || msg.includes("too many requests")) {
                // Append a small note so they know why it might feel "dumber"
                return {
                    ...offlineReply,
                    reply: offlineReply.reply + " (Note: High traffic, using offline mode.)"
                };
            }
        }

        return offlineReply;
    }
};
