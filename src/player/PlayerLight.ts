import Phaser from 'phaser'

type Opts = {
  lightRadius?: number
  intensity?: number
  coneKey?: string
  coneScale?: number
  coneW?: number
  coneH?: number
  ambientColor?: number
  coneSegments?: number
  coneLength?: number
}

export default class PlayerLight {
  scene: Phaser.Scene
  playerObj: Phaser.GameObjects.GameObject & { x: number; y: number }
  light: any
  coneLights: any[]
  cone?: Phaser.GameObjects.Image
  opts: Opts
  textureKey: string

  constructor (scene: Phaser.Scene, playerObj: Phaser.GameObjects.GameObject & { x: number; y: number }, opts: Opts = {}) {
    this.scene = scene
    this.playerObj = playerObj
    this.opts = Object.assign({ lightRadius: 300, intensity: 1.4, coneKey: 'cone', coneScale: 0.8, coneW: 512, coneH: 256, ambientColor: 0x020202, coneSegments: 6, coneLength: 420 }, opts)

    // enable lights on scene if not already
    if (!this.scene.lights.active) {
      this.scene.lights.enable()
    }
    if (this.opts.ambientColor !== undefined) this.scene.lights.setAmbientColor(this.opts.ambientColor)

    // add central point light (covers immediate area around player)
    this.light = this.scene.lights.addLight(this.playerObj.x, this.playerObj.y, this.opts.lightRadius, 0xffffff, this.opts.intensity)

    // create multiple lights along the cone axis to approximate a directional/spotlight
    this.coneLights = []
    const segments = this.opts.coneSegments || 6
    const length = this.opts.coneLength || 420
    for (let i = 1; i <= segments; i++) {
      // radius grows with distance; intensity falls off
      const t = i / segments
      const segRadius = Math.max(40, (this.opts.lightRadius || 300) * (0.2 + 0.8 * t))
      const segIntensity = (this.opts.intensity || 1.4) * (1 - 0.6 * t)
      const l = this.scene.lights.addLight(this.playerObj.x, this.playerObj.y, segRadius, 0xffffcc, segIntensity)
      this.coneLights.push(l)
    }

    // create cone texture (unique key per scene to avoid collisions)
    this.textureKey = `${this.opts.coneKey || 'cone'}-${this.scene.sys.settings.key}`
    if (!this.scene.textures.exists(this.textureKey)) {
      const cw = this.opts.coneW || 512
      const ch = this.opts.coneH || 256
      const canvasTex = this.scene.textures.createCanvas(this.textureKey, cw, ch)
      const ctx = canvasTex && canvasTex.getContext()
      if (ctx) {
        ctx.clearRect(0, 0, cw, ch)
        const grad = ctx.createLinearGradient(0, ch / 2, cw, ch / 2)
        grad.addColorStop(0, 'rgba(255,255,220,1)')
        grad.addColorStop(0.6, 'rgba(255,255,180,0.6)')
        grad.addColorStop(1, 'rgba(255,255,180,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(0, ch / 2)
        ctx.lineTo(cw, 0)
        ctx.lineTo(cw, ch)
        ctx.closePath()
        ctx.fill()
        canvasTex.refresh()
      }
    }

    this.cone = this.scene.add.image(this.playerObj.x, this.playerObj.y, this.textureKey).setBlendMode(Phaser.BlendModes.ADD).setDepth(90).setOrigin(0, 0.5).setScale(this.opts.coneScale || 0.8)
  }

  update (pointer?: Phaser.Input.Pointer) {
    if (!this.playerObj) return
    if (this.light) {
      this.light.x = this.playerObj.x
      this.light.y = this.playerObj.y
    }

    // update cone lights positions to follow player + pointer direction
    const ptr = pointer || this.scene.input.activePointer
    const angle = Phaser.Math.Angle.Between(this.playerObj.x, this.playerObj.y, ptr.worldX, ptr.worldY)
    if (this.cone) {
      this.cone.setPosition(this.playerObj.x, this.playerObj.y)
      this.cone.setRotation(angle)
    }

    if (this.coneLights && this.coneLights.length > 0) {
      const segments = this.opts.coneSegments || 6
      const length = this.opts.coneLength || 420
      const dx = Math.cos(angle)
      const dy = Math.sin(angle)
      for (let i = 0; i < this.coneLights.length; i++) {
        const t = (i + 1) / segments
        const dist = t * length
        const lx = this.playerObj.x + dx * dist
        const ly = this.playerObj.y + dy * dist
        const l = this.coneLights[i]
        if (l) {
          l.x = lx
          l.y = ly
        }
      }
    }
  }

  destroy () {
    try {
      if (this.light && this.scene.lights) this.scene.lights.removeLight(this.light)
    } catch (e) {}
    try {
      if (this.coneLights && this.scene.lights) {
        for (const l of this.coneLights) {
          try { this.scene.lights.removeLight(l) } catch (e) {}
        }
      }
    } catch (e) {}
    try {
      if (this.cone) this.cone.destroy()
    } catch (e) {}
  }
}
