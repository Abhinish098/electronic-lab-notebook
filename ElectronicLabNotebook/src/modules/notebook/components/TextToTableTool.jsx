/**
 * TextToTableTool.jsx
 * Converts delimited text into a styled HTML table and inserts it at the
 * saved cursor position inside the editor.
 *
 * ── Why savedRangeRef? ────────────────────────────────────────────────────────
 * Clicking any sidebar button moves browser focus away from the contentEditable
 * editor. Once focus leaves the editor the browser discards the Selection, so
 * document.execCommand('insertHTML') has nowhere to insert — it falls back to
 * the beginning of the document (appearing to insert at the top).
 *
 * Fix: on the button's onMouseDown (fires BEFORE the focus shift) we snapshot
 * the live Selection into savedRangeRef. When the async work is done we:
 *   1. Re-focus the editor
 *   2. Restore the saved Range into the live Selection
 *   3. Call execCommand — which now inserts exactly where the cursor was
 *
 * This pattern is fully self-contained; no changes needed in parent components.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Props:
 *   editorRef  {React.RefObject}  — the contentEditable div
 *   onInsert   {() => void}       — called after insertion so parent can flush
 */

import { useRef, useState } from 'react';
import { mockTextToTable } from '@/services/mockServices';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Capture the current browser Selection as a cloned Range.
 * Returns null if nothing is selected or if the selection is outside the editor.
 */
const saveRange = (editorEl) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  // Only save if the cursor is actually inside the editor
  if (!editorEl?.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
};

/**
 * Re-focus the editor and restore a previously saved Range as the active
 * Selection so that execCommand inserts at the correct position.
 */
const restoreRange = (editorEl, range) => {
  if (!editorEl || !range) return;
  editorEl.focus();
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
};

/** Insert an HTML string at the current (restored) cursor position. */
const insertHTMLAtCursor = (html) => {
  document.execCommand('insertHTML', false, html);
};

// ── Table HTML builder ────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

const TextToTableTool = ({ editorRef, onInsert }) => {
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const savedRangeRef         = useRef(null);   // snapshot of cursor before focus leaves

  /** Save cursor on mousedown — fires before the button steals focus. */
  const handleButtonMouseDown = () => {
    savedRangeRef.current = saveRange(editorRef.current);
  };

  const handleConvert = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      // Swap for real API call when backend ready:
      // const res = await fetch(ENDPOINTS.TEXT_TO_TABLE, { method:'POST', body: JSON.stringify({ text: input }) });
      // const result = await res.json();
      const result = await mockTextToTable(input);
      if (result) {
        // 1. Restore the saved cursor position in the editor
        restoreRange(editorRef.current, savedRangeRef.current);
        // 2. Insert HTML exactly there
        insertHTMLAtCursor(buildTableHTML(result));
        onInsert?.();
        setInput('');
        savedRangeRef.current = null;
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
        placeholder={'Sample, Value, Unit\nBuffer A, 1.234, mg/mL\nBuffer B, 5.678, μM\nControl, 0.010, mg/mL'}
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button
        className="eln-btn eln-btn-teal"
        style={{ fontSize: 11, padding: '5px 10px' }}
        onMouseDown={handleButtonMouseDown}
        onClick={handleConvert}
        disabled={loading || !input.trim()}
      >
        {loading ? '⚙️ Converting…' : '📊 Insert Table'}
      </button>
      <div style={{ fontSize: 10, color: '#404060', lineHeight: 1.5 }}>
        First row becomes column headers.<br />
        Supports comma, semicolon, or tab delimiters.
      </div>
    </>
  );
};

export default TextToTableTool;