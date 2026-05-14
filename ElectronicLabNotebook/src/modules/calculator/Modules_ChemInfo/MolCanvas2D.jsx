// src/components/MolCanvas2D.jsx
import { useEffect, useRef } from 'react';

const MolCanvas2D = ({ smiles }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!window.RDKit || !smiles || !canvasRef.current) return;

    const mol = window.RDKit.get_mol(smiles);
    if (mol) {
      // Draw directly to the HTML5 canvas
      mol.draw_to_canvas_with_highlights(canvasRef.current, "{}");
      mol.delete();
    }
  }, [smiles]);

  return <canvas ref={canvasRef} width="300" height="300" style={{ border: '1px solid #eee' }} />;
};

export default MolCanvas2D;
