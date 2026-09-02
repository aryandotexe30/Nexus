import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content || typeof content !== 'string' || !content.trim()) {
    return <span className="text-slate-400 italic">No details available</span>;
  }

  return (
    <div className="prose prose-slate max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 leading-relaxed text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
