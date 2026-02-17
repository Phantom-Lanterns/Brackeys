import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  create () {
    // Hand off to PreloadScene which displays progress and loads the full asset set
    this.scene.start('PreloadScene')
  }
}
