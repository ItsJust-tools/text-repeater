'use client';

import { MAX_COUNT } from '../types';

interface ToolSidebarProps {
  text?: string;
  fontSize?: number;
  onFontSizeChange?: (delta: number) => void;
}

export function ToolSidebar({ text, fontSize, onFontSizeChange }: ToolSidebarProps) {
  const chars = (text ?? '').length;

  return (
    <div className="converter-sidebar" data-testid="text-repeater-sidebar">
      <div className="sidebar-section">
        <h3>Input Stats</h3>
        <dl className="stats-list">
          <div className="stat-row">
            <dt>Characters</dt>
            <dd>{chars.toLocaleString()}</dd>
          </div>
          <div className="stat-row">
            <dt>Font size</dt>
            <dd>
              <button
                type="button"
                aria-label="Decrease font size"
                onClick={() => onFontSizeChange?.(-2)}
                className="mr-2 rounded border border-gray-300 px-2 text-xs dark:border-gray-700"
              >
                A-
              </button>
              <span className="font-mono text-xs">{fontSize ?? 16}px</span>
              <button
                type="button"
                aria-label="Increase font size"
                onClick={() => onFontSizeChange?.(2)}
                className="ml-2 rounded border border-gray-300 px-2 text-xs dark:border-gray-700"
              >
                A+
              </button>
            </dd>
          </div>
          <div className="stat-row">
            <dt>Max repetitions</dt>
            <dd>{MAX_COUNT.toLocaleString()}</dd>
          </div>
        </dl>
      </div>
      <div className="sidebar-section">
        <h3>How it works</h3>
        <p className="text-xs leading-relaxed">
          Each repetition can be numbered, wrapped with a prefix/suffix, joined by a separator, and
          grouped N per line. Output case can be forced to upper or lower.
        </p>
      </div>
    </div>
  );
}
