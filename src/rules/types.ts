import type { CellClue } from '../types/puzzle'

/** Result of a single rule check on a single violated region/cell. */
export interface Violation {
  /** Cells to highlight in the UI (error or incomplete). */
  cells: [number, number][]
  /** Human-readable description. */
  message: string
  /** true = confirmed error; false = incomplete (could still be correct). */
  isError: boolean
}

/** Interface all rule validators must implement. */
export interface RuleValidator {
  readonly name: string
  validate(
    n: number,
    m: number,
    regionIds: readonly (readonly number[])[],
    clues: readonly (readonly (CellClue | null)[])[],
  ): Violation[]
}
