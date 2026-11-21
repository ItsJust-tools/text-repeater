import { describe, it, expect } from 'vitest';
import {
  textRepeaterTool,
  repeatText,
  buildRepetition,
  validateState,
} from '../../src/tool/tool-definition';
import { DEFAULT_STATE, MAX_COUNT } from '../../src/tool/types';
import type { ToolState } from '../../src/tool/types';

const state = (patch: Partial<ToolState> = {}): ToolState => ({ ...DEFAULT_STATE, ...patch });

describe('repeatText basics', () => {
  it('repeats text N times with newline separator', () => {
    const r = repeatText(state({ text: 'hi', count: 3 }));
    expect(r.output).toBe('hi\nhi\nhi');
    expect(r.repetitions).toBe(3);
    expect(r.error).toBeNull();
  });

  it('handles zero repetitions', () => {
    const r = repeatText(state({ count: 0 }));
    expect(r.output).toBe('');
    expect(r.repetitions).toBe(0);
    expect(r.error).toBeNull();
  });

  it('rejects negative and non-integer counts', () => {
    expect(repeatText(state({ count: -1 })).error).toMatch(/Count must be/);
    expect(repeatText(state({ count: 1.5 })).error).toMatch(/Count must be/);
    expect(repeatText(state({ count: MAX_COUNT + 1 })).error).toMatch(/Count must be/);
  });

  it('rejects negative group size and non-integer start number', () => {
    expect(repeatText(state({ groupSize: -2 })).error).toMatch(/Group size/);
    expect(repeatText(state({ numberStart: 0.5, numbering: '1.' })).error).toMatch(/Start number/);
  });
});

describe('separators and joining', () => {
  it('uses space, comma and none separators', () => {
    expect(repeatText(state({ text: 'a', count: 3, separatorMode: 'space' })).output).toBe('a a a');
    expect(repeatText(state({ text: 'a', count: 3, separatorMode: 'comma' })).output).toBe('a,a,a');
    expect(repeatText(state({ text: 'a', count: 3, separatorMode: 'none' })).output).toBe('aaa');
  });

  it('uses a custom separator', () => {
    const r = repeatText(state({ text: 'x', count: 3, separatorMode: 'custom', customSeparator: ' | ' }));
    expect(r.output).toBe('x | x | x');
  });
});

describe('numbering', () => {
  it('formats numbering styles with start offset', () => {
    const base: Partial<ToolState> = { text: 'row', count: 3, numbering: '1.', numberStart: 10, separatorMode: 'newline' };
    expect(repeatText(state(base)).output).toBe('10.row\n11.row\n12.row');
    expect(
      repeatText(state({ ...base, numbering: '[1]' as ToolState['numbering'] })).output
    ).toBe('[10]row\n[11]row\n[12]row');
  });

  it('zero-pads with numberPad', () => {
    expect(
      repeatText(
        state({ text: 'x', count: 2, numbering: '01-', numberStart: 7, numberPad: 3, separatorMode: 'none' })
      ).output
    ).toBe('007-x008-x');
  });

  it('buildRepetition wraps prefix/suffix around numbered body', () => {
    const s = state({ numbering: '1.', prefix: '<', suffix: '>', numberStart: 2 });
    expect(buildRepetition('hi', 0, s)).toBe('<2.hi>');
  });

  it('does not number when numbering is none', () => {
    expect(buildRepetition('hi', 0, state({ prefix: '<', suffix: '>' }))).toBe('<hi>');
  });
});

describe('grouping, wrapping and case', () => {
  it('groups repetitions per line using separator inside groups', () => {
    const r = repeatText(
      state({ text: 'a', count: 5, separatorMode: 'comma', groupSize: 2 })
    );
    expect(r.output).toBe('a,a\na,a\na');
    expect(r.lineCount).toBe(3);
  });

  it('applies prefix and suffix per repetition before joining', () => {
    expect(
      repeatText(state({ text: 'hi', count: 2, prefix: '[', suffix: ']', separatorMode: 'space' })).output
    ).toBe('[hi] [hi]');
  });

  it('applies case mode after joining', () => {
    expect(repeatText(state({ text: 'Ab', count: 2, caseMode: 'upper', separatorMode: 'none' })).output).toBe('ABAB');
    expect(repeatText(state({ text: 'aB', count: 1, caseMode: 'lower' })).output).toBe('ab');
    expect(repeatText(state({ text: 'aB', count: 1, caseMode: 'asis' })).output).toBe('aB');
  });
});

describe('serialize/deserialize', () => {
  it('roundtrips full state', () => {
    const s = state({
      text: 'Te\nxt',
      count: 42,
      separatorMode: 'custom',
      customSeparator: '::',
      numbering: '01-',
      numberStart: 5,
      numberPad: 4,
      groupSize: 3,
      prefix: 'p:',
      suffix: ':s',
      caseMode: 'upper',
    });
    const deserialized = textRepeaterTool.deserialize(JSON.parse(textRepeaterTool.serialize(s)));
    expect(deserialized).toEqual({ success: true, data: s });
  });

  it('rejects invalid payloads', () => {
    expect(textRepeaterTool.deserialize(null).success).toBe(false);
    expect(textRepeaterTool.deserialize('nope').success).toBe(false);
    expect(textRepeaterTool.deserialize({ count: 1 }).success).toBe(false);
    expect(textRepeaterTool.deserialize({ text: 'x', count: -3 }).success).toBe(false);
    expect(textRepeaterTool.deserialize({ text: 'x', count: MAX_COUNT + 5 }).success).toBe(false);
  });

  it('defaults invalid optional fields', () => {
    const r = textRepeaterTool.deserialize({
      text: 'x',
      count: 2,
      separatorMode: 'wat',
      numbering: 9,
      caseMode: 'SHOUT',
      numberPad: 0,
      groupSize: -1,
    });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.separatorMode).toBe(DEFAULT_STATE.separatorMode);
    expect(r.data.numbering).toBe(DEFAULT_STATE.numbering);
    expect(r.data.caseMode).toBe(DEFAULT_STATE.caseMode);
    expect(r.data.numberPad).toBe(DEFAULT_STATE.numberPad);
    expect(r.data.groupSize).toBe(DEFAULT_STATE.groupSize);
  });

  it('initialState matches DEFAULT_STATE', () => {
    expect(textRepeaterTool.initialState).toEqual(DEFAULT_STATE);
  });
});

describe('validateState', () => {
  it('accepts the default state', () => {
    expect(validateState(DEFAULT_STATE)).toBeNull();
  });
  it('reports count and group problems', () => {
    expect(validateState(state({ count: 2.5 }))).toMatch(/Count/);
    expect(validateState(state({ groupSize: -1 }))).toMatch(/Group size/);
  });
});
