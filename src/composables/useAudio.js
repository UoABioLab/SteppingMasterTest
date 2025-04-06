import { ref } from 'vue'

export function useAudio() {
  const bgMusic = new Audio('/SteppingMaster/resources/Background_music.mp3')
  const successSound = new Audio('/SteppingMaster/resources/Succeed.MP3')
  const failSound = new Audio('/SteppingMaster/resources/Error.mp3')
  const beepSound = new Audio('/SteppingMaster/resources/beep.mp3')
  const isMuted = ref(false)

  // 设置背景音乐循环
  bgMusic.loop = true

  // 音量控制
  const setVolume = (volume) => {
    bgMusic.volume = volume
    successSound.volume = volume
    failSound.volume = volume
    beepSound.volume = volume
  }

  // 静音控制
  const toggleMute = () => {
    isMuted.value = !isMuted.value
    bgMusic.muted = isMuted.value
    successSound.muted = isMuted.value
    failSound.muted = isMuted.value
    beepSound.muted = isMuted.value
  }

  // 播放背景音乐
  const playBgMusic = () => {
    bgMusic.play().catch(error => console.log('Background music autoplay prevented'))
  }

  // 停止背景音乐
  const stopBgMusic = () => {
    bgMusic.pause()
    bgMusic.currentTime = 0
  }

  // 播放成功音效
  const playSuccess = () => {
    successSound.currentTime = 0
    successSound.play().catch(error => console.log('Success sound play prevented'))
  }

  // 播放失败音效
  const playFail = () => {
    failSound.currentTime = 0
    failSound.play().catch(error => console.log('Fail sound play prevented'))
  }

  // 播放倒计时音效
  const playBeep = () => {
    beepSound.currentTime = 0
    beepSound.play().catch(error => console.log('Beep sound play prevented'))
  }

  return {
    isMuted,
    setVolume,
    toggleMute,
    playBgMusic,
    stopBgMusic,
    playSuccess,
    playFail,
    playBeep
  }
} 
