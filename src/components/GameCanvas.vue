<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gameSettings } from '../config/gameSettings'
import { useGameState } from '../composables/useGameState'
import { useAudio } from '../composables/useAudio'

const canvasRef = ref(null)
const videoRef = ref(null)
const { gameState, score, updateScore, decreaseHealth } = useGameState()
const { playSuccess, playFail } = useAudio()

// 姿势检测相关
let pose = null
let camera = null
const footMovement = ref({ left: false, right: false })

// 箭头状态
const arrows = ref([])
let lastArrowTime = 0
let animationFrame = null

// 加载所有图片
const leftArrow = new Image()
const rightArrow = new Image()
const leftArrowWrong = new Image()
const rightArrowWrong = new Image()
const leftArrowCorrect = new Image()
const rightArrowCorrect = new Image()
const leftFootImg = new Image()
const rightFootImg = new Image()

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
  } catch (error) {
    console.error('Error initializing pose:', error)
  }
}

// 处理检测结果
const onResults = (results) => {
  if (!canvasRef.value || !results.poseLandmarks) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 1. 绘制背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 2. 绘制摄像头画面（小窗口）
  const cameraWidth = 200
  const cameraHeight = 150
  ctx.save()
  ctx.translate(20, canvas.height - cameraHeight - 20)
  ctx.drawImage(results.image, 0, 0, cameraWidth, cameraHeight)
  
  // 在摄像头画面上绘制骨骼
  const scaleX = cameraWidth / results.image.width
  const scaleY = cameraHeight / results.image.height
  ctx.scale(scaleX, scaleY)
  window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS)
  window.drawLandmarks(ctx, results.poseLandmarks)
  ctx.restore()

  // 3. 更新脚的考虑镜像效果）
  const leftFoot = results.poseLandmarks[31]
  const rightFoot = results.poseLandmarks[32]
  footMovement.value = {
    leftPos: {
      x: (1 - leftFoot.x) * canvas.width,  // 使用镜像后的左脚x坐标
      y: canvas.height / 2
    },
    rightPos: {
      x: (1 - rightFoot.x) * canvas.width,  // 使用镜像后的右脚x坐标
      y: canvas.height / 2
    }
  }

  // 4. 绘制游戏元素
  draw()
}

// 加载箭头图片
const loadImages = () => {
  console.log('Starting to load images...')
  let loadedImages = 0
  const totalImages = 8

  const onImageLoad = (imageName) => {
    loadedImages++
    console.log(`Loaded ${imageName} (${loadedImages}/${totalImages})`)
    if (loadedImages === totalImages) {
      console.log('All images loaded successfully')
      // 图片加载完成后开始游戏循环
      lastFrameTime = performance.now()
      gameLoop(lastFrameTime)
    }
  }

  // 加载所有图片
  leftArrow.onload = () => onImageLoad('leftArrow')
  rightArrow.onload = () => onImageLoad('rightArrow')
  leftArrowWrong.onload = () => onImageLoad('leftArrowWrong')
  rightArrowWrong.onload = () => onImageLoad('rightArrowWrong')
  leftArrowCorrect.onload = () => onImageLoad('leftArrowCorrect')
  rightArrowCorrect.onload = () => onImageLoad('rightArrowCorrect')
  leftFootImg.onload = () => onImageLoad('leftFoot')
  rightFootImg.onload = () => onImageLoad('rightFoot')

  // 置图片源
  leftArrow.src = '/SteppingMaster/resources/right_arrow.png'
  rightArrow.src = '/SteppingMaster/resources/left_arrow.png'
  leftArrowWrong.src = '/SteppingMaster/resources/right_arrow_wrong.png'
  rightArrowWrong.src = '/SteppingMaster/resources/left_arrow_wrong.png'
  leftArrowCorrect.src = '/SteppingMaster/resources/right_arrow_correct.png'
  rightArrowCorrect.src = '/SteppingMaster/resources/left_arrow_correct.png'
  leftFootImg.src = '/SteppingMaster/resources/left_foot.png'
  rightFootImg.src = '/SteppingMaster/resources/right_foot.png'
}

