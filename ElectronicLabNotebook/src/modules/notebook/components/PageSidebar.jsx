/**
 * PageSidebar.jsx
 * The "PAGES" section of the notebook sidebar.
 *
 * Layout (top → bottom, all inside a flex column):
 *   ┌─────────────────────┐
 *   │  PAGES       + New  │  ← fixed header
 *   ├─────────────────────┤
 *   │  🔍 Search pages…   │  ← PageSearch (dropdown on focus/type)
 *   ├─────────────────────┤
 *   │  Buffer Opt…        │
 *   │  Cell Viability…    │  ← scrollable list (fills remaining space)
 *   │  Crystallisation…   │
 *   └─────────────────────┘
 *
 * Props:
 *   pages        {PageMeta[]}           — sorted array from usePageManager
 *   activePage   {string}               — id of the currently open page
 *   notebookId   {string}               — forwarded to PageSearch → usePageSearch
 *   onSwitch     {(id: string) => void}
 *   onAdd        {() => void}
 *   onDelete     {(id: string) => void}
 */

import PageSearch from './PageSearch';

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const PageSidebar = ({ pages, activePage, notebookId, onSwitch, onAdd, onDelete }) => (
  <>
    {/* ── Header ── */}
    <div style={{
      padding: '10px 12px',
      borderBottom: '1px solid rgba(100,80,200,0.08)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: 10, color: '#6060a0', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>
        Pages
      </span>
      <button
        className="eln-btn"
        style={{ padding: '2px 8px', fontSize: 11 }}
        onClick={onAdd}
      >
        + New
      </button>
    </div>

    {/* ── Search bar (renders its own dropdown via absolute positioning) ── */}
    <PageSearch notebookId={notebookId} onSelect={onSwitch} />

    {/* ── Scrollable page list ── */}
    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
      {pages.map(page => (
        <div
          key={page.id}
          className={`eln-sidebar-item ${activePage === page.id ? 'active' : ''}`}
          onClick={() => onSwitch(page.id)}
          style={{
            flexDirection: 'column', alignItems: 'flex-start',
            gap: 2, marginBottom: 2, position: 'relative',
          }}
        >
          {/* Title */}
          <div style={{
            fontSize: 12, fontWeight: 600, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            width: '100%', paddingRight: 20,
          }}>
            {page.title}
          </div>

          {/* Date */}
          <div style={{ fontSize: 10, color: '#404065' }}>
            {formatDate(page.created_at)}
          </div>

          {/* Delete button — only on active page when multiple pages exist */}
          {activePage === page.id && pages.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(page.id); }}
              style={{
                position: 'absolute', right: 6, top: 8,
                background: 'transparent', border: 'none',
                cursor: 'pointer', color: '#f76a6a', fontSize: 13, lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  </>
);

export default PageSidebar;