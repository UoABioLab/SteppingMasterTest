import { ref, onMounted, onUnmounted } from 'vue'
import { gameSettings } from '../config/gameSettings'

export function usePoseDetection(emit) {
  const poseData = ref(null)
  const isDetecting = ref(false)
  const lastLeftFootY = ref(0)
  const lastRightFootY = ref(0)
  const footMovement = ref({ left: false, right: false })
  let camera = null
  let pose = null

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
      
      await pose.initialize()
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })
      
      pose.onResults((results) => {
        if (results.poseLandmarks) {
          poseData.value = results.poseLandmarks
          // 检测脚步动作
          const movement = detectFootMovement(results.poseLandmarks)
          if (movement.left || movement.right) {
            console.log('Foot movement detected:', movement)
          }
          footMovement.value = movement
        }
      })
    } catch (error) {
      console.error('Error initializing pose:', error)
    }
  }

  // 检测脚步动作
  const detectFootMovement = (landmarks) => {
    const leftFoot = landmarks[31]  // 左脚
    const rightFoot = landmarks[32] // 右脚
    
    // 由于摄像头是镜像的，所以需要反转 x 坐标
    // 使用 (1 - x) 来反转坐标
    return {
      leftPos: {
        x: (1 - leftFoot.x) * window.innerWidth,  // 修正左脚坐标
        y: window.innerHeight / 2
      },
      rightPos: {
        x: (1 - rightFoot.x) * window.innerWidth, // 修正右脚坐标
        y: window.innerHeight / 2
      }
    }
  }

  // 检查脚是否在箭头区域
  const checkFootInArrowZone = (foot, side) => {
    // 这里需要根据实际游戏中箭头的位置来设置判定区域
    const centerX = window.innerWidth / 2
    const arrowWidth = 60
    
    if (side === 'left') {
      return foot.x > centerX - 150 && foot.x < centerX - 90
    } else {
      return foot.x > centerX + 90 && foot.x < centerX + 150
    }
  }

  const startPoseDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: gameSettings.camera.width,
          height: gameSettings.camera.height
        } 
      })
      const videoElement = document.createElement('video')
      videoElement.srcObject = stream
      camera = new window.Camera(videoElement, {
        onFrame: async () => {
          if (pose && isDetecting.value) {
            await pose.send({ image: videoElement })
          }
        },
        width: gameSettings.camera.width,
        height: gameSettings.camera.height
      })
      isDetecting.value = true
      camera.start()
    } catch (error) {
      console.error('Error starting pose detection:', error)
    }
  }

  const stopPoseDetection = () => {
    if (camera) {
      camera.stop()
    }
    isDetecting.value = false
  }

  onMounted(() => {
    initPose()
  })

  onUnmounted(() => {
    stopPoseDetection()
  })

  return {
    poseData,
    isDetecting,
    footMovement,
    startPoseDetection,
    stopPoseDetection,
    detectFootMovement
  }
} 
