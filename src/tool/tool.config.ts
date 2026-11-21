import type { ToolConfig, ToolTheme } from '@itsjust/core';

const toolTheme: ToolTheme = {
  brand: 'Text Repeater & Multiplier',
  accent: '#10b981',
};

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
  theme: toolTheme,
};

export default toolConfig;
