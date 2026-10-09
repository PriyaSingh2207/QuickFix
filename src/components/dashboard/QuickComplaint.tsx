import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Trash2,
    Zap,
    Droplets,
    Construction,
    Car,
    FileWarning,
    MapPin,
    Sparkles,
    Layers,
    ArrowRight,
    Navigation,
    CheckCircle2,
    AlertTriangle,
    ShieldAlert,
    Send,
    Loader2,
    Maximize2,
    RotateCcw,
    Crosshair,
    Mic,
    MicOff
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SmartCitizenComplaintModal } from "@/components/complaints/SmartCitizenComplaintModal";
import {
    processCitizenComplaint,
    validateCitizenComplaint,
    getStoredIncidents,
    WARD_FALLBACK_COORDINATES
} from "@/services/urbanIntelligence/urbanStore";
import type { RegisterComplaintOutput } from "@/services/urbanIntelligence/urbanStore";
import { evaluateComplaintFusion } from "@/services/urbanIntelligence/incidentFusion";
import type { Complaint } from "@/types/urbanIntelligence";
import {
    getHighPrecisionCoordinates,
    reverseGeocodeCoordinates,
    searchAddressLocations
} from "@/services/location/preciseGeolocation";

const categories = [
    { label: "Water & Sewage", id: "Water & Sewage", icon: Droplets, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
    { label: "Electricity", id: "Electricity & Lighting", icon: Zap, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" },
    { label: "Roads & Potholes", id: "Roads & Infrastructure", icon: Construction, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/40" },
    { label: "Garbage & Waste", id: "Solid Waste", icon: Trash2, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" },
    { label: "Traffic Hazard", id: "Traffic Hazard", icon: Car, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" },
    { label: "Public Safety", id: "Disaster Management", icon: FileWarning, color: "text-red-500 bg-red-50 dark:bg-red-950/40" },
];

export function QuickComplaint() {
    const { t, currentLanguage, languageInfo } = useLanguage();
    const [isRecording, setIsRecording] = useState(false);
    const [activeTab, setActiveTab] = useState<"categories" | "express">("categories");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [category, setCategory] = useState("Water & Sewage");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [wardId, setWardId] = useState("WARD-04");
    const [wardName, setWardName] = useState("Ward 4 - Vijay Nagar North");
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
    const [citizenName, setCitizenName] = useState("");
    const [phone, setPhone] = useState("");
    const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
    const [searchResults, setSearchResults] = useState<Array<{ address: string; latitude: number; longitude: number }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [locationStatus, setLocationStatus] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<RegisterComplaintOutput | null>(null);

    // Live pre-submission AI fusion match preview
    const [previewFusion, setPreviewFusion] = useState<{
        matchedIncidentTitle: string;
        matchedIncidentNumber?: string;
        distanceMeters: number;
        matchCount: number;
        parameterDetails?: any;
    } | null>(null);

    // Real-time validation check
    const validation = validateCitizenComplaint({
        description,
        category,
        wardId,
        address,
        latitude,
        longitude
    });

    // Automatically scan for nearby duplicate incidents whenever location and description are entered
    useEffect(() => {
        if (latitude && longitude && description.length >= 10) {
            const incidents = getStoredIncidents();
            const mockComp: Complaint = {
                id: 'PREVIEW',
                language: 'en',
                rawText: description,
                category,
                subcategory: category,
                wardId,
                wardName,
                latitude,
                longitude,
                address,
                timestamp: new Date().toISOString(),
                confidenceScore: 85
            };

            const match = evaluateComplaintFusion(mockComp, incidents);
            if (match && match.matchedIncidentId) {
                const found = incidents.find(i => i.id === match.matchedIncidentId);
                if (found) {
                    setPreviewFusion({
                        matchedIncidentTitle: found.title,
                        matchedIncidentNumber: found.incidentNumber,
                        distanceMeters: match.distanceMeters,
                        matchCount: found.complaintCount,
                        parameterDetails: match.parameterDetails
                    });
                    return;
                }
            }
        }
        setPreviewFusion(null);
    }, [latitude, longitude, description, category, wardId, address]);

    // Multilingual Voice Input via Speech Recognition (Supports all 10 Indian Languages)
    const handleVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = currentLanguage;
            recognition.interimResults = false;
            recognition.onstart = () => setIsRecording(true);
            recognition.onend = () => setIsRecording(false);
            recognition.onerror = () => setIsRecording(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setDescription(prev => (prev ? prev + ' ' + transcript : transcript));
            };
            recognition.start();
        } else {
            alert('Speech recognition is not supported in this browser. Please type your message.');
        }
    };

    // High-Precision Hardware GPS Auto-Detection & Reverse Geocoding
    const handleDetectGPS = async () => {
        setIsLocating(true);
        setLocationStatus("Acquiring high-precision hardware GPS coordinates...");
        try {
            // 1. Precise GPS coordinates
            const pos = await getHighPrecisionCoordinates();
            setLatitude(pos.latitude);
            setLongitude(pos.longitude);
            setGpsAccuracy(pos.accuracyMeters);

            // 2. Reverse-geocode to exact street address and landmark via OpenStreetMap Nominatim
            setLocationStatus("Reverse-geocoding street address & landmark...");
            const geo = await reverseGeocodeCoordinates(pos.latitude, pos.longitude);
            if (geo.formattedAddress) {
                setAddress(geo.formattedAddress);
            } else if (!address) {
                setAddress(`Near Lat ${pos.latitude.toFixed(4)}, Lon ${pos.longitude.toFixed(4)}`);
            }
            setLocationStatus(null);
        } catch (err: any) {
            console.warn('[QuickComplaint] Hardware GPS error:', err);
            // Fallback to municipal coordinates
            setLatitude(22.7540);
            setLongitude(75.8912);
            setGpsAccuracy(35);
            if (!address) {
                setAddress('AB Road, Near District Hospital Junction, Ward 4');
            }
            setLocationStatus("Hardware GPS unavailable: Defaulted to central Indore. Street address can be edited manually.");
        } finally {
            setIsLocating(false);
        }
    };

    const handleManualAddressChange = async (val: string) => {
        setAddress(val);
        if (!latitude || !longitude) {
            const wardCoord = WARD_FALLBACK_COORDINATES[wardId] || WARD_FALLBACK_COORDINATES['WARD-04'];
            setLatitude(wardCoord.lat);
            setLongitude(wardCoord.lng);
            setGpsAccuracy(20);
        }
        if (val.trim().length >= 3) {
            setIsSearching(true);
            try {
                const results = await searchAddressLocations(val);
                setSearchResults(results);
            } catch (err) {
                console.warn('Search locations failed:', err);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectSearchResult = (result: { address: string; latitude: number; longitude: number }) => {
        setAddress(result.address);
        setLatitude(result.latitude);
        setLongitude(result.longitude);
        setGpsAccuracy(5);
        setSearchResults([]);
    };

    const handleWardChange = (newWardId: string, newWardName: string) => {
        setWardId(newWardId);
        setWardName(newWardName);
        if (locationMode === 'manual' || !latitude) {
            const wardCoord = WARD_FALLBACK_COORDINATES[newWardId] || WARD_FALLBACK_COORDINATES['WARD-04'];
            setLatitude(wardCoord.lat);
            setLongitude(wardCoord.lng);
            setGpsAccuracy(20);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalLat = latitude;
        let finalLng = longitude;
        if (!finalLat || !finalLng) {
            const wardCoord = WARD_FALLBACK_COORDINATES[wardId] || WARD_FALLBACK_COORDINATES['WARD-04'];
            finalLat = wardCoord.lat;
            finalLng = wardCoord.lng;
            setLatitude(finalLat);
            setLongitude(finalLng);
        }

        if (!validation.isValid && (!address || address.trim().length < 3)) return;

        setIsSubmitting(true);
        try {
            const result = processCitizenComplaint({
                citizenName,
                phone,
                description,
                category,
                wardId,
                wardName,
                address,
                latitude: finalLat,
                longitude: finalLng
            });
            setSubmissionResult(result);
        } catch (err: any) {
            alert(err.message || 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setDescription('');
        setAddress('');
        setLatitude(null);
        setLongitude(null);
        setSubmissionResult(null);
    };

    return (
        <>
            <Card className="border border-border/70 shadow-md bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b bg-muted/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                            <span className="bg-teal-50 text-teal-600 p-2 rounded-xl dark:bg-teal-950/40 dark:text-teal-400 shadow-sm">
                                <Sparkles className="w-4 h-4" />
                            </span>
                            <div>
                                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                                    {t('dashboard.registerTitle', 'Register Civic Complaint')}
                                    <Badge variant="outline" className="text-[10px] text-teal-700 dark:text-teal-300 border-teal-500/40 bg-teal-50/50 dark:bg-teal-950/30">
                                        GPS Mandatory & AI Grouping
                                    </Badge>
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {t('dashboard.registerSubtitle', 'Share vital problem information and verified location. Complaints are automatically unified by AI into prioritized municipal incidents.')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border/40 text-xs">
                                <button
                                    onClick={() => setActiveTab("categories")}
                                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                                        activeTab === "categories"
                                            ? "bg-background text-foreground shadow-sm font-bold"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    📂 {t('dashboard.categoryTiles', 'Category Tiles')}
                                </button>
                                <button
                                    onClick={() => setActiveTab("express")}
                                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                                        activeTab === "express"
                                            ? "bg-background text-foreground shadow-sm font-bold"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    ⚡ {t('dashboard.directIntake', 'Direct Intake')}
                                </button>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsModalOpen(true)}
                                className="h-7 text-xs border-teal-500/40 text-teal-700 dark:text-teal-300 hover:bg-teal-50"
                            >
                                <Maximize2 className="w-3 h-3 mr-1" />
                                {t('dashboard.fullScreen', 'Full Screen')}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5">
                    {activeTab === "categories" ? (
                        /* CATEGORIES GRID */
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                            {categories.map((item) => {
                                const Icon = item.icon;
                                const translatedLabel = 
                                    item.id === "Water & Sewage" ? t('category.water', item.label) :
                                    item.id === "Electricity & Lighting" ? t('category.electricity', item.label) :
                                    item.id === "Roads & Infrastructure" ? t('category.roads', item.label) :
                                    item.id === "Solid Waste" ? t('category.garbage', item.label) :
                                    item.id === "Traffic Hazard" ? t('category.traffic', item.label) :
                                    t('category.safety', item.label);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleCategoryClick(item.id)}
                                        className="group flex flex-col items-center justify-center p-3 rounded-xl border border-border/60 bg-background hover:border-teal-500/50 hover:shadow-md transition-all duration-200 text-center"
                                    >
                                        <div className={`p-2.5 rounded-xl ${item.color} mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-semibold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                            {translatedLabel}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                            <MapPin className="h-2.5 w-2.5 text-red-400" />
                                            {t('category.gpsTagged', 'GPS Tagged')}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : submissionResult ? (
                        /* SUBMISSION SUCCESS RECEIPT */
                        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/60 text-green-600 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">Complaint Registered Successfully</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Ticket Reference: <strong className="font-mono text-foreground">{submissionResult.complaint.id}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* AI Grouping Outcome Card */}
                            <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-3.5 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wide text-[11px]">
                                        <Layers className="h-4 w-4 text-purple-600" />
                                        {submissionResult.isGroupedIntoExisting
                                            ? 'AI Incident Fusion: Correlated & Fused!'
                                            : 'New Incident Established in Priority Queue'}
                                    </div>
                                    <Badge variant="outline" className="text-[10px] bg-purple-100 text-purple-800 border-purple-300">
                                        Priority: {submissionResult.matchedIncident.priorityScore.totalScore}/100
                                    </Badge>
                                </div>

                                {submissionResult.isGroupedIntoExisting ? (
                                    <div className="space-y-1.5 text-purple-800 dark:text-purple-300">
                                        <p className="leading-relaxed">
                                            Your report was automatically grouped with ongoing incident{' '}
                                            <strong className="text-purple-950 dark:text-purple-100">{submissionResult.matchedIncident.incidentNumber}</strong> ({submissionResult.matchedIncident.title}).
                                            There are now <strong className="text-purple-950 dark:text-purple-100">{submissionResult.matchedIncident.complaintCount} verified citizen reports</strong> backing this issue, escalating municipal priority to{' '}
                                            <strong className="text-purple-950 dark:text-purple-100">{submissionResult.matchedIncident.priorityScore.totalScore}/100</strong>!
                                        </p>
                                        {submissionResult.fusionMatch && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] text-purple-900 dark:text-purple-200 font-medium">
                                                <div className="bg-purple-100/60 dark:bg-purple-900/40 p-1.5 rounded">
                                                    📍 Proximity: {submissionResult.fusionMatch.distanceMeters}m (≤150m)
                                                </div>
                                                <div className="bg-purple-100/60 dark:bg-purple-900/40 p-1.5 rounded">
                                                    ⏱️ Time: {submissionResult.fusionMatch.timeDifferenceHours}h (≤72h)
                                                </div>
                                                <div className="bg-purple-100/60 dark:bg-purple-900/40 p-1.5 rounded">
                                                    🏷️ Category: {submissionResult.complaint.category}
                                                </div>
                                                <div className="bg-purple-100/60 dark:bg-purple-900/40 p-1.5 rounded">
                                                    🧠 NLP: {submissionResult.fusionMatch.semanticSimilarity}% Match
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-purple-800 dark:text-purple-300 leading-relaxed">
                                        No matching duplicates were found nearby. Your report has established Incident{' '}
                                        <strong className="text-purple-950 dark:text-purple-100">{submissionResult.matchedIncident.incidentNumber}</strong> with an initial calculated priority of{' '}
                                        <strong className="text-purple-950 dark:text-purple-100">{submissionResult.matchedIncident.priorityScore.totalScore}/100</strong>.
                                    </p>
                                )}
                            </div>

                            <Button onClick={handleReset} variant="outline" size="sm" className="h-8 text-xs font-medium">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Register Another Complaint
                            </Button>
                        </div>
                    ) : (
                        /* INLINE EXPRESS COMPLAINT INTAKE */
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Category Selector Chips */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                                    <span>1. Issue Category:</span>
                                    <span className="text-[10px] text-muted-foreground">Required</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                    {categories.map((cat) => {
                                        const isSelected = category === cat.id;
                                        const Icon = cat.icon;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategory(cat.id)}
                                                className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs font-medium text-left transition-all ${
                                                    isSelected
                                                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm"
                                                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                                                }`}
                                            >
                                                <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-teal-600" : "text-slate-400"}`} />
                                                <span className="truncate text-[11px]">{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Problem Description with Multilingual Voice Input */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground">
                                            2. {t('complaint.description', 'Problem Description')} ({languageInfo.nativeName}):
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleVoiceInput}
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-2xs ${
                                                isRecording
                                                    ? 'bg-red-500 text-white animate-pulse'
                                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                            }`}
                                            title="Speak in your chosen language"
                                        >
                                            {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-blue-600" />}
                                            <span>{isRecording ? t('complaint.listening', 'Listening...') : t('complaint.voiceRecord', 'Voice Input')}</span>
                                        </button>
                                    </div>
                                    <span className={`text-[10px] font-mono ${description.length >= 10 ? "text-green-600 font-semibold" : "text-amber-600"}`}>
                                        {description.length}/10 chars min
                                    </span>
                                </div>
                                <Textarea
                                    rows={2}
                                    placeholder={t('complaint.search', 'e.g. Describe issue in Hindi, Marathi, Bengali, Tamil, etc. or click Voice Input...')}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="text-xs resize-none"
                                    required
                                />
                            </div>

                            {/* LOCATION VERIFICATION SECTION (GPS OR MANUAL ENTRY) */}
                            <div className="bg-slate-50/80 dark:bg-slate-900/60 border rounded-xl p-3.5 space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-border/60">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-red-500" />
                                        <span className="text-xs font-bold text-foreground">3. Location Verification</span>
                                        {latitude && longitude && (
                                            <Badge variant="outline" className="text-[10px] text-teal-700 dark:text-teal-300 border-teal-500/40 bg-teal-50/60">
                                                {locationMode === 'auto' ? (gpsAccuracy ? `±${gpsAccuracy}m GPS` : 'GPS Verified') : 'Manual Address'}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Mode Selector Toggle */}
                                    <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLocationMode('auto');
                                                if (!latitude) handleDetectGPS();
                                            }}
                                            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1 ${
                                                locationMode === 'auto'
                                                    ? "bg-background text-teal-700 dark:text-teal-300 shadow-sm border border-border/50"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            <Crosshair className="h-3 w-3" />
                                            <span>Live GPS (Auto)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLocationMode('manual');
                                                if (!latitude) {
                                                    const wardCoord = WARD_FALLBACK_COORDINATES[wardId] || WARD_FALLBACK_COORDINATES['WARD-04'];
                                                    setLatitude(wardCoord.lat);
                                                    setLongitude(wardCoord.lng);
                                                    setGpsAccuracy(20);
                                                }
                                            }}
                                            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1 ${
                                                locationMode === 'manual'
                                                    ? "bg-background text-teal-700 dark:text-teal-300 shadow-sm border border-border/50"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            <span>✍️ Write Manually</span>
                                        </button>
                                    </div>
                                </div>

                                {/* AUTO GPS CONTROLS */}
                                {locationMode === 'auto' ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[11px] text-muted-foreground">
                                                Acquiring hardware GPS coordinates from your device:
                                            </span>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={handleDetectGPS}
                                                disabled={isLocating}
                                                className="h-7 text-xs px-2.5 font-bold border-teal-500/50 text-teal-700 dark:text-teal-300 hover:bg-teal-50 shadow-sm"
                                            >
                                                {isLocating ? (
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin text-teal-600" />
                                                ) : (
                                                    <Crosshair className="h-3 w-3 mr-1 text-teal-600" />
                                                )}
                                                {latitude ? "Refresh High-Precision GPS" : "Auto-Detect Live GPS"}
                                            </Button>
                                        </div>

                                        {locationStatus && (
                                            <div className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 p-2 rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
                                                <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                                                <span>{locationStatus}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                            <div>
                                                <label className="text-[11px] text-muted-foreground block mb-1">Ward Jurisdiction:</label>
                                                <select
                                                    value={wardId}
                                                    onChange={(e) => handleWardChange(e.target.value, e.target.options[e.target.selectedIndex].text)}
                                                    className="w-full h-8 px-2 rounded border bg-background text-xs"
                                                    required
                                                >
                                                    <option value="WARD-04">Ward 4 - Vijay Nagar North</option>
                                                    <option value="WARD-09">Ward 9 - Rajwada Central</option>
                                                    <option value="WARD-12">Ward 12 - Sukhlia Industrial</option>
                                                    <option value="WARD-17">Ward 17 - Chhoti Gwaltoli</option>
                                                    <option value="WARD-23">Ward 23 - Banganga Colony</option>
                                                    <option value="WARD-28">Ward 28 - Annapurna Hills</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[11px] text-muted-foreground block mb-1">Street Address / Landmark (Auto-Resolved):</label>
                                                <Input
                                                    placeholder="e.g. Near Community Center, Gate 2"
                                                    value={address}
                                                    onChange={(e) => handleManualAddressChange(e.target.value)}
                                                    className="h-8 text-xs"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* MANUAL LOCATION ENTRY */
                                    <div className="space-y-2.5">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                            <div>
                                                <label className="text-[11px] text-muted-foreground font-semibold block mb-1">Ward / Zone Area:</label>
                                                <select
                                                    value={wardId}
                                                    onChange={(e) => handleWardChange(e.target.value, e.target.options[e.target.selectedIndex].text)}
                                                    className="w-full h-8 px-2 rounded border bg-background text-xs"
                                                    required
                                                >
                                                    <option value="WARD-04">Ward 4 - Vijay Nagar North</option>
                                                    <option value="WARD-09">Ward 9 - Rajwada Central</option>
                                                    <option value="WARD-12">Ward 12 - Sukhlia Industrial</option>
                                                    <option value="WARD-17">Ward 17 - Chhoti Gwaltoli</option>
                                                    <option value="WARD-23">Ward 23 - Banganga Colony</option>
                                                    <option value="WARD-28">Ward 28 - Annapurna Hills</option>
                                                </select>
                                            </div>

                                            <div className="sm:col-span-2 relative">
                                                <label className="text-[11px] text-muted-foreground font-semibold block mb-1">
                                                    Write Street Address / Landmark Manually:
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="e.g. Near Shiv Mandir, Gate 2, Main Market, AB Road"
                                                        value={address}
                                                        onChange={(e) => handleManualAddressChange(e.target.value)}
                                                        className="h-8 text-xs pr-7"
                                                        required
                                                    />
                                                    {isSearching ? (
                                                        <Loader2 className="h-3.5 w-3.5 text-teal-600 animate-spin absolute right-2 top-2.5" />
                                                    ) : null}
                                                </div>

                                                {/* Autocomplete Suggestions */}
                                                {searchResults.length > 0 && (
                                                    <div className="absolute z-20 left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden text-xs max-h-36 overflow-y-auto">
                                                        <div className="p-1 text-[10px] font-bold text-muted-foreground uppercase border-b bg-muted/40">
                                                            Matching Landmarks (Click to link):
                                                        </div>
                                                        {searchResults.map((res, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => handleSelectSearchResult(res)}
                                                                className="w-full text-left p-1.5 hover:bg-muted text-foreground text-xs flex items-start gap-1 border-b last:border-b-0"
                                                            >
                                                                <MapPin className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                                                                <span className="line-clamp-1">{res.address}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Location Status Display */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
                                    <span className="text-muted-foreground font-medium">Location Status:</span>
                                    {address && address.trim().length >= 3 ? (
                                        <span className="font-mono text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            {locationMode === 'auto'
                                                ? `GPS Verified: ${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`
                                                : `Manual Location Confirmed: ${wardName.split(' - ')[0]}`}
                                        </span>
                                    ) : (
                                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            {locationMode === 'auto'
                                                ? 'Click "Auto-Detect Live GPS" or switch to "Write Manually"'
                                                : 'Write your street address or landmark to proceed'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* LIVE AI GROUPING PARAMETER RADAR */}
                            {previewFusion ? (
                                <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200">
                                            <Layers className="h-4 w-4 text-purple-600" />
                                            <span>AI Incident Fusion: Duplicate Parameter Match Detected</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] bg-purple-100 text-purple-800 border-purple-300 font-mono">
                                            {previewFusion.distanceMeters}m away
                                        </Badge>
                                    </div>

                                    <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-relaxed">
                                        Matched existing incident <strong className="text-purple-950 dark:text-purple-100">"{previewFusion.matchedIncidentTitle}"</strong> ({previewFusion.matchedIncidentNumber || 'Ongoing'}).
                                        Your report will be automatically grouped with <strong className="text-purple-950 dark:text-purple-100">{previewFusion.matchCount} existing report(s)</strong>, escalating its priority in the dispatch queue.
                                    </p>

                                    <div className="flex flex-wrap gap-1.5 text-[10px] pt-1 border-t border-purple-200 dark:border-purple-800/60">
                                        <span className="bg-purple-100/80 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 px-2 py-0.5 rounded">
                                            📏 Distance: {previewFusion.distanceMeters}m (≤150m)
                                        </span>
                                        <span className="bg-purple-100/80 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 px-2 py-0.5 rounded">
                                            ⏱️ Time: ≤72h Active
                                        </span>
                                        <span className="bg-purple-100/80 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 px-2 py-0.5 rounded">
                                            🏷️ Category: {category}
                                        </span>
                                        <span className="bg-purple-100/80 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 px-2 py-0.5 rounded">
                                            🧠 NLP Similarity: Passed
                                        </span>
                                    </div>
                                </div>
                            ) : latitude && longitude && description.length >= 10 ? (
                                <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-xs flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
                                    <p className="text-[11px] text-teal-800 dark:text-teal-300">
                                        <strong>AI Parameter Scan Complete:</strong> No existing duplicate found within 150m radius. This complaint will establish a new prioritized incident record.
                                    </p>
                                </div>
                            ) : null}

                            {/* MANDATORY VALIDATION CHECKLIST & GATE (Citizen CANNOT register if incomplete) */}
                            <div className="rounded-xl border p-3 text-xs space-y-2 bg-card">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                        <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                                        Mandatory Submission Checklist
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        validation.isValid
                                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                    }`}>
                                        {validation.isValid ? "Ready to Register" : "Registration Blocked"}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                                    <div className={`flex items-center gap-1 ${latitude && longitude ? "text-green-600 font-medium" : "text-red-500 font-semibold"}`}>
                                        {latitude && longitude ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                        Location: {latitude && longitude ? (locationMode === 'auto' ? "GPS Locked" : "Manual Linked") : "Missing"}
                                    </div>
                                    <div className={`flex items-center gap-1 ${address.trim().length >= 3 ? "text-green-600 font-medium" : "text-red-500 font-semibold"}`}>
                                        {address.trim().length >= 3 ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                        Address: {address.trim().length >= 3 ? "Provided" : "Missing"}
                                    </div>
                                    <div className={`flex items-center gap-1 ${description.trim().length >= 10 ? "text-green-600 font-medium" : "text-red-500 font-semibold"}`}>
                                        {description.trim().length >= 10 ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                        Detail: {description.trim().length >= 10 ? "Provided" : "Min 10 chars"}
                                    </div>
                                    <div className={`flex items-center gap-1 ${category ? "text-green-600 font-medium" : "text-red-500 font-semibold"}`}>
                                        {category ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                        Category: Selected
                                    </div>
                                </div>

                                {!validation.isValid && (
                                    <div className="pt-1.5 border-t border-border">
                                        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                            Registration is locked. Please provide your problem description and verified location (via GPS or manual address).
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* SUBMIT BUTTON (Strictly Disabled if Incomplete) */}
                            <div className="pt-1">
                                <Button
                                    type="submit"
                                    disabled={!validation.isValid || isSubmitting}
                                    className={`w-full font-bold text-xs h-10 transition-all ${
                                        validation.isValid
                                            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md cursor-pointer"
                                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    ) : validation.isValid ? (
                                        <Send className="h-4 w-4 mr-1.5" />
                                    ) : (
                                        <AlertTriangle className="h-4 w-4 mr-1.5 text-red-500" />
                                    )}
                                    {validation.isValid
                                        ? "Submit Complaint & Auto-Group with AI"
                                        : "Registration Blocked — Provide Location & Mandatory Info"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* Smart Citizen Complaint Modal (for Full-Screen / Photos Intake) */}
            <SmartCitizenComplaintModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                defaultCategory={category}
            />
        </>
    );
}
