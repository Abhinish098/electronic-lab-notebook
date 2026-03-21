/**
 * usePageSearch.js
 * Debounced search hook for notebook pages.
 *
 * Responsibilities (all logic lives here, zero logic in the UI component):
 *   • Accepts the current query string as input.
 *   • Debounces the API call by DEBOUNCE_MS to avoid spamming on each keystroke.
 *   • Returns a ranked list of matching PageMeta objects.
 *   • Clears results immediately when the query is emptied.
 *   • Exposes an `isSearching` flag for the UI to show a loading indicator.
 *
 * To connect to FastAPI:
 *   The mock implementation runs a client-side ILIKE.
 *   The real implementation issues:
 *     GET /api/notebook/pages/search?q=<query>&notebook_id=<id>
 *   Switch by setting VITE_USE_MOCK=false in .env — notebookService handles routing.
 *
 * Props accepted by the hook:
 *   notebookId  {string}    — passed through to the service
 *   query       {string}    — controlled input value from PageSearch component
 *
 * Returns:
 *   results     {PageMeta[]}  — matching pages, empty array when no query
 *   isSearching {boolean}     — true while the debounce timer is pending or the
 *                               API call is in-flight
 */

import { useEffect, useRef, useState } from 'react';
import { notebookService } from '../services/notebookService';

const DEBOUNCE_MS = 220;   // short: results should feel instant

const usePageSearch = (notebookId, query) => {
  const [results,     setResults]     = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef    = useRef(null);
  const latestQuery = useRef(query);   // avoid stale closure inside timeout

  useEffect(() => {
    latestQuery.current = query;
    clearTimeout(timerRef.current);

    // Empty query → clear immediately, no API call
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    timerRef.current = setTimeout(async () => {
      try {
        const hits = await notebookService.searchPages(notebookId, latestQuery.current);
        // Guard against a stale response arriving after the query changed
        if (latestQuery.current === query) {
          setResults(hits);
        }
      } catch (err) {
        console.error('Page search error:', err);
        setResults([]);
      } finally {
        if (latestQuery.current === query) {
          setIsSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [query, notebookId]);

  return { results, isSearching };
};

export default usePageSearch;