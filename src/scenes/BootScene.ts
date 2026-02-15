import Phaser from 'phaser'
import AudioManager from '../audio/AudioManager'

export default class BootScene extends Phaser.Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  preload () {
    // load placeholder audio as data URIs (small silent WAV) so AudioManager has something to play
    const silentWav = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='
    this.load.audio('bgm', silentWav)
    this.load.audio('sfx', silentWav)

    // other assets
    this.load.image('logo', 'assets/logo.png')
  }

  create () {
    // initialize audio manager and start music if available
    const audio = AudioManager.getInstance()
    audio.initWithScene(this)
    audio.playMusicIfAvailable()

    this.scene.start('MenuScene')
  }
}
