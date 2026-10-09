import { AlertTriangle, Users, Activity, Shield } from "lucide-react";

export const slides = [
    {
        id: 1,
        title: "Emergencies don't wait",
        subtitle: "Delayed response and confusion cost lives.",
        icon: AlertTriangle,
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-900/20"
    },
    {
        id: 2,
        title: "One platform. Faster response.",
        subtitle: "Citizens, volunteers and authorities connected in real time.",
        icon: Users,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
        id: 3,
        title: "Core Features",
        subtitle: "Comprehensive tools for civic safety.",
        features: [
            "Live Complaints",
            "Missing Persons Registry",
            "Emergency Announcements"
        ],
        icon: Activity,
        color: "text-teal-500",
        bg: "bg-teal-50 dark:bg-teal-900/20"
    },
    {
        id: 4,
        title: "Who It's For",
        subtitle: "A unified network for everyone.",
        roles: [
            "Citizen",
            "Volunteer",
            "Authority"
        ],
        icon: Shield,
        color: "text-indigo-500",
        bg: "bg-indigo-50 dark:bg-indigo-900/20"
    }
];
