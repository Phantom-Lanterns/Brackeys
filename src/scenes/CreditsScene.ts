import Phaser from 'phaser'
import UIButton from '../ui/UIButton'

export default class CreditsScene extends Phaser.Scene {
  constructor () {
    super({ key: 'CreditsScene' })
  }

  create () {
    const { width, height } = this.scale

    this.add.text(width / 2, height / 2 - 40, 'Credits', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2, 'Made with Phaser', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5)

    const back = new UIButton(this, width / 2, height / 2 + 80, 'Back')
    this.add.existing(back)
    back.on('pointerup', () => this.scene.start('MenuScene'))
  }
}
