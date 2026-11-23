import type { Tool, DeserializeResult } from '@itsjust/core';
import toolConfig from './tool.config';
import {
  DEFAULT_STATE,
  MAX_COUNT,
  MIN_COUNT,
  type CaseMode,
  type NumberingStyle,
  type RepeatResult,
  type SeparatorMode,
  type ToolState,
} from './types';

const SEPARATOR_MODES: SeparatorMode[] = ['newline', 'space', 'comma', 'none', 'custom'];
const NUMBERING_STYLES: NumberingStyle[] = ['none', '1.', '01-', '[1]'];
const CASE_MODES: CaseMode[] = ['asis', 'upper', 'lower'];

function separatorFor(state: ToolState): string {
  switch (state.separatorMode) {
    case 'newline':
      return '\n';
    case 'space':
      return ' ';
    case 'comma':
      return ',';
    case 'none':
      return '';
    case 'custom':
      return state.customSeparator;
  }
}

function formatNumber(value: number, style: NumberingStyle, pad: number): string {
  const width = Math.max(1, Math.trunc(pad));
  const digits = String(value).padStart(width, '0');
  switch (style) {
    case 'none':
      return '';
    case '1.':
      return `${value}.`;
    case '01-':
      return `${digits}-`;
    case '[1]':
      return `[${value}]`;
  }
}

function applyCaseMode(text: string, caseMode: CaseMode): string {
  if (caseMode === 'upper') return text.toUpperCase();
  if (caseMode === 'lower') return text.toLowerCase();
  return text;
}

/**
 * Build one repetition string with its number, prefix and suffix applied.
 * Prefix/suffix wrap the (numbered) repetition body.
 */
export function buildRepetition(text: string, index: number, state: ToolState): string {
  const numberLabel = formatNumber(state.numberStart + index, state.numbering, state.numberPad);
  const body = `${numberLabel}${text}`;
  return `${state.prefix}${body}${state.suffix}`;
}

/** Validate numeric bounds of state; returns an error message or null. */
export function validateState(state: ToolState): string | null {
  if (!Number.isInteger(state.count) || state.count < MIN_COUNT) {
    return `Count must be an integer between ${MIN_COUNT} and ${MAX_COUNT}`;
  }
  if (state.count > MAX_COUNT) {
    return `Count must be an integer between ${MIN_COUNT} and ${MAX_COUNT}`;
  }
  if (!Number.isInteger(state.numberStart)) {
    return 'Start number must be an integer';
  }
  if (!Number.isInteger(state.groupSize) || state.groupSize < 0) {
    return 'Group size must be a non-negative integer';
  }
  return null;
}

/** Generate the repeated output for the state, or an error result. */
export function repeatText(state: ToolState): RepeatResult {
  const error = validateState(state);
  if (error) {
    return { output: '', error, repetitions: 0, charCount: 0, lineCount: 0 };
  }
  const items: string[] = [];
  for (let i = 0; i < state.count; i++) {
    items.push(buildRepetition(state.text, i, state));
  }
  const sep = separatorFor(state);
  let joined: string;
  if (state.groupSize > 0 && state.count > 0) {
    const groups: string[] = [];
    for (let i = 0; i < items.length; i += state.groupSize) {
      groups.push(items.slice(i, i + state.groupSize).join(sep));
    }
    joined = groups.join('\n');
  } else {
    joined = items.join(sep);
  }
  const output = applyCaseMode(joined, state.caseMode);
  const lineCount = output ? output.split('\n').length : 0;
  return {
    output,
    error: null,
    repetitions: state.count,
    charCount: output.length,
    lineCount,
  };
}

/** Canonical serialize: JSON of the full state. */
function serializeState(state: ToolState): string {
  return JSON.stringify(state);
}

/** Defensive deserialize with per-field clamping and defaults. */
function deserializeState(data: unknown): DeserializeResult<ToolState> {
  if (typeof data !== 'object' || data === null) {
    return {
      success: false,
      error: 'Invalid data format: expected { text: string, count: number, ... }',
    };
  }
  const v = data as Partial<ToolState>;
  const textOk = typeof v.text === 'string';
  const countOk =
    typeof v.count === 'number' &&
    Number.isInteger(v.count) &&
    v.count >= MIN_COUNT &&
    v.count <= MAX_COUNT;
  if (!textOk || !countOk) {
    return {
      success: false,
      error: 'Invalid data format: expected { text: string, count: number (0-10000), ... }',
    };
  }
  const separatorMode: SeparatorMode = SEPARATOR_MODES.includes(v.separatorMode as SeparatorMode)
    ? (v.separatorMode as SeparatorMode)
    : DEFAULT_STATE.separatorMode;
  const numbering: NumberingStyle = NUMBERING_STYLES.includes(v.numbering as NumberingStyle)
    ? (v.numbering as NumberingStyle)
    : DEFAULT_STATE.numbering;
  const caseMode: CaseMode = CASE_MODES.includes(v.caseMode as CaseMode)
    ? (v.caseMode as CaseMode)
    : DEFAULT_STATE.caseMode;
  const customSeparator =
    typeof v.customSeparator === 'string' ? v.customSeparator : DEFAULT_STATE.customSeparator;
  const prefix = typeof v.prefix === 'string' ? v.prefix : DEFAULT_STATE.prefix;
  const suffix = typeof v.suffix === 'string' ? v.suffix : DEFAULT_STATE.suffix;
  const numberStart =
    typeof v.numberStart === 'number' && Number.isInteger(v.numberStart)
      ? v.numberStart
      : DEFAULT_STATE.numberStart;
  const numberPad =
    typeof v.numberPad === 'number' && Number.isInteger(v.numberPad) && v.numberPad >= 1
      ? v.numberPad
      : DEFAULT_STATE.numberPad;
  const groupSize =
    typeof v.groupSize === 'number' && Number.isInteger(v.groupSize) && v.groupSize >= 0
      ? v.groupSize
      : DEFAULT_STATE.groupSize;
  return {
    success: true,
    data: {
      text: v.text as string,
      count: v.count as number,
      separatorMode,
      customSeparator,
      numbering,
      numberStart,
      numberPad,
      groupSize,
      prefix,
      suffix,
      caseMode,
    },
  };
}

export const textRepeaterTool: Tool<ToolState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: { ...DEFAULT_STATE },
  serialize: serializeState,
  deserialize: deserializeState,
  exporters: [
    { format: 'png', loader: () => import('./exporters/png') },
    { format: 'jpeg', loader: () => import('./exporters/jpeg') },
    { format: 'webp', loader: () => import('./exporters/webp') },
    { format: 'pdf', loader: () => import('./exporters/pdf') },
  ],
};
