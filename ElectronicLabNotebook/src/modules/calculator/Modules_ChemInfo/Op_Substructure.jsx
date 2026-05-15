/**
 * Op_Substructure.jsx
 * Operation: Substructure Search
 * Renders SubstructureCall for each molecule against a SMARTS query.
 * Props: { molecules: Array<{ smiles, label }>, query: string }
 */

import SubstructureCall from './SubstructureCall';
import { cardLabelStyle } from './opStyles';

const Op_Substructure = ({ molecules, query }) => (
  <div style={{ display: '-webkit-inline-box', flexDirection: 'column', gap: 14 }}>
    {molecules.map((m, i) => (
      <div key={i}>
        <div style={cardLabelStyle}>{m.label || `Molecule ${i + 1}`}</div>
        <SubstructureCall smiles={m.smiles} query={query} />
      </div>
    ))}
  </div>
);

export default Op_Substructure;