// 修改箭头更新函数
const updateArrows = () => {
  arrows.value = arrows.value.filter(arrow => {
    if (!arrow.active) return false
    
    if (arrow.state === 'normal' && !arrow.isOverlapped) {
      if (arrow.direction === 'left') {
        arrow.x += arrow.speed
      } else {
        arrow.x -= arrow.speed
      }

      // 检查是否与固定箭头重叠
      const centerX = canvasRef.value.width / 2
      const targetX = arrow.direction === 'left' ? 
        centerX - gameState.currentSettings.targetDistance :
        centerX + gameState.currentSettings.targetDistance - arrow.width

      // 使用更小的重叠阈值，确保完全重叠
      const overlapThreshold = 5
      
      // 只有在几乎完全重叠时才触发变红
      if (Math.abs(arrow.x - targetX) <= overlapThreshold) {
        arrow.isOverlapped = true
        arrow.state = 'wrong'
        playFail()
        decreaseHealth()
        
        setTimeout(() => {
          arrow.active = false
        }, 1000)
        
        return true
      }
    }
    
    return true
  })
}

// 修改箭头创建函数，添加重叠状态标记
const createArrow = () => {
  const now = Date.now()
  const { intervalRange, arrowSpeed } = gameState.currentSettings
  const minInterval = intervalRange[0]
  const maxInterval = intervalRange[1]
  const interval = Math.random() * (maxInterval - minInterval) + minInterval
  
  if (now - lastArrowTime > interval) {
    const direction = Math.random() > 0.5 ? 'left' : 'right'
    const centerY = gameSettings.canvas.height / 2
    
    // 修改箭头初始位置，从屏幕更外侧开始
    const x = direction === 'left' ? 
      -400 :  // 左侧箭头从更远的位置开始
      window.innerWidth + 400  // 右侧箭头从更远的位置开始
    
    arrows.value.push({
      x,
      y: centerY,
      direction,
      speed: arrowSpeed,
      width: 120,
      height: 120,
      active: true,
      state: 'normal',
      isOverlapped: false  // 新增：重叠状态标记
    })
    
    lastArrowTime = now
  }
}

// 修改游戏循环，减慢刷新速度
const FPS = 30
const frameInterval = 1000 / FPS
let lastFrameTime = 0

const gameLoop = (timestamp) => {
  const elapsed = timestamp - lastFrameTime

  if (elapsed > frameInterval) {
    lastFrameTime = timestamp - (elapsed % frameInterval)

    if (gameState.isPlaying && !gameState.isPaused && gameState.gameStarted) {
      createArrow()
      updateArrows()
      draw()  // 这里的绘制可能跟不上姿势检测的速度
    }
  }
  
  animationFrame = requestAnimationFrame(gameLoop)
}

// 修改绘制函数
const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 1. 绘制背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const targetY = centerY + 100  // 固定的Y轴位置
  
  // 增大箭头尺寸
  const arrowSize = {
    width: 120,  // 增大箭头宽度
    height: 120  // 增大箭头高度
  }

  // 使用难度设置中的 targetDistance
  const targetDistance = gameState.currentSettings.targetDistance
  
  // 调整固定箭头位置
  ctx.drawImage(leftArrow, 
    centerX - targetDistance, // 使用难度相关的距离
    targetY - arrowSize.height/2, 
    arrowSize.width, 
    arrowSize.height
  )
  
  ctx.drawImage(rightArrow, 
    centerX + targetDistance - arrowSize.width, // 使用难度相关的距离
    targetY - arrowSize.height/2, 
    arrowSize.width, 
    arrowSize.height
  )

  // 调整箭头绘制位置
  arrows.value.forEach(arrow => {
    let img
    if (arrow.state === 'wrong') {
      img = arrow.direction === 'left' ? leftArrowWrong : rightArrowWrong
    } else if (arrow.state === 'correct') {
      img = arrow.direction === 'left' ? leftArrowCorrect : rightArrowCorrect
    } else {
      img = arrow.direction === 'left' ? leftArrow : rightArrow
    }
    
    ctx.drawImage(img, 
      arrow.x, 
      targetY - arrowSize.height/2, 
      arrowSize.width, 
      arrowSize.height
    )
  })

  // 4. 绘制脚的图片（最顶层）
  if (footMovement.value) {
    const footSize = arrowSize.height
    
    if (footMovement.value.leftPos) {
      ctx.save()
      ctx.drawImage(leftFootImg,
        footMovement.value.leftPos.x - footSize/2,
        targetY - footSize/2,
        footSize,
        footSize
      )
      ctx.restore()
    }
    
    if (footMovement.value.rightPos) {
      ctx.save()
      ctx.drawImage(rightFootImg,
        footMovement.value.rightPos.x - footSize/2,
        targetY - footSize/2,
        footSize,
        footSize
      )
      ctx.restore()
    }
  }
}

