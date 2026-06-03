import { describe, it, expect } from 'vitest'
import { computeRegions, regionCells, hWall, vWall } from '../regions'

// ── hWall / vWall key constructors ────────────────────────────────────────────

describe('hWall / vWall', () => {
  it('produces the expected key format', () => {
    expect(hWall(0, 0)).toBe('H:0,0')
    expect(hWall(2, 3)).toBe('H:2,3')
    expect(vWall(0, 0)).toBe('V:0,0')
    expect(vWall(1, 4)).toBe('V:1,4')
  })
})

// ── computeRegions — no walls ─────────────────────────────────────────────────

describe('computeRegions() — no walls', () => {
  it('1×1 grid: single region', () => {
    const ids = computeRegions(1, 1, new Set())
    expect(ids).toEqual([[0]])
  })

  it('2×2 grid: all four cells in the same region', () => {
    const ids = computeRegions(2, 2, new Set())
    expect(ids[0][0]).toBe(ids[0][1])
    expect(ids[0][0]).toBe(ids[1][0])
    expect(ids[0][0]).toBe(ids[1][1])
  })

  it('3×3 grid: all nine cells share one region', () => {
    const ids = computeRegions(3, 3, new Set())
    const rid = ids[0][0]
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        expect(ids[r][c]).toBe(rid)
      }
    }
  })

  it('returns correct dimensions', () => {
    const ids = computeRegions(4, 6, new Set())
    expect(ids).toHaveLength(4)
    for (const row of ids) expect(row).toHaveLength(6)
  })
})

// ── computeRegions — with walls ───────────────────────────────────────────────

describe('computeRegions() — with walls', () => {
  it('vertical wall through 2×2 splits into 2 regions', () => {
    // H:0,0 and H:1,0 = walls between col 0 and col 1 in rows 0 and 1
    const walls = new Set([hWall(0, 0), hWall(1, 0)])
    const ids = computeRegions(2, 2, walls)
    expect(ids[0][0]).toBe(ids[1][0])   // left column: same region
    expect(ids[0][1]).toBe(ids[1][1])   // right column: same region
    expect(ids[0][0]).not.toBe(ids[0][1]) // left ≠ right
  })

  it('horizontal wall through 2×2 splits into top/bottom', () => {
    // V:0,0 and V:0,1 = walls below row 0
    const walls = new Set([vWall(0, 0), vWall(0, 1)])
    const ids = computeRegions(2, 2, walls)
    expect(ids[0][0]).toBe(ids[0][1])   // top row: same region
    expect(ids[1][0]).toBe(ids[1][1])   // bottom row: same region
    expect(ids[0][0]).not.toBe(ids[1][0]) // top ≠ bottom
  })

  it('4 walls around a 3×3 centre cell isolate it', () => {
    // Isolate (1,1) from all neighbours in a 3×3 grid
    const walls = new Set([
      hWall(1, 0),   // wall to the right of (1,0): separates (1,0) from (1,1)
      hWall(1, 1),   // wall to the right of (1,1): separates (1,1) from (1,2)
      vWall(0, 1),   // wall below (0,1): separates (0,1) from (1,1)
      vWall(1, 1),   // wall below (1,1): separates (1,1) from (2,1)
    ])
    const ids = computeRegions(3, 3, walls)

    const centreId = ids[1][1]
    // Centre must be alone in its region
    const cells = regionCells(ids).get(centreId)!
    expect(cells).toHaveLength(1)
    expect(cells[0]).toEqual([1, 1])

    // No other cell shares the centre region
    const allIds = ids.flat()
    expect(allIds.filter(id => id === centreId)).toHaveLength(1)
  })

  it('every cell in a 4×4 has a unique region when all internal walls are drawn', () => {
    const n = 4, m = 4
    const walls = new Set<string>()
    for (let r = 0; r < n; r++) for (let c = 0; c < m - 1; c++) walls.add(hWall(r, c))
    for (let r = 0; r < n - 1; r++) for (let c = 0; c < m; c++) walls.add(vWall(r, c))
    const ids = computeRegions(n, m, walls)
    const flat = ids.flat()
    const unique = new Set(flat)
    expect(unique.size).toBe(n * m)
  })

  it('region IDs are contiguous 0-based integers in row-major order', () => {
    // Partition 2×3 into 2 columns (3 walls between columns 0 and 1)
    const walls = new Set([hWall(0, 0), hWall(1, 0)])
    const ids = computeRegions(2, 3, walls)
    // Flood-fill starts at (0,0): first region is 0
    expect(ids[0][0]).toBe(0)
    // (0,0) and (1,0) are connected → same region
    expect(ids[1][0]).toBe(0)
    // (0,1) and (0,2) and (1,1) and (1,2) are connected → region 1
    expect(ids[0][1]).toBe(1)
    expect(ids[0][2]).toBe(1)
    expect(ids[1][1]).toBe(1)
    expect(ids[1][2]).toBe(1)
  })
})

// ── regionCells() ─────────────────────────────────────────────────────────────

describe('regionCells()', () => {
  it('returns all cells for a single-region grid', () => {
    const ids = computeRegions(2, 2, new Set())
    const map = regionCells(ids)
    expect(map.size).toBe(1)
    const cells = map.get(0)!
    expect(cells).toHaveLength(4)
  })

  it('total cell count equals n * m', () => {
    const n = 3, m = 4
    const walls = new Set([hWall(0, 1), hWall(1, 1), hWall(2, 1)])
    const ids = computeRegions(n, m, walls)
    const map = regionCells(ids)
    let total = 0
    for (const cells of map.values()) total += cells.length
    expect(total).toBe(n * m)
  })

  it('each cell appears in exactly one region', () => {
    const n = 3, m = 3
    const walls = new Set([hWall(1, 0), hWall(1, 1), vWall(0, 1), vWall(1, 1)])
    const ids = computeRegions(n, m, walls)
    const map = regionCells(ids)
    const seen = new Set<string>()
    for (const cells of map.values()) {
      for (const [r, c] of cells) {
        const key = `${r},${c}`
        expect(seen.has(key), `cell (${r},${c}) appears in multiple regions`).toBe(false)
        seen.add(key)
      }
    }
    expect(seen.size).toBe(n * m)
  })

  it('region size matches the number of cells in the corresponding region', () => {
    // 3×3 with centre isolated: 1 region of 1, 1 region of 8
    const walls = new Set([hWall(1, 0), hWall(1, 1), vWall(0, 1), vWall(1, 1)])
    const ids = computeRegions(3, 3, walls)
    const map = regionCells(ids)
    const sizes = [...map.values()].map(c => c.length).sort((a, b) => a - b)
    expect(sizes).toEqual([1, 8])
  })
})
