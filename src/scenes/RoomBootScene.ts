import Phaser from 'phaser'
import { RoomManager } from '../game/RoomManager'

export default class RoomBootScene extends Phaser.Scene {
  roomManager: RoomManager = new RoomManager()

  constructor () {
    super({ key: 'RoomBootScene' })
  }

  create () {
    // Clear all states and map data by creating a fresh RoomManager
    this.roomManager = new RoomManager()
    
    // Start the room scene with the room manager
    this.scene.start('RoomScene', { roomManager: this.roomManager })
  }
}
