import React, { useState } from 'react';
import { Download, Copy, Check, FileJson, FileText, FileDown, Eye, Code } from 'lucide-react';
import type { UnifiedIncident } from '@/types/urbanIntelligence';
import { exportAllIncidentsToOpen311 } from '@/services/urbanIntelligence/open311';
import {
  exportIncidentsToPDF,
  exportIncidentsToWord,
  exportIncidentsToJSON,
  openIncidentsPDF
} from '@/services/urbanIntelligence/reportExporter';
import { ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Open311ModalProps {
  incidents: UnifiedIncident[];
  isOpen: boolean;
  onClose: () => void;
}

export const Open311Modal: React.FC<Open311ModalProps> = ({
  incidents,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [previewMode, setPreviewMode] = useState<'json' | 'preview'>('json');
  const jsonContent = exportAllIncidentsToOpen311(incidents);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    toast.success('Open311 JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    try {
      exportIncidentsToPDF(incidents, 'download');
      toast.success('Official Municipal Incident PDF docket generated and downloaded');
    } catch (err: any) {
      toast.error(`PDF export failed: ${err.message}`);
    }
  };

  const handleOpenPDF = () => {
    try {
      openIncidentsPDF(incidents);
      toast.success('Opening official PDF preview in new tab...');
    } catch (err: any) {
      toast.error(`PDF preview failed: ${err.message}`);
    }
  };

  const handleDownloadWord = async () => {
    try {
      setIsExportingWord(true);
      await exportIncidentsToWord(incidents);
      toast.success('Incident Docket exported to Microsoft Word document (.docx)');
    } catch (err: any) {
      toast.error(`Word export failed: ${err.message}`);
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleDownloadJSON = () => {
    try {
      exportIncidentsToJSON(incidents);
      toast.success('Open311 GeoReport v2 JSON file downloaded');
    } catch (err: any) {
      toast.error(`JSON export failed: ${err.message}`);
    }
  };

  const criticalCount = incidents.filter(i => i.urgency === 'critical').length;
  const avgScore = (
    incidents.reduce((sum, i) => sum + i.priorityScore.totalScore, 0) / (incidents.length || 1)
  ).toFixed(1);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-5 border-b bg-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-teal-400" />
              <DialogTitle className="text-base font-bold text-white">
                Municipal Intelligence & Open311 GeoReport v2 Export
              </DialogTitle>
              <Badge variant="outline" className="text-teal-300 border-teal-500/50 text-[10px]">
                PDF • Word (.docx) • JSON
              </Badge>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Export unified municipal incident data to official PDF briefings, Microsoft Word (.docx) dockets, or Open311 GeoReport endpoint JSON.
          </p>
        </DialogHeader>

        {/* Action Controls & Format Selector */}
        <div className="p-4 border-b bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              Total Incidents: <strong className="font-mono text-teal-600">{incidents.length}</strong>
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              Life-Safety: <strong className="text-red-600">{criticalCount}</strong>
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              Avg Priority: <strong className="text-amber-600">{avgScore}/100</strong>
            </span>
          </div>

          {/* Download Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-semibold"
              title="Download official PDF report file"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Download PDF
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenPDF}
              className="h-8 text-xs border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              title="View and print PDF directly in browser"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              View PDF
            </Button>

            <Button
              size="sm"
              onClick={handleDownloadWord}
              disabled={isExportingWord}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold"
              title="Download official Microsoft Word document"
            >
              <FileDown className="h-3.5 w-3.5 mr-1.5" />
              {isExportingWord ? 'Generating Word...' : 'Download Word (.docx)'}
            </Button>

            <Button
              size="sm"
              onClick={handleDownloadJSON}
              className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-sm font-semibold"
              title="Download Open311 format JSON"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download JSON
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 mr-1 text-green-600" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </Button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-4 pt-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setPreviewMode('json')}
              className={`pb-2.5 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                previewMode === 'json'
                  ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              Open311 JSON Schema
            </button>
            <button
              onClick={() => setPreviewMode('preview')}
              className={`pb-2.5 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                previewMode === 'preview'
                  ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Document Roster Preview
            </button>
          </div>
          <span className="text-[11px] text-muted-foreground pb-2">
            Standard: Open311 GeoReport v2
          </span>
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col min-h-0 bg-slate-900/5 dark:bg-slate-950">
          {previewMode === 'json' ? (
            <div className="bg-slate-950 text-slate-200 rounded-lg p-3 font-mono text-[11px] overflow-y-auto flex-1 max-h-[380px] border border-slate-800">
              <pre>{jsonContent}</pre>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 max-h-[380px] border rounded-lg bg-card">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0 border-b">
                  <tr>
                    <th className="p-2.5 text-left font-bold text-slate-700 dark:text-slate-300">Ticket ID</th>
                    <th className="p-2.5 text-left font-bold text-slate-700 dark:text-slate-300">Incident Synopsis</th>
                    <th className="p-2.5 text-left font-bold text-slate-700 dark:text-slate-300">Category</th>
                    <th className="p-2.5 text-left font-bold text-slate-700 dark:text-slate-300">Location</th>
                    <th className="p-2.5 text-center font-bold text-slate-700 dark:text-slate-300">Score</th>
                    <th className="p-2.5 text-center font-bold text-slate-700 dark:text-slate-300">Urgency</th>
                    <th className="p-2.5 text-center font-bold text-slate-700 dark:text-slate-300">Backing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                      <td className="p-2.5 font-mono font-bold text-teal-600 dark:text-teal-400">{inc.incidentNumber}</td>
                      <td className="p-2.5 font-medium max-w-[200px] truncate">{inc.title}</td>
                      <td className="p-2.5 text-muted-foreground">{inc.category}</td>
                      <td className="p-2.5 text-muted-foreground">{inc.wardName}</td>
                      <td className="p-2.5 text-center font-bold font-mono text-amber-600">{inc.priorityScore.totalScore}</td>
                      <td className="p-2.5 text-center uppercase font-semibold text-[10px] text-red-600">{inc.urgency}</td>
                      <td className="p-2.5 text-center text-muted-foreground">{inc.complaintCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
