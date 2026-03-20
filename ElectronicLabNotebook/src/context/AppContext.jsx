/**
 * AppContext.jsx
 * Global state for window management (open / minimized / active).
 * Swap this provider for Zustand or Redux if state grows complex.
 */

import { createContext, useCallback, useContext, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [openWindows,      setOpenWindows]      = useState(new Set());
  const [minimizedWindows, setMinimizedWindows] = useState(new Set());
  const [activeWindow,     setActiveWindow]     = useState(null);

  /** Open a window (or un-minimise it) and bring it to front. */
  const openWindow = useCallback((id) => {
    setOpenWindows(prev => new Set([...prev, id]));
    setMinimizedWindows(prev => { const n = new Set(prev); n.delete(id); return n; });
    setActiveWindow(id);
  }, []);

  /** Permanently close a window. */
  const closeWindow = useCallback((id) => {
    setOpenWindows(prev => { const n = new Set(prev); n.delete(id); return n; });
    setMinimizedWindows(prev => { const n = new Set(prev); n.delete(id); return n; });
    setActiveWindow(prev => (prev === id ? null : prev));
  }, []);

  /** Send a window to the taskbar (hide but keep state). */
  const minimizeWindow = useCallback((id) => {
    setMinimizedWindows(prev => new Set([...prev, id]));
    setActiveWindow(prev => (prev === id ? null : prev));
  }, []);

  /** Bring an existing (possibly minimised) window to focus. */
  const focusWindow = useCallback((id) => {
    setMinimizedWindows(prev => { const n = new Set(prev); n.delete(id); return n; });
    setActiveWindow(id);
  }, []);

  const value = {
    openWindows,
    minimizedWindows,
    activeWindow,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/** Convenience hook — throws if used outside <AppProvider>. */
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};

export default AppContext;