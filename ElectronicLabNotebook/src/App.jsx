/**
 * App.jsx
 * Application root.
 * Responsibilities:
 *   1. Wraps everything in <AppProvider> (global window-manager state)
 *   2. Renders the <Desktop> background layer
 *   3. Maps open windows → <WindowFrame> instances (skips minimised ones)
 *   4. Renders the <Taskbar>
 *
 * To add a new module:
 *   1. Create your component in /src/modules/<name>/
 *   2. Register it in /src/configs/windowRegistry.js
 *   That's all — App.jsx needs no changes.
 */

import { AppProvider, useApp } from '@/context/AppContext';
import { WINDOW_REGISTRY }     from '@/configs/windowRegistry';
import WindowFrame             from '@/components/WindowFrame';
import Desktop                 from '@/layout/Desktop';
import Taskbar                 from '@/layout/Taskbar';

/* ── Inner shell (consumes context) ────────────────────────────────────────── */
const Shell = () => {
  const {
    openWindows, minimizedWindows, activeWindow,
    openWindow, closeWindow, minimizeWindow, focusWindow,
  } = useApp();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Layer 1 — Desktop (background) */}
      <Desktop openWindows={openWindows} onOpen={openWindow} />

      {/* Layer 2 — Open windows */}
      {[...openWindows].map(id => {
        if (minimizedWindows.has(id)) return null;       // hidden, not unmounted
        const cfg = WINDOW_REGISTRY[id];
        if (!cfg) return null;
        const Module = cfg.component;

        return (
          <WindowFrame
            key={id}
            title={cfg.title}
            icon={cfg.icon}
            defaultPos={cfg.defaultPos}
            defaultSize={cfg.defaultSize}
            isActive={activeWindow === id}
            onClose={()    => closeWindow(id)}
            onMinimize={()  => minimizeWindow(id)}
            onFocus={()    => focusWindow(id)}
          >
            <Module />
          </WindowFrame>
        );
      })}

      {/* Layer 3 — Taskbar (always on top) */}
      <Taskbar
        openWindows={openWindows}
        activeWindow={activeWindow}
        minimizedWindows={minimizedWindows}
        onOpen={openWindow}
        onFocus={focusWindow}
        onMinimize={minimizeWindow}
      />

    </div>
  );
};

/* ── Root export ────────────────────────────────────────────────────────────── */
const App = () => (
  <AppProvider>
    <Shell />
  </AppProvider>
);

export default App;