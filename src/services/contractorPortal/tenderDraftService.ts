import { GoogleGenerativeAI } from '@google/generative-ai';
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
  HeadingLevel
} from 'docx';
import type { GovernmentTender, ContractorProfile, TenderApplicationDraft } from '@/types/contractorPortal';
import { downloadBlob } from '@/services/urbanIntelligence/reportExporter';

// Initialize Gemini if key exists
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * AI Assistant: Explains complicated tender clauses, eligibility criteria, or penalty terms in simple language.
 */
export async function explainTenderClauseWithAI(tender: GovernmentTender, query: string): Promise<string> {
  if (!genAI) {
    return generateLocalTenderExplanation(tender, query);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are a senior municipal procurement advisor for Indian government tenders (CPPP, GeM, PWD).
Explain the following question or tender clause in simple, practical language for a civil contractor:

TENDER TITLE: ${tender.title}
DEPARTMENT: ${tender.department} (${tender.issuingAuthority})
ESTIMATED VALUE: INR ${(tender.estimatedValueINR / 100000).toFixed(2)} Lakhs
EARNEST MONEY DEPOSIT (EMD): INR ${tender.earnestMoneyDepositINR}
WORK SCOPE: ${tender.workDescription}
ELIGIBILITY: ${tender.eligibilityCriteria.join('; ')}
MANDATORY DOCUMENTS: ${tender.requiredDocuments.join('; ')}

CONTRACTOR QUESTION:
"${query}"

Provide a concise, direct, and actionable answer highlighting:
1. What the rule actually means in practice.
2. What specific document or certificate the contractor must show.
3. Common pitfall to avoid.
Keep tone professional, encouraging, and clear.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text || generateLocalTenderExplanation(tender, query);
  } catch (error) {
    console.warn('Gemini tender explainer fallback:', error);
    return generateLocalTenderExplanation(tender, query);
  }
}

/**
 * AI Narrative Generator: Generates a customized Technical Methodology & Work Plan
 */
export async function generateTechnicalMethodologyWithAI(
  tender: GovernmentTender,
  contractor: ContractorProfile,
  timelineWeeks: number
): Promise<string> {
  if (!genAI) {
    return generateDefaultMethodology(tender, contractor, timelineWeeks);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
Generate a formal technical methodology and execution strategy for this government tender bid:
TENDER: ${tender.title}
ISSUING AUTHORITY: ${tender.issuingAuthority}
CATEGORY: ${tender.workCategory}
DURATION: ${timelineWeeks} weeks (${tender.contractDurationDays} contractual days)
SCOPE: ${tender.workDescription}

BIDDER PROFILE:
Company: ${contractor.companyName}
Registration: ${contractor.registrationNumber} (${contractor.issuingAuthority})
Experience: ${contractor.experienceYears} years in ${contractor.category}
Specializations: ${contractor.specializations.join(', ')}

Please draft 4 professional paragraphs:
1. Mobilization & Site Setup (Traffic management, utility surveys, safety barricading).
2. Materials & Equipment Allocation (Graded aggregates, testing, mechanical compaction).
3. Quality Assurance & Phase-wise Milestone Control.
4. Health, Environmental & Municipal Safety Compliance.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text || generateDefaultMethodology(tender, contractor, timelineWeeks);
  } catch (error) {
    console.warn('Gemini methodology generator fallback:', error);
    return generateDefaultMethodology(tender, contractor, timelineWeeks);
  }
}

function generateLocalTenderExplanation(tender: GovernmentTender, query: string): string {
  const q = query.toLowerCase();
  if (q.includes('emd') || q.includes('earnest')) {
    return `EMD Requirement: INR ${tender.earnestMoneyDepositINR.toLocaleString('en-IN')} (2% of tender value). Must be submitted via RTGS/NEFT or approved Bank Guarantee on GeM/e-Procurement before ${new Date(tender.submissionDeadline).toLocaleDateString()}. MSME / Startup exemptions apply only if registered for the exact work category code.`;
  }
  if (q.includes('eligib') || q.includes('experience')) {
    return `Eligibility Criteria: Contractor must hold valid ${tender.workCategory} registration and demonstrate completion of similar municipal works valued at >= 50% of INR ${(tender.estimatedValueINR / 100000).toFixed(1)} Lakhs in the past 3 financial years.`;
  }
  if (q.includes('document') || q.includes('attach')) {
    return `Mandatory Documents required for this tender: ${tender.requiredDocuments.join(', ')}. Ensure all GST certificates are updated and balance sheets are verified with valid UDIN.`;
  }
  return `Tender Analysis for "${tender.title}": Ensure your technical bid clearly specifies your equipment availability, experienced site supervisor, and adherence to ${tender.issuingAuthority} specifications. Submission closes on ${new Date(tender.submissionDeadline).toLocaleString('en-IN')}.`;
}

