<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

// ── Layout constants ──────────────────────────────────────────────────────────

const CELL  = 56            // cell size in px
const PAD   = 20            // outer padding
const HALF  = 9             // half-width of the clickable wall zone

// ── Region colour palette (12 distinct, colour-blind-friendly-ish) ────────────

const PALETTE = [
  '#d4e8ff', // soft blue
  '#d4fce8', // soft green
  '#fce8d4', // soft orange
  '#fcd4e8', // soft pink
  '#e8d4fc', // soft purple
  '#fcfcd4', // soft yellow
  '#d4fcfc', // soft cyan
  '#fcd4d4', // soft red
  '#d4d4fc', // soft indigo
  '#d4fcd4', // soft lime
  '#fce8d4', // peach
  '#e8fcd4', // mint
]

// ── Store ─────────────────────────────────────────────────────────────────────

const store = useGameStore()

const puzzle  = computed(() => store.puzzle)
const n       = computed(() => puzzle.value?.n ?? 0)
const m       = computed(() => puzzle.value?.m ?? 0)

const svgWidth  = computed(() => PAD * 2 + m.value * CELL)
const svgHeight = computed(() => PAD * 2 + n.value * CELL)

// ── Cell list ─────────────────────────────────────────────────────────────────

interface CellInfo {
  r: number
  c: number
  rid: number
  x: number
  y: number
  clueText: string | null
  isError: boolean
}

const cellList = computed<CellInfo[]>(() => {
  if (!puzzle.value) return []
  const clues = puzzle.value.clues
  return Array.from({ length: n.value }, (_, r) =>
    Array.from({ length: m.value }, (_, c) => {
      const rid     = store.regionIds[r]?.[c] ?? 0
      const clue    = clues[r][c]
      const clueText = clue?.kind === 'size' ? String(clue.value) : null
      return {
        r, c, rid,
        x: PAD + c * CELL,
        y: PAD + r * CELL,
        clueText,
        isError: store.errorCells.has(`${r},${c}`),
      }
    }),
  ).flat()
})

// ── Wall lists ────────────────────────────────────────────────────────────────

interface WallInfo {
  key: string
  // Line endpoints
  x1: number; y1: number
  x2: number; y2: number
  // Hit-rect (click zone)
  hx: number; hy: number; hw: number; hh: number
  isFixed: boolean
  isDrawn: boolean
}

/** Internal vertical walls: separate (r,c) from (r,c+1) */
const hWallList = computed<WallInfo[]>(() => {
  if (!puzzle.value) return []
  const out: WallInfo[] = []
  for (let r = 0; r < n.value; r++) {
    for (let c = 0; c < m.value - 1; c++) {
      const key   = store.hWall(r, c)
      const x     = PAD + (c + 1) * CELL
      const yTop  = PAD + r * CELL
      const yBot  = PAD + (r + 1) * CELL
      out.push({
        key,
        x1: x, y1: yTop, x2: x, y2: yBot,
        hx: x - HALF, hy: yTop, hw: HALF * 2, hh: CELL,
        isFixed: puzzle.value!.fixedWalls.includes(key),
        isDrawn: store.walls.has(key),
      })
    }
  }
  return out
})

