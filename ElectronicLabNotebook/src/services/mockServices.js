/**
 * mockServices.js
 * Drop-in mock implementations for every FastAPI endpoint.
 * Replace each function body with a real fetch() call once the backend is ready.
 *
 * Each function signature matches the expected production API contract so that
 * swapping mocks for real calls requires only a one-line change per function.
 */

// ── Notebook Agents ─────────────────────────────────────────────────────────

const AUTOCOMPLETE_POOL = [
  ' — showing statistically significant results (p < 0.001) under controlled conditions.',
  ' — analyzed via high-performance liquid chromatography confirming 97.3% purity.',
  ' — incubated at 37 °C for 48 h with continuous agitation at 150 rpm.',
  ' — compared against a validated control group; baseline measurements recorded.',
  ' — further replication needed to validate these preliminary observations.',
  ' — spectroscopic data consistent with the proposed molecular structure.',
  ' — yield calculated at 82.4% following purification by column chromatography.',
];

/**
 * mockAutocomplete
 * @param {string} text - current editor text
 * @returns {Promise<string>} - AI-generated suffix suggestion
 */
export const mockAutocomplete = async (text) => {
  await delay(700);
  return AUTOCOMPLETE_POOL[Math.floor(Math.random() * AUTOCOMPLETE_POOL.length)];
};

/**
 * mockTextToImage
 * @param {string} prompt - natural-language image description
 * @returns {Promise<string>} - URL of generated image
 */
export const mockTextToImage = async (prompt) => {
  await delay(1400);
  const seeds = [42, 137, 256, 512, 1024, 888, 333];
  const seed   = seeds[Math.floor(Math.random() * seeds.length)];
  return `https://picsum.photos/seed/${seed + prompt.length * 3}/400/300`;
};

/**
 * mockTextToTable
 * @param {string} text - raw delimited text
 * @returns {Promise<{ headers: string[], rows: string[][] } | null>}
 */
export const mockTextToTable = async (text) => {
  await delay(800);
  const lines = text.split('\n').filter(l => l.trim());
  if (!lines.length) return null;

  const UNITS   = ['mg/mL', 'μM', '°C', 'mM', 'rpm', 'nmol', 'kDa', 'pH'];
  const STATUSES = ['✅ Valid', '⚠️ Check', '✅ Valid', '✅ Valid', '❌ Invalid'];

  return {
    headers: ['Parameter', 'Value', 'Unit', 'Status'],
    rows: lines.slice(0, 10).map((line, i) => {
      const parts = line.split(/[,;:\t]/).map(p => p.trim());
      return [
        parts[0] || `Sample ${String.fromCharCode(65 + i)}`,
        parts[1] || (Math.random() * 100).toFixed(3),
        parts[2] || UNITS[i % UNITS.length],
        parts[3] || STATUSES[i % STATUSES.length],
      ];
    }),
  };
};

// ── Calculator ───────────────────────────────────────────────────────────────

/**
 * mockProteinAnalysis
 * @param {'pdb' | 'xtc+tpr'} type
 * @returns {Promise<object>} - analysis result payload
 */
export const mockProteinAnalysis = async (type) => {
  await delay(2200);

  if (type === 'pdb') {
    return {
      analysisType: 'RMSD Analysis',
      rmsd:      (Math.random() * 2.5 + 0.3).toFixed(3),
      residues:  Math.floor(Math.random() * 250 + 80),
      chains:    ['A', 'B'],
      resolution:(Math.random() * 2 + 1).toFixed(2),
      data: Array.from({ length: 25 }, (_, i) => ({
        frame: i * 4,
        rmsd:  parseFloat((Math.random() * 1.8 + 0.2).toFixed(3)),
      })),
    };
  }

  return {
    analysisType: 'MD Stability Analysis',
    avgRMSF:    (Math.random() * 1.2 + 0.15).toFixed(3),
    Rg:         (Math.random() * 2.5 + 14).toFixed(2),
    totalFrames: 5000,
    data: Array.from({ length: 25 }, (_, i) => ({
      time: i * 2,
      rmsf: parseFloat((Math.random() * 1.2 + 0.1).toFixed(3)),
      rg:   parseFloat((Math.random() * 1.5 + 14).toFixed(2)),
    })),
  };
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Promise-based delay utility */
const delay = (ms) => new Promise(r => setTimeout(r, ms));