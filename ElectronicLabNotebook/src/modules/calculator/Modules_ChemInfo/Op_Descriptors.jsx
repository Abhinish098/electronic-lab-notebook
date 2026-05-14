/**
 * Op_Descriptors.jsx
 * Operation: Molecular Descriptors
 * Renders MolDetailCall (SVG + property list) per molecule.
 * Props: { molecules: Array<{ smiles, label }> }
 */

import MolDetailCall from './MolDetailCall';
import { cardLabelStyle } from './opStyles';

const Op_Descriptors = ({ molecules }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    {molecules.map((m, i) => (
      <div key={i}>
        <div style={cardLabelStyle}>{m.label || `Molecule ${i + 1}`}</div>
        <MolDetailCall smiles={m.smiles} />
      </div>
    ))}
  </div>
);

export default Op_Descriptors;
