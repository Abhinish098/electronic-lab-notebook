/**
 * Taskbar.jsx
 * Floating pill-shaped taskbar anchored to the bottom-center of the screen.
 *
 * Features:
 *   • Live clock + date display
 *   • Per-app icon with active glow + open-indicator dot
 *   • Click: opens → click active: minimises → click minimised: restores
 *   • System-tray placeholder icons
 *
 * Props:
 *   openWindows      {Set<string>}
 *   activeWindow     {string | null}
 *   minimizedWindows {Set<string>}
 *   onOpen           {(id) => void}
 *   onFocus          {(id) => void}
 *   onMinimize       {(id) => void}
 */

import { useEffect, useState } from 'react';
import { TASKBAR_APPS } from '@/configs/windowRegistry';

const Taskbar = ({ openWindows, activeWindow, minimizedWindows, onOpen, onFocus, onMinimize }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleAppClick = (id) => {
    const isOpen      = openWindows.has(id);
    const isActive    = activeWindow === id && !minimizedWindows.has(id);
    if (!isOpen)    onOpen(id);
    else if (isActive) onMinimize(id);
    else               onFocus(id);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 14,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '8px 16px',
      background: 'rgba(6,6,16,0.88)',
      backdropFilter: 'blur(28px)',
      borderRadius: 22,
      zIndex: 1000,
      border: '1px solid rgba(124,106,247,0.22)',
      boxShadow: [
        '0 10px 40px rgba(0,0,0,0.70)',
        '0 0 0 1px rgba(124,106,247,0.05)',
        'inset 0 1px 0 rgba(255,255,255,0.04)',
      ].join(', '),
    }}>

      {/* ── Clock ── */}
      <div style={{ padding: '0 10px 0 4px', borderRight: '1px solid rgba(124,106,247,0.14)', marginRight: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#8878d8', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{ fontSize: 9, color: '#404060', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
          {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* ── App Icons ── */}
      {TASKBAR_APPS.map(app => {
        const isOpen      = openWindows.has(app.id);
        const isMinimized = minimizedWindows.has(app.id);
        const isActive    = activeWindow === app.id && !isMinimized;

        return (
          <div
            key={app.id}
            className="taskbar-icon-wrap"
            onClick={() => handleAppClick(app.id)}
            title={app.label}
          >
            {/* Icon button */}
            <div
              className="taskbar-icon-btn"
              style={{
                background: isActive
                  ? 'rgba(124,106,247,0.28)'
                  : isOpen ? 'rgba(124,106,247,0.10)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive
                  ? 'rgba(124,106,247,0.50)'
                  : isOpen ? 'rgba(124,106,247,0.20)' : 'transparent'}`,
                boxShadow: isActive ? '0 0 18px rgba(124,106,247,0.35), inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
              }}
            >
              {app.icon}
            </div>

            {/* Label */}
            <span style={{ fontSize: 9, color: isActive ? '#a590ff' : '#404065', fontWeight: isActive ? 700 : 400, letterSpacing: '0.04em' }}>
              {app.label.toUpperCase()}
            </span>

            {/* Open indicator dot */}
            {isOpen && (
              <div style={{
                width:  isActive ? 6 : 3,
                height: isActive ? 6 : 3,
                borderRadius: '50%',
                background: isActive ? '#7c6af7' : '#40406a',
                transition: 'all .18s',
              }} />
            )}
          </div>
        );
      })}

      {/* ── Divider ── */}
      <div style={{ width: 1, height: 32, background: 'rgba(124,106,247,0.12)', margin: '0 6px' }} />

      {/* ── System Tray ── */}
      <div style={{ display: 'flex', gap: 2 }}>
        {['🔔', '⚙️', '🌐'].map((ic, i) => (
          <div
            key={i}
            className="taskbar-icon-btn"
            style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.03)', fontSize: 15 }}
          >
            {ic}
          </div>
        ))}
      </div>

    </div>
  );
};

export default Taskbar;