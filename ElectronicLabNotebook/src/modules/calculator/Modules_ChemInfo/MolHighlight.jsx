// src/components/SubstructureSearching&Highlighting/MolHighlight.jsx
import { useEffect, useState } from 'react';

const MolHighlight = ({ smiles, substructure }) => {
  const [svg, setSvg] = useState('');
  const [count, setCount] = useState(0);
  // --- NEW CODE START ---
  const [selectedIndex, setSelectedIndex] = useState(-1); // -1 means "Show All"
  // --- NEW CODE END ---

  useEffect(() => {
    if (!window.RDKit || !smiles || !substructure) {
      setSvg('');
      setCount(0);
      return;
    }

    const mol = window.RDKit.get_mol(smiles);
    const qmol = window.RDKit.get_qmol(substructure);

    if (mol && qmol) {
      const allMatchesRaw = mol.get_substruct_matches(qmol);
      let allMatches;
      try {
        allMatches = JSON.parse(allMatchesRaw || "[]");
        // If not an array, wrap it
        if (!Array.isArray(allMatches)) {
          if (allMatches && typeof allMatches === "object") {
            allMatches = [allMatches];
          } else {
            allMatches = [];
          }
        }
      } catch (e) {
        console.error("Failed to parse allMatchesRaw:", allMatchesRaw, e);
        allMatches = [];
      }
      setCount(allMatches.length);

      let mdetails;
      try {
        if (selectedIndex === -1) {
          // Try merging all atoms/bonds
          const allAtoms = [...new Set(allMatches.flatMap(m => m.atoms || []))];
          const allBonds = [...new Set(allMatches.flatMap(m => m.bonds || []))];
          mdetails = JSON.stringify({ atoms: allAtoms, bonds: allBonds });
          setSvg(mol.get_svg_with_highlights(mdetails));
        } else {
          mdetails = JSON.stringify(allMatches[selectedIndex]);
          setSvg(mol.get_svg_with_highlights(mdetails));
        }
      } catch (mergeErr) {
        console.warn("Merging all matches failed, falling back to first match or unhighlighted.", mergeErr);
        try {
          if (allMatches.length > 0) {
            mdetails = JSON.stringify(allMatches[0]);
            setSvg(mol.get_svg_with_highlights(mdetails));
          } else {
            setSvg(mol.get_svg());
          }
        } catch (finalErr) {
          console.error("All highlighting attempts failed.", finalErr);
          setSvg(mol.get_svg());
        }
      }
    } else {
      setSvg('');
      setCount(0);
    }
    
    mol?.delete();
    qmol?.delete();
  }, [smiles, substructure, selectedIndex]); // Added selectedIndex to dependency array

  return count > 0 ? (
    <section>
      {/* --- NEW DROPDOWN UI START --- */}
      <div style={{ marginBottom: '10px' }}>
        <label>Select Match: </label>
        <select 
          value={selectedIndex} 
          onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
        >
          <option value={-1}>All Matches ({count})</option>
          {[...Array(count)].map((_, i) => (
            <option key={i} value={i}>Match {i + 1}</option>
          ))}
        </select>
      </div>
      {/* --- NEW DROPDOWN UI END --- */}
      
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </section>
  ) : (
    <p>No match found</p>
  );
};

export default MolHighlight;
