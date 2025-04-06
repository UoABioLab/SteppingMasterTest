<script setup>
import { useGameState } from '../composables/useGameState'

const { score, health, gameState } = useGameState()
</script>

<template>
  <div class="score-board">
    <div class="player-info">
      <span class="label">Player:</span>
      <span class="value">{{ gameState.playerName }}</span>
    </div>
    
    <div class="score-container">
      <div class="score">
        <span class="label">Score:</span>
        <span class="value highlight">{{ score }}</span>
      </div>
    </div>
    
    <div class="health-container">
      <span class="label">Health:</span>
      <div class="hearts">
        <span v-for="n in 3" :key="n" class="heart" :class="{ empty: n > health }">
          {{ n <= health ? '❤️' : '🖤' }}
        </span>
      </div>
    </div>

    <div class="difficulty">
      <span class="label">Mode:</span>
      <span class="value" :class="gameState.difficulty">{{ gameState.difficulty }}</span>
    </div>
  </div>
</template>

<style scoped>
.score-board {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 1rem;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  min-width: 200px;
  border: none;
}

.label {
  color: #888;
  margin-right: 0.5rem;
}

.value {
  font-weight: bold;
}

.highlight {
  color: #00ff00;
  font-size: 1.4rem;
}

.player-info, .score-container, .health-container, .difficulty {
  margin: 0.8rem 0;
}

.score-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hearts {
  display: inline-flex;
  gap: 5px;
}

.heart {
  font-size: 1.5rem;
  transition: transform 0.2s ease;
}

.heart:not(.empty):hover {
  transform: scale(1.2);
}

.difficulty .value {
  text-transform: uppercase;
  font-weight: bold;
}

.difficulty .easy {
  color: #00ff00;
}

.difficulty .medium {
  color: #ffff00;
}

.difficulty .hard {
  color: #ff4444;
}
</style> 
