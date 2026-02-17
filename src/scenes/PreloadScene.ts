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
      style: { font: '20px monospace', fill: '#ffffff' }
    }).setOrigin(0.5)

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: { font: '18px monospace', fill: '#ffffff' }
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

    // small placeholders so AudioManager has something to use
    const silentWav = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='
    this.load.audio('bgm', silentWav)
    this.load.audio('sfx', silentWav)

    // optional small logo used on menu
    this.load.image('logo', 'assets/logo.png')

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
