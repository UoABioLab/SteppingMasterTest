<script setup>
import { ref, onMounted, computed } from 'vue'
import { gameSettings } from '../config/gameSettings'
import { colors } from '../config/colors'
import { useGameState } from '../composables/useGameState'
import { usePoseDetection } from '../composables/usePoseDetection'

const emit = defineEmits(['pose-update'])
const { gameState } = useGameState()
const { detectFootMovement } = usePoseDetection()
const videoRef = ref(null)
const canvasRef = ref(null)
const errorMessage = ref('')
let pose = null
let camera = null

// 添加脚的图片加载
const leftFootImg = new Image()
const rightFootImg = new Image()
leftFootImg.src = '/resources/left_foot.png'
rightFootImg.src = '/resources/right_foot.png'

// 初始化姿势检测器
const initPose = async () => {
  try {
    // 确保 MediaPipe 脚本已加载
    await new Promise((resolve, reject) => {
      if (window.Pose) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });

    // 等待一小段时间确保 WASM 模块加载完成
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    pose = new window.Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      }
    })

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })

    pose.onResults(onResults)
    
    console.log('Pose initialized')
  } catch (error) {
    console.error('Error initializing pose:', error)
    errorMessage.value = error.message
  }
}

// 处理检测结果
const onResults = (results) => {
  if (!canvasRef.value) return

  const ctx = canvasRef.value.getContext('2d')
  ctx.save()
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // 绘制摄像头画面
  ctx.drawImage(results.image, 0, 0, canvasRef.value.width, canvasRef.value.height)

  if (results.poseLandmarks) {
    // 使用全局对象
    window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
      color: colors.BLUE,
      lineWidth: 2
    })
    
    window.drawLandmarks(ctx, results.poseLandmarks, {
      color: colors.RED,
      lineWidth: 1,
      radius: 3
    })

    const movement = detectFootMovement(results.poseLandmarks)
    emit('pose-update', movement)
  }

  ctx.restore()
}

// 启动摄像头
const startCamera = async () => {
  try {
    if (!videoRef.value) return

    camera = new window.Camera(videoRef.value, {
      onFrame: async () => {
        if (pose) {
          await pose.send({ image: videoRef.value })
        }
      },
      width: gameSettings.camera.width,
      height: gameSettings.camera.height
    })

    await camera.start()
    console.log('Camera started')
  } catch (error) {
    console.error('Error starting camera:', error)
    errorMessage.value = error.message
  }
}

onMounted(async () => {
  await initPose()
  await startCamera()
})
</script>

<template>
  <div class="pose-detection">
    <video 
      ref="videoRef"
      :width="gameSettings.camera.width"
      :height="gameSettings.camera.height"
      autoplay
      playsinline
      muted
    ></video>
    <canvas 
      ref="canvasRef" 
      :width="gameSettings.camera.width"
      :height="gameSettings.camera.height"
    ></canvas>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.pose-detection {
  position: fixed;
  bottom: 10px;
  left: 10px;
  overflow: hidden;
  background-color: transparent;
  z-index: 1000;
  width: 240px;
  height: 180px;
  border: none;
}

video {
  display: none;
}

canvas {
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: none;
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 5px;
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  font-size: 12px;
}
</style> 