/**
 * MolWeightCalc.jsx
 * Parses a chemical formula string and computes molecular weight
 * with a per-element contribution breakdown table.
 * Pure client-side calculation — no API call required.
 * Hook up ENDPOINTS.MOL_WEIGHT if server-side validation is needed.
 */

import { useState } from 'react';
import SectionHeader from '@/components/SectionHeader';
import ApiNote       from '@/components/ApiNote';
import { ENDPOINTS } from '@/api/endpoints';

/** Atomic masses (g/mol) for common elements in biochemistry. */
const ATOMIC_MASS = {
  C: 12.011, H: 1.008,  O: 15.999, N: 14.007,
  S: 32.06,  P: 30.974, F: 18.998, Cl: 35.45,
  Br: 79.904, I: 126.9,
};

const MolWeightCalc = () => {
  const [formula, setFormula] = useState('C6H12O6');
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');

  const calculate = () => {
    setError('');
    setResult(null);
    let total = 0;
    const breakdown = [];
    const matches = [...formula.matchAll(/([A-Z][a-z]?)(\d*)/g)];

    if (!matches.length) {
      setError('Could not parse formula. Use standard notation, e.g. C6H12O6.');
      return;
    }

    for (const [, el, cnt] of matches) {
      if (!ATOMIC_MASS[el]) {
        setError(`Unknown element: "${el}". Supported: ${Object.keys(ATOMIC_MASS).join(', ')}`);
        return;
      }
      const n    = parseInt(cnt) || 1;
      const mass = ATOMIC_MASS[el] * n;
      total += mass;
      breakdown.push({ el, n, atomicMass: ATOMIC_MASS[el], contribution: mass.toFixed(3) });
    }

    setResult({ total: total.toFixed(4), breakdown });
  };

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto' }}>
      <SectionHeader
        icon="⚖️"
        title="Molecular Weight Calculator"
        subtitle="From chemical formula to exact MW with element breakdown"
        accentColor="#a590ff"
      />

      {/* Formula Input */}
      <input
        className="eln-input"
        value={formula}
        onChange={e => { setFormula(e.target.value); setResult(null); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && calculate()}
        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, letterSpacing: '0.05em', fontWeight: 500 }}
        placeholder="C2H5OH"
      />

      {error && (
        <div style={{ fontSize: 12, color: '#f76a6a', background: 'rgba(247,106,106,0.08)', borderRadius: 8, padding: '7px 12px' }}>
          ⚠️ {error}
        </div>
      )}

      <button
        className="eln-btn eln-btn-solid"
        onClick={calculate}
        style={{ alignSelf: 'flex-start' }}
      >
        Calculate MW
      </button>

      {/* Result */}
      {result && (
        <div className="eln-window" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* MW Display */}
          <div style={{ padding: '16px 20px', background: 'rgba(124,106,247,0.08)', borderRadius: 10, border: '1px solid rgba(124,106,247,0.2)' }}>
            <div style={{ fontSize: 11, color: '#6060a0', marginBottom: 4 }}>Molecular Weight</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#7c6af7', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>
              {result.total}
              <span style={{ fontSize: 14, color: '#5050a0', fontWeight: 400, marginLeft: 8 }}>g/mol</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <table className="eln-table">
            <thead>
              <tr>
                <th>Element</th>
                <th>Count</th>
                <th>Atomic Mass (g/mol)</th>
                <th>Contribution (g/mol)</th>
              </tr>
            </thead>
            <tbody>
              {result.breakdown.map((b, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#a590ff' }}>{b.el}</td>
                  <td>{b.n}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{b.atomicMass}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#4ecdc4' }}>{b.contribution}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <ApiNote endpoint={ENDPOINTS.MOL_WEIGHT} />
        </div>
      )}
    </div>
  );
};

export default MolWeightCalc;