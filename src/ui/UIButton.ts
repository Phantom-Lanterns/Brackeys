import Phaser from 'phaser'

export default class UIButton extends Phaser.GameObjects.Container {
  constructor (scene: Phaser.Scene, x: number, y: number, label: string) {
    super(scene, x, y)

    const bg = scene.add.rectangle(0, 0, 160, 40, 0x333333)
    bg.setStrokeStyle(2, 0xffffff)
    const text = scene.add.text(0, 0, label, { color: '#fff' }).setOrigin(0.5)

    this.add([bg, text])
    this.setSize(160, 40)
    this.setInteractive({ useHandCursor: true })
    this.scene.input.setDraggable(this)
    this.scene.input.setTopOnly(true)

    this.on('pointerover', () => bg.setFillStyle(0x555555))
    this.on('pointerout', () => bg.setFillStyle(0x333333))
  }
}
