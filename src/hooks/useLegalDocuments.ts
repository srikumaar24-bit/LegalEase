import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type LegalDocument = {
  id: string;
  title: string;
  document_type: string;
  parties: string;
  terms: string;
  effective_date: string | null;
  status: 'draft' | 'review' | 'ready';
  content: string;
  created_at: string;
  updated_at: string;
};

export type LegalDocumentInput = {
  title: string;
  documentType: string;
  parties: string;
  terms: string;
  effectiveDate: string;
};

export function useLegalDocuments() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('legal_documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setDocuments((data ?? []) as LegalDocument[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const createDocument = useCallback(async (input: LegalDocumentInput, content: string) => {
    const { data, error: insertError } = await supabase
      .from('legal_documents')
      .insert({
        title: input.title,
        document_type: input.documentType,
        parties: input.parties,
        terms: input.terms,
        effective_date: input.effectiveDate || null,
        status: 'review',
        content,
      })
      .select()
      .maybeSingle();

    if (insertError || !data) {
      setError(insertError?.message ?? 'Unable to save this document.');
      return null;
    }

    const document = data as LegalDocument;
    setDocuments((current) => [document, ...current]);
    return document;
  }, []);

  const updateDocument = useCallback(async (id: string, content: string, status: LegalDocument['status'] = 'review') => {
    const { data, error: updateError } = await supabase
      .from('legal_documents')
      .update({ content, status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateError || !data) {
      setError(updateError?.message ?? 'Unable to save your changes.');
      return null;
    }

    const document = data as LegalDocument;
    setDocuments((current) => current.map((item) => item.id === id ? document : item));
    return document;
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase.from('legal_documents').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }
    setDocuments((current) => current.filter((item) => item.id !== id));
    return true;
  }, []);

  return { documents, loading, error, createDocument, updateDocument, deleteDocument, reload: loadDocuments };
}
