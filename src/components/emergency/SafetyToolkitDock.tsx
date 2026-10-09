
import { motion } from "framer-motion";
import { ShieldCheck, Share2, Phone, UserCheck, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const tools = [
    { label: "I am Safe", icon: UserCheck, color: "bg-emerald-600" },
    { label: "Share Loc", icon: Share2, color: "bg-blue-600" },
    { label: "Contacts", icon: Phone, color: "bg-amber-600" },
];

export function SafetyToolkitDock() {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
        >
            <div className="flex flex-col gap-3">
                {expanded && tools.map((tool, i) => (
                    <motion.div
                        key={tool.label}
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Button className={`${tool.color} shadow-lg rounded-full h-12 pr-6 pl-4 flex items-center gap-2 hover:brightness-110`}>
                            <tool.icon className="w-5 h-5" />
                            {tool.label}
                        </Button>
                    </motion.div>
                ))}
            </div>

            <Button
                size="icon"
                className={`h-16 w-16 rounded-full shadow-2xl transition-all ${expanded ? 'bg-slate-800' : 'bg-red-600 hover:bg-red-700 animate-bounce'}`}
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? (
                    <ChevronUp className="w-8 h-8 rotate-180 transition-transform" />
                ) : (
                    <ShieldCheck className="w-8 h-8" />
                )}
            </Button>
        </motion.div>
    );
}
