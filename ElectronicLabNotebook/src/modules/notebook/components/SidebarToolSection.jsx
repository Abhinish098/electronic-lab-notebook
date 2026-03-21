/**
 * SidebarToolSection.jsx
 * Collapsible accordion section pinned at the bottom of the notebook sidebar.
 *
 * Props:
 *   icon     {string}   — emoji
 *   label    {string}   — section heading
 *   expanded {boolean}
 *   onToggle {() => void}
 *   children {ReactNode}
 */

const SidebarToolSection = ({ icon, label, expanded, onToggle, children }) => (
  <div style={{ borderTop: '1px solid rgba(100,80,200,0.10)', flexShrink: 0 }}>

    {/* ── Header ── */}
    <div
      onClick={onToggle}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', userSelect: 'none', transition: 'background .15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,106,247,0.07)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#7070b0', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: 9, color: '#5050a0', display: 'inline-block', transition: 'transform .18s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
        ▲
      </span>
    </div>

    {/* ── Body ── */}
    {expanded && (
      <div style={{ padding: '4px 10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {children}
      </div>
    )}
  </div>
);

export default SidebarToolSection;