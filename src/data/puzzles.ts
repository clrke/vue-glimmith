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
 * The intended solution (verified by the solvability tests in
 * `__tests__/puzzles.test.ts`):
 *
 *   A A A B B      Region A (3): (0,0)-(0,1)-(0,2)   clue at (0,1)
 *   C C D D B      Region B (3): (0,3)-(0,4)-(1,4)   clue at (0,4)
 *   C C D D E      Region C (4): (1,0)-(1,1)-(2,0)-(2,1)   clue at (1,0)
 *   F F G G E      Region D (4): (1,2)-(1,3)-(2,2)-(2,3)   clue at (1,3)
 *   F F G G E      Region E (3): (2,4)-(3,4)-(4,4)   clue at (3,4)
 *                  Region F (4): (3,0)-(3,1)-(4,0)-(4,1)   clue at (4,0)
 *                  Region G (4): (3,2)-(3,3)-(4,2)-(4,3)   clue at (4,3)
 *
 * The clue values sum to 3+3+4+4+3+4+4 = 25 = the full board, so every cell
 * belongs to a clued region. The previous clue set summed to only 21, which
 * left 4 cells that no clue could ever constrain — meaning the puzzle had no
 * "intended" solution at all and could only be completed by carving arbitrary
 * unclued filler regions. `puzzles.test.ts` now guards against that.
 */
const classic5x5: Puzzle = {
  id: 'classic-5',
  title: 'Classic 5×5',
  n: 5,
  m: 5,
  fixedWalls: [],
  rules: ['size'],
  clues: [
    [null, { kind: 'size', value: 3 }, null, null, { kind: 'size', value: 3 }],
    [{ kind: 'size', value: 4 }, null, null, { kind: 'size', value: 4 }, null],
    [null, null, null, null, null],
    [null, null, null, null, { kind: 'size', value: 3 }],
    [{ kind: 'size', value: 4 }, null, null, { kind: 'size', value: 4 }, null],
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
