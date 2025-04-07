const SteppingMaster = {
    en: {
      title: "Stepping Master (Lateral Lunge)",
      start: "Start Game",
      back: "Back to Menu",
      gameOver: "Game Over!",
      selectDifficulty: "Select Difficulty",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      retry: "Retry",
      error: "Game start failed, please try again",
      calibrate: "Please maintain a standing position",
      score: "Score",
      lives: "Lives",
      countTime: "CountdownTimer",
      timePlayed: "Time Played",
      finalScore: "Final Score",
      finalLife: "Final Lives",
      highScore: "High Score",
      player: "Player",
      mode: "Mode",

    },
    zh: {
      title: "节奏大师 (侧弓步)",
      start: "开始游戏",
      back: "返回菜单",
      gameOver: "游戏结束！",
      selectDifficulty: "选择难度",
      easy: "简单",
      medium: "中等",
      hard: "困难",
      retry: "重试",
      error: "游戏启动失败，请重试",
      calibrate: "请保持站立姿势",
      score: "分数",
      lives: "生命值",
      countTime: "倒计时",
      timePlayed: "游戏时间",
      finalScore: "最终得分",
      finalLife: "最终生命值",
      highScore: "最高分",
      player: "玩家",
      mode: "模式",
    }
  }
  
  const currentLang = localStorage.getItem('language') || 'en'
  
  export function t(key) {
    return SteppingMaster[currentLang]?.[key] || key
  }