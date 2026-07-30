/**
 * Size Separation rule.
 *
 * Verified against public walkthroughs of the source game (The Artisan of
 * Glimmith): "each neighboring region must have a different area" — i.e. no
 * two edge-adjacent regions may contain the same number of cells, regardless
 * of clues. This is a pure structural constraint on the region partition; it
 * doesn't require or read any clue data.
 *
 * Every equal-size adjacent pair is reported as a confirmed error — unlike
 * the Size rule's "too large" vs "still growing" distinction, there's no
 * partial/ambiguous state here: two regions either currently share an edge
 * and a size, or they don't, and that's directly checkable at any point.
 */

import type { RuleValidator, Violation } from './types'
import { regionCells } from '../solver/regions'

export const sizeSeparationRule: RuleValidator = {
  name: 'Size Separation',

  validate(n, m, regionIds): Violation[] {
    const violations: Violation[] = []
    const byRegion = regionCells(regionIds)
    const sizeOf = new Map<number, number>()
    for (const [rid, cellList] of byRegion) sizeOf.set(rid, cellList.length)

    const flaggedPairs = new Set<string>()

    function checkPair(ridA: number, ridB: number): void {
      if (ridA === ridB) return
      const key = ridA < ridB ? `${ridA}-${ridB}` : `${ridB}-${ridA}`
      if (flaggedPairs.has(key)) return

      const sizeA = sizeOf.get(ridA)
      const sizeB = sizeOf.get(ridB)
      if (sizeA === undefined || sizeB === undefined || sizeA !== sizeB) return

      flaggedPairs.add(key)
      violations.push({
        cells: [...(byRegion.get(ridA) ?? []), ...(byRegion.get(ridB) ?? [])],
        message: `Adjacent regions both have ${sizeA} cells — regions of equal size can't touch`,
        isError: true,
      })
    }

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < m; c++) {
        const rid = regionIds[r][c]
        if (c + 1 < m) checkPair(rid, regionIds[r][c + 1])
        if (r + 1 < n) checkPair(rid, regionIds[r + 1][c])
      }
    }

    return violations
  },
}
