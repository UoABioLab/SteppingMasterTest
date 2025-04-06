<script setup>
import { ref, onMounted } from 'vue'

const canvasRef = ref(null)
const videoRef = ref(null)
let pose = null
let camera = null

// 加载脚的图片
const leftFootImg = new Image()
const rightFootImg = new Image()
leftFootImg.src = '/resources/left_foot.png'
rightFootImg.src = '/resources/right_foot.png'

// 初始化姿势检测器
const initPose = async () => {
  pose = new window.Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    }
  })

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  })

  pose.onResults(onResults)
}

// 处理检测结果
const onResults = (results) => {
  if (!canvasRef.value || !results.poseLandmarks) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  // 清空画布
  ctx.clearRect(0, 0, width, height)

  // 获取脚的位置
  const leftFoot = results.poseLandmarks[31]
  const rightFoot = results.poseLandmarks[32]

  // 绘制脚的图片
  const footSize = 80
  
  // 左脚
  ctx.save()
  ctx.drawImage(leftFootImg,
    leftFoot.x * width - footSize/2,  // x坐标
    height/2 - footSize/2,  // y坐标固定在中间
    footSize,
    footSize
  )
  ctx.restore()

  // 右脚
  ctx.save()
  ctx.drawImage(rightFootImg,
    rightFoot.x * width - footSize/2,  // x坐标
    height/2 - footSize/2,  // y坐标固定在中间
    footSize,
    footSize
  )
  ctx.restore()

  // 打印脚的位置信息
  console.log('Foot positions:', {
    left: { x: leftFoot.x * width, y: height/2 },
    right: { x: rightFoot.x * width, y: height/2 }
  })
}

// 启动摄像头
const startCamera = async () => {
  if (!videoRef.value) return

  camera = new window.Camera(videoRef.value, {
    onFrame: async () => {
      if (pose) {
        await pose.send({ image: videoRef.value })
      }
    },
    width: 640,
    height: 480
  })

  await camera.start()
}

onMounted(async () => {
  await initPose()
  await startCamera()
})
</script>

<template>
  <div class="foot-test">
    <div class="canvas-container">
      <video 
        ref="videoRef"
        width="640"
        height="480"
        autoplay
        playsinline
        muted
        class="camera-view"
      ></video>
      <canvas 
        ref="canvasRef" 
        width="800"
        height="600"
        class="test-canvas"
      ></canvas>
    </div>
  </div>
</template>

<style scoped>
.foot-test {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
}

.canvas-container {
  position: relative;
  width: 800px;
  height: 600px;
}

.camera-view {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 200px;
  height: 150px;
  border-radius: 8px;
  z-index: 2;
}

.test-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid #646cff;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
}
</style> 