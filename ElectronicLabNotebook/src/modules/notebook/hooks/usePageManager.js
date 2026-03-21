/**
 * usePageManager.js
 * Manages page metadata, the content cache, and all API calls for the notebook.
 *
 * ─── Why a ref-based content cache? ─────────────────────────────────────────
 *
 * The page-switching bug (editor shows wrong content after switching tabs) is
 * caused by React's asynchronous state batching:
 *
 *   switchPage() calls flushContent() → setPages(...)  [async]
 *                        then          setActivePage()  [async]
 *
 * Both state updates are batched together. When the useEffect([activePage])
 * fires, the `pages` state might still hold stale content for the OLD page,
 * so `current.content` is wrong.
 *
 * The fix: `contentCache` is a plain ref object  { [pageId]: htmlString }.
 * It is updated SYNCHRONOUSLY before the page switch, so when the effect
 * reads from it the value is always the latest. React state (`pages`) is
 * only used for rendering the sidebar list (title, dates) — never for
 * populating the editor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Returns:
 *   pages          — array of PageMeta objects (for the sidebar list)
 *   activePage     — id string of the currently open page
 *   currentMeta    — PageMeta for the active page
 *   loading        — true while the initial page list is being fetched
 *   editorRef      — ref to attach to the contentEditable div
 *   switchPage(id) — save current content, then load the new page
 *   addPage()      — create a new page via API and switch to it
 *   deletePage(id) — delete via API and switch to an adjacent page
 *   updateTitle(id, title) — patch page title via API
 *   flushContent() — write editor DOM → contentCache (+ debounced API save)
 *   getContentForPage(id)  — read from cache (used by tools to insert HTML)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { notebookService, MOCK_NOTEBOOK_ID } from '../services/notebookService';

// How long to wait after the last edit before auto-saving to the API (ms)
const AUTOSAVE_DEBOUNCE_MS = 1500;

const usePageManager = () => {
  const [pages,      setPages]      = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [loading,    setLoading]    = useState(true);

  const editorRef      = useRef(null);
  const activePageRef  = useRef(null);    // sync mirror of activePage state
  const contentCache   = useRef({});      // { [pageId]: htmlString } — source of truth
  const saveTimerRef   = useRef(null);    // debounce handle for auto-save

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const fetchedPages = await notebookService.fetchPages(MOCK_NOTEBOOK_ID);
        if (cancelled) return;

        setPages(fetchedPages);

        if (fetchedPages.length > 0) {
          const firstId = fetchedPages[0].id;
          // Eagerly load content for the first page
          const { content } = await notebookService.fetchPageContent(firstId);
          if (cancelled) return;
          contentCache.current[firstId] = content;
          activePageRef.current = firstId;
          setActivePage(firstId);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Populate editor when activePage changes ──────────────────────────────────
  // Reads from contentCache (synchronous), never from React state.
  useEffect(() => {
    if (!activePage || !editorRef.current) return;

    const loadContent = async () => {
      // If not yet in cache, fetch from API
      if (contentCache.current[activePage] === undefined) {
        try {
          const { content } = await notebookService.fetchPageContent(activePage);
          contentCache.current[activePage] = content;
        } catch (err) {
          console.error('Failed to load page content:', err);
          contentCache.current[activePage] = '<p></p>';
        }
      }

      if (!editorRef.current) return;
      editorRef.current.innerHTML = contentCache.current[activePage];

      // Move cursor to end of content
      editorRef.current.focus();
      const range = document.createRange();
      const sel   = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    };

    loadContent();
  }, [activePage]);

  // ── Flush: editor DOM → cache (+ schedule API auto-save) ────────────────────
  const flushContent = useCallback(() => {
    if (!editorRef.current || !activePageRef.current) return;
    const html   = editorRef.current.innerHTML;
    const pageId = activePageRef.current;

    // Always write to cache synchronously
    contentCache.current[pageId] = html;

    // Debounce the actual API call so we don't spam on every keystroke
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await notebookService.updatePageContent(pageId, html);
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, []);

  // ── Switch page ──────────────────────────────────────────────────────────────
  const switchPage = useCallback((newId) => {
    if (newId === activePageRef.current) return;

    // 1. Save current editor content to cache SYNCHRONOUSLY before any state change
    if (editorRef.current && activePageRef.current) {
      contentCache.current[activePageRef.current] = editorRef.current.innerHTML;
    }
    // 2. Flush to API (debounced)
    flushContent();

    // 3. Update refs and state
    activePageRef.current = newId;
    setActivePage(newId);
  }, [flushContent]);

  // ── Add page ─────────────────────────────────────────────────────────────────
  const addPage = useCallback(async () => {
    // Save current page first
    if (editorRef.current && activePageRef.current) {
      contentCache.current[activePageRef.current] = editorRef.current.innerHTML;
      flushContent();
    }

    try {
      const newPage = await notebookService.createPage(MOCK_NOTEBOOK_ID, {
        title: `New Experiment`,
      });
      contentCache.current[newPage.id] = '<p></p>';
      setPages(prev => [...prev, newPage]);
      activePageRef.current = newPage.id;
      setActivePage(newPage.id);
    } catch (err) {
      console.error('Failed to create page:', err);
    }
  }, [flushContent]);

  // ── Delete page ───────────────────────────────────────────────────────────────
  const deletePage = useCallback(async (pageId) => {
    try {
      await notebookService.deletePage(pageId);
      delete contentCache.current[pageId];

      setPages(prev => {
        const remaining = prev.filter(p => p.id !== pageId);
        // If we deleted the active page, switch to the nearest remaining page
        if (pageId === activePageRef.current && remaining.length > 0) {
          const nextId = remaining[0].id;
          activePageRef.current = nextId;
          setActivePage(nextId);
        }
        return remaining;
      });
    } catch (err) {
      console.error('Failed to delete page:', err);
    }
  }, []);

  // ── Update page title ─────────────────────────────────────────────────────────
  const updateTitle = useCallback(async (pageId, title) => {
    // Optimistic local update first
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, title } : p));
    try {
      await notebookService.updatePageMeta(pageId, { title });
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  }, []);

  // ── Read content for a page from cache (for tools that insert into editor) ───
  const getContentForPage = useCallback((pageId) => {
    return contentCache.current[pageId] ?? '';
  }, []);

  const currentMeta = pages.find(p => p.id === activePage) ?? null;

  return {
    pages,
    activePage,
    currentMeta,
    loading,
    editorRef,
    switchPage,
    addPage,
    deletePage,
    updateTitle,
    flushContent,
    getContentForPage,
  };
};

export default usePageManager;