import Phaser from 'phaser'
import { RoomManager } from '../game/RoomManager'
import Player from '../player/Player'
import Door from '../player/Interaction/Door'
import MiniMap from '../utils/MiniMap'
import { CONSTANTS } from '../utils/Constants'

export default class TestRoom1Scene extends Phaser.Scene {
  roomManager!: RoomManager
  currentRoomId: string = ''
  roomWidth: number = CONSTANTS.ROOM_WIDTH
  roomHeight: number = CONSTANTS.ROOM_HEIGHT
  graphics!: Phaser.GameObjects.Graphics
  player!: Player
  doors: Map<string, Door> = new Map()
  doorSize: number = CONSTANTS.DOOR_SIZE
  miniMap!: MiniMap

  constructor () {
    super({ key: 'TestRoom1Scene' })
  }

  init (data: any) {
    this.roomManager = data.roomManager ?? new RoomManager()
    this.currentRoomId = this.roomManager.getCurrentRoomId()
  }

  create () {
    // Set physics world bounds to the room size
    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight)

    this.graphics = this.add.graphics()
    this.miniMap = new MiniMap(this, this.roomManager, this.currentRoomId)
    this.player = new Player(this, this.roomWidth / 2, this.roomHeight / 2)
    
    // Constrain physics body to room bounds
    this.player.body.setCollideWorldBounds(true)
    
    // Create doors
    this.generateRoom()

    // Add interactable to mark room as visited
    const interactable = this.add.rectangle(this.roomWidth / 2 + 80, this.roomHeight / 2 - 40, 36, 36, 0xffcc00)
    this.physics.add.existing(interactable, true)
    ;(interactable as any).interactable = {
      onInteract: (_player: Player) => {
        // persist doors then mark visited so doors remain the same next time
        this.roomManager.setRoomDoors(this.currentRoomId, Array.from(this.doors.keys()) as any)
        this.roomManager.markVisited(this.currentRoomId);
        (interactable as any).setFillStyle(0x888888)
      }
    }

    // Setup keyboard for interaction
    this.input.keyboard!.addKey('E').on('down', () => {
      this.player.interact()
    })
  }

  update (time: number, delta: number) {
    this.player.update(delta)
    this.currentRoomId = this.roomManager.getCurrentRoomId()
    this.miniMap.update(this.currentRoomId)
    this.render()
  }

  generateRoom() {
    this.doors.clear()

    const centerCoords = this.roomManager.getCurrentRoomCoords()

    // If persisted doors exist for this room, use them
    const roomData = this.roomManager.getRoomData(this.currentRoomId)
    const allConfigs = [
      { direction: 'north' as const, x: this.roomWidth / 2, y: this.doorSize / 2 },
      { direction: 'south' as const, x: this.roomWidth / 2, y: this.roomHeight - this.doorSize / 2 },
      { direction: 'east' as const, x: this.roomWidth - this.doorSize / 2, y: this.roomHeight / 2 },
      { direction: 'west' as const, x: this.doorSize / 2, y: this.roomHeight / 2 },
    ]

    if (roomData && roomData.doors && roomData.doors.length > 0) {
      for (const dir of roomData.doors) {
        const cfg = allConfigs.find(c => c.direction === dir)
        if (cfg) {
          const door = new Door(this, cfg.x, cfg.y, this.doorSize, this.doorSize, () => this.transitionRoom(cfg.direction))
          this.doors.set(cfg.direction, door)
        }
      }
      return
    }

    const possible: typeof allConfigs = []
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

    const count = Math.floor(Math.random() * possible.length) + 1
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

  transitionRoom(direction: 'north' | 'south' | 'east' | 'west') {
    const newRoomId = this.roomManager.moveToRoom(direction)
    const sceneToLoad = this.roomManager.getSceneForRoom(newRoomId)
    this.scene.start(sceneToLoad, { roomManager: this.roomManager })
  }

  render () {
    this.graphics.clear()

    // Room background (use room-specific color when available)
    const roomData = this.roomManager.getRoomData(this.currentRoomId)
    const bg = 0x3a2a2a
    this.graphics.fillStyle(bg)
    this.graphics.fillRect(0, 0, this.roomWidth, this.roomHeight)

    // Walls
    //this.graphics.strokeStyle(0xff6666, 20)
    this.graphics.strokeRect(10, 10, this.roomWidth - 20, this.roomHeight - 20)

    // Text
    this.graphics.fillStyle(0xffffff)
    //this.graphics.fillText('Test Room 1 (Red)', 20, 30, 200)
  }
}
