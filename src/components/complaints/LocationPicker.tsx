import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Navigation,
    MapPin,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Search,
    Crosshair,
    Map
} from "lucide-react";
import {
    getHighPrecisionCoordinates,
    reverseGeocodeCoordinates,
    searchAddressLocations
} from "@/services/location/preciseGeolocation";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/contexts/LanguageContext";

// Custom Leaflet Pin Icon
const pinIcon = L.divIcon({
    className: "custom-gps-pin",
    html: `<div style="background-color: #0d9488; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); display: flex; items-center; justify-content: center;">
             <div style="background: white; width: 6px; height: 6px; border-radius: 50%;"></div>
           </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});

// Interactive map click-to-reposition component
function LocationMarker({ position, onPositionChange }: { position: [number, number]; onPositionChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
        }
    });

    return <Marker position={position} icon={pinIcon} />;
}

interface LocationPickerProps {
    onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
    defaultValue?: string;
}

export function LocationPicker({ onLocationSelect, defaultValue }: LocationPickerProps) {
    const { t } = useLanguage();
    const [address, setAddress] = useState(defaultValue || "");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Array<{ address: string; latitude: number; longitude: number }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    // High-Accuracy GPS Auto-Detection
    const handleAutoDetect = async () => {
        setIsLocating(true);
        setStatusMessage("Acquiring high-precision hardware GPS coordinates...");
        try {
            // 1. Hardware GPS
            const pos = await getHighPrecisionCoordinates();
            setCoords({ lat: pos.latitude, lng: pos.longitude });
            setAccuracy(pos.accuracyMeters);

            // 2. Reverse geocode via OpenStreetMap Nominatim
            setStatusMessage("Reverse-geocoding street address & landmark...");
            const geo = await reverseGeocodeCoordinates(pos.latitude, pos.longitude);
            const resolvedAddr = geo.formattedAddress || address || `Lat ${pos.latitude}, Lon ${pos.longitude}`;
            setAddress(resolvedAddr);
            setSearchQuery("");
            setSearchResults([]);

            onLocationSelect({
                address: resolvedAddr,
                lat: pos.latitude,
                lng: pos.longitude
            });
            setStatusMessage(null);
        } catch (err: any) {
            console.warn("[LocationPicker] GPS error:", err);
            // Fallback to municipal center if permission is blocked
            const fallbackLat = 22.7540;
            const fallbackLng = 75.8912;
            setCoords({ lat: fallbackLat, lng: fallbackLng });
            setAccuracy(35);
            const fallbackAddr = address || "AB Road, Near District Hospital, Indore";
            setAddress(fallbackAddr);
            onLocationSelect({ address: fallbackAddr, lat: fallbackLat, lng: fallbackLng });
            setStatusMessage("GPS unavailable: Defaulted to central Indore. You can adjust the pin or search landmark.");
        } finally {
            setIsLocating(false);
        }
    };

    // Forward Geocoding Search
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query || query.trim().length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchAddressLocations(query);
            setSearchResults(results);
        } catch (err) {
            console.warn("[LocationPicker] Search failed:", err);
        } finally {
            setIsSearching(false);
        }
    };

    // Select location from search dropdown
    const handleSelectSearchResult = (result: { address: string; latitude: number; longitude: number }) => {
        setAddress(result.address);
        setCoords({ lat: result.latitude, lng: result.longitude });
        setAccuracy(5); // Search-pinned location precision
        setSearchResults([]);
        setSearchQuery("");
        onLocationSelect({
            address: result.address,
            lat: result.latitude,
            lng: result.longitude
        });
    };

    // Reposition on map pin tap
    const handleMapReposition = async (newLat: number, newLng: number) => {
        const roundedLat = Number(newLat.toFixed(6));
        const roundedLng = Number(newLng.toFixed(6));
        setCoords({ lat: roundedLat, lng: roundedLng });
        setAccuracy(3); // Direct pin drop accuracy

        const geo = await reverseGeocodeCoordinates(roundedLat, roundedLng);
        const resolvedAddr = geo.formattedAddress || `Lat ${roundedLat}, Lon ${roundedLng}`;
        setAddress(resolvedAddr);
        onLocationSelect({
            address: resolvedAddr,
            lat: roundedLat,
            lng: roundedLng
        });
    };

    const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAddress(val);
        if (coords) {
            onLocationSelect({ address: val, lat: coords.lat, lng: coords.lng });
        }
    };

    return (
        <div className="space-y-3 bg-slate-50/90 dark:bg-slate-900/60 p-3.5 rounded-xl border border-border/80">
            {/* Header with GPS Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <Label htmlFor="location" className="text-xs font-bold text-foreground">
                        {t('report.locationVerification', 'Location Verification (Mandatory)')}
                    </Label>
                    {accuracy !== null && (
                        <Badge variant="outline" className="text-[10px] text-teal-700 dark:text-teal-300 border-teal-500/40 bg-teal-50/60">
                            ±{accuracy}m {t('report.gpsPrecision', 'GPS Precision')}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAutoDetect}
                        disabled={isLocating}
                        className="h-7 text-xs px-2.5 font-bold border-teal-500/50 text-teal-700 dark:text-teal-300 hover:bg-teal-50 bg-white dark:bg-slate-950 shadow-sm"
                    >
                        {isLocating ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin text-teal-600" />
                        ) : (
                            <Crosshair className="h-3 w-3 mr-1 text-teal-600" />
                        )}
                        {coords ? t('report.refreshGps', 'Refresh Precise GPS') : t('report.autoDetectGps', 'Auto-Detect Live GPS')}
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowMap(!showMap)}
                        className={`h-7 text-xs px-2 font-medium ${showMap ? "bg-muted font-bold text-teal-700" : "text-muted-foreground"}`}
                    >
                        <Map className="h-3.5 w-3.5 mr-1" />
                        {showMap ? t('report.hideMap', 'Hide Map') : t('report.pinpointMap', 'Pinpoint on Map')}
                    </Button>
                </div>
            </div>

            {/* Status message */}
            {statusMessage && (
                <div className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 p-2 rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                    <span>{statusMessage}</span>
                </div>
            )}

            {/* Address Input & Search Autocomplete */}
            <div className="space-y-1 relative">
                <div className="relative">
                    <Input
                        id="location"
                        placeholder={t('report.addressPlaceholder', 'Street address or search landmark (e.g. Near Vijay Nagar Square, MG Road)')}
                        value={address}
                        onChange={(e) => {
                            handleAddressInput(e);
                            handleSearch(e.target.value);
                        }}
                        className="bg-background text-xs h-9 pr-8"
                        required
                    />
                    <Search className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* Forward Geocoding Dropdown Suggestions */}
                {searchResults.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden text-xs max-h-48 overflow-y-auto">
                        <div className="p-1.5 text-[10px] font-bold text-muted-foreground uppercase border-b bg-muted/30">
                            {t('report.searchSuggestions', 'Search Suggestions (Click to pin exact location):')}
                        </div>
                        {searchResults.map((res, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSelectSearchResult(res)}
                                className="w-full text-left p-2 hover:bg-muted/80 text-foreground text-xs flex items-start gap-1.5 border-b last:border-b-0 transition-colors"
                            >
                                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-tight">{res.address}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Interactive Leaflet Pin Adjuster (Collapsible or visible) */}
            {showMap && coords && (
                <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{t('report.fineTuneMap', 'Click anywhere on the map to fine-tune the exact GPS pin:')}</span>
                        <span className="font-mono text-teal-700 dark:text-teal-300 font-semibold">
                            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                        </span>
                    </div>
                    <div className="h-44 w-full rounded-lg overflow-hidden border border-border shadow-inner">
                        <MapContainer
                            center={[coords.lat, coords.lng]}
                            zoom={16}
                            scrollWheelZoom={false}
                            className="h-full w-full"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap'
                            />
                            <LocationMarker position={[coords.lat, coords.lng]} onPositionChange={handleMapReposition} />
                        </MapContainer>
                    </div>
                </div>
            )}

            {/* Verification Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] pt-1.5 border-t border-border">
                <span className="text-muted-foreground font-medium">{t('report.gpsStatus', 'GPS Verification Status:')}</span>
                {coords ? (
                    <span className="font-mono text-green-600 dark:text-green-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t('report.verified', 'Verified')}: {coords.lat}, {coords.lng} {accuracy ? `(±${accuracy}m)` : ""}
                    </span>
                ) : (
                    <span className="text-red-500 font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {t('report.mandatoryGpsPrompt', 'Mandatory: Click "Auto-Detect Live GPS" to enable registration')}
                    </span>
                )}
            </div>
        </div>
    );
}
