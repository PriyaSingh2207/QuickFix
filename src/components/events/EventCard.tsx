import { useState } from "react";
import type { CivicEvent } from "@/lib/eventsApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Calendar, MapPin, Heart, Share2, User,
    CheckCircle2, Clock, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EventCardProps {
    event: CivicEvent;
}

export function EventCard({ event }: EventCardProps) {
    const [isLiked, setIsLiked] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: event.title,
            text: `Check out ${event.title} at ${event.location}`,
            url: window.location.href, // or actual event link
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            toast.success("Link copied to clipboard!");
        }
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        toast(isLiked ? "Removed from My Events" : "Added to My Events", {
            icon: !isLiked ? <Heart className="h-4 w-4 fill-red-500 text-red-500" /> : undefined
        });
    };

    return (
        <Card className="group flex flex-col overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full bg-white dark:bg-slate-900 border-0 shadow-sm ring-1 ring-slate-100">
            {/* Banner Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {event.status === "live" ? (
                        <Badge className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-500/30 animate-pulse flex items-center gap-1.5 px-2 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            LIVE
                        </Badge>
                    ) : (
                        <Badge className="bg-white/90 hover:bg-white text-slate-900 border-0 shadow-sm backdrop-blur-md px-2 py-0.5 font-semibold">
                            Upcoming
                        </Badge>
                    )}
                    <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 text-white backdrop-blur-md border-0 capitalize">
                        {event.category}
                    </Badge>
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm"
                        onClick={(e) => { e.stopPropagation(); handleLike(); }}
                    >
                        <Heart className={cn("h-4 w-4 transition-colors", isLiked && "fill-red-500 text-red-500")} />
                    </Button>
                </div>
            </div>

            <CardContent className="flex flex-col flex-1 p-4 md:p-5">
                {/* Meta Info */}
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="h-3 w-3 text-slate-500" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 line-clamp-1">{event.organizer}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {event.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-y-2 text-xs md:text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>
                                {new Date(event.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>
                                {new Date(event.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    </div>

                    {/* Fundraising Progress */}
                    {event.isFundraiser && event.targetAmount && event.raisedAmount && (
                        <div className="mb-4 space-y-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-orange-700">₹{event.raisedAmount.toLocaleString()} raised</span>
                                <span className="text-slate-400">of ₹{event.targetAmount.toLocaleString()}</span>
                            </div>
                            <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                                    style={{ width: `${(event.raisedAmount / event.targetAmount) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                        {event.description}
                    </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <RegisterModal event={event} />
                    <Button variant="outline" onClick={handleShare} className="text-slate-600 border-slate-200 hover:bg-slate-50">
                        <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function RegisterModal({ event }: { event: CivicEvent }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = () => {
        if (event.registerUrl) {
            window.open(event.registerUrl, '_blank');
            return;
        }
        if (event.helpline) {
            window.location.href = `tel:${event.helpline}`;
            return;
        }
        // Native registration mock
        setIsOpen(false);
        toast.success("Registered Successfully!", {
            description: "Check your messages for confirmation.",
        });
    };

    if (event.helpline) {
        return (
            <Button onClick={handleAction} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                <Phone className="mr-2 h-4 w-4" /> Call Helpline
            </Button>
        );
    }

    if (event.registerUrl) {
        return (
            <Button onClick={handleAction} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                Register Now
            </Button>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-indigo-500/20">
                    {event.status === 'live' ? 'Join Now' : 'Register'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Join Event</DialogTitle>
                    <DialogDescription>
                        Register for <strong>{event.title}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input placeholder="Your Name" />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input placeholder="+91 99999 99999" />
                    </div>
                </div>
                <Button onClick={handleAction} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Confirm Registration <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
            </DialogContent>
        </Dialog>
    );
}
