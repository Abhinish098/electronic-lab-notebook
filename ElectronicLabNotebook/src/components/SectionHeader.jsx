/**
 * SectionHeader.jsx
 * Reusable module / panel header with icon badge, title and subtitle.
 * Props:
 *   icon        {string}  — emoji or character
 *   title       {string}
 *   subtitle    {string}  — optional descriptive line
 *   accentColor {string}  — CSS colour token (default violet)
 */

const SectionHeader = ({
  icon,
  title,
  subtitle,
  accentColor = '#7c6af7',
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
    {/* Icon Badge */}
    <div style={{
      width: 34,
      height: 34,
      borderRadius: 9,
      fontSize: 17,
      background: `${accentColor}22`,
      border: `1px solid ${accentColor}33`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </div>

    {/* Text */}
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: accentColor }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: '#5050a0' }}>{subtitle}</div>
      )}
    </div>
  </div>
);

export default SectionHeader;