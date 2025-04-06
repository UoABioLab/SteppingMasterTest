<template>
  <div class="game-container" :style="containerStyle">
    <div class="content-wrapper">
      <div v-if="!gameState.isPlaying" class="menu-view">
        <DifficultySelect />
      </div>
      <div v-else class="game-view">
        <ScoreBoard />
        <GameCanvas ref="gameCanvasRef" />
      </div>
    </div>
    <PoseDetection 
      @pose-update="onPoseUpdate" 
      :class="{ 'hidden': !shouldShowPoseDetection }"
    />
    <GameOver v-if="gameState.gameOver" />
    <CountDown 
      v-if="showCountDown" 
      @complete="onCountDownComplete" 
    />
    <button class="sound-toggle" @click="toggleMute">
      {{ isMuted ? '🔇' : '🔊' }}
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import GameCanvas from './components/GameCanvas.vue'
import DifficultySelect from './components/DifficultySelect.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import PoseDetection from './components/PoseDetection.vue'
import GameOver from './components/GameOver.vue'
import CountDown from './components/CountDown.vue'
import { useGameState } from './composables/useGameState'
import { useAudio } from './composables/useAudio'

const { gameState } = useGameState()
const { playBgMusic, stopBgMusic, toggleMute, isMuted } = useAudio()
const gameCanvasRef = ref(null)
const showCountDown = ref(false)
const gameStarted = ref(false)

// 背景样式
const containerStyle = ref({
  backgroundImage: 'url(/SteppingMaster/resources/background.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
})

// 计算属性：控制摄像头显示
const shouldShowPoseDetection = computed(() => {
  return gameState.isPlaying && !gameState.gameOver
})

const onPoseUpdate = (footMovement) => {
  if (gameCanvasRef.value && gameStarted.value) {
    gameCanvasRef.value.checkArrowHit(footMovement)
  }
}

// 修改开始游戏的处理
const onStartGame = () => {
  showCountDown.value = true
  gameStarted.value = false
}

// 修改倒计时完成的处理
const onCountDownComplete = () => {
  showCountDown.value = false
  gameStarted.value = true
  gameState.gameStarted = true
}

// 监听游戏状态变化，控制背景音乐
watch(() => gameState.isPlaying, (isPlaying) => {
  if (isPlaying) {
    onStartGame()
    playBgMusic()  // 开始游戏时播放背景音乐
  } else {
    gameStarted.value = false
    stopBgMusic()  // 结束游戏时停止背景音乐
  }
})

// 监听游戏结束状态
watch(() => gameState.gameOver, (isGameOver) => {
  if (isGameOver) {
    gameStarted.value = false
    stopBgMusic()  // 游戏结束时停止背景音乐
  }
})

// 修改重新开始游戏的处理
const resetGame = () => {
  gameState.gameOver = false
  gameState.isPlaying = true
  showCountDown.value = true
  gameStarted.value = false
  playBgMusic()  // 重新开始游戏时播放背景音乐
}

// 组件挂载时尝试预加载音频
onMounted(() => {
  // 预加载背景音乐，但不自动播放
  const bgMusic = new Audio('/resources/Background_music.mp3')
  bgMusic.load()
})
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}

.content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-view,
.game-view {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sound-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #646cff;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 1000;
}

.sound-toggle:hover {
  background: rgba(100, 108, 255, 0.7);
}

.hidden {
  opacity: 0;
  pointer-events: none;
}

.pose-detection {
  transition: opacity 0.3s ease;
}
</style>
