/**
 * WhitePages.jsx
 * Multi-page rich-text editor with a collapsible page list sidebar.
 * Uses the browser's native execCommand API for formatting.
 * Replace with a library (TipTap, Quill, Slate) for production.
 */

import { useRef, useState } from 'react';

const INITIAL_PAGES = [
  {
    id: 1,
    title: 'Buffer Optimisation Study',
    created: 'Jan 15, 2025',
    content: '<h3>Objective</h3><p>Determine the optimal buffer conditions for enzyme assay at varying pH levels (6.0 – 8.5).</p><h3>Materials</h3><p>PBS buffer, Tris-HCl, sodium acetate, enzyme stock solution (2 mg/mL).</p><h3>Observations</h3><p>Maximum activity observed at pH 7.4 with Tris-HCl buffer. Significant reduction in activity below pH 6.5.</p>',
  },
  {
    id: 2,
    title: 'Cell Viability Assay',
    created: 'Jan 18, 2025',
    content: '<h3>Procedure</h3><p>MTT assay performed on HeLa cells at passage 12. Cells seeded at 1×10⁴ per well in 96-well plate.</p>',
  },
  {
    id: 3,
    title: 'Crystallisation Protocol',
    created: 'Jan 22, 2025',
    content: '<h3>Hanging Drop Setup</h3><p>Reservoir solution: 20% PEG 4000, 0.1 M HEPES pH 7.5, 0.2 M MgCl₂.</p>',
  },
];

const WhitePages = () => {
  const [pages,      setPages]      = useState(INITIAL_PAGES);
  const [activePage, setActivePage] = useState(INITIAL_PAGES[0].id);
  const editorRef = useRef(null);

  const current = pages.find(p => p.id === activePage);

  /* ── Page CRUD ── */
  const addPage = () => {
    const id = Date.now();
    const newPage = {
      id,
      title: `New Experiment #${pages.length + 1}`,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      content: '<p>Start writing…</p>',
    };
    setPages(prev => [...prev, newPage]);
    setActivePage(id);
  };

  const deletePage = (id) => {
    setPages(prev => prev.filter(p => p.id !== id));
    if (activePage === id) {
      setActivePage(pages.find(p => p.id !== id)?.id ?? null);
    }
  };

  const updateTitle   = (id, title)   => setPages(prev => prev.map(p => p.id === id ? { ...p, title }   : p));
  const updateContent = ()            => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setPages(prev => prev.map(p => p.id === activePage ? { ...p, content: html } : p));
    }
  };

  /* ── Rich text commands ── */
  const execCmd = (cmd, value) => {
    document.execCommand(cmd, false, value ?? null);
    editorRef.current?.focus();
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* ── Page List Sidebar ── */}
      <div style={{ width: 190, borderRight: '1px solid rgba(100,80,200,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(100,80,200,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#6060a0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Pages</span>
          <button className="eln-btn" style={{ padding: '2px 8px', fontSize: 11 }} onClick={addPage}>+ New</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {pages.map(page => (
            <div
              key={page.id}
              className={`eln-sidebar-item ${activePage === page.id ? 'active' : ''}`}
              onClick={() => setActivePage(page.id)}
              style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, marginBottom: 2, position: 'relative' }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', paddingRight: 18 }}>
                {page.title}
              </div>
              <div style={{ fontSize: 10, color: '#404065' }}>{page.created}</div>

              {activePage === page.id && pages.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); deletePage(page.id); }}
                  style={{ position: 'absolute', right: 6, top: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#f76a6a', fontSize: 13, lineHeight: 1 }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Editor Area ── */}
      {current && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Toolbar */}
          <div style={{ padding: '6px 14px', borderBottom: '1px solid rgba(100,80,200,0.1)', display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              style={{ flex: 1, minWidth: 120, background: 'transparent', border: 'none', color: '#a590ff', fontSize: 14, fontWeight: 700, outline: 'none', fontFamily: 'Outfit, sans-serif' }}
              value={current.title}
              onChange={e => updateTitle(current.id, e.target.value)}
            />
            <div style={{ display: 'flex', gap: 3 }}>
              <button className="eln-btn" style={{ padding: '2px 7px', fontWeight: 700 }}         onClick={() => execCmd('bold')}>B</button>
              <button className="eln-btn" style={{ padding: '2px 7px', fontStyle: 'italic' }}      onClick={() => execCmd('italic')}>I</button>
              <button className="eln-btn" style={{ padding: '2px 7px', textDecoration: 'underline' }} onClick={() => execCmd('underline')}>U</button>
              <button className="eln-btn" style={{ padding: '2px 8px', fontSize: 11 }}             onClick={() => execCmd('formatBlock', 'h3')}>H3</button>
              <button className="eln-btn" style={{ padding: '2px 8px', fontSize: 11 }}             onClick={() => execCmd('insertUnorderedList')}>• List</button>
              <button className="eln-btn" style={{ padding: '2px 8px', fontSize: 11 }}             onClick={() => execCmd('insertHorizontalRule')}>── HR</button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={updateContent}
              dangerouslySetInnerHTML={{ __html: current.content }}
              style={{ outline: 'none', color: '#d0d0ea', lineHeight: 1.85, fontSize: 14, minHeight: '100%', fontFamily: 'Outfit, sans-serif' }}
            />
          </div>

          {/* Status Bar */}
          <div style={{ padding: '4px 14px', borderTop: '1px solid rgba(100,80,200,0.08)', display: 'flex', gap: 16, fontSize: 10, color: '#404065' }}>
            <span>📄 {current.created}</span>
            <span>🔗 Mock API ready</span>
            <span style={{ marginLeft: 'auto' }}>Rich Text Editor · ELN v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhitePages;