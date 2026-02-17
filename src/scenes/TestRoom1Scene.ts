import Phaser from 'phaser'
import { RoomManager } from '../game/RoomManager'
import Player from '../player/Player'

export default class TestRoom1Scene extends Phaser.Scene {
  roomManager!: RoomManager
  roomWidth: number = 1000
  roomHeight: number = 1000
  graphics!: Phaser.GameObjects.Graphics
  player!: Player

  constructor () {
    super({ key: 'TestRoom1Scene' })
  }

  init (data: any) {
    this.roomManager = data.roomManager
  }

  create () {
    this.graphics = this.add.graphics()
    this.player = new Player(this, 500, 500)
  }

  update (time: number, delta: number) {
    this.player.update(delta)
    this.render()
  }

  render () {
    this.graphics.clear()

    // Room background (red tinted for test room 1)
    this.graphics.fillStyle(0x3a2a2a)
    this.graphics.fillRect(0, 0, this.roomWidth, this.roomHeight)

    // Walls
    //this.graphics.strokeStyle(0xff6666, 20)
    this.graphics.strokeRect(10, 10, this.roomWidth - 20, this.roomHeight - 20)

    // Doors
    const doorSize = 150
    this.graphics.fillStyle(0x1a1a1a)
    this.graphics.fillRect((this.roomWidth - doorSize) / 2, 0, doorSize, 30) // north
    this.graphics.fillRect((this.roomWidth - doorSize) / 2, this.roomHeight - 30, doorSize, 30) // south
    this.graphics.fillRect(this.roomWidth - 30, (this.roomHeight - doorSize) / 2, 30, doorSize) // east
    this.graphics.fillRect(0, (this.roomHeight - doorSize) / 2, 30, doorSize) // west
    this.graphics.fillStyle(0xffffff)
    //this.graphics.fillText('Test Room 1 (Red)', 20, 30, 200)
  }
}
