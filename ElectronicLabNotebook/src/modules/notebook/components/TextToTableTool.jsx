/**
 * TextToTableTool.jsx
 * Converts delimited text into a styled HTML table and inserts it at the
 * editor cursor. Rendered inside a SidebarToolSection accordion.
 *
 * Props:
 *   editorRef    {React.RefObject} — the contentEditable div
 *   onInsert     {() => void}      — called after insertion so parent can flush
 */

import { useState } from 'react';
import { mockTextToTable } from '@/services/mockServices';

/** Insert HTML at the current cursor position via execCommand. */
const insertHTMLAtCursor = (html) => {
  document.execCommand('insertHTML', false, html);
};

const buildTableHTML = ({ headers, rows }) =>
  `<table style="border-collapse:collapse;width:100%;margin:14px 0;font-size:13px;">` +
    `<thead><tr>` +
      headers.map(h =>
        `<th style="background:rgba(124,106,247,0.14);color:#a590ff;padding:7px 12px;` +
        `text-align:left;border:1px solid rgba(124,106,247,0.18);font-weight:600;">${h}</th>`
      ).join('') +
    `</tr></thead>` +
    `<tbody>` +
      rows.map(row =>
        `<tr>${row.map(cell =>
          `<td style="padding:6px 12px;border:1px solid rgba(255,255,255,0.05);color:#c0c0e0;">${cell}</td>`
        ).join('')}</tr>`
      ).join('') +
    `</tbody>` +
  `</table><p></p>`;

const TextToTableTool = ({ editorRef, onInsert }) => {
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      // Swap for real API call when backend ready:
      // const res = await fetch(ENDPOINTS.TEXT_TO_TABLE, { method:'POST', body: JSON.stringify({ text: input }) });
      // const result = await res.json();
      const result = await mockTextToTable(input);
      if (result) {
        editorRef.current?.focus();
        insertHTMLAtCursor(buildTableHTML(result));
        onInsert?.();
        setInput('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <textarea
        className="eln-input"
        rows={3}
        style={{ resize: 'none', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.55 }}
        placeholder={'Sample A, 1.23\nSample B, 4.56\nControl,  0.01'}
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button
        className="eln-btn eln-btn-teal"
        style={{ fontSize: 11, padding: '5px 10px' }}
        onClick={handleConvert}
        disabled={loading || !input.trim()}
      >
        {loading ? '⚙️ Converting…' : '📊 Insert Table'}
      </button>
      <div style={{ fontSize: 10, color: '#404060', lineHeight: 1.4 }}>
        Table is inserted at cursor.
      </div>
    </>
  );
};

export default TextToTableTool;