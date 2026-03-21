/**
 * EditorToolbar.jsx
 * Title input + rich-text formatting buttons.
 *
 * Props:
 *   title       {string}
 *   pageId      {string}
 *   onTitleChange {(id, title) => void}
 *   editorRef   {React.RefObject}        — needed to refocus after commands
 */

const FORMAT_BUTTONS = [
  { label: 'B', cmd: 'bold',                style: { fontWeight: 700 } },
  { label: 'I', cmd: 'italic',              style: { fontStyle: 'italic' } },
  { label: 'U', cmd: 'underline',           style: { textDecoration: 'underline' } },
  { label: 'H3', cmd: 'formatBlock', value: 'h3', style: { fontSize: 11 } },
  { label: '• List', cmd: 'insertUnorderedList', style: { fontSize: 11 } },
  { label: '── HR',  cmd: 'insertHorizontalRule', style: { fontSize: 11 } },
];

const EditorToolbar = ({ title, pageId, onTitleChange, editorRef }) => {
  const execCmd = (cmd, value) => {
    document.execCommand(cmd, false, value ?? null);
    editorRef.current?.focus();
  };

  return (
    <div style={{
      padding: '6px 14px',
      borderBottom: '1px solid rgba(100,80,200,0.10)',
      display: 'flex',
      gap: 4,
      alignItems: 'center',
      flexWrap: 'wrap',
      flexShrink: 0,
    }}>
      {/* Editable page title */}
      <input
        style={{ flex: 1, minWidth: 120, background: 'transparent', border: 'none', color: '#a590ff', fontSize: 14, fontWeight: 700, outline: 'none', fontFamily: 'Outfit, sans-serif' }}
        value={title}
        onChange={e => onTitleChange(pageId, e.target.value)}
        placeholder="Page title…"
      />

      {/* Format buttons */}
      <div style={{ display: 'flex', gap: 3 }}>
        {FORMAT_BUTTONS.map(({ label, cmd, value, style }) => (
          <button
            key={label}
            className="eln-btn"
            style={{ padding: '2px 7px', ...style }}
            onClick={() => execCmd(cmd, value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EditorToolbar;