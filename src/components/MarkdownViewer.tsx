import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content || typeof content !== 'string' || !content.trim()) {
    return <span className="text-slate-400 italic text-sm">No details available</span>;
  }

  // Unescape literal \n and normalize newlines
  const formattedContent = content
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\r/g, '')
    .trim();

  return (
    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:underline">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}
