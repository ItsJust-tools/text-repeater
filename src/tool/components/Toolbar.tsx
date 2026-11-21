'use client';

import React from 'react';
import type { ToolState } from '../types';

interface ToolbarProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
  onClear: () => void;
}

const QUICK_COUNTS: { count: number; label: string }[] = [
  { count: 5, label: '×5' },
  { count: 10, label: '×10' },
  { count: 50, label: '×50' },
  { count: 100, label: '×100' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ state, onChange, onClear }) => {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
      data-testid="text-repeater-toolbar"
    >
      <div className="flex items-center gap-1" role="group" aria-label="Quick repeat count">
        {QUICK_COUNTS.map(({ count, label }) => (
          <button
            key={count}
            type="button"
            onClick={() => onChange({ ...state, count })}
            aria-pressed={state.count === count}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              state.count === count
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
