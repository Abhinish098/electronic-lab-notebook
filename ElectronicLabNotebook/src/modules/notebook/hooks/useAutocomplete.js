/**
 * useAutocomplete.js
 * Handles debounced AI autocomplete for the WhitePages editor.
 *
 * Behaviour:
 *  • Starts a 1 400 ms debounce timer on every editor input event.
 *  • If the user stops typing and has ≥ 12 characters, fetches a suggestion.
 *  • Exposes the suggestion as a string for the AutocompleteBar to render.
 *  • Tab key accepts; any printable key or Escape dismisses.
 *
 * Returns:
 *   suggestion       — the current suggestion string ('' if none)
 *   isLoading        — true while waiting for the API response
 *   handleInput()    — call on editor onInput events
 *   handleKeyDown(e) — call on editor onKeyDown; returns true if Tab was consumed
 *   dismiss()        — programmatically clear the suggestion
 */

import { useCallback, useRef, useState } from 'react';
import { mockAutocomplete } from '@/services/mockServices';

const DEBOUNCE_MS    = 1400;
const MIN_TEXT_LEN   = 12;

// Keys that should NOT dismiss the suggestion (navigation, modifiers)
const NON_DISMISS_KEYS = new Set([
  'Shift','Control','Alt','Meta','CapsLock',
  'ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
  'Home','End','PageUp','PageDown',
  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
]);

/** Insert plain text at the current cursor position. */
const insertTextAtCursor = (text) => {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;
  const range    = sel.getRangeAt(0);
  const textNode = document.createTextNode(text);
  range.deleteContents();
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
};

const useAutocomplete = (editorRef, onAccept) => {
  const [suggestion, setSuggestion] = useState('');
  const [isLoading,  setIsLoading]  = useState(false);
  const debounceRef  = useRef(null);
  const suggestionRef = useRef('');  // sync mirror to avoid stale closure in keydown

  const dismiss = useCallback(() => {
    setSuggestion('');
    suggestionRef.current = '';
    setIsLoading(false);
    clearTimeout(debounceRef.current);
  }, []);

  const handleInput = useCallback(() => {
    // Clear suggestion immediately when the user types
    setSuggestion('');
    suggestionRef.current = '';
    setIsLoading(false);
    clearTimeout(debounceRef.current);

    const text = editorRef.current?.innerText?.trim() ?? '';
    if (text.length < MIN_TEXT_LEN) return;

    // Schedule a new fetch
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Swap mockAutocomplete for a real fetch when backend is ready:
        // const res = await fetch(ENDPOINTS.AUTOCOMPLETE, { method: 'POST', body: JSON.stringify({ text }) });
        // const s   = (await res.json()).suggestion;
        const s = await mockAutocomplete(text);
        setSuggestion(s);
        suggestionRef.current = s;
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);
  }, [editorRef]);

  const handleKeyDown = useCallback((e) => {
    // Tab + active suggestion → accept
    if (e.key === 'Tab' && suggestionRef.current) {
      e.preventDefault();
      editorRef.current?.focus();
      insertTextAtCursor(suggestionRef.current);
      onAccept?.();    // notify parent to flush content
      dismiss();
      return true;     // signal that Tab was consumed
    }

    // Any printable key or Escape → dismiss
    if (e.key === 'Escape' || (!NON_DISMISS_KEYS.has(e.key) && (suggestionRef.current || isLoading))) {
      dismiss();
    }

    return false;
  }, [dismiss, editorRef, isLoading, onAccept]);

  return { suggestion, isLoading, handleInput, handleKeyDown, dismiss };
};

export default useAutocomplete;