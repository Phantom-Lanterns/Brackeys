import Phaser from 'phaser'
import { RoomManager } from '../game/RoomManager'
import Player from '../player/Player'

interface Door {
  direction: 'north' | 'south' | 'east' | 'west'
  x: number
  y: number
  width: number
  height: number
}

export default class RoomScene extends Phaser.Scene {
  doors: Door[] = []
  roomManager!: RoomManager
  currentRoomId: string = ''
  roomWidth: number = 1000
  roomHeight: number = 1000
  doorSize: number = 150
  graphics!: Phaser.GameObjects.Graphics
  miniMapGraphics!: Phaser.GameObjects.Graphics
  wallThickness: number = 20
  player!: Player

  constructor () {
    super({ key: 'RoomScene' })
  }

  init (data: any) {
    this.roomManager = data.roomManager
    this.currentRoomId = this.roomManager.getCurrentRoomId()
  }

  create () {
    this.graphics = this.add.graphics()
    this.miniMapGraphics = this.add.graphics()
    
    this.generateRoom()
    this.player = new Player(this, 500, 500)
  }

  generateRoom () {
    // Door positions - centered on each wall
    this.doors = [
      {
        direction: 'north',
        x: (this.roomWidth - this.doorSize) / 2,
        y: 0,
        width: this.doorSize,
        height: 30,
      },
      {
        direction: 'south',
        x: (this.roomWidth - this.doorSize) / 2,
        y: this.roomHeight - 30,
        width: this.doorSize,
        height: 30,
      },
      {
        direction: 'east',
        x: this.roomWidth - 30,
        y: (this.roomHeight - this.doorSize) / 2,
        width: 30,
        height: this.doorSize,
      },
      {
        direction: 'west',
        x: 0,
        y: (this.roomHeight - this.doorSize) / 2,
        width: 30,
        height: this.doorSize,
      },
    ]
  }

  update (time: number, delta: number) {
    // Update player
    this.player.update(delta)

    // Check door collisions
    this.checkDoorCollisions()

    // Render
    this.render()
  }

  checkDoorCollisions () {
    const playerX = this.player.sprite.x
    const playerY = this.player.sprite.y

    for (const door of this.doors) {
      if (
        playerX >= door.x &&
        playerX <= door.x + door.width &&
        playerY >= door.y &&
        playerY <= door.y + door.height
      ) {
        this.transitionRoom(door.direction)
      }
    }
  }

  transitionRoom (direction: 'north' | 'south' | 'east' | 'west') {
    const newRoomId = this.roomManager.moveToRoom(direction)
    this.currentRoomId = newRoomId

    // Reset player position based on direction
    switch (direction) {
      case 'north':
        this.player.sprite.y = this.roomHeight - 50
        break
      case 'south':
        this.player.sprite.y = 50
        break
      case 'east':
        this.player.sprite.x = 50
        break
      case 'west':
        this.player.sprite.x = this.roomWidth - 50
        break
    }

    // Regenerate room
    this.generateRoom()
  }

  render () {
    const { width, height } = this.scale
    this.graphics.clear()

    // Draw room background (floor)
    this.graphics.fillStyle(0x2a2a2a)
    this.graphics.fillRect(0, 0, this.roomWidth, this.roomHeight)

    // Draw walls (just the borders)
    // this.graphics.strokeStyle(0x666666, this.wallThickness)
    this.graphics.strokeRect(this.wallThickness / 2, this.wallThickness / 2, this.roomWidth - this.wallThickness, this.roomHeight - this.wallThickness)

    // Draw door openings (darker to show they're open)
    this.graphics.fillStyle(0x1a1a1a)
    for (const door of this.doors) {
      this.graphics.fillRect(door.x, door.y, door.width, door.height)
    }

    // Draw room ID text
    this.graphics.fillStyle(0xffffff)
    // this.graphics.fillText(`Room: ${this.currentRoomId}`, 20, 30, 200)

    // Draw mini map
    this.renderMiniMap()
  }

  renderMiniMap () {
    const miniMapSize = 150
    const { width, height } = this.scale
    const miniMapX = width - miniMapSize - 10
    const miniMapY = 10
    const cellSize = 30

    this.miniMapGraphics.clear()

    // Draw mini map background
    this.miniMapGraphics.fillStyle(0x000000, 0.8)
    this.miniMapGraphics.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize)

    // Draw border
    // this.miniMapGraphics.strokeStyle(0xffffff, 2)
    this.miniMapGraphics.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize)

    // Draw visited rooms
    const visitedRooms = this.roomManager.getVisitedRooms()

    visitedRooms.forEach((coords, roomId) => {
      const screenX = miniMapX + miniMapSize / 2 + coords.x * cellSize
      const screenY = miniMapY + miniMapSize / 2 + coords.y * cellSize

      if (roomId === this.currentRoomId) {
        this.miniMapGraphics.fillStyle(0x00ff00)
      } else {
        this.miniMapGraphics.fillStyle(0xffffff)
      }

      this.miniMapGraphics.fillRect(screenX - 5, screenY - 5, 10, 10)
    })

    // Draw connections
    visitedRooms.forEach((coords, roomId) => {
      const screenX = miniMapX + miniMapSize / 2 + coords.x * cellSize
      const screenY = miniMapY + miniMapSize / 2 + coords.y * cellSize

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
          const adjScreenX = miniMapX + miniMapSize / 2 + adjCoords.x * cellSize
          const adjScreenY = miniMapY + miniMapSize / 2 + adjCoords.y * cellSize

          // this.miniMapGraphics.strokeStyle(0x888888, 1)
          this.miniMapGraphics.beginPath()
          this.miniMapGraphics.moveTo(screenX, screenY)
          this.miniMapGraphics.lineTo(adjScreenX, adjScreenY)
          this.miniMapGraphics.strokePath()
        }
      }
    })
  }
}
