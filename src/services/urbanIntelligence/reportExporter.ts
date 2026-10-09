import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle
} from 'docx';
import type { UnifiedIncident, Complaint } from '@/types/urbanIntelligence';
import { exportAllIncidentsToOpen311 } from './open311';

/**
 * Sanitizes a filename so that it is safe across Windows, macOS, and Linux
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

/**
 * Safely downloads a Blob in the browser with guaranteed filename preservation.
 * Prevents premature URL.revokeObjectURL which causes Edge/Chrome to download files as UUIDs without extensions.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const safeName = sanitizeFilename(filename);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.setAttribute('download', safeName);
  document.body.appendChild(a);
  a.click();

  // Keep the Object URL valid for 60 seconds so Windows / Chromium can stream and save the file properly
  setTimeout(() => {
    try {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, 60000);
}

/**
 * Opens a PDF Blob directly in a new browser tab for immediate viewing / printing
 */
export function openPDFInNewTab(doc: jsPDF): void {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, 120000);
}

/**
 * Builds and opens the Municipal Incidents PDF directly in a new browser tab
 */
export function openIncidentsPDF(incidents: UnifiedIncident[]): void {
  exportIncidentsToPDF(incidents, 'open');
}

/**
 * Builds and opens a Single Incident PDF directly in a new browser tab
 */
export function openSingleIncidentPDF(incident: UnifiedIncident, complaints?: Complaint[]): void {
  exportSingleIncidentToPDF(incident, complaints, 'open');
}

/**
 * Formats a Date into a clean YYYY-MM-DD string safe for filenames
 */
function getISODateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats date and time for document display (e.g. 09 Oct 2026, 08:45 AM)
 */
function getDisplayDateString(date = new Date()): { dateStr: string; timeStr: string } {
  const dateStr = date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return { dateStr, timeStr };
}

/**
 * Generates and downloads an official Municipal Intelligence PDF Docket
 */
export function exportIncidentsToPDF(
  incidents: UnifiedIncident[],
  mode: 'download' | 'open' = 'download'
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const now = new Date();
  const { dateStr, timeStr } = getDisplayDateString(now);

  const criticalCount = incidents.filter(i => i.urgency === 'critical').length;
  const avgScore = (
    incidents.reduce((sum, i) => sum + i.priorityScore.totalScore, 0) / (incidents.length || 1)
  ).toFixed(1);

  // --- Document Header ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 26, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('QUICKFIX URBAN INTELLIGENCE DOCKET', 14, 12);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    'Official Municipal Decision Docket & Open311 GeoReport v2 Compliance Registry',
    14,
    19
  );

  // Date & City Info on Top Right
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(45, 212, 191); // teal-400
  doc.text('INDORE MUNICIPAL CORPORATION', 283, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${dateStr} ${timeStr}`, 283, 19, { align: 'right' });

  // --- Executive KPI Summary Cards Bar ---
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, 30, 269, 14, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 30, 269, 14, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  doc.text(`Total Active Incidents: ${incidents.length}`, 20, 39);
  doc.setTextColor(185, 28, 28); // red-700
  doc.text(`Life-Safety Hazards: ${criticalCount}`, 90, 39);
  doc.setTextColor(13, 148, 136); // teal-600
  doc.text(`Avg City Priority Score: ${avgScore} / 100`, 165, 39);
  doc.setTextColor(71, 85, 105);
  doc.text(`Standard: Open311 GeoReport v2`, 235, 39);

  // --- Incidents Table ---
  const tableData = incidents.map(inc => [
    inc.incidentNumber,
    inc.category,
    `${inc.address}\n(${inc.wardName})`,
    `${inc.priorityScore.totalScore}/100`,
    inc.urgency.toUpperCase(),
    `${inc.complaintCount} citizens`,
    `${inc.title}\n${inc.description.slice(0, 95)}...`
  ]);

  autoTable(doc, {
    startY: 48,
    head: [
      [
        'Ticket ID',
        'Department / Category',
        'Location & Jurisdiction',
        'Priority',
        'Urgency',
        'Backing',
        'Problem Synopsis & Context'
      ]
    ],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
      valign: 'middle',
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [15, 118, 110], // teal-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 50 },
      3: { cellWidth: 22, fontStyle: 'bold', halign: 'center' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 'auto' }
    },
    didParseCell: data => {
      if (data.section === 'body' && data.column.index === 3) {
        const scoreVal = parseFloat(data.cell.raw as string);
        if (scoreVal >= 85) {
          data.cell.styles.textColor = [185, 28, 28]; // red
        } else if (scoreVal >= 70) {
          data.cell.styles.textColor = [194, 65, 12]; // orange
        }
      }
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'CRITICAL') {
          data.cell.styles.textColor = [185, 28, 28];
        }
      }
    }
  });

  // Footer note on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Quickfix Urban Intelligence Platform • Generated for Municipal Governance & Officer Portals • Page ${i} of ${pageCount}`,
      14,
      202
    );
  }

  const pdfBlob = doc.output('blob');
  if (mode === 'open') {
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }, 120000);
  } else {
    const filename = `quickfix_urban_incident_docket_${getISODateString(now)}.pdf`;
    downloadBlob(pdfBlob, filename);
  }
}

