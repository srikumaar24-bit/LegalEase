import { FileText, Clock, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { LegalDocument } from '@/hooks/useLegalDocuments';
import { formatRelativeDate } from '@/lib/legal';

type Props = {
  documents: LegalDocument[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
};

const STATUS_DOT: Record<LegalDocument['status'], string> = {
  draft: 'bg-gray-400',
  review: 'bg-amber-500',
  ready: 'bg-emerald-500',
};

export function DocumentList({ documents, selectedId, onSelect, loading }: Props) {
  const [query, setQuery] = useState('');

  const filtered = documents.filter((doc) =>
    doc.title.toLowerCase().includes(query.toLowerCase()) ||
    doc.document_type.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            <p className="mt-2 text-xs text-gray-400">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <FileText className="h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-400">{query ? 'No matches found' : 'No documents yet'}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                className={`w-full text-left rounded-xl px-3 py-2.5 transition-all ${
                  selectedId === doc.id
                    ? 'bg-blue-50 ring-1 ring-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[doc.status]}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${selectedId === doc.id ? 'text-blue-900' : 'text-gray-700'}`}>
                      {doc.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">{doc.document_type}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-300">
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate(doc.updated_at)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
