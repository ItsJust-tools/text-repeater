export type SeparatorMode = 'newline' | 'space' | 'comma' | 'none' | 'custom';

export type NumberingStyle = 'none' | '1.' | '01-' | '[1]';

export type CaseMode = 'asis' | 'upper' | 'lower';

export interface ToolState {
  /** The text to repeat. */
  text: string;
  /** How many times to repeat. */
  count: number;
  /** Separator placed between repetitions. */
  separatorMode: SeparatorMode;
  /** Custom separator used when separatorMode is 'custom'. */
  customSeparator: string;
  /** Numbering style applied per repetition. */
  numbering: NumberingStyle;
  /** First repetition number. */
  numberStart: number;
  /** Zero-pad numbers to this width (minimum 1). */
  numberPad: number;
  /** Repetitions per output line/block (0 = keep separators only). */
  groupSize: number;
  /** Prefix wrapped around each repetition. */
  prefix: string;
  /** Suffix wrapped around each repetition. */
  suffix: string;
  /** Case applied to the final output. */
  caseMode: CaseMode;
}

export const MIN_COUNT = 0;
export const MAX_COUNT = 10000;

export const DEFAULT_STATE: ToolState = {
  text: 'Hello!',
  count: 3,
  separatorMode: 'newline',
  customSeparator: '',
  numbering: 'none',
  numberStart: 1,
  numberPad: 1,
  groupSize: 0,
  prefix: '',
  suffix: '',
  caseMode: 'asis',
};

export interface RepeatResult {
  /** The generated output (case applied). */
  output: string;
  /** Error message when state is invalid, otherwise null. */
  error: string | null;
  /** Number of repetitions actually generated (0 on error). */
  repetitions: number;
  /** Character count of the output. */
  charCount: number;
  /** Line count of the output. */
  lineCount: number;
}