/**
 * Generates and downloads a genuine Microsoft Word (.docx) Document
 */
export async function exportIncidentsToWord(incidents: UnifiedIncident[]): Promise<void> {
  const now = new Date();
  const { dateStr, timeStr } = getDisplayDateString(now);

  const criticalCount = incidents.filter(i => i.urgency === 'critical').length;
  const avgScore = (
    incidents.reduce((sum, i) => sum + i.priorityScore.totalScore, 0) / (incidents.length || 1)
  ).toFixed(1);

  // Build Table Rows
  const tableHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 1400, type: WidthType.DXA },
        shading: { fill: '0F766E' },
        children: [new Paragraph({ children: [new TextRun({ text: 'Ticket ID', bold: true, color: 'FFFFFF' })] })]
      }),
      new TableCell({
        width: { size: 2800, type: WidthType.DXA },
        shading: { fill: '0F766E' },
        children: [new Paragraph({ children: [new TextRun({ text: 'Incident Synopsis', bold: true, color: 'FFFFFF' })] })]
      }),
      new TableCell({
        width: { size: 1600, type: WidthType.DXA },
        shading: { fill: '0F766E' },
        children: [new Paragraph({ children: [new TextRun({ text: 'Department', bold: true, color: 'FFFFFF' })] })]
      }),
      new TableCell({
        width: { size: 2200, type: WidthType.DXA },
        shading: { fill: '0F766E' },
        children: [new Paragraph({ children: [new TextRun({ text: 'Location & Ward', bold: true, color: 'FFFFFF' })] })]
      }),
      new TableCell({
        width: { size: 1000, type: WidthType.DXA },
        shading: { fill: '0F766E' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Priority', bold: true, color: 'FFFFFF' })] })]
      }),
      new TableCell({
        width: { size: 1000, type: WidthType.DXA },
        shading: { fill: '0F766E' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Urgency', bold: true, color: 'FFFFFF' })] })]
      }),
      new TableCell({
        width: { size: 1000, type: WidthType.DXA },
        shading: { fill: '0F766E' },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Backing', bold: true, color: 'FFFFFF' })] })]
      })
    ]
  });

  const incidentRows = incidents.map(
    (inc, index) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 1400, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: inc.incidentNumber,
                    bold: true,
                    color: '0F766E'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 2800, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: inc.title, bold: true }),
                  new TextRun({ text: `\n${inc.description.slice(0, 160)}...`, size: 18, color: '475569' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 1600, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: inc.category, bold: true }),
                  new TextRun({ text: `\nDept: ${inc.department}`, size: 18, color: '64748b' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: inc.address }),
                  new TextRun({ text: `\n${inc.wardName}`, bold: true, color: '0284C7', size: 18 })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 1000, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${inc.priorityScore.totalScore}/100`,
                    bold: true,
                    color: inc.priorityScore.totalScore >= 85 ? 'B91C1C' : '0F766E'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 1000, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: inc.urgency.toUpperCase(),
                    bold: true,
                    color: inc.urgency === 'critical' ? 'B91C1C' : '334155'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 1000, type: WidthType.DXA },
            shading: { fill: index % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${inc.complaintCount} citizens`,
                    size: 18,
                    color: '475569'
                  })
                ]
              })
            ]
          })
        ]
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000
            }
          }
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [
              new TextRun({
                text: 'QUICKFIX URBAN INTELLIGENCE PLATFORM',
                bold: true,
                size: 32,
                color: '0F172A'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Official Municipal Incident Docket & Open311 GeoReport Registry',
                bold: true,
                color: '0F766E',
                size: 22
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Jurisdiction: Indore Municipal Corporation • Generated on: ${dateStr} at ${timeStr}`,
                color: '64748B',
                size: 18
              })
            ]
          }),
          new Paragraph({ text: '' }), // spacing

          // KPI Overview
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: 'F1F5F9' },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Active Incidents: ', bold: true }),
                          new TextRun({ text: `${incidents.length}`, bold: true, color: '0F766E' }),
                          new TextRun({ text: '   |   Critical Life-Safety: ', bold: true }),
                          new TextRun({ text: `${criticalCount}`, bold: true, color: 'B91C1C' }),
                          new TextRun({ text: '   |   City Avg Priority: ', bold: true }),
                          new TextRun({ text: `${avgScore} / 100`, bold: true, color: '0F766E' })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: '' }), // spacing
          new Paragraph({
            children: [
              new TextRun({
                text: 'Prioritized Incident Docket (Ordered by AI Dynamic Urgency & Population Impact)',
                bold: true,
                size: 22,
                color: '0F172A'
              })
            ]
          }),
          new Paragraph({ text: '' }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [tableHeaderRow, ...incidentRows]
          }),

          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Generated by Quickfix Urban Incident Intelligence Engine • Open311 GeoReport v2 Compliant • Confidential for Municipal Dispatch Personnel',
                size: 16,
                color: '94A3B8'
              })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const filename = `quickfix_incident_docket_${getISODateString(now)}.docx`;
  downloadBlob(blob, filename);
}

/**
 * Downloads Open311 JSON format file
 */
export function exportIncidentsToJSON(incidents: UnifiedIncident[]): void {
  const jsonContent = exportAllIncidentsToOpen311(incidents);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const filename = `quickfix_open311_export_${getISODateString(new Date())}.json`;
  downloadBlob(blob, filename);
}

/**
 * Generates and downloads a single incident PDF Case File
 */
export function exportSingleIncidentToPDF(
  incident: UnifiedIncident,
  complaints?: Complaint[],
  mode: 'download' | 'open' = 'download'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const now = new Date();
  const { dateStr, timeStr } = getDisplayDateString(now);
  const p = incident.priorityScore;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('QUICKFIX URBAN INTELLIGENCE CASE FILE', 14, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Incident Ref: ${incident.incidentNumber} • Indore Municipal Corporation • ${dateStr} ${timeStr}`,
    14,
    18
  );

  // Score Badge
  doc.setFillColor(15, 118, 110);
  doc.roundedRect(156, 6, 40, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`PRIORITY: ${p.totalScore}`, 160, 14);

  // Metadata Table
  autoTable(doc, {
    startY: 30,
    head: [['Field', 'Incident Specification Details']],
    body: [
      ['Ticket Number', incident.incidentNumber],
      ['Incident Title', incident.title],
      ['Department', incident.department],
      ['Category', incident.category],
      ['Location & Ward', `${incident.address} (${incident.wardName})`],
      ['Coordinates', `${incident.latitude.toFixed(5)}, ${incident.longitude.toFixed(5)}`],
      ['Status', incident.status.toUpperCase()],
      ['Urgency Rating', incident.urgency.toUpperCase()],
      ['Constituent Reports', `${incident.complaintCount} verified citizen reports fused`],
      ['Assigned Field Crew', incident.assignedTeamName || 'Unassigned (In Dispatch Queue)'],
      ['Critical Assets Nearby', incident.nearbyCriticalInfrastructure.join(', ') || 'None within 200m radius']
    ],
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [15, 118, 110] },
    columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } }
  });

  // Priority Factor Table
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(
    'Dynamic Priority Formula Breakdown (P = 0.25U + 0.25I + 0.20S + 0.10W + 0.10C + 0.10E)',
    14,
    finalY
  );

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Factor Component', 'Score (0 - 100)', 'Weight', 'Weighted Contribution']],
    body: [
      ['Urgency (U)', `${p.urgency}`, '25%', `${(p.urgency * 0.25).toFixed(1)}`],
      ['Population Impact (I)', `${p.impact}`, '25%', `${(p.impact * 0.25).toFixed(1)}`],
      ['Infrastructure Safety (S)', `${p.safety}`, '20%', `${(p.safety * 0.20).toFixed(1)}`],
      ['Waiting Duration (W)', `${p.waitingTime}`, '10%', `${(p.waitingTime * 0.10).toFixed(1)}`],
      ['Confidence & Validation (C)', `${p.confidence}`, '10%', `${(p.confidence * 0.10).toFixed(1)}`],
      ['Environmental Risk (E)', `${p.environmental}`, '10%', `${(p.environmental * 0.10).toFixed(1)}`],
      ['TOTAL PRIORITY SCORE', `${p.totalScore}`, '100%', `${p.totalScore} / 100`]
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [30, 41, 59] },
    columnStyles: { 3: { fontStyle: 'bold' } }
  });

  // Citizen Complaint Quotes
  if (complaints && complaints.length > 0) {
    const quotesY = (doc as any).lastAutoTable.finalY + 8;
    if (quotesY < 250) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('Constituent Citizen Voices Fused into this Incident:', 14, quotesY);

      const complaintRows = complaints.slice(0, 4).map(c => [
        c.id.slice(0, 8),
        c.citizenName || 'Verified Citizen',
        (c.translatedText || c.rawText).slice(0, 100)
      ]);

      autoTable(doc, {
        startY: quotesY + 3,
        head: [['Report ID', 'Citizen', 'Report Summary']],
        body: complaintRows,
        theme: 'striped',
        styles: { fontSize: 7.5, cellPadding: 2.5 },
        headStyles: { fillColor: [71, 85, 105] },
        columnStyles: { 0: { cellWidth: 30, fontStyle: 'bold' }, 1: { cellWidth: 35 } }
      });
    }
  }

  const pdfBlob = doc.output('blob');
  if (mode === 'open') {
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }, 120000);
  } else {
    const safeId = incident.incidentNumber.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const filename = `quickfix_case_file_${safeId}_${getISODateString(now)}.pdf`;
    downloadBlob(pdfBlob, filename);
  }
}

