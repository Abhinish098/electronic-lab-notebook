/**
 * CalculatorApp.jsx
 * Root of the Calculator module.
 * Sidebar navigation routes between the three scientific tools.
 * To add a new tool: import it and push an entry into TOOLS.
 */

import { useState } from 'react';
import ProteinAnalyzer from './ProteinAnalyzer';
import MolWeightCalc   from './MolWeightCalc';
import DilutionCalc    from './DilutionCalc';

const TOOLS = [
  { id: 'protein',   label: 'Protein Analyser', icon: '🧬', component: ProteinAnalyzer },
  { id: 'molweight', label: 'Mol. Weight',       icon: '⚖️', component: MolWeightCalc   },
  { id: 'dilution',  label: 'Dilution Calc',     icon: '💧', component: DilutionCalc    },
];

const CalculatorApp = () => {
  const [active, setActive] = useState('protein');

  const ActiveTool = TOOLS.find(t => t.id === active)?.component ?? null;

  return (
    <div style={{ display: 'flex', height: '100%' }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: 165,
        borderRight: '1px solid rgba(100,80,200,0.1)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        <div style={{
          fontSize: 10,
          color: '#5050a0',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          padding: '4px 8px',
          marginBottom: 4,
        }}>
          Lab Tools
        </div>

        {TOOLS.map(t => (
          <div
            key={t.id}
            className={`eln-sidebar-item ${active === t.id ? 'active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span>{t.label}</span>
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: '10px 8px' }}>
          <div style={{ fontSize: 10, color: '#303050', lineHeight: 1.6 }}>
            🔬 Bio Calculator Suite<br />
            <span style={{ color: '#282845' }}>v1.0 · FastAPI ready</span>
          </div>
        </div>
      </div>

      {/* ── Tool Content ── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {ActiveTool && <ActiveTool />}
      </div>

    </div>
  );
};

export default CalculatorApp;