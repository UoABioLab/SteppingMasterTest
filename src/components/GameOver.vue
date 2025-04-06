<script setup>
import { useGameState } from '../composables/useGameState'

const { score, gameState, resetGame } = useGameState()

const playAgain = () => {
  resetGame()
}

const backToMenu = () => {
  gameState.isPlaying = false
  gameState.gameOver = false
  gameState.gameStarted = false
}
</script>

<template>
  <div class="game-over" v-if="gameState.gameOver">
    <h2>Game Over</h2>
    <div class="score-info">
      <div class="final-score">Final Score: {{ score }}</div>
      <div class="high-score">High Score: {{ gameState.highScore }}</div>
    </div>
    <div class="player-stats">
      <div>Player: {{ gameState.playerName }}</div>
      <div>Difficulty: {{ gameState.difficulty }}</div>
    </div>
    <div class="buttons">
      <button @click="playAgain" class="play-again">Play Again</button>
      <button @click="backToMenu" class="back-menu">Back to Menu</button>
    </div>
  </div>
</template>

<style scoped>
.game-over {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  color: white;
  min-width: 300px;
  border: 2px solid #646cff;
}

h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #ff4444;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.score-info {
  margin-bottom: 1.5rem;
}

.final-score {
  font-size: 1.8rem;
  color: #00ff00;
  margin-bottom: 0.5rem;
}

.high-score {
  font-size: 1.4rem;
  color: #ffff00;
}

.player-stats {
  margin-bottom: 2rem;
  font-size: 1.2rem;
}

.player-stats > div {
  margin: 0.5rem 0;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.play-again, .back-menu {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 8px;
  border: 2px solid #646cff;
  background-color: transparent;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.play-again {
  background-color: #00aa00;
  border-color: #00aa00;
}

.back-menu {
  background-color: #aa0000;
  border-color: #aa0000;
}

.play-again:hover, .back-menu:hover {
  transform: scale(1.05);
  opacity: 0.9;
}
</style> 
