import Phaser from 'phaser'
import UIButton from '../ui/UIButton'

export default class MenuScene extends Phaser.Scene {
  constructor () {
    super({ key: 'MenuScene' })
  }

  create () {
    const { width, height } = this.scale

    this.add.text(width / 2, height / 2 - 120, 'My Phaser Game', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5)

    const start = new UIButton(this, width / 2, height / 2 - 20, 'Start')
    const settings = new UIButton(this, width / 2, height / 2 + 40, 'Settings')
    const credits = new UIButton(this, width / 2, height / 2 + 100, 'Credits')

    this.add.existing(start)
    this.add.existing(settings)
    this.add.existing(credits)

    start.on('pointerup', () => this.scene.start('GameScene'))
    settings.on('pointerup', async () => {
      const mod = await import('./SettingsScene')
      if (!this.scene.get('SettingsScene')) this.scene.add('SettingsScene', mod.default, false)
      this.scene.start('SettingsScene')
    })

    credits.on('pointerup', async () => {
      const mod = await import('./CreditsScene')
      if (!this.scene.get('CreditsScene')) this.scene.add('CreditsScene', mod.default, false)
      this.scene.start('CreditsScene')
    })
  }
}
