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
 * Parses CSV / TSV / semicolon-delimited text where the FIRST row is always
 * treated as the header row and all subsequent rows become data rows.
 *
 * Auto-detection priority: tab → semicolon → comma
 * Handles values quoted with double-quotes (RFC 4180 subset).
 *
 * @param {string} text - raw delimited text (first row = headers)
 * @returns {Promise<{ headers: string[], rows: string[][] } | null>}
 */
export const mockTextToTable = async (text) => {
  await delay(300);   // lighter delay — this is now pure client-side parsing

  // ── 1. Split into non-empty lines ─────────────────────────────────────────
  const lines = text.split('\n').map(l => l.trimEnd()).filter(l => l.trim());
  if (lines.length < 1) return null;

  // ── 2. Auto-detect delimiter from the first line ──────────────────────────
  const firstLine = lines[0];
  const delimiter =
    firstLine.includes('\t') ? '\t'  :
    firstLine.includes(';')  ? ';'   : ',';

  // ── 3. Split a single line, respecting double-quoted fields ───────────────
  const splitLine = (line) => {
    const cells = [];
    let cur = '';
    let inQuote = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        // Escaped quote inside quoted field ("" → ")
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuote = !inQuote; }
      } else if (ch === delimiter && !inQuote) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  // ── 4. First row → headers; remaining rows → data ─────────────────────────
  const headers = splitLine(lines[0]).map(h => h || '(empty)');
  const colCount = headers.length;

  const rows = lines.slice(1).map(line => {
    const cells = splitLine(line);
    // Pad short rows / trim long rows to match the header column count
    const normalised = Array.from({ length: colCount }, (_, i) => cells[i] ?? '');
    return normalised;
  });

  if (rows.length === 0) return null;

  return { headers, rows };
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