<script setup>
import { ref } from 'vue'
import { useGameState } from '../composables/useGameState'

const { gameState, startGame } = useGameState()
const selectedDifficulty = ref('medium')

const selectDifficulty = (difficulty) => {
  selectedDifficulty.value = difficulty
}

const startGameWithDifficulty = () => {
  if (!gameState.playerName.trim()) {
    alert('Please enter your name!')
    return
  }
  gameState.difficulty = selectedDifficulty.value
  startGame()
}

const exitToMain = () => {
  window.location.href = 'https://uoabiolab.github.io/GameIndex/'
}
</script>

<template>
  <div class="difficulty-select">
    <h1>Step Master</h1>
    <div class="player-input">
      <input 
        type="text" 
        v-model="gameState.playerName" 
        placeholder="Enter your name" 
      />
    </div>
    <div class="difficulty-options">
      <h2>Select Difficulty</h2>
      <div class="buttons">
        <button 
          type="button"
          @click="selectDifficulty('easy')"
          :class="{ active: selectedDifficulty === 'easy' }"
        >Easy</button>
        <button 
          type="button"
          @click="selectDifficulty('medium')"
          :class="{ active: selectedDifficulty === 'medium' }"
        >Medium</button>
        <button 
          type="button"
          @click="selectDifficulty('hard')"
          :class="{ active: selectedDifficulty === 'hard' }"
        >Hard</button>
      </div>
    </div>
    <div class="start-game">
      <button 
        type="button"
        class="start-button"
        @click="startGameWithDifficulty"
      >Start Game</button>
    </div>
    <div class="exit-game">
      <button 
        type="button"
        class="exit-button"
        @click="exitToMain"
      >Exit to Main Menu</button>
    </div>
  </div>
</template>

<style scoped>
.difficulty-select {
  text-align: center;
  color: white;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 1rem;
  min-width: 400px;
}

h1 {
  font-size: 3rem;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

h2 {
  font-size: 1.5rem;
  margin: 1rem 0;
}

.player-input {
  margin-bottom: 2rem;
}

input {
  padding: 0.5rem 1rem;
  font-size: 1.2rem;
  border-radius: 4px;
  border: none;
  width: 200px;
  margin-bottom: 1rem;
}

.difficulty-options {
  margin-bottom: 2rem;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 8px;
  border: 2px solid #646cff;
  background-color: transparent;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover {
  background-color: #646cff;
}

button.active {
  background-color: #646cff;
  border-color: white;
}

.start-button {
  font-size: 1.5rem;
  padding: 1.2rem 3rem;
  background-color: #00ff00;
  border-color: #00ff00;
  color: black;
}

.start-button:hover {
  background-color: #00dd00;
  border-color: #00dd00;
  transform: scale(1.05);
}

.exit-game {
  margin-top: 1rem;
}

.exit-button {
  font-size: 1.2rem;
  padding: 0.8rem 2rem;
  background-color: #ff4444;
  border-color: #ff4444;
  color: white;
}

.exit-button:hover {
  background-color: #dd3333;
  border-color: #dd3333;
  transform: scale(1.05);
}
</style>
