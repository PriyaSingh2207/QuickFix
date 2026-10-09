import { useState, useEffect } from "react";
import { Filter, MapPin, Search } from "lucide-react";
import { fetchNearbyEvents, type CivicEvent } from "@/lib/eventsApi";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Live Now", "Upcoming", "Volunteering", "Fundraising"];

export function Events() {
    const [events, setEvents] = useState<CivicEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [city] = useState("Indore");

    useEffect(() => {
        // Step 1: Get User Location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    // Theoretically we would reverse geocode here to get city name
                    // For now, default to Indore as per requirements
                },
                (error) => {
                    console.error("Location access denied", error);
                    toast.error("Location access denied. Showing events in Indore.");
                }
            );
        }

        // Step 2: Fetch Events
        const loadEvents = async () => {
            setIsLoading(true);
            try {
                const data = await fetchNearbyEvents(location?.lat, location?.lng);
                setEvents(data);
            } catch (error) {
                toast.error("Failed to load events");
            } finally {
                setIsLoading(false);
            }
        };

        loadEvents();
    }, []);

    const filteredEvents = events.filter(event => {
        // Search Filter
        if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && !event.location.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Category/Status Filter
        if (activeFilter === "All") return true;
        if (activeFilter === "Live Now") return event.status === "live";
        if (activeFilter === "Upcoming") return event.status === "upcoming";
        if (activeFilter === "Volunteering") return event.volunteerSlots !== undefined;
        if (activeFilter === "Fundraising") return event.isFundraiser;

        return true;
    });

    return (
        <div className="max-w-[1400px] mx-auto min-h-screen pb-20 px-4 md:px-6 space-y-8 animate-in fade-in duration-500">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 relative py-4 -mx-4 px-4 md:mx-0 md:px-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs font-normal bg-indigo-50 text-indigo-700 border-indigo-200">
                            <MapPin className="mr-1 h-3 w-3" /> {city}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Within 10km</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Events Near You</h1>
                </div>

                <div className="w-full md:w-auto flex items-center gap-2">
                    <div className="relative flex-1 md:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search events..."
                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {FILTERS.map((filter) => (
                    <Button
                        key={filter}
                        variant={activeFilter === filter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            "rounded-full whitespace-nowrap transition-all",
                            activeFilter === filter
                                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                                : "text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        {filter === "Live Now" && (
                            <span className="mr-2 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                        {filter}
                    </Button>
                ))}
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    // Skeleton Loading State
                    [1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[200px] w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))
                ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((event, idx) => (
                        <div
                            key={event.id}
                            className="animate-in slide-in-from-bottom-5 fade-in fill-mode-backwards"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <EventCard event={event} />
                        </div>
                    ))
                ) : (
                    // Empty State
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No events found</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                            We couldn't find any events matching your filters. Try checking a different category or location.
                        </p>
                        <Button
                            variant="link"
                            onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                            className="mt-4 text-indigo-600"
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>

        </div>
    );
}
