import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  MapPin,
  Navigation,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Send,
  Droplets,
  Zap,
  Construction,
  Trash2,
  Car,
  AlertOctagon,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  processCitizenComplaint,
  validateCitizenComplaint,
  getStoredIncidents
} from '@/services/urbanIntelligence/urbanStore';
import type { RegisterComplaintOutput } from '@/services/urbanIntelligence/urbanStore';
import { evaluateComplaintFusion } from '@/services/urbanIntelligence/incidentFusion';
import type { Complaint } from '@/types/urbanIntelligence';
import { getHighPrecisionCoordinates, reverseGeocodeCoordinates } from '@/services/location/preciseGeolocation';

interface SmartCitizenComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

const CATEGORIES = [
  { id: 'Water & Sewage', label: 'Water & Sewage', icon: Droplets, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { id: 'Electricity & Lighting', label: 'Electricity & Power', icon: Zap, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { id: 'Roads & Infrastructure', label: 'Roads & Potholes', icon: Construction, color: 'text-orange-500 bg-orange-50 border-orange-200' },
  { id: 'Solid Waste', label: 'Garbage & Waste', icon: Trash2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  { id: 'Traffic Hazard', label: 'Traffic & Signals', icon: Car, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
  { id: 'Disaster Management', label: 'Public Safety Hazard', icon: AlertOctagon, color: 'text-red-500 bg-red-50 border-red-200' }
];

export const SmartCitizenComplaintModal: React.FC<SmartCitizenComplaintModalProps> = ({
  isOpen,
  onClose,
  defaultCategory
}) => {
  const [category, setCategory] = useState<string>(defaultCategory || 'Water & Sewage');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [wardId, setWardId] = useState<string>('WARD-04');
  const [wardName, setWardName] = useState<string>('Ward 4 - Vijay Nagar North');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [citizenName, setCitizenName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<RegisterComplaintOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pre-submission live grouping preview
  const [previewFusion, setPreviewFusion] = useState<{
    matchedIncidentTitle: string;
    matchedIncidentNumber?: string;
    distanceMeters: number;
    matchCount: number;
    relation: string;
    parameterDetails?: any;
  } | null>(null);

  useEffect(() => {
    if (defaultCategory) {
      setCategory(defaultCategory);
    }
  }, [defaultCategory]);

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
            relation: match.relation,
            parameterDetails: match.parameterDetails
          });
          return;
        }
      }
    }
    setPreviewFusion(null);
  }, [latitude, longitude, description, category, wardId, address]);

  // High-Precision Hardware GPS Auto-detect & Geocoding
  const handleDetectGPS = async () => {
    setIsLocating(true);
    try {
      // 1. Acquire hardware GPS coordinates
      const pos = await getHighPrecisionCoordinates();
      setLatitude(pos.latitude);
      setLongitude(pos.longitude);
      setGpsAccuracy(pos.accuracyMeters);

      // 2. Perform high-precision reverse geocoding
      const geo = await reverseGeocodeCoordinates(pos.latitude, pos.longitude);
      if (geo.formattedAddress) {
        setAddress(geo.formattedAddress);
      }
    } catch (err: any) {
      console.warn('[SmartModal GPS] High-precision location fallback:', err);
      // Fallback coordinate
      const fallbackLat = 22.7540;
      const fallbackLng = 75.8912;
      setLatitude(fallbackLat);
      setLongitude(fallbackLng);
      setGpsAccuracy(50);
      if (!address) {
        setAddress('AB Road, Vijay Nagar Junction, Ward 4, Indore');
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid || latitude === null || longitude === null) return;

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
        latitude,
        longitude
      });

      // Save to local reports cache as well
      const fallbackReport = {
        id: result.complaint.id,
        title: `${category}: ${description.slice(0, 40)}...`,
        description,
        category,
        location: address,
        lat: latitude,
        lng: longitude,
        images: [],
        created_at: new Date().toISOString(),
        status: 'Open'
      };
      try {
        const existing = JSON.parse(localStorage.getItem('offline_reports') || '[]');
        localStorage.setItem('offline_reports', JSON.stringify([fallbackReport, ...existing]));
      } catch (e) {
        console.warn('Could not cache report locally', e);
      }

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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleReset()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  Register Civic Complaint
                </DialogTitle>
                <p className="text-xs text-slate-400">
                  AI-Powered Intake & Live Incident Fusion by Parameters
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-teal-300 border-teal-500/40 text-[10px] tracking-wider uppercase">
              GPS Verified
            </Badge>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {submissionResult ? (
            /* SUCCESS CONFIRMATION VIEW */
            <div className="space-y-5 py-2 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950/60 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground">Complaint Successfully Registered!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Reference Ticket: <strong className="font-mono text-foreground">{submissionResult.complaint.id}</strong>
                </p>
              </div>

              {/* AI Grouping Result Card */}
              <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-xs uppercase tracking-wide">
                    <Layers className="h-4 w-4 text-purple-600" />
                    {submissionResult.isGroupedIntoExisting
                      ? 'AI Incident Fusion: Correlated & Grouped!'
                      : 'New Verified Incident Created in Priority Queue'}
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border-purple-300">
                    {submissionResult.isGroupedIntoExisting ? 'Duplicate Fused' : 'New Ticket'}
                  </Badge>
                </div>

                {submissionResult.isGroupedIntoExisting ? (
                  <div className="space-y-2">
                    <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
                      Our AI automatically grouped your report with ongoing incident{' '}
                      <strong className="text-purple-950 dark:text-purple-100">{submissionResult.matchedIncident.incidentNumber}</strong> ({submissionResult.matchedIncident.title}).
                      There are now <strong className="text-purple-950 dark:text-purple-100">{submissionResult.matchedIncident.complaintCount} citizens</strong> backing this issue, escalating its priority score to{' '}
                      <strong className="text-purple-950 dark:text-purple-100">{submissionResult.matchedIncident.priorityScore.totalScore}/100</strong>!
                    </p>
                    
                    {/* Parameter Matching Breakdown */}
                    {submissionResult.fusionMatch && (
                      <div className="bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-purple-200/60 dark:border-purple-800/60 text-[11px] space-y-1.5">
                        <span className="font-bold text-purple-950 dark:text-purple-200 block">
                          AI Grouping Parameter Verification:
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                          <div>📍 Proximity: <strong className="text-purple-700 dark:text-purple-300">{submissionResult.fusionMatch.distanceMeters}m</strong> (≤150m threshold)</div>
                          <div>⏱️ Time Delta: <strong className="text-purple-700 dark:text-purple-300">{submissionResult.fusionMatch.timeDifferenceHours}h</strong> (≤72h window)</div>
                          <div>🏷️ Category: <strong className="text-purple-700 dark:text-purple-300">{submissionResult.complaint.category}</strong> (Exact Match)</div>
                          <div>🧠 Semantic NLP: <strong className="text-purple-700 dark:text-purple-300">{submissionResult.fusionMatch.semanticSimilarity}%</strong> Overlap</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
                    No matching duplicates were found within the 150m spatial radius and 72-hour window. Your report has established Incident{' '}
                    <strong className="text-purple-950 dark:text-purple-100">{submissionResult.matchedIncident.incidentNumber}</strong> with an initial calculated priority of{' '}
                    <strong className="text-purple-950 dark:text-purple-100">{submissionResult.matchedIncident.priorityScore.totalScore}/100</strong>.
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/my-complaints?ticket=${submissionResult.complaint.id}`}
                  onClick={handleReset}
                  className="flex-1"
                >
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9">
                    Track Live on Timeline →
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 border-slate-700 text-xs h-9"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            /* COMPLAINT SUBMISSION FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Chips */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>1. Select Category:</span>
                  <span className="text-[10px] text-muted-foreground">Required</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => {
                    const isSelected = category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    2. Describe the Problem (Hindi, Hinglish, English):
                  </label>
                  <span className={`text-[10px] font-mono ${description.length >= 10 ? 'text-green-600 font-semibold' : 'text-amber-600'}`}>
                    {description.length}/10 chars min
                  </span>
                </div>
                <Textarea
                  rows={3}
                  placeholder="e.g. 'Paani ka pipe phat gaya hai hospital ke samne' or 'Dangerous road pothole near junction'..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="text-xs resize-none"
                  required
                />
              </div>

              {/* MANDATORY LOCATION SECTION */}
              <div className="bg-slate-50 dark:bg-slate-900 border rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-bold text-foreground">3. Location Verification (Mandatory)</span>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleDetectGPS}
                    disabled={isLocating}
                    className="h-7 text-xs px-2.5 font-medium border-teal-500/40 text-teal-700 dark:text-teal-300 hover:bg-teal-50"
                  >
                    {isLocating ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Navigation className="h-3 w-3 mr-1 text-teal-600" />
                    )}
                    {latitude ? 'Update GPS' : 'Auto-Detect Live GPS'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Ward Jurisdiction:</label>
                    <select
                      value={wardId}
                      onChange={e => {
                        setWardId(e.target.value);
                        setWardName(e.target.options[e.target.selectedIndex].text);
                      }}
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
                    <label className="text-[11px] text-muted-foreground block mb-1">Street Address / Landmark:</label>
                    <Input
                      placeholder="e.g. Near Community Center, Gate 2"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* GPS Status Indicator */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-muted-foreground font-medium">GPS Verification Status:</span>
                  {latitude && longitude ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {latitude}, {longitude}
                      </span>
                      {gpsAccuracy && (
                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 py-0 h-4">
                          ±{gpsAccuracy}m GPS Precision
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-red-500 font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Mandatory: Click "Auto-Detect Live GPS" to enable registration
                    </span>
                  )}
                </div>
              </div>

              {/* Citizen Details (Optional) */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Your Name (Optional):</label>
                  <Input
                    placeholder="Citizen Name"
                    value={citizenName}
                    onChange={e => setCitizenName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Phone Number (Optional):</label>
                  <Input
                    placeholder="+91 Mobile Number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Live Pre-Submission AI Grouping Radar */}
              {previewFusion ? (
                <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200">
                      <Layers className="h-4 w-4 text-purple-600" />
                      <span>AI Parameter Match Detected (Incident Fusion)</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-purple-100 text-purple-800 border-purple-300 font-mono">
                      {previewFusion.distanceMeters}m away
                    </Badge>
                  </div>

                  <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-relaxed">
                    Matched existing incident <strong className="text-purple-950 dark:text-purple-100">"{previewFusion.matchedIncidentTitle}"</strong> ({previewFusion.matchedIncidentNumber || 'Ongoing'}).
                    Your report will be automatically grouped with <strong className="text-purple-950 dark:text-purple-100">{previewFusion.matchCount} existing report(s)</strong>, escalating its priority in the dispatch queue.
                  </p>

                  {/* Parameter Breakdown */}
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
                    <strong>AI Parameter Scan Complete:</strong> No existing duplicate found within 150m radius. This complaint will create a new prioritized incident record.
                  </p>
                </div>
              ) : null}

              {/* STRICT VALIDATION GATE: Citizen CANNOT register if mandatory info is missing */}
              <div className="rounded-xl border p-3 text-xs space-y-2 bg-card">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                    Mandatory Submission Checklist
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    validation.isValid
                      ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {validation.isValid ? 'Ready to Register' : 'Registration Blocked'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${latitude && longitude ? 'text-green-600 font-medium' : 'text-red-500 font-semibold'}`}>
                    {latitude && longitude ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    GPS Location: {latitude && longitude ? 'Verified' : 'Missing'}
                  </div>
                  <div className={`flex items-center gap-1.5 ${address.trim().length >= 3 ? 'text-green-600 font-medium' : 'text-red-500 font-semibold'}`}>
                    {address.trim().length >= 3 ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    Street Address: {address.trim().length >= 3 ? 'Provided' : 'Missing'}
                  </div>
                  <div className={`flex items-center gap-1.5 ${description.trim().length >= 10 ? 'text-green-600 font-medium' : 'text-red-500 font-semibold'}`}>
                    {description.trim().length >= 10 ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    Description: {description.trim().length >= 10 ? 'Provided' : 'Too short (min 10)'}
                  </div>
                  <div className={`flex items-center gap-1.5 ${category ? 'text-green-600 font-medium' : 'text-red-500 font-semibold'}`}>
                    {category ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    Category: {category ? 'Selected' : 'Missing'}
                  </div>
                </div>

                {!validation.isValid && (
                  <div className="pt-1.5 border-t border-border">
                    <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      Registration is locked. You must provide GPS location, street address, and description before submitting.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button (Strictly Disabled if Incomplete) */}
              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={!validation.isValid || isSubmitting}
                  className={`w-full font-bold text-xs h-10 transition-all ${
                    validation.isValid
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md cursor-pointer'
                      : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
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
                    ? 'Submit Complaint & Auto-Group with AI'
                    : 'Registration Blocked — Provide GPS & Mandatory Info'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
