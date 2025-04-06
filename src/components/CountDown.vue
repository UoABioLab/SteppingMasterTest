<script setup>
import { ref, onMounted } from 'vue'
import { useGameState } from '../composables/useGameState'
import { useAudio } from '../composables/useAudio'

const props = defineProps({
  onComplete: Function
})

const { gameState } = useGameState()
const { playBeep } = useAudio()

const count = ref(5)
const isVisible = ref(true)

onMounted(() => {
  gameState.isPlaying = true
  gameState.gameStarted = false
  
  const countDown = () => {
    if (count.value > 0) {
      playBeep?.()
      count.value--
      setTimeout(countDown, 1000)
    } else {
      isVisible.value = false
      gameState.gameStarted = true
      props.onComplete?.()
    }
  }
  
  countDown()
})
</script>

<template>
  <div v-if="isVisible" class="countdown">
    <div class="count">{{ count }}</div>
    <div class="text">Game Starting...</div>
  </div>
</template>

<style scoped>
.countdown {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
}

.count {
  font-size: 8rem;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 20px #646cff;
  animation: pulse 1s infinite;
}

.text {
  font-size: 2rem;
  color: #fff;
  margin-top: 1rem;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style> 
