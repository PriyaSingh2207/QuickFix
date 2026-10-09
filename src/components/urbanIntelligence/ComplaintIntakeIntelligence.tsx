import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  RefreshCw,
  Languages
} from 'lucide-react';
import type { Complaint, UnifiedIncident } from '@/types/urbanIntelligence';
import { evaluateComplaintFusion } from '@/services/urbanIntelligence/incidentFusion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface ComplaintIntakeIntelligenceProps {
  existingIncidents: UnifiedIncident[];
  onAddNewComplaint: (complaint: Complaint) => void;
}

export const ComplaintIntakeIntelligence: React.FC<ComplaintIntakeIntelligenceProps> = ({
  existingIncidents,
  onAddNewComplaint
}) => {
  const [inputText, setInputText] = useState('');
  const [citizenName, setCitizenName] = useState('Anil Gupta');
  const [address, setAddress] = useState('Opposite Trauma Wing, AB Road, Ward 4');
  const [wardId, setWardId] = useState('WARD-04');
  const [wardName, setWardName] = useState('Ward 4 - Vijay Nagar North');

  // AI Classification State
  const [classificationResult, setClassificationResult] = useState<{
    detectedLanguage: 'en' | 'hi' | 'hinglish';
    category: string;
    subcategory: string;
    confidence: number;
    missingDetails: string[];
    adaptiveFollowUps: string[];
    fusionMatch: ReturnType<typeof evaluateComplaintFusion>;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submittedAlert, setSubmittedAlert] = useState(false);

  // Sample quick scenarios
  const SAMPLES = [
    {
      label: 'Hindi: Hospital Flooding',
      text: 'जिला अस्पताल के मुख्य गेट के सामने पानी की बड़ी पाइपलाइन फूट गई है। एम्बुलेंस आने-जाने का रास्ता पूरी तरह बंद हो चुका है।'
    },
    {
      label: 'Hinglish: School Live Wire',
      text: 'School ke gate ke paas transformer se high voltage taar toot kar zameen par latak gaya hai. Spark ho raha hai bohot tez.'
    },
    {
      label: 'English: Choked Storm Drain',
      text: 'Main bridge culvert completely blocked with plastic waste. Heavy monsoon rains forecast for tonight will flood 150 residential homes.'
    }
  ];

  const handleAnalyzeText = (text: string) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setSubmittedAlert(false);

    // Multilingual AI classification heuristics
    setTimeout(() => {
      const lower = text.toLowerCase();
      let lang: 'en' | 'hi' | 'hinglish' = 'en';
      if (/[\u0900-\u097F]/.test(text)) lang = 'hi';
      else if (lower.includes('hai') || lower.includes('ke') || lower.includes('se') || lower.includes('paas') || lower.includes('bohot')) lang = 'hinglish';

      let cat = 'Municipal Services';
      let subcat = 'General Inquiry';
      let confidence = 88;
      const missing: string[] = [];
      const followUps: string[] = [];

      if (lower.includes('paani') || lower.includes('pipe') || lower.includes('water') || lower.includes('drain') || lower.includes('नाला')) {
        cat = 'Water & Sewage';
        subcat = lower.includes('drain') || lower.includes('नाला') ? 'Storm Drain Blockage' : 'Main Pipeline Rupture';
        confidence = 94;
        if (!lower.includes('meter') && !lower.includes('gate') && !lower.includes('road')) {
          missing.push('Exact landmark or diameter of pipe');
          followUps.push('Is the water drinkable pipeline or sewage overflow?');
        }
      } else if (lower.includes('taar') || lower.includes('wire') || lower.includes('spark') || lower.includes('bijli') || lower.includes('बिजली')) {
        cat = 'Electricity & Lighting';
        subcat = 'Live High Voltage Hazard';
        confidence = 98;
        if (!lower.includes('pole') && !lower.includes('transformer')) {
          missing.push('Transformer pole number');
          followUps.push('Is the cable sparking or touching standing water?');
        }
      } else if (lower.includes('pothole') || lower.includes('road') || lower.includes('sadak') || lower.includes('सड़क')) {
        cat = 'Roads & Infrastructure';
        subcat = 'Hazardous Pothole Crater';
        confidence = 91;
      } else if (lower.includes('kachra') || lower.includes('garbage') || lower.includes('waste') || lower.includes('कचरा')) {
        cat = 'Solid Waste';
        subcat = 'Uncollected Refuse Heap';
        confidence = 90;
      }

      // Check fusion against existing incidents
      const dummyComplaint: Complaint = {
        id: `CMP-${Date.now().toString().slice(-4)}`,
        citizenName,
        language: lang,
        rawText: text,
        category: cat,
        subcategory: subcat,
        wardId,
        wardName,
        latitude: 22.7540,
        longitude: 75.8912,
        address,
        timestamp: new Date().toISOString(),
        confidenceScore: confidence,
        missingDetails: missing,
        followUpQuestions: followUps
      };

      const match = evaluateComplaintFusion(dummyComplaint, existingIncidents);

      setClassificationResult({
        detectedLanguage: lang,
        category: cat,
        subcategory: subcat,
        confidence,
        missingDetails: missing,
        adaptiveFollowUps: followUps,
        fusionMatch: match
      });

      setIsAnalyzing(false);
    }, 400);
  };

  const handleRegisterComplaint = () => {
    if (!inputText.trim() || !classificationResult) return;

    const newComp: Complaint = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      citizenName,
      language: classificationResult.detectedLanguage,
      rawText: inputText,
      category: classificationResult.category,
      subcategory: classificationResult.subcategory,
      wardId,
      wardName,
      latitude: 22.7540,
      longitude: 75.8912,
      address,
      timestamp: new Date().toISOString(),
      confidenceScore: classificationResult.confidence,
      missingDetails: classificationResult.missingDetails,
      followUpQuestions: classificationResult.adaptiveFollowUps,
      incidentId: classificationResult.fusionMatch?.matchedIncidentId
    };

    onAddNewComplaint(newComp);
    setSubmittedAlert(true);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-xl p-5 border border-teal-800/40 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge className="bg-teal-500 text-slate-950 font-bold uppercase text-[10px] tracking-wider">
            NLP Intake & Duplicate Intelligence
          </Badge>
          <h2 className="text-xl font-bold tracking-tight">Multilingual Complaint Intake Engine</h2>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Process raw citizen complaints across Hindi, Hinglish, and English. Automatically extracts categories, flags missing evidence, and fuses incoming reports with existing urban incidents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Complaint Submission & Simulator */}
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Complaint Input Workbench</h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Languages className="h-3.5 w-3.5 text-teal-600" />
              Hindi • Hinglish • English
            </span>
          </div>

          {/* Quick sample chips */}
          <div className="flex flex-wrap gap-1.5">
            {SAMPLES.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(s.text);
                  handleAnalyzeText(s.text);
                }}
                className="text-[11px] bg-muted hover:bg-slate-200 dark:hover:bg-slate-800 px-2.5 py-1 rounded border text-muted-foreground transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Citizen Complaint Description:</label>
            <Textarea
              rows={4}
              placeholder="Type in Hindi, Hinglish, or English (e.g. 'Paani ka pipe phat gaya hai hospital ke paas', 'Live wire sparking outside school')..."
              value={inputText}
              onChange={e => {
                setInputText(e.target.value);
                handleAnalyzeText(e.target.value);
              }}
              className="text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Citizen Name:</label>
              <input
                type="text"
                value={citizenName}
                onChange={e => setCitizenName(e.target.value)}
                className="w-full h-8 px-2 rounded border bg-background text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Ward Location:</label>
              <select
                value={wardId}
                onChange={e => {
                  setWardId(e.target.value);
                  setWardName(e.target.options[e.target.selectedIndex].text);
                }}
                className="w-full h-8 px-2 rounded border bg-background text-xs"
              >
                <option value="WARD-04">Ward 4 - Vijay Nagar North</option>
                <option value="WARD-09">Ward 9 - Rajwada Central</option>
                <option value="WARD-12">Ward 12 - Sukhlia Industrial</option>
                <option value="WARD-17">Ward 17 - Chhoti Gwaltoli</option>
                <option value="WARD-23">Ward 23 - Banganga Colony</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleRegisterComplaint}
            disabled={!classificationResult || !inputText.trim()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs h-9 mt-2"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Submit & Fuse into Intelligence Stream
          </Button>

          {submittedAlert && (
            <div className="bg-green-50 text-green-800 dark:bg-green-950/50 dark:text-green-300 p-3 rounded-lg border border-green-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              Complaint recorded and fused with incident stream. Check Ranked Queue!
            </div>
          )}
        </div>

        {/* Right Column: AI Extraction & Fusion Preview */}
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-teal-600" />
            AI Intake Analysis & Prediction Confidence
          </h3>

          {!classificationResult ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground p-6 border-2 border-dashed rounded-lg">
              <Languages className="h-8 w-8 mb-2 opacity-40 text-teal-600" />
              <p className="text-xs">Type or select a sample complaint to test the intelligence engine.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Classification Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border rounded-lg p-3 bg-muted/30">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Category</span>
                  <span className="font-bold text-foreground mt-0.5 block">{classificationResult.category}</span>
                  <span className="text-[11px] text-teal-600 font-medium">{classificationResult.subcategory}</span>
                </div>

                <div className="border rounded-lg p-3 bg-muted/30">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Prediction Confidence</span>
                  <span className="text-lg font-black text-teal-600 block">{classificationResult.confidence}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Language: {classificationResult.detectedLanguage}</span>
                </div>
              </div>

              {/* Duplicate / Fusion Match Result */}
              <div className="border rounded-lg p-3.5 bg-slate-50 dark:bg-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-purple-600" />
                    Urban Incident Fusion Evaluation:
                  </span>
                  {classificationResult.fusionMatch ? (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-[10px]">
                      {classificationResult.fusionMatch.relation} ({classificationResult.fusionMatch.confidenceScore}%)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-blue-600 border-blue-300 text-[10px]">
                      NEW ISOLATED INCIDENT
                    </Badge>
                  )}
                </div>

                {classificationResult.fusionMatch ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Matched existing incident <strong className="text-foreground">{classificationResult.fusionMatch.matchedIncidentId}</strong> located within <strong className="text-foreground">{classificationResult.fusionMatch.distanceMeters}m</strong> radius and <strong className="text-foreground">{classificationResult.fusionMatch.semanticSimilarity}%</strong> semantic text correlation.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No matching spatial or semantic incident found nearby. Will spawn a fresh ticket in the Ranked Queue.
                  </p>
                )}
              </div>

              {/* Missing Details & Adaptive Follow-up Questions */}
              {classificationResult.adaptiveFollowUps.length > 0 && (
                <div className="border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg p-3.5 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold">
                    <HelpCircle className="h-4 w-4 text-amber-600" />
                    Adaptive Follow-Up Questions (Chatbot Prompt):
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-amber-800 dark:text-amber-300 text-[11px]">
                    {classificationResult.adaptiveFollowUps.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
