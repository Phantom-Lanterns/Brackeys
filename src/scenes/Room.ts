import Phaser from 'phaser'
import { RoomManager } from '../game/RoomManager'
import Player from '../player/Player'
import Door from '../player/Interaction/Door'
import MiniMap from '../utils/MiniMap'
import { CONSTANTS } from '../utils/Constants'

interface DoorConfig {
  direction: 'north' | 'south' | 'east' | 'west'
  x: number
  y: number
}

export default class RoomScene extends Phaser.Scene {
  doors: Map<string, Door> = new Map()
  roomManager!: RoomManager
  currentRoomId: string = ''
  roomWidth: number = CONSTANTS.ROOM_WIDTH
  roomHeight: number = CONSTANTS.ROOM_HEIGHT
  doorSize: number = CONSTANTS.DOOR_SIZE
  graphics!: Phaser.GameObjects.Graphics
  wallThickness: number = CONSTANTS.WALL_THICKNESS
  player!: Player
  miniMap!: MiniMap

  constructor () {
    super({ key: 'RoomScene' })
  }

  init (data: any) {
    this.roomManager = data.roomManager
    this.currentRoomId = this.roomManager.getCurrentRoomId()
  }

  create () {
    // Set physics world bounds to the room size (no camera scrolling)
    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight)

    this.graphics = this.add.graphics()
    this.miniMap = new MiniMap(this, this.roomManager, this.currentRoomId)
    
    this.generateRoom()
    this.player = new Player(this, this.roomWidth / 2, this.roomHeight / 2)
    
    // Constrain physics body to room bounds
    this.player.body.setCollideWorldBounds(true)

    // Setup keyboard for interaction
    this.input.keyboard!.addKey('E').on('down', () => {
      this.player.interact()
    })
    
    // Add a room interactable object (locks/marks the room visited when interacted)
    // Only add if room hasn't been visited yet
    const roomData = this.roomManager.getRoomData(this.currentRoomId)
    if (!roomData?.visited) {
      const interactable = this.add.rectangle(this.roomWidth / 2, this.roomHeight / 2 - 100, 40, 40, 0xffcc00)
      this.physics.add.existing(interactable, true)
      ;(interactable as any).interactable = {
        onInteract: (_player: Player) => {
          // persist current door directions so locked rooms keep the same doors
          this.roomManager.setRoomDoors(this.currentRoomId, Array.from(this.doors.keys()) as any)
          this.roomManager.markVisited(this.currentRoomId);
          (interactable as any).setFillStyle(0x888888)
        }
      }
    }
  }

  generateRoom () {
    // Clear existing doors
    this.doors.clear()

    const centerCoords = this.roomManager.getCurrentRoomCoords()
    // If this room already has persisted doors, use them
    const roomData = this.roomManager.getRoomData(this.currentRoomId)
    if (roomData && roomData.doors && roomData.doors.length > 0) {
      const allConfigs: DoorConfig[] = [
        { direction: 'north', x: this.roomWidth / 2, y: this.doorSize / 2 },
        { direction: 'south', x: this.roomWidth / 2, y: this.roomHeight - this.doorSize / 2 },
        { direction: 'east', x: this.roomWidth - this.doorSize / 2, y: this.roomHeight / 2 },
        { direction: 'west', x: this.doorSize / 2, y: this.roomHeight / 2 },
      ]
      for (const dir of roomData.doors) {
        const cfg = allConfigs.find(c => c.direction === dir)
        if (cfg) {
          const door = new Door(this, cfg.x, cfg.y, this.doorSize, this.doorSize, () => this.transitionRoom(cfg.direction))
          this.doors.set(cfg.direction, door)
        }
      }
      return
    }

    const allConfigs: DoorConfig[] = [
      { direction: 'north', x: this.roomWidth / 2, y: this.doorSize / 2 },
      { direction: 'south', x: this.roomWidth / 2, y: this.roomHeight - this.doorSize / 2 },
      { direction: 'east', x: this.roomWidth - this.doorSize / 2, y: this.roomHeight / 2 },
      { direction: 'west', x: this.doorSize / 2, y: this.roomHeight / 2 },
    ]

    // filter configs by bounds
    const possible: DoorConfig[] = []
    for (const cfg of allConfigs) {
      const tgt = { x: centerCoords.x, y: centerCoords.y }
      switch (cfg.direction) {
        case 'north': tgt.y -= 1; break
        case 'south': tgt.y += 1; break
        case 'east': tgt.x += 1; break
        case 'west': tgt.x -= 1; break
      }
      if (Math.abs(tgt.x) <= 2 && Math.abs(tgt.y) <= 2) possible.push(cfg)
    }

    if (possible.length === 0) return

    // choose random number of doors between 1 and possible.length
    const count = Math.floor(Math.random() * possible.length) + 1

    // shuffle and pick 'count' configs
    for (let i = possible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[possible[i], possible[j]] = [possible[j], possible[i]]
    }

    const selected = possible.slice(0, count)
    for (const cfg of selected) {
      const door = new Door(this, cfg.x, cfg.y, this.doorSize, this.doorSize, () => this.transitionRoom(cfg.direction))
      this.doors.set(cfg.direction, door)
    }
  }

  update (time: number, delta: number) {
    // Update player
    this.player.update(delta)
    
    // Update minimap
    this.miniMap.update(this.currentRoomId)

    // Render
    this.render()
  }

  transitionRoom (direction: 'north' | 'south' | 'east' | 'west') {
    const newRoomId = this.roomManager.moveToRoom(direction)
    
    // Determine which scene should be loaded for this room
    const sceneToLoad = this.roomManager.getSceneForRoom(newRoomId)

    // Transition to that scene
    this.scene.start(sceneToLoad, { roomManager: this.roomManager })
  }

  render () {
    this.graphics.clear()

    // Draw room background (floor) - use room-specific color when available
    const roomData = this.roomManager.getRoomData(this.currentRoomId)
    const bg = 0x2aff2a
    this.graphics.fillStyle(bg)
    this.graphics.fillRect(0, 0, this.roomWidth, this.roomHeight)

    // Draw walls (just the borders)
    this.graphics.strokeRect(
      this.wallThickness / 2,
      this.wallThickness / 2,
      this.roomWidth - this.wallThickness,
      this.roomHeight - this.wallThickness
    )
  }
}
