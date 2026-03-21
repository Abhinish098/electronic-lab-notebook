/**
 * WhitePages.jsx  —  Orchestrator (lean composition layer)
 *
 * This file owns NO business logic itself.
 * It wires together:
 *   usePageManager  →  page list, content cache, API calls
 *   useAutocomplete →  debounced AI suggestion
 *   PageSidebar     →  page list + add/delete buttons
 *   SidebarToolSection + TextToTableTool + TextToImageTool  →  bottom tools
 *   EditorToolbar   →  title input + format buttons
 *   EditorArea      →  contentEditable writing surface
 *   AutocompleteBar →  ghost suggestion pill
 *   StatusBar       →  bottom metadata strip
 *
 * Layout:
 * ┌──────────────────────┬──────────────────────────────────┐
 * │  PageSidebar         │  EditorToolbar                   │
 * │   Buffer Opt…        │                                  │
 * │   Cell Viability…    │  EditorArea (contentEditable)    │
 * │   Crystallisation…   │                                  │
 * │   ─── (flex gap) ─── │  AutocompleteBar (ghost pill)    │
 * │  TextToTableTool ▲   │  StatusBar                       │
 * │  TextToImageTool ▲   │                                  │
 * └──────────────────────┴──────────────────────────────────┘
 */

import { useState } from 'react';

import usePageManager   from './hooks/usePageManager';
import { MOCK_NOTEBOOK_ID } from './services/notebookService';
import useAutocomplete  from './hooks/useAutocomplete';

import PageSidebar        from './components/PageSidebar';
import SidebarToolSection from './components/SidebarToolSection';
import TextToTableTool    from './components/TextToTableTool';
import TextToImageTool    from './components/TextToImageTool';
import EditorToolbar      from './components/EditorToolbar';
import EditorArea         from './components/EditorArea';
import AutocompleteBar    from './components/AutocompleteBar';
import StatusBar          from './components/StatusBar';

const WhitePages = () => {
  // ── Core state (pages + content cache + API) ─────────────────────────────
  const {
    pages, activePage, currentMeta, loading,
    editorRef,
    switchPage, addPage, deletePage, updateTitle, flushContent,
  } = usePageManager();

  // ── AI autocomplete (silent background feature) ───────────────────────────
  const {
    suggestion, isLoading: acLoading,
    handleInput, handleKeyDown, dismiss,
  } = useAutocomplete(editorRef, flushContent);

  // ── Sidebar tool accordion state ──────────────────────────────────────────
  const [tableOpen, setTableOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, color: '#5050a0' }}>
        <span className="eln-pulse" style={{ fontSize: 18 }}>📓</span>
        <span style={{ fontSize: 13 }}>Loading notebook…</span>
      </div>
    );
  }

  // ─── Main layout ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ════════════ SIDEBAR ════════════ */}
      <div style={{
        width: 210,
        borderRight: '1px solid rgba(100,80,200,0.10)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Pages list (scrollable, fills remaining vertical space) */}
        <PageSidebar
          pages={pages}
          activePage={activePage}
          notebookId={MOCK_NOTEBOOK_ID}
          onSwitch={switchPage}
          onAdd={addPage}
          onDelete={deletePage}
        />

        {/* ── Bottom tools, pinned ── */}
        <SidebarToolSection
          icon="📊" label="Text → Table"
          expanded={tableOpen}
          onToggle={() => setTableOpen(v => !v)}
        >
          <TextToTableTool editorRef={editorRef} onInsert={flushContent} />
        </SidebarToolSection>

        <SidebarToolSection
          icon="🎨" label="Text → Image"
          expanded={imageOpen}
          onToggle={() => setImageOpen(v => !v)}
        >
          <TextToImageTool editorRef={editorRef} onInsert={flushContent} />
        </SidebarToolSection>
      </div>

      {/* ════════════ EDITOR COLUMN ════════════ */}
      {currentMeta ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <EditorToolbar
            title={currentMeta.title}
            pageId={currentMeta.id}
            onTitleChange={updateTitle}
            editorRef={editorRef}
          />
          <EditorArea
            editorRef={editorRef}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={flushContent}
          />
          <AutocompleteBar
            suggestion={suggestion}
            isLoading={acLoading}
            onDismiss={dismiss}
          />
          <StatusBar
            createdAt={currentMeta.created_at}
            hasSuggestion={!!suggestion}
          />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#404060', fontSize: 13 }}>
          No pages yet — click <strong style={{ color: '#7c6af7', margin: '0 4px' }}>+ New</strong> to create one.
        </div>
      )}

    </div>
  );
};

export default WhitePages;