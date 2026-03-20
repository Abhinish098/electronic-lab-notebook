/**
 * AutocompleteAgent.jsx
 * RAG-style AI text autocomplete for experiment notes.
 * Swap mockAutocomplete() for a real fetch to ENDPOINTS.AUTOCOMPLETE.
 */

import { useState } from 'react';
import SectionHeader from '@/components/SectionHeader';
import LoadingBar    from '@/components/LoadingBar';
import ApiNote       from '@/components/ApiNote';
import { mockAutocomplete } from '@/services/mockServices';
import { ENDPOINTS } from '@/api/endpoints';

const AutocompleteAgent = () => {
  const [text,       setText]       = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [history,    setHistory]    = useState([]);

  const getSuggestion = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setSuggestion('');
    const s = await mockAutocomplete(text);
    setSuggestion(s);
    setHistory(h => [{ text, suggestion: s, ts: new Date().toLocaleTimeString() }, ...h.slice(0, 4)]);
    setLoading(false);
  };

  const acceptSuggestion = () => {
    setText(t => t + suggestion);
    setSuggestion('');
  };

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionHeader
        icon="✨"
        title="AI Autocomplete Agent"
        subtitle="RAG-powered context-aware text suggestions"
        accentColor="#a590ff"
      />

      <textarea
        className="eln-input"
        rows={5}
        style={{ resize: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.7 }}
        placeholder="Start typing your experiment notes…"
        value={text}
        onChange={e => setText(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="eln-btn eln-btn-solid" onClick={getSuggestion} disabled={loading || !text.trim()}>
          {loading ? 'Generating…' : '✨ Get Suggestion'}
        </button>
        {suggestion && (
          <button className="eln-btn" onClick={acceptSuggestion} style={{ fontSize: 12 }}>
            ✅ Accept
          </button>
        )}
        {suggestion && (
          <button className="eln-btn" onClick={() => setSuggestion('')} style={{ fontSize: 12 }}>
            ✕ Dismiss
          </button>
        )}
      </div>

      {loading && <LoadingBar label="Querying RAG pipeline" />}

      {suggestion && !loading && (
        <div style={{
          background: 'rgba(124,106,247,0.07)',
          border: '1px solid rgba(124,106,247,0.22)',
          borderRadius: 10,
          padding: 14,
        }}>
          <div style={{ fontSize: 10, color: '#7c6af7', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Suggestion
          </div>
          <div style={{ fontSize: 13, color: '#c8c8e8', lineHeight: 1.7 }}>
            <span style={{ color: '#8080c0' }}>{text}</span>
            <span style={{ color: '#a590ff', fontStyle: 'italic' }}>{suggestion}</span>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#404068', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Recent Suggestions
          </div>
          {history.map((h, i) => (
            <div key={i} style={{ padding: '8px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.02)', marginBottom: 4, fontSize: 12, color: '#6060a0' }}>
              <span style={{ color: '#a590ff', fontSize: 10, marginRight: 6 }}>{h.ts}</span>
              {h.text.slice(0, 40)}{h.text.length > 40 ? '…' : ''}
              {h.suggestion.slice(0, 40)}…
            </div>
          ))}
        </div>
      )}

      <ApiNote endpoint={ENDPOINTS.AUTOCOMPLETE} />
    </div>
  );
};

export default AutocompleteAgent;