function generateDefaultMethodology(tender: GovernmentTender, contractor: ContractorProfile, timelineWeeks: number): string {
  return `1. Mobilization & Site Reconnaissance:
${contractor.companyName} will establish a dedicated field mobilization camp within 72 hours of work order issuance. Detailed joint geometric survey and underground utility mapping will be conducted with ${tender.issuingAuthority} engineers.

2. Plant & Machinery Deployment:
All primary plant including sensor pavers, tandem rollers, excavation jetters, and batching transports will be deployed as per prescribed technical schedules. Calibrated testing instruments will be maintained on-site.

3. Execution Methodology & Milestone Scheduling:
Works will be phased systematically across a ${timelineWeeks}-week timeline with zero disruption to urban pedestrian flow. Heavy operations will be prioritized during designated municipal low-traffic windows.

4. Quality Control & Safety Assurance:
Standard IRC/CPWD specifications will be rigorously followed. Material test reports (MTR) will be logged daily. Mandatory personal protective equipment (PPE) and retro-reflective night signage will be maintained throughout.`;
}

/**
 * Validates pre-submission checklist
 */
export function validateTenderDraft(draft: TenderApplicationDraft, tender: GovernmentTender): {
  isReady: boolean;
  missingItems: string[];
} {
  const missingItems: string[] = [];

  if (!draft.financialBidINR || draft.financialBidINR <= 0) {
    missingItems.push('Financial Bid Amount (INR) is required');
  }
  if (!draft.technicalMethodology || draft.technicalMethodology.length < 50) {
    missingItems.push('Technical Execution Methodology is incomplete (minimum 50 characters)');
  }
  if (!draft.complianceDeclarations.nonBlacklisted) {
    missingItems.push('Declaration of Non-Blacklisting must be certified');
  }
  if (!draft.complianceDeclarations.validGstAndTax) {
    missingItems.push('Declaration of Valid Tax & GST compliance must be certified');
  }
  if (!draft.complianceDeclarations.acceptedTerms) {
    missingItems.push('Acceptance of General Conditions of Contract (GCC) is mandatory');
  }

  return {
    isReady: missingItems.length === 0,
    missingItems
  };
}

/**
 * Exports Tender Application Docket to official PDF
 */
export function exportTenderApplicationPDF(draft: TenderApplicationDraft, tender: GovernmentTender): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Top Municipal Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('GOVERNMENT E-PROCUREMENT TENDER BID DOCKET', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Ref: ${tender.tenderId} • Portal: ${tender.officialSource}`, 14, 19);

  // Status Badge
  doc.setFillColor(15, 118, 110);
  doc.roundedRect(150, 7, 46, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('BID PROPOSAL DRAFT', 154, 14.5);

  // 1. Tender Reference Table
  autoTable(doc, {
    startY: 32,
    head: [['Tender Parameter', 'Official Government Tender Specification']],
    body: [
      ['Tender Title', tender.title],
      ['Issuing Authority', `${tender.issuingAuthority} (${tender.department})`],
      ['Tender Reference ID', tender.tenderId],
      ['Work Category & Location', `${tender.workCategory} • ${tender.location}`],
      ['Estimated Value (INR)', `Rs. ${tender.estimatedValueINR.toLocaleString('en-IN')} (Rs. ${(tender.estimatedValueINR / 100000).toFixed(2)} Lakhs)`],
      ['Earnest Money Deposit (EMD)', `Rs. ${tender.earnestMoneyDepositINR.toLocaleString('en-IN')}`],
      ['Official Source Portal', `${tender.officialSource} (${tender.officialSourceUrl})`],
      ['Submission Deadline', new Date(tender.submissionDeadline).toLocaleString('en-IN')]
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [15, 118, 110] },
    columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } }
  });

  // 2. Bidder Details Table
  const snap = draft.companyDetailsSnapshot;
  const bidderY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Bidder Organization & Registration Credentials', 14, bidderY);

  autoTable(doc, {
    startY: bidderY + 3,
    head: [['Bidder Information Field', 'Verified Registration Data']],
    body: [
      ['Company / Firm Name', snap.companyName],
      ['Government Contractor Reg No', snap.registrationNumber],
      ['GSTIN Identification', snap.gstNumber],
      ['PAN Number', snap.panNumber],
      ['Authorized Signatory', snap.authorizedSignatory],
      ['Financial Bid Offer (INR)', `Rs. ${draft.financialBidINR.toLocaleString('en-IN')} (Excluding applicable GST)`],
      ['Proposed Completion Timeline', `${draft.proposedTimelineWeeks} Weeks`]
    ],
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [30, 41, 59] },
    columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } }
  });

  // 3. Technical Methodology
  const techY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Technical Execution Methodology & Quality Plan', 14, techY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitMethodology = doc.splitTextToSize(draft.technicalMethodology || 'Standard PWD execution plan.', 182);
  doc.text(splitMethodology, 14, techY + 5);

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Quickfix Contractor Portal • Tender Docket Ref ${tender.tenderId} • Generated on ${dateStr} • Page ${i} of ${pageCount}`,
      14,
      288
    );
  }

  const blob = doc.output('blob');
  const safeRef = tender.tenderId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  downloadBlob(blob, `tender_bid_docket_${safeRef}_${now.toISOString().slice(0, 10)}.pdf`);
}

