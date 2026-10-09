import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ElementRef } from "react";
import { cn } from "@/lib/utils";

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'p' | 'span';
    splitType?: 'words' | 'chars';
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
}

const SplitText = ({
    text,
    className,
    delay = 0,
    duration = 0.5,
    tag: Tag = "div",
    splitType = "chars",
    from = { opacity: 0, y: 20 },
    to = { opacity: 1, y: 0 }
}: SplitTextProps) => {
    const containerRef = useRef<ElementRef<"div">>(null);

    useGSAP(() => {
        const elements = containerRef.current?.children;
        if (!elements) return;

        gsap.fromTo(
            elements,
            from,
            {
                ...to,
                duration,
                delay: delay / 1000, // Convert ms to seconds
                stagger: 0.02,
                ease: "back.out(1.7)",
            }
        );
    }, { scope: containerRef });

    const renderContent = () => {
        if (splitType === 'words') {
            return text.split(' ').map((word, i) => (
                <span key={i} className="inline-block mr-[0.25em]">{word}</span>
            ));
        }
        return text.split('').map((char, i) => (
            <span key={i} className="inline-block">{char === ' ' ? '\u00A0' : char}</span>
        ));
    };

    return (
        <Tag ref={containerRef as any} className={cn("overflow-hidden", className)}>
            {renderContent()}
        </Tag>
    );
};

export default SplitText;
