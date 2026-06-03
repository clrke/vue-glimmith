/**
 * Size rule — Fillomino-style.
 *
 * A cell with a size clue of value k must belong to a region containing
 * exactly k cells. Multiple clue cells in the same region must all agree
 * on the same k; conflicting clues in one region are always an error.
 *
 * Outcome for a region containing one or more size clues:
 *   - region.size > k   → confirmed error (too large)
 *   - region.size === k → satisfied (no violation)
 *   - region.size < k   → incomplete (not yet an error — region might still grow)
 *   - mixed k values    → confirmed error (conflicting clues)
 */

import type { CellClue } from '../types/puzzle'
import type { RuleValidator, Violation } from './types'
import { regionCells } from '../solver/regions'

export const sizeRule: RuleValidator = {
  name: 'Size',

  validate(n, m, regionIds, clues): Violation[] {
    const violations: Violation[] = []
    const byRegion = regionCells(regionIds)

    // Gather clue cells grouped by region
    const regionClues = new Map<number, { r: number; c: number; value: number }[]>()
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < m; c++) {
        const clue = clues[r][c]
        if (clue?.kind === 'size') {
          const rid = regionIds[r][c]
          if (!regionClues.has(rid)) regionClues.set(rid, [])
          regionClues.get(rid)!.push({ r, c, value: clue.value })
        }
      }
    }

    for (const [rid, clueList] of regionClues) {
      const size = byRegion.get(rid)?.length ?? 0
      const cellList = byRegion.get(rid) ?? []

      // Conflicting clues in the same region
      const targetValues = new Set(clueList.map(cl => cl.value))
      if (targetValues.size > 1) {
        violations.push({
          cells: clueList.map(cl => [cl.r, cl.c]),
          message: `Conflicting size clues in one region: ${[...targetValues].sort().join(' vs ')}`,
          isError: true,
        })
        continue
      }

      const target = clueList[0].value

      if (size > target) {
        violations.push({
          cells: cellList,
          message: `Region is too large: ${size} cells (clue says ${target})`,
          isError: true,
        })
      } else if (size < target) {
        violations.push({
          cells: clueList.map(cl => [cl.r, cl.c]),
          message: `Region needs ${target - size} more cell${target - size !== 1 ? 's' : ''} (has ${size}, needs ${target})`,
          isError: false,
        })
      }
      // size === target → satisfied, no violation
    }

    return violations
  },
}
