import type { EdgeKey } from '../types/puzzle'

// ── Edge key constructors ─────────────────────────────────────────────────────

/** Wall to the RIGHT of (r,c): separates (r,c) from (r,c+1). */
export function hWall(r: number, c: number): EdgeKey {
  return `H:${r},${c}`
}

/** Wall BELOW (r,c): separates (r,c) from (r+1,c). */
export function vWall(r: number, c: number): EdgeKey {
  return `V:${r},${c}`
}

// ── Region detection ──────────────────────────────────────────────────────────

/**
 * Flood-fill to compute connected regions.
 *
 * Two cells belong to the same region iff there is no wall between them
 * (directly or transitively). Returns an n×m grid of region IDs (0-indexed,
 * contiguous, assigned in row-major scan order).
 */
export function computeRegions(
  n: number,
  m: number,
  walls: ReadonlySet<string>,
): number[][] {
  const ids: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(-1))
  let nextId = 0

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < m; c++) {
      if (ids[r][c] !== -1) continue

      const id = nextId++
      const queue: [number, number][] = [[r, c]]
      ids[r][c] = id

      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!

        // Right: no H wall to the right of (cr,cc)
        if (cc + 1 < m && !walls.has(hWall(cr, cc)) && ids[cr][cc + 1] === -1) {
          ids[cr][cc + 1] = id
          queue.push([cr, cc + 1])
        }
        // Left: no H wall to the right of (cr,cc-1)
        if (cc - 1 >= 0 && !walls.has(hWall(cr, cc - 1)) && ids[cr][cc - 1] === -1) {
          ids[cr][cc - 1] = id
          queue.push([cr, cc - 1])
        }
        // Down: no V wall below (cr,cc)
        if (cr + 1 < n && !walls.has(vWall(cr, cc)) && ids[cr + 1][cc] === -1) {
          ids[cr + 1][cc] = id
          queue.push([cr + 1, cc])
        }
        // Up: no V wall below (cr-1,cc)
        if (cr - 1 >= 0 && !walls.has(vWall(cr - 1, cc)) && ids[cr - 1][cc] === -1) {
          ids[cr - 1][cc] = id
          queue.push([cr - 1, cc])
        }
      }
    }
  }

  return ids
}

/**
 * Invert a region-ID grid into a map from region ID → list of (row, col) pairs.
 */
export function regionCells(ids: readonly (readonly number[])[]): Map<number, [number, number][]> {
  const map = new Map<number, [number, number][]>()
  for (let r = 0; r < ids.length; r++) {
    for (let c = 0; c < ids[r].length; c++) {
      const id = ids[r][c]
      if (!map.has(id)) map.set(id, [])
      map.get(id)!.push([r, c])
    }
  }
  return map
}
