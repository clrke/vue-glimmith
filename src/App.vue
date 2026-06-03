<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useGameStore } from './stores/game'
import GlimmithBoard from './components/GlimmithBoard.vue'
import { puzzles } from './data/puzzles'

const store = useGameStore()

onMounted(() => {
  store.loadPuzzle(puzzles[0])
})

const puzzle    = computed(() => store.puzzle)
const isSolved  = computed(() => store.isSolved)
const violations = computed(() => store.violations)

function loadPuzzle(idx: number) {
  store.loadPuzzle(puzzles[idx])
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Vue Glimmith</h1>
      <p class="subtitle">Divide the grid into regions that satisfy the clues</p>
    </header>

    <div class="puzzle-select">
      <button
        v-for="(p, i) in puzzles"
        :key="p.id"
        :class="['puzzle-btn', { active: puzzle?.id === p.id }]"
        @click="loadPuzzle(i)"
      >{{ p.title }}</button>
    </div>

    <main class="board-area">
      <GlimmithBoard v-if="puzzle" />
    </main>

    <aside class="status-panel" v-if="puzzle">
      <div v-if="isSolved" class="solved-banner">
        ✨ Solved!
      </div>

      <div class="controls">
        <button class="reset-btn" @click="store.reset()">Reset</button>
      </div>

      <div class="violations" v-if="violations.length > 0">
        <div
          v-for="(v, i) in violations"
          :key="i"
          :class="['violation', v.isError ? 'violation--error' : 'violation--incomplete']"
        >
          {{ v.isError ? '✗' : '○' }} {{ v.message }}
        </div>
      </div>

      <div class="help">
        <p><strong>How to play:</strong> Click between two cells to draw or erase a border.</p>
        <p>Numbers show how many cells each region must contain.</p>
      </div>
    </aside>
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f5f5f0;
  color: #1a1a2e;
  min-height: 100vh;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 32px 16px;
  min-height: 100vh;
}

.app-header {
  text-align: center;
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.subtitle {
  color: #555;
  margin-top: 4px;
}

.puzzle-select {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.puzzle-btn {
  padding: 6px 16px;
  border: 2px solid #ccc;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s;
}
.puzzle-btn:hover { border-color: #888; }
.puzzle-btn.active { border-color: #1a1a2e; background: #1a1a2e; color: white; }

.board-area {
  display: flex;
  justify-content: center;
}

.status-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 320px;
  width: 100%;
}

.solved-banner {
  font-size: 1.4rem;
  font-weight: 700;
  color: #276749;
  background: #c6f6d5;
  border-radius: 8px;
  padding: 10px 24px;
}

.controls {
  display: flex;
  gap: 8px;
}

.reset-btn {
  padding: 6px 20px;
  border: 2px solid #e53e3e;
  border-radius: 6px;
  background: white;
  color: #e53e3e;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.reset-btn:hover { background: #e53e3e; color: white; }

.violations {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.violation {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
}
.violation--error      { background: #fff5f5; color: #c53030; border: 1px solid #fed7d7; }
.violation--incomplete { background: #fffdf0; color: #7b6c00; border: 1px solid #fef3c7; }

.help {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #4a5568;
}
.help p + p { margin-top: 4px; }
</style>
