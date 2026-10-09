import {
    HeartPulse, Flame, Waves, Activity, Zap
} from "lucide-react";

export interface Step {
    title: string;
    text: string;
    image?: string; // We'll use a placeholder or generic for now, relying on GuideIllustration to render icon based logic
}

export interface EmergencyGuide {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    steps: Step[];
    checklist: string[];
}

export const EMERGENCY_GUIDES: EmergencyGuide[] = [
    {
        id: 'cpr',
        title: 'Heart Attack & CPR',
        description: 'Immediate actions for cardiac arrest and chest pain.',
        icon: HeartPulse,
        color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
        steps: [
            { title: 'Check Safety & Response', text: 'Ensure the scene is safe. Tap the person strictly on the shoulder and shout "Are you okay?".' },
            { title: 'Call Emergency', text: 'If no response, point to a specific person and shout "Call Ambulance!" or dial 112/911 immediately.' },
            { title: 'Check Breathing', text: 'Look for chest rise and fall. Listen for breathing. If not breathing normally, start CPR.' },
            { title: 'Start Compressions', text: 'Place heel of hand on center of chest. Interlock fingers. Push hard and fast (100-120 bpm).' },
            { title: 'Rescue Breaths (Optional)', text: 'If trained: 30 compressions, then 2 breaths. If untrained: Continue hands-only CPR until help arrives.' },
            { title: 'Use AED', text: 'If an AED is available, turn it on and follow the voice prompts immediately.' }
        ],
        checklist: [
            'Scene is safe',
            'Checked responsiveness',
            'Called Emergency Services',
            'Started Chest Compressions',
            'Asked for AED'
        ]
    },
    {
        id: 'fire',
        title: 'Fire Emergency',
        description: 'Evacuation and immediate response to fire.',
        icon: Flame,
        color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
        steps: [
            { title: 'Stay Low', text: 'Smoke rises. Crawl on hands and knees to avoid inhaling toxic fumes.' },
            { title: 'Check Doors', text: 'Feel doorknobs with back of hand. If hot, do NOT open. Find another exit.' },
            { title: 'Stop, Drop, and Roll', text: 'If your clothes catch fire: Stop moving, Drop to ground, and Roll to smother flames.' },
            { title: 'Evacuate Immediately', text: 'Do not gather belongings. Get out and stay out. Go to your assembly point.' },
            { title: 'Call Fire Department', text: 'Once safely outside, call 101/911. Provide clear address and details.' }
        ],
        checklist: [
            'Alerted others',
            'Stayed low to ground',
            'Checked doors for heat',
            'Evacuated building',
            'Called Fire Dept'
        ]
    },
    {
        id: 'flood',
        title: 'Flood Safety',
        description: 'Surviving rising waters and flash floods.',
        icon: Waves,
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
        steps: [
            { title: 'Seek Higher Ground', text: 'Move to higher ground immediately. Do not wait for instructions if water is rising.' },
            { title: 'Avoid Walking in Water', text: '6 inches of moving water can knock you down. Use a stick to check firmness of ground.' },
            { title: 'Do Not Drive', text: 'Turn around, don\'t drown. 1 foot of water can float a car.' },
            { title: 'Disconnect Utilities', text: 'Turn off electricity and gas at main switches if safe to do so.' },
            { title: 'Sanitize', text: 'Avoid floodwater as it may be contaminated with sewage or chemicals.' }
        ],
        checklist: [
            'Moved to high ground',
            'Avoided floodwater',
            'Turned off utilities',
            'Prepared emergency kit',
            'Listened to radio/alerts'
        ]
    },
    {
        id: 'bleeding',
        title: 'Bleeding Control',
        description: 'Stop severe bleeding and prevent shock.',
        icon: Activity,
        color: 'text-red-600 bg-red-50 dark:bg-red-900/20',
        steps: [
            { title: 'Expose Wound', text: 'Remove clothing to see the source of bleeding clearly.' },
            { title: 'Apply Direct Pressure', text: 'Cover wound with clean cloth. Push hard directly on it with both hands.' },
            { title: 'Elevate', text: 'If possible, raise the injured limb above the level of the heart.' },
            { title: 'Packing (Deep Wounds)', text: 'For deep wounds, pack the cloth inside the wound and keep pressing.' },
            { title: 'Tourniquet', text: 'For life-threatening limb bleeding, apply a tourniquet 2-3 inches above the wound. Tighten until bleeding stops.' }
        ],
        checklist: [
            'Called Emergency',
            'Applied direct pressure',
            'Kept pressure constant',
            'Checked for shock',
            'Kept victim warm'
        ]
    },
    {
        id: 'shock',
        title: 'Electric Shock',
        description: 'High voltage response and safety.',
        icon: Zap,
        color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
        steps: [
            { title: 'Do Not Touch', text: 'Do not touch the victim if they are still in contact with the power source.' },
            { title: 'Turn Off Power', text: 'Switch off the mains or unplug the device immediately.' },
            { title: 'Separate from Source', text: 'If you can\'t turn power off, stand on dry material (wood/rubber) and use a broom handle to push the source away.' },
            { title: 'Check Circulation', text: 'Once safe, check for breathing and heartbeat. Start CPR if needed.' },
            { title: 'Treat Burns', text: 'Cover any electrical burns with a sterile gauze bandage. Do not use ice.' }
        ],
        checklist: [
            'Did NOT touch victim',
            'Turned off power',
            'Separated source safely',
            'Checked breathing',
            'Called for help'
        ]
    }
];
