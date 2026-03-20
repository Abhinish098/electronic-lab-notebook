/**
 * LoadingBar.jsx
 * Animated shimmer progress bar shown during any async operation.
 * Props:
 *   label {string} — human-readable operation name
 */

const LoadingBar = ({ label = 'Processing' }) => (
  <div style={{ padding: '16px 0' }}>
    <div
      className="eln-pulse"
      style={{
        fontSize: 12,
        color: '#7060c0',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span>⚙️</span> {label}…
    </div>

    <div style={{
      height: 3,
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 3,
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        borderRadius: 3,
        background: 'linear-gradient(90deg, #7c6af7, #4ecdc4, #7c6af7)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s linear infinite, progressBar 2.5s ease forwards',
      }} />
    </div>
  </div>
);

export default LoadingBar;