import { useEffect, useRef } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd } = textarea;

    if (e.key === "Tab") {
      e.preventDefault();
      const newValue = value.substring(0, selectionStart) + "  " + value.substring(selectionEnd);
      onChange(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
      }, 0);
    } else if (e.key === "Enter") {
      // Auto-indent on new line
      const lines = value.substring(0, selectionStart).split('\n');
      const currentLine = lines[lines.length - 1];
      const indent = currentLine.match(/^\s*/)?.[0] || '';
      
      // Add extra indent for opening braces
      const extraIndent = currentLine.trim().endsWith('{') ? '  ' : '';
      
      e.preventDefault();
      const newValue = value.substring(0, selectionStart) + '\n' + indent + extraIndent + value.substring(selectionEnd);
      onChange(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + indent.length + extraIndent.length;
      }, 0);
    }
  };

  return (
    <div className="h-full relative code-editor">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-full p-4 font-mono text-sm border-none outline-none resize-none bg-gray-50"
        placeholder={`Write your ${language} code here...`}
        spellCheck={false}
        style={{
          tabSize: 2,
          lineHeight: '1.5',
        }}
      />
      
      {/* Line numbers */}
      <div className="absolute left-0 top-0 p-4 pointer-events-none text-gray-400 font-mono text-sm leading-6">
        {value.split('\n').map((_, index) => (
          <div key={index} className="text-right w-8">
            {index + 1}
          </div>
        ))}
      </div>
      
      <style>{`
        .code-editor textarea {
          padding-left: 3rem;
        }
      `}</style>
    </div>
  );
}
