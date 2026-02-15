import Phaser from 'phaser'
import UIButton from '../ui/UIButton'
import AudioManager from '../audio/AudioManager'

export default class SettingsScene extends Phaser.Scene {
  private audio = AudioManager.getInstance()

  constructor () {
    super({ key: 'SettingsScene' })
  }

  create () {
    const { width, height } = this.scale

    this.audio.initWithScene(this)

    this.add.text(width / 2, height / 2 - 120, 'Settings', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // Music toggle and volume
    const musicLabel = this.add.text(width / 2 - 80, height / 2 - 40, `Music: ${this.audio.isMusicEnabled() ? 'On' : 'Off'}` , { color: '#fff' }).setOrigin(0, 0.5)
    const musicToggle = new UIButton(this, width / 2 + 80, height / 2 - 40, 'Toggle')
    this.add.existing(musicToggle)
    musicToggle.on('pointerup', () => {
      this.audio.toggleMusic()
      musicLabel.setText(`Music: ${this.audio.isMusicEnabled() ? 'On' : 'Off'}`)
    })

    const musicVolLabel = this.add.text(width / 2 - 80, height / 2, `Music Vol: ${Math.round(this.audio.getMusicVolume() * 100)}` , { color: '#fff' }).setOrigin(0, 0.5)
    const musicDec = new UIButton(this, width / 2 + 20, height / 2, '-')
    const musicInc = new UIButton(this, width / 2 + 80, height / 2, '+')
    this.add.existing(musicDec)
    this.add.existing(musicInc)
    musicDec.on('pointerup', () => {
      const v = Math.max(0, this.audio.getMusicVolume() - 0.1)
      this.audio.setMusicVolume(v)
      musicVolLabel.setText(`Music Vol: ${Math.round(v * 100)}`)
    })
    musicInc.on('pointerup', () => {
      const v = Math.min(1, this.audio.getMusicVolume() + 0.1)
      this.audio.setMusicVolume(v)
      musicVolLabel.setText(`Music Vol: ${Math.round(v * 100)}`)
    })

    // SFX toggle and volume
    const sfxLabel = this.add.text(width / 2 - 80, height / 2 + 60, `SFX: ${this.audio.isSfxEnabled() ? 'On' : 'Off'}` , { color: '#fff' }).setOrigin(0, 0.5)
    const sfxToggle = new UIButton(this, width / 2 + 80, height / 2 + 60, 'Toggle')
    this.add.existing(sfxToggle)
    sfxToggle.on('pointerup', () => {
      this.audio.toggleSfx()
      sfxLabel.setText(`SFX: ${this.audio.isSfxEnabled() ? 'On' : 'Off'}`)
    })

    const sfxVolLabel = this.add.text(width / 2 - 80, height / 2 + 100, `SFX Vol: ${Math.round(this.audio.getSfxVolume() * 100)}` , { color: '#fff' }).setOrigin(0, 0.5)
    const sfxDec = new UIButton(this, width / 2 + 20, height / 2 + 100, '-')
    const sfxInc = new UIButton(this, width / 2 + 80, height / 2 + 100, '+')
    this.add.existing(sfxDec)
    this.add.existing(sfxInc)
    sfxDec.on('pointerup', () => {
      const v = Math.max(0, this.audio.getSfxVolume() - 0.1)
      this.audio.setSfxVolume(v)
      sfxVolLabel.setText(`SFX Vol: ${Math.round(v * 100)}`)
    })
    sfxInc.on('pointerup', () => {
      const v = Math.min(1, this.audio.getSfxVolume() + 0.1)
      this.audio.setSfxVolume(v)
      sfxVolLabel.setText(`SFX Vol: ${Math.round(v * 100)}`)
    })

    // Controls panel
    this.add.text(width / 2, height / 2 + 160, 'Controls: Arrow keys or WASD to move', { color: '#fff' }).setOrigin(0.5)

    const back = new UIButton(this, width / 2, height / 2 + 220, 'Back')
    this.add.existing(back)
    back.on('pointerup', () => this.scene.start('MenuScene'))
  }
}
