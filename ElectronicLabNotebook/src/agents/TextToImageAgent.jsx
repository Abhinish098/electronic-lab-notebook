/**
 * TextToImageAgent.jsx
 * Prompt → image generation for scientific visualisations.
 * Swap mockTextToImage() for a real POST to ENDPOINTS.TEXT_TO_IMAGE.
 */

import { useState, useEffect } from 'react';
import SectionHeader from '@/components/SectionHeader';
import LoadingBar    from '@/components/LoadingBar';
import ApiNote       from '@/components/ApiNote';
import { mockTextToImage, fetchImageHistory } from '@/services/mockServices';
import { ENDPOINTS } from '@/api/endpoints';

const TextToImageAgent = () => {
  const [prompt,   setPrompt]   = useState('');
  const [images,   setImages]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchImageHistory()
      .then(setImages)
      .catch(err => console.error('Failed to load image history:', err));
  }, []);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await mockTextToImage(prompt);
      console.log('result from mockTextToImage:', result);  // ← add this
      console.log('result.b64 type:', typeof result.b64);   // ← and this
      const entry = {
        url:       result.b64,        // ← extract b64 string, not the whole object
        dbId:      result.id,
        modelUsed: result.modelUsed,
        prompt,
        id:        Date.now(),
        ts:        new Date().toLocaleTimeString(),
      };
      setImages(prev => [entry, ...prev]);
      setPrompt('');
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
      <SectionHeader
        icon="🎨"
        title="Text → Image Agent"
        subtitle="Generate scientific visualisations from natural-language descriptions"
        accentColor="#f7c66a"
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="eln-input"
          style={{ flex: 1 }}
          placeholder="e.g. 3D protein folding diagram with alpha helices highlighted in blue…"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
        />
        <button className="eln-btn eln-btn-gold" onClick={generate} disabled={loading || !prompt.trim()}>
          {loading ? '⏳' : '🎨 Generate'}
        </button>
      </div>

      {loading && <LoadingBar label="Generating image" />}

      {images.length === 0 && !loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#303050' }}>
          <div style={{ fontSize: 48 }}>🖼️</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No images yet</div>
          <div style={{ fontSize: 12 }}>Describe a scientific scene above</div>
          <ApiNote endpoint={ENDPOINTS.TEXT_TO_IMAGE} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 12 }}>
        {images.map(img => (
          <div
            key={img.id}
            onClick={() => setSelected(selected?.id === img.id ? null : img)}
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              cursor: 'pointer',
              border: `1px solid ${selected?.id === img.id ? 'rgba(247,198,106,0.5)' : 'rgba(247,198,106,0.14)'}`,
              background: 'rgba(255,255,255,0.02)',
              transition: 'transform .18s, border-color .18s',
              transform: selected?.id === img.id ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <img
              key={img.dbId}
              src={img.url}
              alt={img.prompt}
              style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }}
            />
            <div style={{ padding: '7px 10px' }}>
              <div style={{ fontSize: 11, color: '#7060a0', lineHeight: 1.4 }}>
                {img.prompt.slice(0, 60)}{img.prompt.length > 60 ? '…' : ''}
              </div>
              <div style={{ fontSize: 10, color: '#404060', marginTop: 3 }}>{img.ts}</div>
            </div>
          </div>
        ))}
      </div>

      {images.length > 0 && <ApiNote endpoint={ENDPOINTS.TEXT_TO_IMAGE} />}
    </div>
  );
};

export default TextToImageAgent;