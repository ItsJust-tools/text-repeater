import type { ToolConfig } from '@itsjust/core';

export const toolConfig: ToolConfig = {
  id: 'text-repeater',
  name: 'Text Repeater & Multiplier',
  description:
    'Repeat any text N times with configurable separators, numbering, wrapping and line grouping, plus copy and download.',
  version: '1.0.0',
  exportFormats: ['png', 'jpeg', 'webp', 'pdf'],
  features: {
    export: true,
    autoSave: true,
    undoRedo: true,
    sidebar: true,
    statusBar: true,
    darkMode: true,
  },
  theme: {
    accent: '#10b981',
    accentHover: '#059669',
    accentSubtle: 'rgba(16, 185, 129, 0.08)',
    brand: 'Text Repeater & Multiplier',
    icon: '\u{1F501}',
  },
};

export default toolConfig;
