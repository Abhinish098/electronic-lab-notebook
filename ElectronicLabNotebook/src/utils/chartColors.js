/**
 * chartColors.js
 * Central palette used across every Recharts instance.
 * Extend or swap colours here to retheme all charts at once.
 */

export const CHART_COLORS = [
  '#7c6af7', // violet  (primary)
  '#4ecdc4', // teal
  '#f7c66a', // amber
  '#f76a6a', // coral
  '#6af7a0', // mint
  '#f76af7', // fuchsia
  '#6aaff7', // sky
];

/** Convenience: pick a colour by index, wrapping around the palette. */
export const colorAt = (index) => CHART_COLORS[index % CHART_COLORS.length];