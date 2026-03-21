/**
 * PageSearch.jsx
 * Standalone search bar for finding notebook pages.
 *
 * This component owns ONLY presentation and user-interaction wiring.
 * All search logic lives in usePageSearch.js.
 *
 * Behaviour:
 *   • Input field appears directly below the "PAGES / + New" header.
 *   • Typing triggers usePageSearch (debounced 220 ms).
 *   • A dropdown appears below the input listing matching pages.
 *   • Clicking a result calls onSelect(pageId), which switches the editor
 *     to that page via usePageManager's switchPage() — passed down from
 *     PageSidebar → WhitePages → usePageManager.
 *   • The dropdown closes on: result click, Escape key, or outside click.
 *   • Keyboard navigation: ↑ / ↓ moves highlight; Enter selects highlighted.
 *
 * Props:
 *   notebookId  {string}                  — forwarded to the search hook
 *   onSelect    {(pageId: string) => void} — switches the editor to the page
 *
 * Consumed by:
 *   PageSidebar.jsx  (placed between header and scrollable page list)
 */

import { useEffect, useRef, useState } from 'react';
import usePageSearch from '../hooks/usePageSearch';

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
};

const PageSearch = ({ notebookId, onSelect }) => {
  const [query,         setQuery]         = useState('');
  const [isOpen,        setIsOpen]        = useState(false);
  const [highlightIdx,  setHighlightIdx]  = useState(0);

  const inputRef    = useRef(null);
  const dropdownRef = useRef(null);
  const wrapperRef  = useRef(null);

  const { results, isSearching } = usePageSearch(notebookId, query);

  // Open dropdown whenever there's a query; close when empty
  useEffect(() => {
    setIsOpen(query.trim().length > 0);
    setHighlightIdx(0);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // ── Select a result ─────────────────────────────────────────────────────────
  const handleSelect = (pageId) => {
    onSelect(pageId);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // ── Keyboard navigation ──────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[highlightIdx]) handleSelect(results[highlightIdx].id);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  // Highlight keyword inside a title string
  const highlight = (title, q) => {
    if (!q.trim()) return title;
    const idx = title.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return title;
    return (
      <>
        {title.slice(0, idx)}
        <mark style={{ background: 'rgba(124,106,247,0.35)', color: '#c8b8ff', borderRadius: 2, padding: '0 1px' }}>
          {title.slice(idx, idx + q.length)}
        </mark>
        {title.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div
      ref={wrapperRef}
      style={{ padding: '7px 10px 6px', flexShrink: 0, position: 'relative' }}
    >
      {/* ── Input ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${isOpen ? 'rgba(124,106,247,0.45)' : 'rgba(120,100,255,0.15)'}`,
        borderRadius: isOpen && results.length > 0 ? '8px 8px 0 0' : 8,
        padding: '5px 9px',
        transition: 'border-color .18s, border-radius .12s',
      }}>
        {/* Search icon */}
        <span style={{ fontSize: 11, color: '#5050a0', flexShrink: 0 }}>
          {isSearching ? '⏳' : '🔍'}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages…"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#d0d0ea',
            fontSize: 12,
            fontFamily: 'Outfit, sans-serif',
          }}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5050a0', fontSize: 13, lineHeight: 1, padding: 0, flexShrink: 0 }}
          >
            ×
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 10,
            right: 10,
            // Subtract the 7px top padding of the wrapper so the dropdown
            // aligns flush under the input box border
            marginTop: -1,
            background: 'rgba(10,10,22,0.98)',
            border: '1px solid rgba(124,106,247,0.35)',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            zIndex: 500,
            maxHeight: 260,
            overflowY: 'auto',
            boxShadow: '0 12px 36px rgba(0,0,0,0.65)',
          }}
        >
          {isSearching && results.length === 0 && (
            <div style={{ padding: '10px 12px', fontSize: 11, color: '#5050a0', fontStyle: 'italic' }}>
              Searching…
            </div>
          )}

          {!isSearching && results.length === 0 && (
            <div style={{ padding: '10px 12px', fontSize: 11, color: '#404060' }}>
              No pages matching <strong style={{ color: '#7070a0' }}>"{query}"</strong>
            </div>
          )}

          {results.map((page, idx) => {
            const isHighlighted = idx === highlightIdx;
            return (
              <div
                key={page.id}
                onClick={() => handleSelect(page.id)}
                onMouseEnter={() => setHighlightIdx(idx)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  background: isHighlighted ? 'rgba(124,106,247,0.14)' : 'transparent',
                  borderBottom: idx < results.length - 1 ? '1px solid rgba(100,80,200,0.07)' : 'none',
                  transition: 'background .12s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {/* Page title with highlighted match */}
                <div style={{ fontSize: 12, fontWeight: 600, color: isHighlighted ? '#c8b8ff' : '#a0a0d0' }}>
                  {highlight(page.title, query)}
                </div>

                {/* Date metadata */}
                <div style={{ fontSize: 10, color: '#404065' }}>
                  {formatDate(page.created_at)}
                </div>
              </div>
            );
          })}

          {/* Footer hint */}
          {results.length > 0 && (
            <div style={{ padding: '5px 12px', fontSize: 9, color: '#303050', borderTop: '1px solid rgba(100,80,200,0.07)', display: 'flex', gap: 10 }}>
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>Esc close</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PageSearch;