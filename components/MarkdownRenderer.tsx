
import React from 'react';

// Since we cannot use external markdown libraries easily in this single-block environment without complex setup,
// we will implement a basic custom renderer that handles code blocks and basic text.
export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const parseContent = (text: string) => {
    // Basic regex-based parsing for demonstration. 
    // In a real project, we would use react-markdown with prism.
    const sections = text.split(/(```[\s\S]*?```)/g);
    
    return sections.map((section, index) => {
      if (section.startsWith('```')) {
        const lines = section.split('\n');
        const lang = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={index} className="my-4 rounded-lg overflow-hidden border border-slate-700 shadow-xl bg-slate-900">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700 text-xs text-slate-400 font-mono">
              <span>{lang || 'code'}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-cyan-400 transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm mono text-cyan-50">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      
      return (
        <div key={index} className="prose prose-invert max-w-none whitespace-pre-wrap py-2 text-slate-300 leading-relaxed">
          {section}
        </div>
      );
    });
  };

  return <div className="markdown-body">{parseContent(content)}</div>;
};
