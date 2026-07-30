import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { Puzzle } from '../types/puzzle'
import { computeRegions, regionCells, hWall, vWall } from '../solver/regions'
import { ruleRegistry } from '../rules'

export const useGameStore = defineStore('game', () => {
  const puzzle = ref<Puzzle | null>(null)
  // Stored as a new Set reference on each mutation so Vue's reactivity picks it up.
  const walls = ref(new Set<string>())

  // ── Derived state ───────────────────────────────────────────────────────────

  const regionIds = computed<number[][]>(() => {
    if (!puzzle.value) return []
    return computeRegions(puzzle.value.n, puzzle.value.m, walls.value)
  })

  const cells = computed(() => regionCells(regionIds.value))

  const violations = computed(() => {
    if (!puzzle.value) return []
    return puzzle.value.rules.flatMap(name =>
      ruleRegistry[name].validate(
        puzzle.value!.n,
        puzzle.value!.m,
        regionIds.value,
        puzzle.value!.clues,
      ),
    )
  })

  /** Set of "r,c" strings for cells with confirmed errors. */
  const errorCells = computed<Set<string>>(() => {
    const s = new Set<string>()
    for (const v of violations.value) {
      if (v.isError) {
        for (const [r, c] of v.cells) s.add(`${r},${c}`)
      }
    }
    return s
  })

  /** True iff every clue is satisfied and no violations remain. */
  const isSolved = computed<boolean>(() => {
    if (!puzzle.value) return false
    return violations.value.length === 0 && hasAllCluesSatisfied()
  })

  function hasAllCluesSatisfied(): boolean {
    if (!puzzle.value) return false
    const { n, m, clues } = puzzle.value
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < m; c++) {
        const clue = clues[r][c]
        if (!clue) continue
        if (clue.kind === 'size') {
          const rid = regionIds.value[r]?.[c]
          const size = cells.value.get(rid)?.length ?? 0
          if (size !== clue.value) return false
        }
      }
    }
    return true
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function loadPuzzle(p: Puzzle): void {
    puzzle.value = p
    walls.value = new Set(p.fixedWalls)
  }

  function toggleWall(key: string): void {
    if (!puzzle.value) return
    // Fixed walls are immutable
    if (puzzle.value.fixedWalls.includes(key)) return

    const next = new Set(walls.value)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    walls.value = next
  }

  function reset(): void {
    if (!puzzle.value) return
    walls.value = new Set(puzzle.value.fixedWalls)
  }

  return {
    puzzle: readonly(puzzle),
    walls: readonly(walls),
    regionIds,
    cells,
    violations,
    errorCells,
    isSolved,
    loadPuzzle,
    toggleWall,
    reset,
    // Expose helpers for use in the board component
    hWall,
    vWall,
  }
})
