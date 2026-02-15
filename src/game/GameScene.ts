import Phaser from 'phaser'
import Player from '../player/Player'
import TutorialHUD from '../ui/TutorialHUD'

export default class GameScene extends Phaser.Scene {
  private player!: Player
  private hud?: TutorialHUD

  constructor () {
    super({ key: 'GameScene' })
  }

  create () {
    const { width, height } = this.scale

    // create player with physics
    this.player = new Player(this, width / 2, height / 2)

    // ensure world bounds match game size
    this.physics.world.setBounds(0, 0, width, height)

    // example: create a static obstacle to demonstrate collisions
    const obstacle = this.add.rectangle(width / 2 + 100, height / 2, 64, 64, 0x666666)
    this.physics.add.existing(obstacle, true)
    // ensure obstacle is affected by lights
    try { (obstacle as any).setPipeline('Light2D') } catch (e) {}
    // set collider so player collides with obstacle
    this.player.collideWith(obstacle, (_playerObj: any, _ob: any) => {
      const body = (_playerObj && _playerObj.body) as Phaser.Physics.Arcade.Body | undefined
      if (body) body.stop()
    })

    // Tutorial HUD: use class to encapsulate lifecycle
    this.hud = new TutorialHUD(this, 20, 20)

    // Add a farther cube to demonstrate darkness falloff (should be invisible when out of range)
    const farObstacle = this.add.rectangle(width / 2 + 360, height / 2, 64, 64, 0x777777)
    this.physics.add.existing(farObstacle, true)
    try { (farObstacle as any).setPipeline('Light2D') } catch (e) {}

  }

  update (time: number, delta: number) {
    this.player.update(delta / 1000)
  }
}
