import { describe, it, expect } from 'vitest'
import { puzzles } from '../puzzles'
import { ruleRegistry } from '../../rules'
import { computeRegions, hWall, vWall } from '../../solver/regions'
import type { Puzzle } from '../../types/puzzle'

/**
 * Solvability guard for shipped puzzle data.
 *
 * A puzzle whose clues admit no valid partition is unwinnable, and nothing in
 * the app would surface that — the player just never sees the solved banner.
 * These tests brute-force every shipped puzzle to prove at least one solution
 * exists under its own declared `rules`.
 *
 * The search enumerates board partitions directly (one connected region at a
 * time, seeded from the first unassigned cell in row-major order) rather than
 * enumerating wall subsets, which would be 2^40 for a 5×5 board.
 */

type Cell = [number, number]

/** Neighbours of (r,c) that are not cut off by a fixed wall. */
function openNeighbours(p: Puzzle, r: number, c: number): Cell[] {
  const fixed = new Set(p.fixedWalls)
  const out: Cell[] = []
  if (c + 1 < p.m && !fixed.has(hWall(r, c))) out.push([r, c + 1])
  if (c - 1 >= 0 && !fixed.has(hWall(r, c - 1))) out.push([r, c - 1])
  if (r + 1 < p.n && !fixed.has(vWall(r, c))) out.push([r + 1, c])
  if (r - 1 >= 0 && !fixed.has(vWall(r - 1, c))) out.push([r - 1, c])
  return out
}

/**
 * Find one partition of the board into connected regions satisfying every rule
 * the puzzle declares, or null if none exists. Returns a region-ID grid.
 *
 * With `requireAllClued`, only "intended" solutions count — every region must
 * carry at least one clue. A puzzle with no such solution is under-specified:
 * some cells can only ever be covered by arbitrary unclued filler regions that
 * no rule constrains, so the player reaches the solved state by guessing.
 */
function findSolution(
  p: Puzzle,
  { requireAllClued = false, stepBudget = 2_000_000 } = {},
): number[][] | null {
  const { n, m } = p
  const ids: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(-1))
  let steps = 0
  let nextId = 0

  const key = (r: number, c: number) => r * m + c

  function firstUnassigned(): Cell | null {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < m; c++) if (ids[r][c] === -1) return [r, c]
    }
    return null
  }

  /** Enumerate every connected set of unassigned cells of size `k` containing `seed`. */
  function eachRegion(seed: Cell, k: number, visit: (cells: Cell[]) => boolean): boolean {
    const chosen: Cell[] = [seed]
    const inChosen = new Set<number>([key(seed[0], seed[1])])

    const seedCands = openNeighbours(p, seed[0], seed[1]).filter(([r, c]) => ids[r][c] === -1)

    function rec(cands: Cell[], forbidden: Set<number>): boolean {
      if (++steps > stepBudget) return false
      if (chosen.length === k) return visit(chosen.slice())
      // No candidates left means this branch can never reach size k. (Note the
      // frontier is only the *immediate* neighbours, so `chosen + cands < k` is
      // NOT a valid prune — a region grows past its current frontier.)
      if (cands.length === 0) return false

      const localForbidden = new Set(forbidden)
      for (let i = 0; i < cands.length; i++) {
        const cell = cands[i]
        const ck = key(cell[0], cell[1])
        if (localForbidden.has(ck)) continue

        chosen.push(cell)
        inChosen.add(ck)

        const nextCands = cands.slice(i + 1).filter(([r, c]) => !localForbidden.has(key(r, c)))
        const seen = new Set(nextCands.map(([r, c]) => key(r, c)))
        for (const [nr, nc] of openNeighbours(p, cell[0], cell[1])) {
          const nk = key(nr, nc)
          if (ids[nr][nc] !== -1 || inChosen.has(nk) || localForbidden.has(nk) || seen.has(nk)) continue
          seen.add(nk)
          nextCands.push([nr, nc])
        }

        const done = rec(nextCands, localForbidden)

        chosen.pop()
        inChosen.delete(ck)
        if (done) return true

        localForbidden.add(ck)
      }
      return false
    }

    if (k === 1) return visit([seed])
    return rec(seedCands, new Set())
  }

  function allRulesPass(): boolean {
    return p.rules.every(name => ruleRegistry[name].validate(n, m, ids, p.clues).length === 0)
  }

  function search(): boolean {
    const seed = firstUnassigned()
    if (!seed) return allRulesPass()

    const [sr, sc] = seed
    const remaining = ids.flat().filter(v => v === -1).length
    const seedClue = p.clues[sr][sc]
    // A clued seed pins the region size exactly; an unclued seed may be any size.
    const sizes = seedClue ? [seedClue.value] : Array.from({ length: remaining }, (_, i) => i + 1)

    for (const k of sizes) {
      if (k > remaining) continue
      const id = nextId
      const found = eachRegion(seed, k, cells => {
        // Every clue inside the candidate region must agree with its size.
        let clueCount = 0
        for (const [r, c] of cells) {
          const clue = p.clues[r][c]
          if (!clue) continue
          if (clue.value !== k) return false
          clueCount++
        }
        if (requireAllClued && clueCount === 0) return false
        for (const [r, c] of cells) ids[r][c] = id
        nextId++
        if (search()) return true
        nextId--
        for (const [r, c] of cells) ids[r][c] = -1
        return false
      })
      if (found) return true
    }
    return false
  }

  return search() ? ids.map(row => [...row]) : null
}

