import Phaser from 'phaser'
import loadAllAssets from '../utils/preloader'
import AudioManager from '../audio/AudioManager'

export default class PreloadScene extends Phaser.Scene {
  constructor () {
    super({ key: 'PreloadScene' })
  }

  preload () {
    const { width, height } = this.cameras.main

    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)

    const progressBar = this.add.graphics()

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: { font: '20px monospace', color: '#ffffff' }
    }).setOrigin(0.5)

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: { font: '18px monospace', color: '#ffffff' }
    }).setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30)
      percentText.setText(Math.round(value * 100) + '%')
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
    })

    // Load background music explicitly as 'bgm' (Music folder)
    this.load.audio('bgm', 'assets/Music/Destiny.wav')

    // player spritesheet (16x16 frames, 16 frames total: 4 down, 4 up, 4 right, 4 left)
    this.load.spritesheet('player_walk', 'assets/character1.png', { frameWidth: 16, frameHeight: 32 })

    // lever spritesheet (64x64 frames, 5 frames: left=closed, right=open)
    this.load.spritesheet('lever', 'assets/lever.png', { frameWidth: 64, frameHeight: 64 })

    // enqueue all known assets
    loadAllAssets(this)
  }

  create () {
    const audio = AudioManager.getInstance()
    audio.initWithScene(this)
    audio.playMusicIfAvailable()

    this.scene.start('MenuScene')
  }
}
