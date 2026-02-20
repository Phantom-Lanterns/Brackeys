import Phaser from 'phaser'
import UIButton from '../ui/UIButton'

export default class CreditsScene extends Phaser.Scene {
  constructor () {
    super({ key: 'CreditsScene' })
  }

  create () {
    const { width, height } = this.scale

    // Dark overlay background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85)

    // ===== TITLE =====
    const title = this.add.text(width / 2, height / 2 - 180, 'CREDITS', {
      fontSize: '40px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5)

    // Soft glow effect (static)
    const glow = this.add.text(width / 2, height / 2 - 180, 'CREDITS', {
      fontSize: '40px',
      fontStyle: 'bold',
      color: '#00ffff'
    }).setOrigin(0.5)
    glow.setAlpha(0.25)

    // ===== TEAM NAMES =====
    this.add.text(
      width / 2,
      height / 2 - 60,
      [
        'Khaled Magdy',
        'Omar Salem',
        'Omar Tantawy',
        'Mohamed Magdy'
      ].join('\n'),
      {
        fontSize: '20px',
        color: '#dddddd',
        align: 'center',
        lineSpacing: 10
      }
    ).setOrigin(0.5)

    // ===== FLAVOR TEXT =====
    this.add.text(
      width / 2,
      height / 2 + 70,
      'Made with Phaser ⚡\nPowered by caffeine, bugs,\nand questionable life choices',
      {
        fontSize: '14px',
        color: '#999999',
        align: 'center',
        lineSpacing: 6
      }
    ).setOrigin(0.5)

    // ===== ASSETS CREDITS (with extra space below flavor text) =====
    this.add.text(
      width / 2,
      height / 2 + 160, // increased from 150 → 160 for more spacing
      [
        '',
        '',
        'Assets & Tools:',
        'Lever Sprite Sheet by Abner Ramirez',
        'https://echoofthebanana.itch.io/2d-lever',
        '',
        'Character Assets by Andreecy',
        'https://andreecy.itch.io/td-character-animation'
      ].join('\n'),
      {
        fontSize: '14px',
        color: '#bbbbbb',
        align: 'center',
        lineSpacing: 6
      }
    ).setOrigin(0.5)

    // ===== BACK BUTTON =====
    const back = new UIButton(this, width / 2, height - 80, 'Back')
    this.add.existing(back)

    back.on('pointerup', () => {
      this.scene.start('MenuScene')
    })
  }
}