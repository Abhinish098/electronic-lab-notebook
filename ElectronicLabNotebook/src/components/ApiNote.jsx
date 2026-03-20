/**
 * ApiNote.jsx
 * Subtle footer note displaying the FastAPI endpoint path for each feature.
 * Acts as a living reference connecting UI features to backend routes.
 *
 * Props:
 *   endpoint {string} — e.g. '/api/agents/autocomplete'
 */

const ApiNote = ({ endpoint }) => (
  <div style={{
    fontSize: 11,
    color: '#40405a',
    padding: '7px 12px',
    background: 'rgba(255,255,255,0.015)',
    borderRadius: 7,
    borderLeft: '2px solid rgba(124,106,247,0.25)',
  }}>
    🔗 FastAPI endpoint:{' '}
    <code style={{
      color: '#7c6af7',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
    }}>
      {endpoint}
    </code>
  </div>
);

export default ApiNote;