/** Internal horizontal walls: separate (r,c) from (r+1,c) */
const vWallList = computed<WallInfo[]>(() => {
  if (!puzzle.value) return []
  const out: WallInfo[] = []
  for (let r = 0; r < n.value - 1; r++) {
    for (let c = 0; c < m.value; c++) {
      const key  = store.vWall(r, c)
      const y    = PAD + (r + 1) * CELL
      const xLft = PAD + c * CELL
      const xRgt = PAD + (c + 1) * CELL
      out.push({
        key,
        x1: xLft, y1: y, x2: xRgt, y2: y,
        hx: xLft, hy: y - HALF, hw: CELL, hh: HALF * 2,
        isFixed: puzzle.value!.fixedWalls.includes(key),
        isDrawn: store.walls.has(key),
      })
    }
  }
  return out
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function cellColor(rid: number): string {
  return PALETTE[rid % PALETTE.length]
}

function onWallClick(key: string): void {
  store.toggleWall(key)
}
</script>

<template>
  <svg
    :width="svgWidth"
    :height="svgHeight"
    class="glimmith-board"
    :style="{ display: 'block', userSelect: 'none' }"
  >
    <!-- ── Cell fills ───────────────────────────────────────────────────── -->
    <g class="cells">
      <rect
        v-for="cell in cellList"
        :key="`cell-${cell.r}-${cell.c}`"
        :x="cell.x"
        :y="cell.y"
        :width="CELL"
        :height="CELL"
        :fill="cellColor(cell.rid)"
        :stroke="cell.isError ? '#e53e3e' : 'none'"
        :stroke-width="cell.isError ? 2.5 : 0"
        rx="0"
      />
    </g>

    <!-- ── Grid lines (always visible, light) ──────────────────────────── -->
    <g class="grid-lines" stroke="#bbb" stroke-width="0.5" pointer-events="none">
      <!-- Vertical grid lines -->
      <line
        v-for="c in (m - 1)"
        :key="`vg-${c}`"
        :x1="PAD + c * CELL"
        :y1="PAD"
        :x2="PAD + c * CELL"
        :y2="PAD + n * CELL"
      />
      <!-- Horizontal grid lines -->
      <line
        v-for="r in (n - 1)"
        :key="`hg-${r}`"
        :x1="PAD"
        :y1="PAD + r * CELL"
        :x2="PAD + m * CELL"
        :y2="PAD + r * CELL"
      />
    </g>

    <!-- ── Drawn walls (internal) ───────────────────────────────────────── -->
    <g class="drawn-walls" pointer-events="none">
      <line
        v-for="w in hWallList.filter(w => w.isDrawn)"
        :key="`hw-${w.key}`"
        :x1="w.x1" :y1="w.y1" :x2="w.x2" :y2="w.y2"
        :stroke="w.isFixed ? '#444' : '#1a1a2e'"
        :stroke-width="w.isFixed ? 4 : 3"
        stroke-linecap="round"
      />
      <line
        v-for="w in vWallList.filter(w => w.isDrawn)"
        :key="`vw-${w.key}`"
        :x1="w.x1" :y1="w.y1" :x2="w.x2" :y2="w.y2"
        :stroke="w.isFixed ? '#444' : '#1a1a2e'"
        :stroke-width="w.isFixed ? 4 : 3"
        stroke-linecap="round"
      />
    </g>

    <!-- ── Outer border ─────────────────────────────────────────────────── -->
    <rect
      :x="PAD"
      :y="PAD"
      :width="m * CELL"
      :height="n * CELL"
      fill="none"
      stroke="#222"
      stroke-width="3"
      pointer-events="none"
    />

    <!-- ── Clue numbers ─────────────────────────────────────────────────── -->
    <g class="clues" pointer-events="none">
      <text
        v-for="cell in cellList.filter(c => c.clueText !== null)"
        :key="`clue-${cell.r}-${cell.c}`"
        :x="cell.x + CELL / 2"
        :y="cell.y + CELL / 2"
        text-anchor="middle"
        dominant-baseline="central"
        font-size="18"
        font-weight="700"
        font-family="system-ui, sans-serif"
        :fill="cell.isError ? '#c53030' : '#1a1a2e'"
      >{{ cell.clueText }}</text>
    </g>

    <!-- ── Clickable wall zones (invisible, topmost layer) ─────────────── -->
    <g class="wall-zones">
      <rect
        v-for="w in hWallList"
        :key="`hz-${w.key}`"
        :x="w.hx" :y="w.hy" :width="w.hw" :height="w.hh"
        fill="transparent"
        :class="['wall-zone', { 'wall-zone--fixed': w.isFixed, 'wall-zone--drawn': w.isDrawn }]"
        @click="onWallClick(w.key)"
      />
      <rect
        v-for="w in vWallList"
        :key="`vz-${w.key}`"
        :x="w.hx" :y="w.hy" :width="w.hw" :height="w.hh"
        fill="transparent"
        :class="['wall-zone', { 'wall-zone--fixed': w.isFixed, 'wall-zone--drawn': w.isDrawn }]"
        @click="onWallClick(w.key)"
      />
    </g>
  </svg>
</template>

<style scoped>
.glimmith-board {
  cursor: pointer;
}

.wall-zone {
  cursor: crosshair;
  transition: opacity 0.1s;
}
.wall-zone--fixed {
  cursor: not-allowed;
}
.wall-zone:not(.wall-zone--fixed):hover {
  fill: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
}
</style>
