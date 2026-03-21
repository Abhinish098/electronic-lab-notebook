/**
 * StatusBar.jsx
 * Bottom strip showing page metadata, save state, and autocomplete hint.
 *
 * Props:
 *   createdAt       {string}   — ISO date string from the API
 *   hasSuggestion   {boolean}
 *   saveStatus      {'idle'|'saving'|'saved'|'error'}
 */

const formatDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
};

const SAVE_LABELS = {
  idle:   { text: '🔗 Mock API ready',    color: '#404065' },
  saving: { text: '💾 Saving…',           color: '#7c6af7' },
  saved:  { text: '✅ Saved',             color: '#4ecdc4' },
  error:  { text: '❌ Save failed',       color: '#f76a6a' },
};

const StatusBar = ({ createdAt, hasSuggestion, saveStatus = 'idle' }) => {
  const save = SAVE_LABELS[saveStatus] ?? SAVE_LABELS.idle;

  return (
    <div style={{
      padding: '4px 14px',
      borderTop: '1px solid rgba(100,80,200,0.08)',
      display: 'flex',
      gap: 16,
      fontSize: 10,
      color: '#404065',
      flexShrink: 0,
      alignItems: 'center',
    }}>
      <span>📄 {formatDate(createdAt)}</span>
      <span style={{ color: save.color }}>{save.text}</span>
      {hasSuggestion && (
        <span style={{ color: '#7c6af7' }}>✨ Suggestion ready — press Tab</span>
      )}
      <span style={{ marginLeft: 'auto' }}>Rich Text Editor · ELN v1.0</span>
    </div>
  );
};

export default StatusBar;