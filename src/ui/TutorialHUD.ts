import Phaser from 'phaser'

export default class TutorialHUD {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  private destroyed = false
  private dismissHandler: () => void

  constructor (scene: Phaser.Scene, x = 20, y = 20, duration = 6000) {
    this.scene = scene

    const hudBg = scene.add.rectangle(0, 0, 380, 120, 0x000000, 0.6).setOrigin(0, 0)
    const hudText = scene.add.text(12, 12, 'Tutorial:\nUse Arrow keys or WASD to move.\nPress any key or click to continue.', { color: '#ffffff', fontSize: '16px', wordWrap: { width: 360 } })
    this.container = scene.add.container(x, y, [hudBg, hudText])

    this.dismissHandler = () => this.destroy()

    const kb = scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin
    kb.once('keydown', this.dismissHandler)
    scene.input.once('pointerdown', this.dismissHandler)
    scene.time.delayedCall(duration, this.dismissHandler)
  }

  destroy () {
    if (this.destroyed) return
    this.destroyed = true
    // best-effort cleanup; listeners set with `once` won't leak, but keep idempotent
    try {
      this.container.destroy()
    } catch (e) {
      // ignore
    }
  }
}
