import Phaser from 'phaser'
import { RoomManager } from '../game/RoomManager'
import RoomScene from './Room'

export default class RoomBootScene extends Phaser.Scene {
  roomManager: RoomManager = new RoomManager()

  constructor () {
    super({ key: 'RoomBootScene' })
  }

  create () {
    // Start the room scene with the room manager
    this.scene.start('RoomScene', { roomManager: this.roomManager })
  }
}
