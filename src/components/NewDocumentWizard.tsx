import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Loader2, Sparkles, Calendar, Users, FileText, ListTree } from 'lucide-react';
import { DOCUMENT_TYPES, generateDraft } from '@/lib/legal';
import type { LegalDocumentInput } from '@/hooks/useLegalDocuments';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerate: (input: LegalDocumentInput, content: string) => void;
};

export function NewDocumentWizard({ open, onClose, onGenerate }: Props) {
  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [parties, setParties] = useState('');
  const [terms, setTerms] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [generating, setGenerating] = useState(false);

  if (!open) return null;

  const reset = () => {
    setStep(0);
    setDocType('');
    setTitle('');
    setParties('');
    setTerms('');
    setEffectiveDate('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const input: LegalDocumentInput = {
      title: title.trim() || docType || 'Untitled document',
      documentType: docType,
      parties: parties.trim(),
      terms: terms.trim(),
      effectiveDate: effectiveDate.trim(),
    };
    const content = generateDraft(input);
    await new Promise((r) => setTimeout(r, 700));
    setGenerating(false);
    reset();
    onGenerate(input, content);
  };

  const canProceed = step === 0 ? !!docType : step === 1 ? !!title.trim() : true;
  const selectedType = DOCUMENT_TYPES.find((t) => t.value === docType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">New document</h2>
          </div>
          <button onClick={handleClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-5 flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>

          {step === 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-700">What type of document do you need?</p>
              <div className="grid gap-2">
                {DOCUMENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setDocType(type.value)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                      docType === type.value
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`mt-0.5 rounded-lg p-2 ${docType === type.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{type.label}</p>
                      <p className="text-xs text-gray-400">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700">Document details</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Document title</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={selectedType ? `${selectedType.label} — Acme / Globex` : 'e.g. NDA with Globex Inc.'}
                      autoFocus
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1"><Users className="h-3.5 w-3.5" /> Parties involved</label>
                    <input
                      value={parties}
                      onChange={(e) => setParties(e.target.value)}
                      placeholder="e.g. Acme LLC and Globex Inc."
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1"><Calendar className="h-3.5 w-3.5" /> Effective date (optional)</label>
                    <input
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      placeholder="e.g. January 1, 2026"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-1 text-sm font-semibold text-gray-700">Key terms and clauses</p>
              <p className="mb-3 text-xs text-gray-400">List the specific terms you want included. One per line.</p>
              <div className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2">
                <ListTree className="mt-0.5 h-4 w-4 text-gray-400" />
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder={'Payment of $5,000 due within 30 days\nProject delivered by March 15, 2026\nWork product owned by the client\nEither party may end with 14 days notice'}
                  rows={6}
                  className="w-full resize-none border-0 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4 rounded-b-2xl">
          <button
            onClick={() => (step === 0 ? handleClose() : setStep(step - 1))}
            className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                canProceed ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? 'Generating...' : 'Generate draft'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
