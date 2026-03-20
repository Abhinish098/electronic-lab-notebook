/**
 * WindowFrame.jsx
 * macOS-style draggable window shell with traffic-light controls.
 * All application content is rendered as {children} inside the content area.
 *
 * Props:
 *   title       {string}
 *   icon        {string}  — emoji shown in the title bar
 *   defaultPos  {{ x, y }}
 *   defaultSize {{ w, h }}
 *   isActive    {boolean} — whether this window is currently focused
 *   onClose     {() => void}
 *   onMinimize  {() => void}
 *   onFocus     {() => void}
 *   children    {ReactNode}
 */

import { useCallback, useState } from 'react';

const WindowFrame = ({
  title,
  icon,
  children,
  defaultPos,
  defaultSize,
  onClose,
  onMinimize,
  isActive,
  onFocus,
}) => {
  const [pos,      setPos]  = useState(defaultPos  ?? { x: 80, y: 40 });
  const [size]              = useState(defaultSize  ?? { w: 900, h: 600 });
  const [maximized, setMax] = useState(false);
  const [prevState, setPrev]= useState(null);

  /* ── Drag ── */
  const startDrag = useCallback((e) => {
    if (maximized) return;
    e.preventDefault();
    const ox = e.clientX - pos.x;
    const oy = e.clientY - pos.y;
    const move = (ev) => setPos({ x: ev.clientX - ox, y: ev.clientY - oy });
    const up   = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup',   up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup',   up);
  }, [pos, maximized]);

  /* ── Maximise / restore ── */
  const toggleMax = (e) => {
    e.stopPropagation();
    if (!maximized) { setPrev({ pos, size }); setMax(true); }
    else            { if (prevState) setPos(prevState.pos); setMax(false); }
  };

  const windowStyle = maximized
    ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: 'calc(100vh - 72px)' }
    : { position: 'fixed', top: pos.y, left: pos.x, width: size.w, height: size.h };

  return (
    <div
      className="eln-window"
      onClick={onFocus}
      style={{
        ...windowStyle,
        zIndex: isActive ? 200 : 100,
        background: 'rgba(7,7,16,0.97)',
        backdropFilter: 'blur(24px)',
        borderRadius: maximized ? 0 : 14,
        border: `1px solid ${isActive ? 'rgba(124,106,247,0.45)' : 'rgba(100,80,200,0.12)'}`,
        boxShadow: isActive
          ? '0 0 0 1px rgba(124,106,247,0.08), 0 28px 90px rgba(0,0,0,0.85), 0 0 50px rgba(124,106,247,0.06)'
          : '0 16px 60px rgba(0,0,0,0.75)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Title Bar ─────────────────────────────────────────────────────── */}
      <div
        onMouseDown={startDrag}
        style={{
          height: 40,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          background: 'rgba(10,10,22,0.85)',
          borderBottom: '1px solid rgba(100,80,200,0.12)',
          cursor: maximized ? 'default' : 'move',
          userSelect: 'none',
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            ['#f76a6a', (e) => { e.stopPropagation(); onClose(); }],
            ['#f7c66a', (e) => { e.stopPropagation(); onMinimize(); }],
            ['#6af7a0', toggleMax],
          ].map(([bg, fn], i) => (
            <button
              key={i}
              onClick={fn}
              style={{
                width: 12, height: 12, borderRadius: '50%',
                border: 'none', background: bg, cursor: 'pointer',
                transition: 'opacity .15s, transform .15s',
              }}
              onMouseEnter={e => (e.target.style.opacity = '0.75')}
              onMouseLeave={e => (e.target.style.opacity = '1')}
            />
          ))}
        </div>

        {/* Title */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
        }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#b0a8d8', letterSpacing: '0.015em' }}>
            {title}
          </span>
        </div>

        {/* Spacer to balance traffic lights */}
        <div style={{ width: 60 }} />
      </div>

      {/* ── Content Area ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;