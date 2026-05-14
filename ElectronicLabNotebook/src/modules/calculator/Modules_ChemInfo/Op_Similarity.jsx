/**
 * Op_Similarity.jsx
 * Operation: Tanimoto Similarity
 * Renders SimilarityCall for every unique pair of molecules.
 * Props: { molecules: Array<{ smiles, label }> }
 */

import SimilarityCall from './SimilarityCall';

const Op_Similarity = ({ molecules }) => {
  const pairs = [];
  for (let a = 0; a < molecules.length; a++) {
    for (let b = a + 1; b < molecules.length; b++) {
      pairs.push({ a: molecules[a], b: molecules[b] });
    }
  }

  if (pairs.length === 0) {
    return (
      <div style={{ fontSize: 12, color: '#5050a0' }}>
        Add at least 2 molecules to compare.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {pairs.map((p, i) => (
        <div key={i}>
          <div style={{ fontSize: 11, color: '#8080a0', marginBottom: 6, fontWeight: 600 }}>
            {p.a.label || p.a.smiles} vs {p.b.label || p.b.smiles}
          </div>
          <SimilarityCall smilesA={p.a.smiles} smilesB={p.b.smiles} />
        </div>
      ))}
    </div>
  );
};

export default Op_Similarity;
