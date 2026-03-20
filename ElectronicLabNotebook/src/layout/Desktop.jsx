/**
 * Desktop.jsx
 * The background layer of the OS environment.
 * Renders:
 *   • Layered gradient + grid background
 *   • ELN branding watermark (bottom-left)
 *   • Desktop icon grid (top-right)
 *   • "Get started" hint when no windows are open
 *
 * Props:
 *   openWindows  {Set<string>}        — IDs of currently open windows
 *   onOpen       {(id: string) => void}
 */

import { useState } from 'react';
import { WINDOW_REGISTRY } from '@/configs/windowRegistry';

const DESKTOP_APPS = [
  {
    id: 'notebook',
    label: 'Lab Notebook',
    emoji: '📓',
    grad: 'linear-gradient(145deg,#6050e0,#4030b0)',
    shadow: 'rgba(100,80,220,0.45)',
  },
  {
    id: 'calculator',
    label: 'Bio Calculator',
    emoji: '🧮',
    grad: 'linear-gradient(145deg,#30a09a,#1e7a78)',
    shadow: 'rgba(50,165,160,0.40)',
  },
  {
    id: 'dashboard',
    label: 'Data Dashboard',
    emoji: '📊',
    grad: 'linear-gradient(145deg,#c08830,#a06818)',
    shadow: 'rgba(200,145,50,0.40)',
  },
];

const Desktop = ({ openWindows, onOpen }) => {
  const [bouncing, setBouncing] = useState(null);

  const handleDblClick = (id) => {
    setBouncing(id);
    onOpen(id);
    setTimeout(() => setBouncing(null), 380);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>

      {/* ── Background layers ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #06060f 0%, #080814 40%, #06060e 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: [
          'radial-gradient(ellipse 70% 60% at 15% 55%, rgba(70,40,140,0.12) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 50% at 85% 15%, rgba(20,90,110,0.09) 0%, transparent 55%)',
          'radial-gradient(ellipse 40% 40% at 60% 85%, rgba(110,60,40,0.06) 0%, transparent 50%)',
        ].join(', '),
      }} />
      {/* Subtle dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: [
          'linear-gradient(rgba(100,80,200,0.02) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(100,80,200,0.02) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '44px 44px',
      }} />

      {/* ── Branding watermark ── */}
      <div style={{ position: 'absolute', top: 36, left: 40, pointerEvents: 'none' }}>
        <div style={{ fontSize: 10, color: '#28284a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 8 }}>
          Electronic Lab Notebook
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95, color: 'rgba(220,215,255,0.035)' }}>
          ELN<br />Platform
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['AI-Powered', 'FastAPI Ready', 'v1.0'].map(tag => (
            <span key={tag} style={{ fontSize: 10, color: '#252545', border: '1px solid #1a1a38', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Desktop Icons ── */}
      <div style={{ position: 'absolute', top: 56, right: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DESKTOP_APPS.map(app => (
          <div
            key={app.id}
            className="desk-icon"
            onDoubleClick={() => handleDblClick(app.id)}
            title={`Double-click to open ${app.label}`}
            style={{ opacity: openWindows.has(app.id) ? 0.6 : 1 }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 15, fontSize: 26,
              background: app.grad,
              boxShadow: `0 8px 24px ${app.shadow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: bouncing === app.id ? 'scale(0.88)' : 'scale(1)',
              transition: 'transform .15s',
            }}>
              {app.emoji}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, color: 'rgba(220,215,255,0.65)',
              textAlign: 'center', textShadow: '0 1px 6px rgba(0,0,0,0.9)',
            }}>
              {app.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Get-started hint ── */}
      {openWindows.size === 0 && (
        <div style={{ position: 'absolute', bottom: 92, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 12, color: '#252545', fontWeight: 500 }}>
            Double-click desktop icons · or tap the taskbar icons below
          </div>
        </div>
      )}

    </div>
  );
};

export default Desktop;