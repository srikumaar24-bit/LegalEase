import { useState, useEffect } from 'react';
import { FileText, Save, Trash2, Download, Copy, Check, Loader2, Calendar, Users } from 'lucide-react';
import type { LegalDocument } from '@/hooks/useLegalDocuments';
import { formatRelativeDate } from '@/lib/legal';

type Props = {
  doc: LegalDocument;
  onSave: (id: string, content: string, status: LegalDocument['status']) => void;
  onDelete: (id: string) => void;
};

const STATUS_STYLES: Record<LegalDocument['status'], { label: string; className: string; dot: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  review: { label: 'In review', className: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  ready: { label: 'Ready', className: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
};

export function DocumentEditor({ doc, onSave, onDelete }: Props) {
  const [content, setContent] = useState(doc.content);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    setContent(doc.content);
  }, [doc.id, doc.content]);

  const dirty = content !== doc.content;
  const statusInfo = STATUS_STYLES[doc.status];

  const handleSave = async () => {
    setSaving(true);
    await onSave(doc.id, content, doc.status);
    setSaving(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${doc.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'legalease-document'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <h2 className="truncate font-semibold text-gray-900">{doc.title}</h2>
            <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{doc.parties || 'No parties'}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatRelativeDate(doc.updated_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={handleCopy} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors" title="Copy text">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <button onClick={handleDownload} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors" title="Download">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={() => setShowDelete(true)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              dirty && !saving
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-full w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-4 font-mono text-sm leading-relaxed text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Your document content will appear here..."
        />
      </div>

      {showDelete && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowDelete(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900">Delete this document?</h3>
            <p className="mt-1.5 text-sm text-gray-500">"{doc.title}" will be permanently removed. This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { onDelete(doc.id); setShowDelete(false); }} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
