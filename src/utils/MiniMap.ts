import Phaser from 'phaser'
import { RoomManager } from '../game/RoomManager'
import { CONSTANTS } from './Constants'

export default class MiniMap {
  scene: Phaser.Scene
  roomManager: RoomManager
  graphics: Phaser.GameObjects.Graphics
  currentRoomId: string

  constructor(scene: Phaser.Scene, roomManager: RoomManager, currentRoomId: string) {
    this.scene = scene
    this.roomManager = roomManager
    this.currentRoomId = currentRoomId
    this.graphics = scene.add.graphics()
    this.graphics.setScrollFactor(0, 0) // Fixed to viewport
    this.graphics.setDepth(100) // Above other objects
  }

  update(currentRoomId: string) {
    this.currentRoomId = currentRoomId
    this.render()
  }

  render() {
    this.graphics.clear()

    const { width, height } = this.scene.scale
    const miniMapX = width - CONSTANTS.MINIMAP_SIZE - CONSTANTS.MINIMAP_OFFSET_X
    const miniMapY = CONSTANTS.MINIMAP_OFFSET_Y

    // Draw mini map background
    this.graphics.fillStyle(0x000000, 0.8)
    this.graphics.fillRect(miniMapX, miniMapY, CONSTANTS.MINIMAP_SIZE, CONSTANTS.MINIMAP_SIZE)

    // Draw border
    this.graphics.strokeRect(miniMapX, miniMapY, CONSTANTS.MINIMAP_SIZE, CONSTANTS.MINIMAP_SIZE)

    // Draw visited rooms
    const visitedRooms = this.roomManager.getVisitedRooms()

    visitedRooms.forEach((coords, roomId) => {
      const screenX = miniMapX + CONSTANTS.MINIMAP_SIZE / 2 + coords.x * CONSTANTS.MINIMAP_CELL_SIZE
      const screenY = miniMapY + CONSTANTS.MINIMAP_SIZE / 2 + coords.y * CONSTANTS.MINIMAP_CELL_SIZE

      if (roomId === this.currentRoomId) {
        this.graphics.fillStyle(0x00ff00)
      } else {
        this.graphics.fillStyle(0xffffff)
      }

      this.graphics.fillRect(screenX - 5, screenY - 5, 10, 10)
    })

    // Draw connections
    visitedRooms.forEach((coords, roomId) => {
      const screenX = miniMapX + CONSTANTS.MINIMAP_SIZE / 2 + coords.x * CONSTANTS.MINIMAP_CELL_SIZE
      const screenY = miniMapY + CONSTANTS.MINIMAP_SIZE / 2 + coords.y * CONSTANTS.MINIMAP_CELL_SIZE

      const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
      ]

      for (const dir of directions) {
        const adjacentId = `${coords.x + dir.dx},${coords.y + dir.dy}`
        if (visitedRooms.has(adjacentId)) {
          const adjCoords = visitedRooms.get(adjacentId)!
          const adjScreenX = miniMapX + CONSTANTS.MINIMAP_SIZE / 2 + adjCoords.x * CONSTANTS.MINIMAP_CELL_SIZE
          const adjScreenY = miniMapY + CONSTANTS.MINIMAP_SIZE / 2 + adjCoords.y * CONSTANTS.MINIMAP_CELL_SIZE

          this.graphics.beginPath()
          this.graphics.moveTo(screenX, screenY)
          this.graphics.lineTo(adjScreenX, adjScreenY)
          this.graphics.strokePath()
        }
      }
    })
  }

  destroy() {
    this.graphics.destroy()
  }
}
