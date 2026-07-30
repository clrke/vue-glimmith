import { describe, it, expect } from 'vitest'
import { sizeSeparationRule } from '../sizeSeparation'

describe('sizeSeparationRule', () => {
  it('flags two adjacent regions of equal size', () => {
    // 2x2 grid split into two size-2 columns, sharing a vertical border.
    const regionIds = [
      [0, 1],
      [0, 1],
    ]
    const violations = sizeSeparationRule.validate(2, 2, regionIds, [
      [null, null],
      [null, null],
    ])
    expect(violations).toHaveLength(1)
    expect(violations[0].isError).toBe(true)
    expect(violations[0].message).toMatch(/2 cells/)
  })

  it('allows adjacent regions of different sizes', () => {
    // Region 0 is 3 cells (L-shape), region 1 is 1 cell.
    const regionIds = [
      [0, 0],
      [0, 1],
    ]
    const violations = sizeSeparationRule.validate(2, 2, regionIds, [
      [null, null],
      [null, null],
    ])
    expect(violations).toHaveLength(0)
  })

  it('allows equal-size regions that are not adjacent', () => {
    // Regions 0 and 2 are both size 2; region 1 (size 4) sits between them,
    // so 0 and 2 never share an edge.
    const regionIds = [
      [0, 1, 1, 2],
      [0, 1, 1, 2],
    ]
    const violations = sizeSeparationRule.validate(2, 4, regionIds, [
      [null, null, null, null],
      [null, null, null, null],
    ])
    expect(violations).toHaveLength(0)
  })

  it('produces no violations for a single region covering the whole board', () => {
    const regionIds = [
      [0, 0],
      [0, 0],
    ]
    const violations = sizeSeparationRule.validate(2, 2, regionIds, [
      [null, null],
      [null, null],
    ])
    expect(violations).toHaveLength(0)
  })

  it('does not double-report the same adjacent pair from multiple shared edges', () => {
    // Regions 0 and 1 share a long, multi-cell border — should still be one violation.
    const regionIds = [
      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ]
    const violations = sizeSeparationRule.validate(2, 4, regionIds, [
      [null, null, null, null],
      [null, null, null, null],
    ])
    expect(violations).toHaveLength(1)
  })
})
