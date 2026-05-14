/**
 * opStyles.js
 * Shared style tokens for all ChemInfo operation components.
 * Import from here to keep all ops visually consistent.
 */

export const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

export const cardLabelStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: '#7c6af7',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
};

export const smilesTagStyle = {
  fontSize: 10,
  color: '#5050a0',
  background: 'rgba(124,106,247,0.06)',
  borderRadius: 6,
  padding: '2px 6px',
  wordBreak: 'break-all',
};
