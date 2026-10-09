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

const WARD_DEFAULTS: Record<string, { lat: number; lng: number; name: string }> = {
    'WARD-04': { lat: 22.7540, lng: 75.8912, name: 'Ward 4 - Vijay Nagar North' },
    'WARD-09': { lat: 22.7196, lng: 75.8577, name: 'Ward 9 - Rajwada Central' },
    'WARD-12': { lat: 22.7610, lng: 75.8750, name: 'Ward 12 - Sukhlia Industrial' },
    'WARD-17': { lat: 22.7160, lng: 75.8710, name: 'Ward 17 - Chhoti Gwaltoli' },
    'WARD-23': { lat: 22.7480, lng: 75.8450, name: 'Ward 23 - Banganga Colony' },
    'WARD-28': { lat: 22.6950, lng: 75.8320, name: 'Ward 28 - Annapurna Hills' }
};

interface LocationPickerProps {
    onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
    defaultValue?: string;
}

export function LocationPicker({ onLocationSelect, defaultValue }: LocationPickerProps) {
    const { t } = useLanguage();
    const [mode, setMode] = useState<'auto' | 'manual'>('auto');
    const [address, setAddress] = useState(defaultValue || "");
    const [selectedWard, setSelectedWard] = useState('WARD-04');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [isLocating, setIsLocating] = useState(false);
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
            setStatusMessage("GPS unavailable: Defaulted to central coordinates. You can switch to 'Write Manually' or adjust pin.");
        } finally {
            setIsLocating(false);
        }
    };

    // Forward Geocoding Search for manual typing
    const handleSearch = async (query: string) => {
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
        setAccuracy(5);
        setSearchResults([]);
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
        setAccuracy(3);

        const geo = await reverseGeocodeCoordinates(roundedLat, roundedLng);
        const resolvedAddr = geo.formattedAddress || `Lat ${roundedLat}, Lon ${roundedLng}`;
        setAddress(resolvedAddr);
        onLocationSelect({
            address: resolvedAddr,
            lat: roundedLat,
            lng: roundedLng
        });
    };

    // Handle manual address input
    const handleManualAddressChange = (val: string) => {
        setAddress(val);
        const wardInfo = WARD_DEFAULTS[selectedWard] || WARD_DEFAULTS['WARD-04'];
        const currentLat = coords?.lat || wardInfo.lat;
        const currentLng = coords?.lng || wardInfo.lng;
        
        if (!coords) {
            setCoords({ lat: currentLat, lng: currentLng });
        }

        if (val.trim().length >= 3) {
            onLocationSelect({ address: val, lat: currentLat, lng: currentLng });
            handleSearch(val);
        }
    };

    // Handle ward change in manual mode
    const handleWardChange = (wardId: string) => {
        setSelectedWard(wardId);
        const wardInfo = WARD_DEFAULTS[wardId] || WARD_DEFAULTS['WARD-04'];
        setCoords({ lat: wardInfo.lat, lng: wardInfo.lng });
        
        const updatedAddress = address || `${wardInfo.name}, Indore`;
        if (!address) setAddress(updatedAddress);
        
        onLocationSelect({
            address: updatedAddress,
            lat: wardInfo.lat,
            lng: wardInfo.lng
        });
    };

    return (
        <div className="space-y-3 bg-slate-50/90 dark:bg-slate-900/60 p-3.5 rounded-xl border border-border/80">
            {/* Mode Switcher Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
                <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <Label className="text-xs font-bold text-foreground">
                        {t('report.locationVerification', 'Location Verification')}
                    </Label>
                    {coords && (
                        <Badge variant="outline" className="text-[10px] text-teal-700 dark:text-teal-300 border-teal-500/40 bg-teal-50/60">
                            {mode === 'auto' ? (accuracy ? `±${accuracy}m GPS` : 'GPS Verified') : 'Manual Address'}
                        </Badge>
                    )}
                </div>

                {/* Mode Selector Buttons */}
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40">
                    <button
                        type="button"
                        onClick={() => {
                            setMode('auto');
                            if (!coords) handleAutoDetect();
                        }}
                        className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1 ${
                            mode === 'auto'
                                ? "bg-background text-teal-700 dark:text-teal-300 shadow-sm border border-border/50"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Crosshair className="h-3 w-3" />
                        <span>{t('report.autoGps', 'Live GPS (Auto)')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode('manual');
                            if (!coords) {
                                const wardInfo = WARD_DEFAULTS[selectedWard];
                                setCoords({ lat: wardInfo.lat, lng: wardInfo.lng });
                                if (address) {
                                    onLocationSelect({ address, lat: wardInfo.lat, lng: wardInfo.lng });
                                }
                            }
                        }}
                        className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1 ${
                            mode === 'manual'
                                ? "bg-background text-teal-700 dark:text-teal-300 shadow-sm border border-border/50"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <span>✍️ {t('report.writeManually', 'Write Manually')}</span>
                    </button>
                </div>
            </div>

            {/* AUTO GPS VIEW */}
            {mode === 'auto' && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground">
                            {t('report.gpsHelp', 'Use hardware satellite coordinates to auto-pinpoint location:')}
                        </span>
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
                                {coords ? t('report.refreshGps', 'Refresh GPS') : t('report.autoDetectGps', 'Auto-Detect Live GPS')}
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowMap(!showMap)}
                                className={`h-7 text-xs px-2 font-medium ${showMap ? "bg-muted font-bold text-teal-700" : "text-muted-foreground"}`}
                            >
                                <Map className="h-3.5 w-3.5 mr-1" />
                                {showMap ? t('report.hideMap', 'Hide Map') : t('report.pinpointMap', 'Map Pin')}
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <Input
                            id="location"
                            placeholder={t('report.addressPlaceholder', 'Auto-resolved street address or landmark...')}
                            value={address}
                            onChange={(e) => handleManualAddressChange(e.target.value)}
                            className="bg-background text-xs h-9 pr-8"
                            required
                        />
                        <Search className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>
                </div>
            )}

            {/* MANUAL LOCATION ENTRY VIEW */}
            {mode === 'manual' && (
                <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-1">
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                {t('report.selectWard', 'Ward / Area:')}
                            </label>
                            <select
                                value={selectedWard}
                                onChange={(e) => handleWardChange(e.target.value)}
                                className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                                <option value="WARD-04">Ward 4 - Vijay Nagar North</option>
                                <option value="WARD-09">Ward 9 - Rajwada Central</option>
                                <option value="WARD-12">Ward 12 - Sukhlia Industrial</option>
                                <option value="WARD-17">Ward 17 - Chhoti Gwaltoli</option>
                                <option value="WARD-23">Ward 23 - Banganga Colony</option>
                                <option value="WARD-28">Ward 28 - Annapurna Hills</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                {t('report.typeAddress', 'Write Street Address / Landmark:')}
                            </label>
                            <div className="relative">
                                <Input
                                    id="manual-location-input"
                                    placeholder={t('report.manualAddressPlaceholder', 'e.g. Near Shiv Mandir, Gate 2, Main Market, AB Road')}
                                    value={address}
                                    onChange={(e) => handleManualAddressChange(e.target.value)}
                                    className="bg-background text-xs h-8 pr-8"
                                    required
                                />
                                {isSearching ? (
                                    <Loader2 className="h-3.5 w-3.5 text-teal-600 animate-spin absolute right-2.5 top-2.5" />
                                ) : (
                                    <Search className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-2.5 pointer-events-none" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>✍️ {t('report.manualTip', 'Type exact landmark or building name. Location is automatically linked.')}</span>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowMap(!showMap)}
                            className="h-6 text-[11px] px-2 text-teal-700 dark:text-teal-300 font-medium hover:bg-teal-50"
                        >
                            <Map className="h-3 w-3 mr-1" />
                            {showMap ? t('report.hideMap', 'Hide Map') : t('report.adjustOnMap', 'Adjust on Map')}
                        </Button>
                    </div>

                    {/* Autocomplete Suggestions */}
                    {searchResults.length > 0 && (
                        <div className="z-20 bg-popover border rounded-lg shadow-lg overflow-hidden text-xs max-h-40 overflow-y-auto">
                            <div className="p-1.5 text-[10px] font-bold text-muted-foreground uppercase border-b bg-muted/30">
                                {t('report.matchingLocations', 'Matching Locations (Click to use):')}
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
            )}

            {/* Status message */}
            {statusMessage && (
                <div className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 p-2 rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                    <span>{statusMessage}</span>
                </div>
            )}

            {/* Interactive Leaflet Pin Adjuster */}
            {showMap && coords && (
                <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{t('report.fineTuneMap', 'Click anywhere on the map to fine-tune the exact pin:')}</span>
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
                <span className="text-muted-foreground font-medium">{t('report.gpsStatus', 'Location Status:')}</span>
                {coords && address && address.trim().length >= 3 ? (
                    <span className="font-mono text-green-600 dark:text-green-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {mode === 'auto' ? (
                            <>{t('report.verifiedGps', 'GPS Lock')}: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} {accuracy ? `(±${accuracy}m)` : ""}</>
                        ) : (
                            <>{t('report.manualConfirmed', 'Manual Location Set')}: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</>
                        )}
                    </span>
                ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {mode === 'auto'
                            ? t('report.mandatoryGpsPrompt', 'Click "Auto-Detect Live GPS" or switch to "Write Manually"')
                            : t('report.manualAddressPrompt', 'Write your street address or landmark above to proceed')}
                    </span>
                )}
            </div>
        </div>
    );
}
