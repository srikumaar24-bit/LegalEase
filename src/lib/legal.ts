import type { LegalDocumentInput } from '@/hooks/useLegalDocuments';

export const DOCUMENT_TYPES = [
  { value: 'Freelance agreement', label: 'Freelance agreement', icon: 'BriefcaseBusiness', description: 'Protect project scope, payment, and ownership.' },
  { value: 'Non-disclosure agreement', label: 'Non-disclosure agreement', icon: 'ShieldCheck', description: 'Keep shared business information confidential.' },
  { value: 'Residential lease', label: 'Residential lease', icon: 'House', description: 'Set clear expectations for a rental arrangement.' },
  { value: 'Employment offer', label: 'Employment offer', icon: 'UserRoundCheck', description: 'Present role, compensation, and conditions.' },
  { value: 'Client services agreement', label: 'Client services agreement', icon: 'Handshake', description: 'Define an ongoing professional engagement.' },
  { value: 'Custom document', label: 'Custom document', icon: 'FilePenLine', description: 'Start from your own legal workflow.' },
] as const;

function clean(value: string): string {
  return value.trim() || 'Not specified';
}

function clauses(terms: string): string[] {
  return terms
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function generateDraft(input: LegalDocumentInput): string {
  const name = clean(input.title);
  const parties = clean(input.parties);
  const date = clean(input.effectiveDate);
  const requestedClauses = clauses(input.terms);
  const clauseText = requestedClauses.length > 0
    ? requestedClauses.map((item, index) => `${index + 1}. ${item}`).join('\n')
    : '1. The parties will act in good faith and comply with all applicable laws.';

  return `${name.toUpperCase()}

${input.documentType.toUpperCase()}

Effective date: ${date}

PARTIES
${parties}

PURPOSE
This ${input.documentType.toLowerCase()} records the understanding between the parties identified above. It is intended to make the practical expectations, responsibilities, and protections of the arrangement easier to review.

AGREED TERMS
${clauseText}

RESPONSIBILITIES
Each party will provide the information, access, approvals, and cooperation reasonably required to carry out this arrangement. Any material change should be documented in writing and accepted by the relevant parties.

CONFIDENTIALITY
Information exchanged for this arrangement should be treated as confidential when it is marked confidential or would reasonably be understood to be confidential. A party should not disclose such information except where disclosure is required by law or approved in writing.

TERM AND TERMINATION
This document begins on the effective date above and continues until the arrangement is completed or ended in writing. Either party may request a review if the underlying circumstances materially change.

GOVERNING LAW
The parties should complete this document with the governing jurisdiction, notice details, and any required local terms before signing.

SIGNATURES

Party 1: ________________________________    Date: ______________

Party 2: ________________________________    Date: ______________


Prepared with LegalEase. Review this draft with a qualified legal professional before relying on it.`;
}

export function formatRelativeDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function documentSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'legalease-document';
}
