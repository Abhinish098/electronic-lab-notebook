/**
 * AutocompleteBar.jsx
 * Renders a one-line ghost suggestion pill below the editor.
 * Only visible when a suggestion is ready or the AI is loading.
 * Tab accepts; × button or any key dismisses (handled upstream).
 *
 * Props:
 *   suggestion  {string}    — the suggestion text ('' = hide)
 *   isLoading   {boolean}
 *   onDismiss   {() => void}
 */

const AutocompleteBar = ({ suggestion, isLoading, onDismiss }) => {
  if (!suggestion && !isLoading) return null;

  return (
    <div style={{
      margin: '0 18px 4px',
      padding: '6px 12px',
      borderRadius: 8,
      background: 'rgba(124,106,247,0.07)',
      border: '1px solid rgba(124,106,247,0.18)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    }}>
      {isLoading ? (
        <>
          <span className="eln-pulse" style={{ fontSize: 12 }}>✨</span>
          <span style={{ fontSize: 11, color: '#5050a0', fontStyle: 'italic' }}>AI thinking…</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 12 }}>✨</span>
          <span style={{ fontSize: 11, color: '#8878c8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
            {suggestion}
          </span>
          <span style={{ fontSize: 9, color: '#7c6af7', fontWeight: 700, background: 'rgba(124,106,247,0.18)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
            Tab ↵
          </span>
          <button
            onClick={onDismiss}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#404068', fontSize: 13, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
          >
            ×
          </button>
        </>
      )}
    </div>
  );
};

export default AutocompleteBar;