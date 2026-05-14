/**
 * Op_Viewer3D.jsx
 * Operation: 3D Conformation
 * Renders one MolViewer3D card per molecule.
 * Props: { molecules: Array<{ smiles, label }> }
 *
 * Pattern: molecules are stored in local state (initialised from prop) so that
 * $3Dmol.createViewer always receives a stable, freshly-mounted DOM node —
 * the same approach used in the confirmed-working standalone implementation.
 */

import { useState } from 'react';
import MolViewer3D from './MolViewer3D';
import { cardStyle, cardLabelStyle, smilesTagStyle } from './opStyles';

const Op_Viewer3D = ({ molecules: initialMolecules }) => {
  // Lazy-init from prop. Because ChemInformatics mounts us with key={runKey},
  // this useState always re-initialises fresh on every Run click.
  const [molecules] = useState(() => initialMolecules);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {molecules.map((m, i) => (
        // key=smiles guarantees a unique MolViewer3D instance per molecule,
        // so $3Dmol.createViewer always gets a new, empty DOM node.
        <div key={m.smiles || i} style={cardStyle}>
          <div style={cardLabelStyle}>{m.label || `Molecule ${i + 1}`}</div>
          <MolViewer3D smiles={m.smiles || ''} />
          <code style={smilesTagStyle}>{m.smiles}</code>
        </div>
      ))}
    </div>
  );
};

export default Op_Viewer3D;
