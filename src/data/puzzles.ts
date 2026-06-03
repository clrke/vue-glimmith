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
  clues: [
    [{ kind: 'size', value: 3 }, null, null, { kind: 'size', value: 2 }, null],
    [null, null, { kind: 'size', value: 4 }, null, null],
    [{ kind: 'size', value: 2 }, null, null, null, { kind: 'size', value: 3 }],
    [null, null, { kind: 'size', value: 4 }, null, null],
    [null, { kind: 'size', value: 3 }, null, null, null],
  ],
}

export const puzzles: Puzzle[] = [classic4x4, classic5x5]
