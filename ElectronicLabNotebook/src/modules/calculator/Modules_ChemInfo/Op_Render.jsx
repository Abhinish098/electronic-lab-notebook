/**
 * Op_Render.jsx
 * Operation: 2D Structure Render
 * Renders one MolCanvas2D card per molecule.
 * Props: { molecules: Array<{ smiles, label }> }
 */

import MolCanvas2D from './MolCanvas2D';
import { cardStyle, cardLabelStyle, smilesTagStyle } from './opStyles';

const Op_Render = ({ molecules }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
    {molecules.map((m, i) => (
      <div key={i} style={cardStyle}>
        <div style={cardLabelStyle}>{m.label || `Molecule ${i + 1}`}</div>
        <MolCanvas2D smiles={m.smiles} />
        <code style={smilesTagStyle}>{m.smiles}</code>
      </div>
    ))}
  </div>
);

export default Op_Render;
