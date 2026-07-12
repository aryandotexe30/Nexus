import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  const [ReactMarkdown, setReactMarkdown] = useState<any>(null);
  const [remarkGfm, setRemarkGfm] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      import('react-markdown'),
      import('remark-gfm')
    ]).then(([markdownModule, gfmModule]) => {
      if (mounted) {
        setReactMarkdown(() => markdownModule.default);
        setRemarkGfm(() => gfmModule.default);
      }
    });
    return () => { mounted = false; };
  }, []);

  if (!content || !ReactMarkdown || !remarkGfm) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Waiting for content...</span>
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-headings:text-slate-900 prose-p:text-slate-700">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