/**
 * Generates and downloads a single incident genuine Word (.docx) Case File
 */
export async function exportSingleIncidentToWord(incident: UnifiedIncident): Promise<void> {
  const p = incident.priorityScore;
  const now = new Date();
  const { dateStr, timeStr } = getDisplayDateString(now);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000
            }
          }
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [
              new TextRun({
                text: `INCIDENT CASE FILE: ${incident.incidentNumber}`,
                bold: true,
                size: 28,
                color: '0F172A'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${incident.title}`,
                bold: true,
                size: 22,
                color: '0F766E'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated on ${dateStr} at ${timeStr} • Priority Score: ${p.totalScore}/100 • Urgency: ${incident.urgency.toUpperCase()}`,
                color: '64748B',
                size: 18
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // Details Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 3000, type: WidthType.DXA },
                    shading: { fill: '0F766E' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Parameter', bold: true, color: 'FFFFFF' })] })]
                  }),
                  new TableCell({
                    width: { size: 7000, type: WidthType.DXA },
                    shading: { fill: '0F766E' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Municipal Specification', bold: true, color: 'FFFFFF' })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Department & Category', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${incident.department} (${incident.category})` })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Location', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${incident.address} - ${incident.wardName}` })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status & Urgency', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Status: ${incident.status.toUpperCase()} | Urgency: ${incident.urgency.toUpperCase()}` })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Citizen Backing', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${incident.complaintCount} fused citizen reports` })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Field Response Crew', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: incident.assignedTeamName || 'Unassigned (Dispatch Pending)' })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Problem Synopsis', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: incident.description })] })] })
                ]
              })
            ]
          }),

          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Priority Formula Breakdown: P = 0.25U + 0.25I + 0.20S + 0.10W + 0.10C + 0.10E',
                bold: true,
                size: 20,
                color: '0F172A'
              })
            ]
          }),
          new Paragraph({ text: '' }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: '1E293B' }, children: [new Paragraph({ children: [new TextRun({ text: 'Factor', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ shading: { fill: '1E293B' }, children: [new Paragraph({ children: [new TextRun({ text: 'Raw Score (0-100)', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ shading: { fill: '1E293B' }, children: [new Paragraph({ children: [new TextRun({ text: 'Weight', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ shading: { fill: '1E293B' }, children: [new Paragraph({ children: [new TextRun({ text: 'Contribution', bold: true, color: 'FFFFFF' })] })] })
                ]
              }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Urgency (U)' })] }), new TableCell({ children: [new Paragraph({ text: `${p.urgency}` })] }), new TableCell({ children: [new Paragraph({ text: '25%' })] }), new TableCell({ children: [new Paragraph({ text: `${(p.urgency * 0.25).toFixed(1)}` })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Population Impact (I)' })] }), new TableCell({ children: [new Paragraph({ text: `${p.impact}` })] }), new TableCell({ children: [new Paragraph({ text: '25%' })] }), new TableCell({ children: [new Paragraph({ text: `${(p.impact * 0.25).toFixed(1)}` })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Infrastructure Safety (S)' })] }), new TableCell({ children: [new Paragraph({ text: `${p.safety}` })] }), new TableCell({ children: [new Paragraph({ text: '20%' })] }), new TableCell({ children: [new Paragraph({ text: `${(p.safety * 0.20).toFixed(1)}` })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Waiting Duration (W)' })] }), new TableCell({ children: [new Paragraph({ text: `${p.waitingTime}` })] }), new TableCell({ children: [new Paragraph({ text: '10%' })] }), new TableCell({ children: [new Paragraph({ text: `${(p.waitingTime * 0.10).toFixed(1)}` })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Confidence & Validation (C)' })] }), new TableCell({ children: [new Paragraph({ text: `${p.confidence}` })] }), new TableCell({ children: [new Paragraph({ text: '10%' })] }), new TableCell({ children: [new Paragraph({ text: `${(p.confidence * 0.10).toFixed(1)}` })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Environmental Risk (E)' })] }), new TableCell({ children: [new Paragraph({ text: `${p.environmental}` })] }), new TableCell({ children: [new Paragraph({ text: '10%' })] }), new TableCell({ children: [new Paragraph({ text: `${(p.environmental * 0.10).toFixed(1)}` })] })] }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: 'F1F5F9' }, children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL PRIORITY SCORE', bold: true })] })] }),
                  new TableCell({ shading: { fill: 'F1F5F9' }, children: [new Paragraph({ children: [new TextRun({ text: `${p.totalScore}`, bold: true })] })] }),
                  new TableCell({ shading: { fill: 'F1F5F9' }, children: [new Paragraph({ children: [new TextRun({ text: '100%', bold: true })] })] }),
                  new TableCell({ shading: { fill: 'F1F5F9' }, children: [new Paragraph({ children: [new TextRun({ text: `${p.totalScore} / 100`, bold: true, color: '0F766E' })] })] })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const safeId = incident.incidentNumber.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = `quickfix_case_file_${safeId}_${getISODateString(now)}.docx`;
  downloadBlob(blob, filename);
}
