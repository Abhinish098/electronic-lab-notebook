/**
 * TextToImageTool.jsx
 * Generates an image from a text prompt and inserts it as a <figure> at the
 * editor cursor. Rendered inside a SidebarToolSection accordion.
 *
 * Props:
 *   editorRef    {React.RefObject} — the contentEditable div
 *   onInsert     {() => void}      — called after insertion so parent can flush
 */

import { useState } from 'react';
import { mockTextToImage } from '@/services/mockServices';

const insertHTMLAtCursor = (html) => {
  document.execCommand('insertHTML', false, html);
};

const buildFigureHTML = (url, caption) =>
  `<figure style="margin:14px 0;">` +
    `<img src="${url}" alt="${caption}" ` +
      `style="max-width:100%;border-radius:8px;border:1px solid rgba(124,106,247,0.18);display:block;" />` +
    `<figcaption style="font-size:11px;color:#6060a0;margin-top:5px;font-style:italic;">${caption}</figcaption>` +
  `</figure><p></p>`;

const TextToImageTool = ({ editorRef, onInsert }) => {
  const [prompt,  setPrompt]  = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      // Swap for real API call when backend ready:
      // const res = await fetch(ENDPOINTS.TEXT_TO_IMAGE, { method:'POST', body: JSON.stringify({ prompt }) });
      // const { url } = await res.json();
      const url = await mockTextToImage(prompt);
      editorRef.current?.focus();
      insertHTMLAtCursor(buildFigureHTML(url, prompt));
      onInsert?.();
      setPrompt('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        className="eln-input"
        style={{ fontSize: 11 }}
        placeholder="e.g. protein folding diagram…"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleGenerate()}
      />
      <button
        className="eln-btn eln-btn-gold"
        style={{ fontSize: 11, padding: '5px 10px' }}
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? '⏳ Generating…' : '🎨 Insert Image'}
      </button>
      <div style={{ fontSize: 10, color: '#404060', lineHeight: 1.4 }}>
        Image is inserted at cursor.
      </div>
    </>
  );
};

export default TextToImageTool;