/** Derive the wall set a player would draw to realise a given partition. */
function wallsFor(p: Puzzle, ids: number[][]): Set<string> {
  const walls = new Set<string>()
  for (let r = 0; r < p.n; r++) {
    for (let c = 0; c < p.m; c++) {
      if (c + 1 < p.m && ids[r][c] !== ids[r][c + 1]) walls.add(hWall(r, c))
      if (r + 1 < p.n && ids[r][c] !== ids[r + 1][c]) walls.add(vWall(r, c))
    }
  }
  return walls
}

describe('solvability checker', () => {
  // Self-check: the guards below are only meaningful if they can actually fail.
  const underSpecified: Puzzle = {
    id: 'under-specified',
    title: 'under-specified',
    n: 2,
    m: 2,
    fixedWalls: [],
    rules: ['size'],
    // Clue sums to 2 on a 4-cell board — the other 2 cells can only ever be
    // covered by unclued filler, so no fully-clued solution exists.
    clues: [
      [{ kind: 'size', value: 2 }, null],
      [null, null],
    ],
  }

  it('finds a solution for an under-specified puzzle', () => {
    expect(findSolution(underSpecified)).not.toBeNull()
  })

  it('rejects an under-specified puzzle when every region must be clued', () => {
    expect(findSolution(underSpecified, { requireAllClued: true })).toBeNull()
  })

  it('rejects a puzzle whose clues are outright unsatisfiable', () => {
    const impossible: Puzzle = {
      ...underSpecified,
      id: 'impossible',
      // A 2×2 board cannot contain a 3-cell region and a 4-cell region at once.
      clues: [
        [{ kind: 'size', value: 3 }, null],
        [null, { kind: 'size', value: 4 }],
      ],
    }
    expect(findSolution(impossible)).toBeNull()
  })
})

describe('shipped puzzles', () => {
  it('exposes a non-empty puzzle list with unique ids', () => {
    expect(puzzles.length).toBeGreaterThan(0)
    expect(new Set(puzzles.map(p => p.id)).size).toBe(puzzles.length)
  })

  for (const p of puzzles) {
    describe(`${p.id} (${p.title})`, () => {
      it('has well-formed dimensions and clue grid', () => {
        expect(p.clues).toHaveLength(p.n)
        for (const row of p.clues) expect(row).toHaveLength(p.m)
        expect(p.rules.length).toBeGreaterThan(0)
        for (const name of p.rules) expect(ruleRegistry[name]).toBeDefined()
      })

      it('declares no clue larger than the board', () => {
        for (const row of p.clues) {
          for (const clue of row) {
            if (clue) expect(clue.value).toBeLessThanOrEqual(p.n * p.m)
          }
        }
      })

      it('is solvable under its own declared rules', () => {
        const solution = findSolution(p)
        expect(solution, `no valid partition exists for ${p.id}`).not.toBeNull()

        // Every rule must be clean, and every clue satisfied, for the found solution.
        for (const name of p.rules) {
          expect(ruleRegistry[name].validate(p.n, p.m, solution!, p.clues)).toEqual([])
        }
      })

      it('has an intended solution in which every region carries a clue', () => {
        // Guards against under-specified clue sets. `classic-5` originally
        // failed this: its clues summed to 21 on a 25-cell board, so 4 cells
        // could only ever sit in unconstrained filler regions.
        const intended = findSolution(p, { requireAllClued: true })
        expect(intended, `${p.id} has no fully-clued solution — clue set is under-specified`).not.toBeNull()

        for (const name of p.rules) {
          expect(ruleRegistry[name].validate(p.n, p.m, intended!, p.clues)).toEqual([])
        }
      })

      it('has a solution the player can actually draw with walls', () => {
        const solution = findSolution(p)!
        const walls = wallsFor(p, solution)

        // Fixed walls must be part of any solution's wall set — otherwise the
        // player can never reach it, since fixed walls cannot be erased.
        for (const w of p.fixedWalls) expect(walls.has(w)).toBe(true)

        // Drawing exactly those walls must reproduce the same partition,
        // which proves each region is genuinely connected.
        const replayed = computeRegions(p.n, p.m, walls)
        const sameShape = (a: number[][], b: number[][]) => {
          const map = new Map<number, number>()
          for (let r = 0; r < p.n; r++) {
            for (let c = 0; c < p.m; c++) {
              const from = a[r][c]
              if (!map.has(from)) map.set(from, b[r][c])
              if (map.get(from) !== b[r][c]) return false
            }
          }
          return new Set(map.values()).size === map.size
        }
        expect(sameShape(solution, replayed)).toBe(true)
      })
    })
  }
})
