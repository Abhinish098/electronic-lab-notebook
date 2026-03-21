/**
 * TextToImageTool.jsx
 * Generates an image from a text prompt and inserts it as a <figure> at the
 * saved cursor position inside the editor.
 *
 * Uses the same saveRange / restoreRange pattern as TextToTableTool —
 * see that file for the full explanation of why this is necessary.
 *
 * Props:
 *   editorRef  {React.RefObject}  — the contentEditable div
 *   onInsert   {() => void}       — called after insertion so parent can flush
 */

import { useRef, useState } from 'react';
import { mockTextToImage } from '@/services/mockServices';

// ── Cursor helpers (duplicated from TextToTableTool — extract to a shared
//    utility if more tools need the same pattern) ───────────────────────────────

const saveRange = (editorEl) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!editorEl?.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
};

const restoreRange = (editorEl, range) => {
  if (!editorEl || !range) return;
  editorEl.focus();
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
};

const insertHTMLAtCursor = (html) => {
  document.execCommand('insertHTML', false, html);
};

// ── Figure HTML builder ───────────────────────────────────────────────────────

const buildFigureHTML = (url, caption) =>
  `<figure style="margin:14px 0;">` +
    `<img src="${url}" alt="${caption}" ` +
      `style="max-width:100%;border-radius:8px;border:1px solid rgba(124,106,247,0.18);display:block;" />` +
    `<figcaption style="font-size:11px;color:#6060a0;margin-top:5px;font-style:italic;">${caption}</figcaption>` +
  `</figure><p></p>`;

// ── Component ─────────────────────────────────────────────────────────────────

const TextToImageTool = ({ editorRef, onInsert }) => {
  const [prompt,  setPrompt]  = useState('');
  const [loading, setLoading] = useState(false);
  const savedRangeRef         = useRef(null);

  /** Save cursor on mousedown — fires before the button steals focus. */
  const handleButtonMouseDown = () => {
    savedRangeRef.current = saveRange(editorRef.current);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      // Swap for real API call when backend ready:
      // const res = await fetch(ENDPOINTS.TEXT_TO_IMAGE, { method:'POST', body: JSON.stringify({ prompt }) });
      // const { url } = await res.json();
      const url = await mockTextToImage(prompt);

      // 1. Restore the saved cursor position in the editor
      restoreRange(editorRef.current, savedRangeRef.current);
      // 2. Insert figure HTML exactly there
      insertHTMLAtCursor(buildFigureHTML(url, prompt));
      onInsert?.();
      setPrompt('');
      savedRangeRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  /** Also save cursor when the user presses Enter in the prompt input. */
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      savedRangeRef.current = saveRange(editorRef.current);
      handleGenerate();
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
        onKeyDown={handleInputKeyDown}
      />
      <button
        className="eln-btn eln-btn-gold"
        style={{ fontSize: 11, padding: '5px 10px' }}
        onMouseDown={handleButtonMouseDown}
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