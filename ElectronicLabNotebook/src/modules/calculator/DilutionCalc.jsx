/**
 * DilutionCalc.jsx
 * Interactive C₁V₁ = C₂V₂ dilution calculator.
 * Fill any 3 of the 4 fields; the missing one is solved automatically.
 * Pure client-side logic — wire ENDPOINTS.DILUTION for audit-trail logging.
 */

import { useState } from 'react';
import SectionHeader from '@/components/SectionHeader';
import ApiNote       from '@/components/ApiNote';
import { ENDPOINTS } from '@/api/endpoints';

const FIELDS = [
  { key: 'c1', label: 'Stock Concentration (C₁)', unit: 'mM'  },
  { key: 'v1', label: 'Stock Volume (V₁)',         unit: 'mL'  },
  { key: 'c2', label: 'Final Concentration (C₂)',  unit: 'mM'  },
  { key: 'v2', label: 'Final Volume (V₂)',          unit: 'mL'  },
];

/** Solve C₁V₁ = C₂V₂ for the single empty field. Returns null if 0 or 2+ empty. */
const solve = ({ c1, v1, c2, v2 }) => {
  const empty = [c1, v1, c2, v2].filter(v => v === '').length;
  if (empty !== 1) return null;
  if (!c1) return { field: 'c1', value: ((+c2 * +v2) / +v1).toFixed(4) };
  if (!v1) return { field: 'v1', value: ((+c2 * +v2) / +c1).toFixed(4) };
  if (!c2) return { field: 'c2', value: ((+c1 * +v1) / +v2).toFixed(4) };
  if (!v2) return { field: 'v2', value: ((+c1 * +v1) / +c2).toFixed(4) };
  return null;
};

const DilutionCalc = () => {
  const [values, setValues] = useState({ c1: '', v1: '', c2: '', v2: '' });

  const handleChange = (field, raw) => {
    // Allow only numeric / empty input
    if (raw !== '' && isNaN(Number(raw))) return;
    setValues(prev => ({ ...prev, [field]: raw }));
  };

  const reset = () => setValues({ c1: '', v1: '', c2: '', v2: '' });

  const solved = solve(values);

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto' }}>
      <SectionHeader
        icon="💧"
        title="Dilution Calculator"
        subtitle="C₁V₁ = C₂V₂ — leave exactly one field empty to auto-solve"
        accentColor="#4ecdc4"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {FIELDS.map(f => {
          const isSolved = solved?.field === f.key;
          const displayValue = isSolved ? solved.value : values[f.key];

          return (
            <div key={f.key}>
              <div style={{ fontSize: 11, color: isSolved ? '#4ecdc4' : '#8080a0', marginBottom: 5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                {f.label}
                {isSolved && (
                  <span style={{ background: 'rgba(78,205,196,0.18)', borderRadius: 4, padding: '1px 6px', fontSize: 10, color: '#4ecdc4' }}>
                    ← Solved
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                <input
                  className="eln-input"
                  value={displayValue}
                  readOnly={isSolved}
                  onChange={e => handleChange(f.key, e.target.value)}
                  placeholder="?"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color: isSolved ? '#4ecdc4' : '#e2e2f0',
                    background: isSolved ? 'rgba(78,205,196,0.05)' : undefined,
                    borderColor: isSolved ? 'rgba(78,205,196,0.35)' : undefined,
                  }}
                />
                <span style={{ fontSize: 12, color: '#5050a0', whiteSpace: 'nowrap' }}>{f.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula display */}
      <div style={{ textAlign: 'center', padding: '10px 0', fontFamily: 'JetBrains Mono, monospace', fontSize: 17, color: '#404068', letterSpacing: '0.04em' }}>
        C₁ · V₁{' '}
        <span style={{ color: '#7c6af7' }}>=</span>
        {' '}C₂ · V₂
      </div>

      <button className="eln-btn" style={{ alignSelf: 'flex-start' }} onClick={reset}>
        ↺ Reset
      </button>

      <div style={{ background: 'rgba(78,205,196,0.05)', border: '1px solid rgba(78,205,196,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#6060a0' }}>
        💡 Fill in any <strong style={{ color: '#4ecdc4' }}>3</strong> values to automatically compute the unknown field.
      </div>

      <ApiNote endpoint={ENDPOINTS.DILUTION} />
    </div>
  );
};

export default DilutionCalc;