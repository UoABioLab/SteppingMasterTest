import { ref, reactive } from 'vue'
import { difficulties } from '../config/difficulties'

export function useGameState() {
  // 使用单例模式确保状态在组件间共享
  if (useGameState.instance) {
    return useGameState.instance
  }

  const gameState = reactive({
    isPlaying: false,
    isPaused: false,
    gameStarted: false,
    difficulty: 'medium',
    currentSettings: difficulties.medium,
    playerName: '',
    highScore: 0,
    gameOver: false
  })

  const score = ref(0)
  const health = ref(3)

  const startGame = () => {
    console.log('Starting game with difficulty:', gameState.difficulty)
    gameState.currentSettings = difficulties[gameState.difficulty]
    if (!gameState.playerName) {
      gameState.playerName = 'Player'
    }
    gameState.isPlaying = true
    gameState.gameOver = false
    gameState.gameStarted = false
    score.value = 0
    health.value = 3
    console.log('Game state:', gameState)
  }

  const endGame = () => {
    gameState.isPlaying = false
    gameState.gameOver = true
    if (score.value > gameState.highScore) {
      gameState.highScore = score.value
    }
  }

  const resetGame = () => {
    gameState.isPlaying = false
    gameState.isPaused = false
    gameState.gameOver = false
    score.value = 0
    health.value = 3
    startGame()
  }

  const updateScore = (points = 1) => {
    score.value += points
    
    // 检查是否达到当前难度的得分上限
    if (score.value >= gameState.currentSettings.scoreLimit) {
      // 达到上限时结束游戏
      gameState.isPlaying = false
      gameState.gameOver = true
      if (score.value > gameState.highScore) {
        gameState.highScore = score.value
      }
    }
  }

  const decreaseHealth = () => {
    health.value--
    if (health.value <= 0) {
      endGame()
    }
  }

  const instance = {
    gameState,
    score,
    health,
    startGame,
    endGame,
    resetGame,
    updateScore,
    decreaseHealth
  }

  // 保存实例
  useGameState.instance = instance
  return instance
} 
