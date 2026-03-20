/**
 * StatCard.jsx
 * Single metric display card used in Calculator & Dashboard modules.
 */

const StatCard = ({ label, value, color = '#7c6af7', icon }) => (
  <div style={{
    background: 'rgba(255,255,255,0.025)',
    borderRadius: 10,
    padding: '11px 14px',
    border: `1px solid ${color}28`,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }}>
    <div style={{
      fontSize: 10,
      color: '#6060a0',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    }}>
      {icon} {label}
    </div>
    <div style={{
      fontSize: 22,
      fontWeight: 700,
      color,
      fontFamily: 'JetBrains Mono, monospace',
      letterSpacing: '-0.02em',
    }}>
      {value}
    </div>
  </div>
);

export default StatCard;