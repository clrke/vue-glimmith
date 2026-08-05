import { describe, it, expect } from 'vitest'
import { sizeRule } from '../size'
import type { CellClue } from '../../types/puzzle'

/** Convenience: build an n×m clue grid from a sparse map of "r,c" → value. */
function clueGrid(n: number, m: number, entries: Record<string, number>): (CellClue | null)[][] {
  const grid: (CellClue | null)[][] = Array.from({ length: n }, () =>
    new Array<CellClue | null>(m).fill(null),
  )
  for (const [key, value] of Object.entries(entries)) {
    const [r, c] = key.split(',').map(Number)
    grid[r][c] = { kind: 'size', value }
  }
  return grid
}

describe('sizeRule', () => {
  it('reports no violation when a region matches its clue exactly', () => {
    // Whole 2×2 board is one region of 4 cells; clue says 4.
    const regionIds = [
      [0, 0],
      [0, 0],
    ]
    const violations = sizeRule.validate(2, 2, regionIds, clueGrid(2, 2, { '0,0': 4 }))
    expect(violations).toHaveLength(0)
  })

  it('flags an over-sized region as a confirmed error, highlighting the whole region', () => {
    // One region of 4 cells, but the clue says 2 — it can only shrink, so this is final.
    const regionIds = [
      [0, 0],
      [0, 0],
    ]
    const violations = sizeRule.validate(2, 2, regionIds, clueGrid(2, 2, { '0,0': 2 }))
    expect(violations).toHaveLength(1)
    expect(violations[0].isError).toBe(true)
    expect(violations[0].message).toMatch(/too large/)
    // The whole region is highlighted, not just the clue cell.
    expect(violations[0].cells).toHaveLength(4)
  })

  it('treats an under-sized region as incomplete, not an error', () => {
    // Region 0 is the left column (2 cells); clue says 4. It could still grow.
    const regionIds = [
      [0, 1],
      [0, 1],
    ]
    const violations = sizeRule.validate(2, 2, regionIds, clueGrid(2, 2, { '0,0': 4 }))
    expect(violations).toHaveLength(1)
    expect(violations[0].isError).toBe(false)
    expect(violations[0].message).toContain('needs 2 more cells')
    // Only the clue cell is highlighted while incomplete — the region isn't final yet.
    expect(violations[0].cells).toEqual([[0, 0]])
  })

  it('singularises the message when exactly one cell is missing', () => {
    // 1×2 board split in two; region 0 has 1 cell, clue says 2.
    const regionIds = [[0, 1]]
    const violations = sizeRule.validate(1, 2, regionIds, clueGrid(1, 2, { '0,0': 2 }))
    expect(violations).toHaveLength(1)
    expect(violations[0].message).toContain('needs 1 more cell (')
    expect(violations[0].message).not.toContain('more cells')
  })

  it('flags conflicting clues in the same region and suppresses the size check', () => {
    // One region of 4 cells carrying clues 2 and 3 — unsatisfiable regardless of size.
    const regionIds = [
      [0, 0],
      [0, 0],
    ]
    const violations = sizeRule.validate(2, 2, regionIds, clueGrid(2, 2, { '0,0': 2, '0,1': 3 }))
    // Exactly one violation: the conflict. No additional "too large" report for the same region.
    expect(violations).toHaveLength(1)
    expect(violations[0].isError).toBe(true)
    expect(violations[0].message).toMatch(/Conflicting size clues/)
    expect(violations[0].cells).toEqual([
      [0, 0],
      [0, 1],
    ])
  })

  it('accepts multiple clue cells in one region when they all agree', () => {
    const regionIds = [
      [0, 0],
      [0, 0],
    ]
    const violations = sizeRule.validate(2, 2, regionIds, clueGrid(2, 2, { '0,0': 4, '1,1': 4 }))
    expect(violations).toHaveLength(0)
  })

  it('ignores regions that contain no clues, whatever their size', () => {
    // Region 0 (left column) satisfies its clue of 2; region 1 is unclued and unconstrained.
    const regionIds = [
      [0, 1],
      [0, 1],
    ]
    const violations = sizeRule.validate(2, 2, regionIds, clueGrid(2, 2, { '0,0': 2 }))
    expect(violations).toHaveLength(0)
  })

  it('checks each clued region independently', () => {
    // Region 0 too large (3 cells vs clue 2), region 1 too small (1 cell vs clue 3).
    const regionIds = [
      [0, 0],
      [0, 1],
    ]
    const violations = sizeRule.validate(2, 2, regionIds, clueGrid(2, 2, { '0,0': 2, '1,1': 3 }))
    expect(violations).toHaveLength(2)
    expect(violations.filter(v => v.isError)).toHaveLength(1)
    expect(violations.filter(v => !v.isError)).toHaveLength(1)
  })

  it('returns no violations for a board with no clues at all', () => {
    const regionIds = [
      [0, 1],
      [2, 3],
    ]
    const violations = sizeRule.validate(2, 2, regionIds, clueGrid(2, 2, {}))
    expect(violations).toHaveLength(0)
  })
})
