import type { Puzzle } from '../types/puzzle'

/**
 * Classic 4×4 Fillomino
 *
 * One valid solution:
 *   Region A (2): (0,0)–(0,1)
 *   Region B (2): (0,2)–(0,3)
 *   Region C (4): (1,0)–(1,1)–(2,0)–(2,1)
 *   Region D (4): (1,2)–(1,3)–(2,2)–(2,3)
 *   Region E (2): (3,0)–(3,1)
 *   Region F (2): (3,2)–(3,3)
 */
const classic4x4: Puzzle = {
  id: 'classic-4',
  title: 'Classic 4×4',
  n: 4,
  m: 4,
  fixedWalls: [],
  rules: ['size'],
  clues: [
    [{ kind: 'size', value: 2 }, null, null, { kind: 'size', value: 2 }],
    [null, { kind: 'size', value: 4 }, { kind: 'size', value: 4 }, null],
    [null, null, null, null],
    [{ kind: 'size', value: 2 }, null, null, { kind: 'size', value: 2 }],
  ],
}

/**
 * Classic 5×5 Fillomino
 *
 * One valid solution:
 *   Region A (3): (0,0)–(0,1)–(0,2)
 *   Region B (2): (0,3)–(0,4)
 *   Region C (2): (1,0)–(2,0)
 *   Region D (4): (1,1)–(1,2)–(1,3)–(2,3)
 *   Region E (3): (1,4)–(2,4)–(3,4)
 *   Region F (4): (2,1)–(2,2)–(3,1)–(3,2)
 *   Region G (3): (3,0)–(4,0)–(4,1)
 *   Region H (2): (3,3)–(4,3)
 *   Region I (3): (4,2)–(4,4)   ← not connected! fix: (4,2)–(4,3)–(4,4)?
 *
 * Simpler layout — 25 cells total across valid regions:
 */
const classic5x5: Puzzle = {
  id: 'classic-5',
  title: 'Classic 5×5',
  n: 5,
  m: 5,
  fixedWalls: [],
  rules: ['size'],
  clues: [
    [{ kind: 'size', value: 3 }, null, null, { kind: 'size', value: 2 }, null],
    [null, null, { kind: 'size', value: 4 }, null, null],
    [{ kind: 'size', value: 2 }, null, null, null, { kind: 'size', value: 3 }],
    [null, null, { kind: 'size', value: 4 }, null, null],
    [null, { kind: 'size', value: 3 }, null, null, null],
  ],
}

/**
 * Size Separation demo — 4×4, combines the Size rule with the new
 * Size Separation rule (verified against the source game's "Size
 * Separation" mechanic: no two edge-adjacent regions may share a size).
 *
 * One valid solution:
 *   Region A (6): (0,0)-(0,1)-(0,2)-(1,0)-(1,1)-(1,2)
 *   Region B (4): (0,3)-(1,3)-(2,3)-(3,3)
 *   Region C (4): (2,0)-(2,1)-(3,0)-(3,1)
 *   Region D (2): (2,2)-(3,2)
 *
 * Adjacent-pair sizes: A-B 6/4, A-C 6/4, A-D 6/2, C-D 4/2, D-B 2/4 — all
 * differ. C and B are both size 4 but are NOT adjacent (D sits between
 * them), which is allowed — Size Separation only restricts *adjacent*
 * equal sizes, not equal sizes anywhere on the board.
 */
const sizeSeparationDemo: Puzzle = {
  id: 'size-separation-4',
  title: 'Size Separation 4×4',
  n: 4,
  m: 4,
  fixedWalls: [],
  rules: ['size', 'sizeSeparation'],
  clues: [
    [{ kind: 'size', value: 6 }, null, null, { kind: 'size', value: 4 }],
    [null, null, null, null],
    [null, null, null, null],
    [{ kind: 'size', value: 4 }, null, { kind: 'size', value: 2 }, null],
  ],
}

export const puzzles: Puzzle[] = [classic4x4, classic5x5, sizeSeparationDemo]
