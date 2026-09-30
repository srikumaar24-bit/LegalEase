import { useState, useMemo } from 'react';
import { Scale, Plus, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useLegalDocuments } from '@/hooks/useLegalDocuments';
import type { LegalDocument, LegalDocumentInput } from '@/hooks/useLegalDocuments';
import { DocumentList } from '@/components/DocumentList';
import { DocumentEditor } from '@/components/DocumentEditor';
import { NewDocumentWizard } from '@/components/NewDocumentWizard';

function App() {
  const { documents, loading, error, createDocument, updateDocument, deleteDocument } = useLegalDocuments();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const selected = useMemo(
    () => documents.find((doc) => doc.id === selectedId) ?? null,
    [documents, selectedId],
  );

  const handleGenerate = async (input: LegalDocumentInput, content: string) => {
    const doc = await createDocument(input, content);
    if (doc) {
      setSelectedId(doc.id);
      setWizardOpen(false);
    }
  };

  const handleSave = async (id: string, content: string, status: LegalDocument['status']) => {
    await updateDocument(id, content, status);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 p-2 shadow-lg shadow-blue-500/25">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">LegalEase</h1>
            <p className="text-xs text-gray-400 leading-tight hidden sm:block">Draft. Review. Export.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
            <FileText className="h-3.5 w-3.5" />
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </span>
          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:scale-105 active:scale-100"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">New document</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className={`flex flex-col border-r border-gray-200 bg-white ${selected ? 'hidden md:flex' : 'flex'} w-full md:w-72 lg:w-80 flex-shrink-0`}>
          <DocumentList
            documents={documents}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
          />
        </aside>

        <main className={`flex-1 ${selected ? 'flex' : 'hidden md:flex'} flex-col overflow-hidden`}>
          {selected ? (
            <div className="relative flex-1 overflow-hidden">
              <DocumentEditor
                doc={selected}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              {loading ? (
                <>
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  <p className="mt-3 text-sm text-gray-400">Loading your documents...</p>
                </>
              ) : documents.length === 0 ? (
                <>
                  <div className="mb-4 w-fit rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-4 shadow-lg shadow-blue-500/25">
                    <Scale className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Welcome to LegalEase</h2>
                  <p className="mt-1.5 max-w-sm text-sm text-gray-500">
                    Create clear, professional legal drafts in minutes. Pick a template, add your details, and generate a structured document you can review and export.
                  </p>
                  <button
                    onClick={() => setWizardOpen(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:scale-105 active:scale-100"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                    Create your first document
                  </button>
                </>
              ) : (
                <>
                  <FileText className="h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-400">Select a document to start editing</p>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      <NewDocumentWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onGenerate={handleGenerate}
      />
    </div>
  );
}

export default App;
