'use client';

import React from 'react';
import { repeatText } from '../tool-definition';
import {
  DEFAULT_STATE,
  MAX_COUNT,
  type CaseMode,
  type NumberingStyle,
  type SeparatorMode,
  type ToolState,
} from '../types';

interface CanvasProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
}

const SEPARATOR_OPTIONS: { value: SeparatorMode; label: string }[] = [
  { value: 'newline', label: 'Newline' },
  { value: 'space', label: 'Space' },
  { value: 'comma', label: 'Comma' },
  { value: 'none', label: 'None' },
  { value: 'custom', label: 'Custom' },
];

const NUMBERING_OPTIONS: { value: NumberingStyle; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: '1.', label: '1. 2. 3.' },
  { value: '01-', label: '01- 02- 03-' },
  { value: '[1]', label: '[1] [2] [3]' },
];

const CASE_OPTIONS: { value: CaseMode; label: string }[] = [
  { value: 'asis', label: 'As-is' },
  { value: 'upper', label: 'UPPER' },
  { value: 'lower', label: 'lower' },
];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  }, [value]);
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label={label}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export const Canvas: React.FC<CanvasProps> = ({ state, onChange }) => {
  const result = React.useMemo(() => repeatText(state), [state]);
  const update = (patch: Partial<ToolState>) => onChange({ ...state, ...patch });

  const handleDownload = React.useCallback(() => {
    if (!result.output) return;
    const blob = new Blob([result.output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repeated-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [result.output]);

  const inputClass =
    'rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100';

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full" data-testid="text-repeater-canvas">
      <div className="grid gap-2">
        <label
          htmlFor="repeat-text"
          className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
        >
          Text
        </label>
        <textarea
          id="repeat-text"
          data-testid="repeat-text"
          value={state.text}
          onChange={(e) => update({ text: e.target.value })}
          rows={3}
          placeholder="Text to repeat"
          className={`w-full ${inputClass}`}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="repeat-count"
            className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Count (0–{MAX_COUNT})
          </label>
          <input
            id="repeat-count"
            data-testid="repeat-count"
            type="number"
            min={0}
            max={MAX_COUNT}
            step={1}
            value={Number.isInteger(state.count) ? String(state.count) : ''}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (raw === '') return;
              const n = Number(raw);
              if (!Number.isNaN(n)) update({ count: n });
            }}
            className={`w-28 ${inputClass}`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="repeat-separator"
            className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Separator
          </label>
          <select
            id="repeat-separator"
            data-testid="repeat-separator"
            value={state.separatorMode}
            onChange={(e) => update({ separatorMode: e.target.value as SeparatorMode })}
            className={inputClass}
          >
            {SEPARATOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {state.separatorMode === 'custom' ? (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="repeat-custom-separator"
              className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Custom separator
            </label>
            <input
              id="repeat-custom-separator"
              data-testid="repeat-custom-separator"
              type="text"
              value={state.customSeparator}
              onChange={(e) => update({ customSeparator: e.target.value })}
              className={`w-32 font-mono ${inputClass}`}
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="repeat-numbering"
            className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Numbering
          </label>
          <select
            id="repeat-numbering"
            data-testid="repeat-numbering"
            value={state.numbering}
            onChange={(e) => update({ numbering: e.target.value as NumberingStyle })}
            className={inputClass}
          >
            {NUMBERING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {state.numbering !== 'none' ? (
          <>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="repeat-number-start"
                className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
              >
                Start # / padding
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="repeat-number-start"
                  data-testid="repeat-number-start"
                  type="number"
                  step={1}
                  value={String(state.numberStart)}
                  onChange={(e) => {
                    const n = Number(e.target.value.trim());
                    if (!Number.isNaN(n)) update({ numberStart: n });
                  }}
                  className={`w-20 ${inputClass}`}
                />
                <input
                  aria-label="Number padding width"
                  data-testid="repeat-number-pad"
                  type="number"
                  min={1}
                  step={1}
                  value={String(state.numberPad)}
                  onChange={(e) => {
                    const n = Number(e.target.value.trim());
                    if (!Number.isNaN(n) && n >= 1) update({ numberPad: n });
                  }}
                  className={`w-16 ${inputClass}`}
                />
              </div>
            </div>
          </>
        ) : null}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="repeat-group-size"
            className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Group size (0 = off)
          </label>
          <input
            id="repeat-group-size"
            data-testid="repeat-group-size"
            type="number"
            min={0}
            step={1}
            value={String(state.groupSize)}
            onChange={(e) => {
              const n = Number(e.target.value.trim());
              if (!Number.isNaN(n) && n >= 0) update({ groupSize: n });
            }}
            className={`w-24 ${inputClass}`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="repeat-case"
            className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Case
          </label>
          <select
            id="repeat-case"
            data-testid="repeat-case"
            value={state.caseMode}
            onChange={(e) => update({ caseMode: e.target.value as CaseMode })}
            className={inputClass}
          >
            {CASE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="repeat-prefix"
            className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Prefix
          </label>
          <input
            id="repeat-prefix"
            data-testid="repeat-prefix"
            type="text"
            value={state.prefix}
            onChange={(e) => update({ prefix: e.target.value })}
            className={`w-32 font-mono ${inputClass}`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="repeat-suffix"
            className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            Suffix
          </label>
          <input
            id="repeat-suffix"
            data-testid="repeat-suffix"
            type="text"
            value={state.suffix}
            onChange={(e) => update({ suffix: e.target.value })}
            className={`w-32 font-mono ${inputClass}`}
          />
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT_STATE, text: '' })}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Reset
        </button>
      </div>

      {result.error ? (
        <div
          role="alert"
          data-testid="repeat-error"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {result.error}
        </div>
      ) : (
        <div
          className="flex items-center justify-between gap-3 rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2"
          data-testid="repeat-result"
        >
          <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
            Output ({result.repetitions} reps · {result.charCount} chars · {result.lineCount} lines)
          </span>
          <div className="flex items-center gap-2">
            <CopyButton label="Copy repeated output" value={result.output} />
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Download repeated output as txt"
              className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Download
            </button>
          </div>
        </div>
      )}
      {!result.error ? (
        <pre
          data-testid="repeat-preview"
          className="whitespace-pre-wrap break-all rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2 font-mono text-sm text-gray-900 dark:text-gray-100 max-h-96 overflow-y-auto"
        >
          {result.output || '—'}
        </pre>
      ) : null}
    </div>
  );
};
