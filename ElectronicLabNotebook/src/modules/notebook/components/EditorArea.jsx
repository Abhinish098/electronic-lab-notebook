/**
 * EditorArea.jsx
 * The scrollable contentEditable writing area.
 * Does NOT use dangerouslySetInnerHTML — content is loaded imperatively
 * by the usePageManager hook via editorRef.
 *
 * Props:
 *   editorRef       {React.RefObject}
 *   onInput         {() => void}   — propagates to autocomplete hook
 *   onKeyDown       {(e) => void}  — propagates to autocomplete hook
 *   onBlur          {() => void}   — triggers content flush
 */

const EditorArea = ({ editorRef, onInput, onKeyDown, onBlur }) => (
  <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
    {/*
      IMPORTANT: no dangerouslySetInnerHTML.
      innerHTML is set imperatively by usePageManager's useEffect([activePage]).
      onBlur  → flush to content cache + schedule API auto-save
      onInput → drive the autocomplete debounce
      onKeyDown → Tab-to-accept suggestion, Escape-to-dismiss
    */}
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={onInput}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      style={{
        outline: 'none',
        color: '#d0d0ea',
        lineHeight: 1.85,
        fontSize: 14,
        minHeight: '100%',
        fontFamily: 'Outfit, sans-serif',
      }}
    />
  </div>
);

export default EditorArea;