/**
 * Exports Tender Application Docket to Microsoft Word (.docx)
 */
export async function exportTenderApplicationDOCX(draft: TenderApplicationDraft, tender: GovernmentTender): Promise<void> {
  const snap = draft.companyDetailsSnapshot;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 }
          }
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [
              new TextRun({
                text: 'GOVERNMENT E-PROCUREMENT TENDER BID PROPOSAL',
                bold: true,
                size: 26,
                color: '0F172A'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Tender Ref: ${tender.tenderId} • Issuing Authority: ${tender.issuingAuthority}`,
                bold: true,
                color: '0F766E',
                size: 20
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Submitted by: ${snap.companyName} (Reg: ${snap.registrationNumber}) • Generated: ${dateStr}`,
                color: '64748B',
                size: 18
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // Table 1: Tender Details
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 3000, type: WidthType.DXA }, shading: { fill: '0F766E' }, children: [new Paragraph({ children: [new TextRun({ text: 'Tender Specification', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ width: { size: 7000, type: WidthType.DXA }, shading: { fill: '0F766E' }, children: [new Paragraph({ children: [new TextRun({ text: 'Details', bold: true, color: 'FFFFFF' })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Title', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: tender.title })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Department & Authority', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${tender.department} - ${tender.issuingAuthority}` })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Estimated Value & EMD', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `INR ${tender.estimatedValueINR.toLocaleString('en-IN')} (EMD: INR ${tender.earnestMoneyDepositINR.toLocaleString('en-IN')})` })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Official Source Portal', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${tender.officialSource} (${tender.officialSourceUrl})` })] })
                ]
              })
            ]
          }),

          new Paragraph({ text: '' }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({ text: 'Bidder Information & Financial Offer', bold: true, color: '0F172A', size: 22 })
            ]
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 3000, type: WidthType.DXA }, shading: { fill: '1E293B' }, children: [new Paragraph({ children: [new TextRun({ text: 'Bidder Parameter', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ width: { size: 7000, type: WidthType.DXA }, shading: { fill: '1E293B' }, children: [new Paragraph({ children: [new TextRun({ text: 'Submitted Value', bold: true, color: 'FFFFFF' })] })] })
                ]
              }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Company Name', bold: true })] })] }), new TableCell({ children: [new Paragraph({ text: snap.companyName })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Govt Registration No', bold: true })] })] }), new TableCell({ children: [new Paragraph({ text: snap.registrationNumber })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'GSTIN / PAN', bold: true })] })] }), new TableCell({ children: [new Paragraph({ text: `${snap.gstNumber} / ${snap.panNumber}` })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Financial Bid Quote', bold: true })] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `INR ${draft.financialBidINR.toLocaleString('en-IN')}`, bold: true, color: '0F766E' })] })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Proposed Execution Time', bold: true })] })] }), new TableCell({ children: [new Paragraph({ text: `${draft.proposedTimelineWeeks} Weeks` })] })] })
            ]
          }),

          new Paragraph({ text: '' }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({ text: 'Technical Execution Methodology', bold: true, color: '0F172A', size: 22 })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: draft.technicalMethodology || 'Standard municipal execution plan.', size: 20 })
            ]
          }),

          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Declaration: The undersigned bidder certifies that all facts, credentials, and attachments provided herein are accurate and comply with government procurement guidelines.',
                italics: true,
                size: 18,
                color: '64748B'
              })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const safeRef = tender.tenderId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  downloadBlob(blob, `tender_bid_docket_${safeRef}_${now.toISOString().slice(0, 10)}.docx`);
}