// 修改碰撞检测逻辑
const checkArrowHit = (footMovement) => {
  if (!footMovement) return
  
  const centerX = gameSettings.canvas.width / 2
  const { hitThreshold, targetDistance } = gameState.currentSettings

  arrows.value.forEach(arrow => {
    if (!arrow.active || arrow.state !== 'normal' || arrow.isOverlapped) return

    let targetX
    if (arrow.direction === 'left') {
      targetX = centerX - targetDistance
      
      if (footMovement.leftPos) {
        const footDistance = Math.abs(footMovement.leftPos.x - (arrow.x + arrow.width/2))
        
        if (footDistance <= hitThreshold) {
          arrow.isOverlapped = true
          
          // 添加调试日志
          console.log('Hard mode hit check:', {
            arrowX: arrow.x,
            targetX: targetX,
            distance: Math.abs(arrow.x - targetX),
            threshold: hitThreshold
          })
          
          // 修改判定逻辑，增加容错范围
          if (Math.abs(arrow.x - targetX) <= hitThreshold * 1.5) {  // 增加1.5倍容错
            arrow.state = 'correct'
            playSuccess()
            setTimeout(() => {
              arrow.active = false
              updateScore()
            }, 500)
          } else {
            arrow.state = 'wrong'
            playFail()
            decreaseHealth()
            setTimeout(() => {
              arrow.active = false
            }, 1000)
          }
        }
      }
    } else {
      targetX = centerX + targetDistance - arrow.width
      
      if (footMovement.rightPos) {
        const footDistance = Math.abs(footMovement.rightPos.x - (arrow.x + arrow.width/2))
        
        if (footDistance <= hitThreshold) {
          arrow.isOverlapped = true
          
          // 添加调试日志
          console.log('Hard mode hit check:', {
            arrowX: arrow.x,
            targetX: targetX,
            distance: Math.abs(arrow.x - targetX),
            threshold: hitThreshold
          })
          
          // 修改判定逻辑，增加容错范围
          if (Math.abs(arrow.x - targetX) <= hitThreshold * 1.5) {  // 增加1.5倍容错
            arrow.state = 'correct'
            playSuccess()
            setTimeout(() => {
              arrow.active = false
              updateScore()
            }, 500)
          } else {
            arrow.state = 'wrong'
            playFail()
            decreaseHealth()
            setTimeout(() => {
              arrow.active = false
            }, 1000)
          }
        }
      }
    }
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
    width: gameSettings.camera.width,
    height: gameSettings.camera.height
  })

  await camera.start()
}

onMounted(async () => {
  console.log('GameCanvas mounted')
  loadImages()
  await initPose()
  await startCamera()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  if (camera) {
    camera.stop()
  }
})

defineExpose({
  checkArrowHit
})
</script>

<template>
  <div class="game-canvas-container">
    <video 
      ref="videoRef"
      width="640"
      height="480"
      autoplay
      playsinline
      muted
      style="display: none"
    ></video>
    <canvas 
      ref="canvasRef"
      :width="gameSettings.canvas.width"
      :height="gameSettings.canvas.height"
      class="game-canvas"
    ></canvas>
  </div>
</template>

<style scoped>
.game-canvas {
  background: transparent;
}
</style>
