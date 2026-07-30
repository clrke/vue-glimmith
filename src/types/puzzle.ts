import type { RuleName } from '../rules/types'

/**
 * Identifies a wall between two adjacent cells.
 *
 *   H:r,c  = vertical wall to the RIGHT of cell (r,c), separating (r,c) from (r,c+1)
 *   V:r,c  = horizontal wall BELOW cell (r,c), separating (r,c) from (r+1,c)
 *
 * All outer border walls are implied — only internal walls are stored.
 */
export type EdgeKey = string

/** A size clue: the cell's region must contain exactly `value` cells. */
export interface SizeClue {
  kind: 'size'
  value: number
}

/** Union of all clue types (extensible as new rule types are added). */
export type CellClue = SizeClue

/**
 * A puzzle definition.
 *
 * `fixedWalls` are pre-drawn walls the player cannot toggle. Internal walls the
 * player must figure out are left absent; players draw/erase them interactively.
 *
 * `clues[r][c]` is `null` if the cell carries no clue.
 *
 * `rules` lists which validators apply to this puzzle (registry keys from
 * `src/rules/index.ts`). Rules are opt-in per puzzle rather than globally
 * applied — different rule types conflict with each other's constraints in
 * general (e.g. a Size-Separation-violating layout can be a perfectly valid
 * Size-only solution), matching how the source game scopes rule types per
 * level rather than applying every rule everywhere.
 */
export interface Puzzle {
  id: string
  title: string
  /** Number of rows */
  n: number
  /** Number of columns */
  m: number
  /** Walls pre-drawn by the puzzle author (immutable). */
  fixedWalls: EdgeKey[]
  /** Per-cell clue data; n × m, null = no clue. */
  clues: (CellClue | null)[][]
  /** Registry keys of the rule validators active for this puzzle. */
  rules: RuleName[]
}
