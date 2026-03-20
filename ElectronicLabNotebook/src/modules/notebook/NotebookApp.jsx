/**
 * NotebookApp.jsx
 * Root of the Notebook module.
 * Tab bar routes between White Pages and the three AI agents.
 * Adding a new agent: import it and push an entry into TABS.
 */

import { useState } from 'react';
import WhitePages          from './WhitePages';
import AutocompleteAgent   from '@/agents/AutocompleteAgent';
import TextToImageAgent    from '@/agents/TextToImageAgent';
import TextToTableAgent    from '@/agents/TextToTableAgent';

const TABS = [
  { id: 'whitepages',   label: 'White Pages',    icon: '📄', component: WhitePages        },
  { id: 'autocomplete', label: 'AI Autocomplete', icon: '✨', component: AutocompleteAgent },
  { id: 'texttoimage',  label: 'Text → Image',    icon: '🎨', component: TextToImageAgent  },
  { id: 'texttotable',  label: 'Text → Table',    icon: '📊', component: TextToTableAgent  },
];

const NotebookApp = () => {
  const [activeTab, setActiveTab] = useState('whitepages');

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Tab Bar ── */}
      <div style={{
        padding: '0 14px',
        borderBottom: '1px solid rgba(100,80,200,0.12)',
        display: 'flex',
        gap: 3,
        alignItems: 'flex-end',
        height: 40,
        overflowX: 'auto',
        flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`eln-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Active Panel ── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {ActiveComponent && <ActiveComponent />}
      </div>

    </div>
  );
};

export default NotebookApp;