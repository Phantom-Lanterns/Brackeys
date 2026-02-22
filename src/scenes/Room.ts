import Phaser from 'phaser'
import { RoomManager } from '../game/RoomManager'
import Player from '../player/Player'
import Door from '../player/Interaction/Door'
import MiniMap from '../utils/MiniMap'
import AudioManager from '../audio/AudioManager'
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
  tiles: (Phaser.GameObjects.Image | Phaser.GameObjects.TileSprite)[] = []
  furniture: Phaser.GameObjects.Image[] = []
  wallThickness: number = CONSTANTS.WALL_THICKNESS
  floorKey?: string
  wallKey?: string
  player!: Player
  miniMap!: MiniMap
  restartHoldDuration: number = 0
  restartThreshold: number = 1500 // milliseconds
  restartGraphics!: Phaser.GameObjects.Graphics

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

    // Center the camera on the room
    this.cameras.main.centerOn(this.roomWidth / 2, this.roomHeight / 2)
    // Set the area outside the room to black
    this.cameras.main.setBackgroundColor(0x000000)

    this.graphics = this.add.graphics()
    this.miniMap = new MiniMap(this, this.roomManager, this.currentRoomId)
    this.restartGraphics = this.add.graphics()
    this.restartGraphics.setScrollFactor(0, 0) // Fixed to viewport
    this.restartGraphics.setDepth(101) // Above minimap
    
    this.generateRoom()
    this.player = new Player(this, this.roomWidth / 2, this.roomHeight / 2)
    
    // Constrain physics body to room bounds
    this.player.body.setCollideWorldBounds(true)

    // Setup keyboard for interaction
    this.input.keyboard!.addKey('E').on('down', () => {
      this.player.interact()
    })

    // Setup keyboard for restart (hold R)
    const rKey = this.input.keyboard!.addKey('R')
    rKey.on('down', () => {
      this.restartHoldDuration = 0
    })
    rKey.on('up', () => {
      this.restartHoldDuration = 0
    })
    
    // Add a room interactable object (lever - locks/marks the room visited when interacted)
    // Always create the lever; show triggered state if room is visited
    const roomData = this.roomManager.getRoomData(this.currentRoomId)
    const lever = this.add.sprite(this.roomWidth / 2, this.roomHeight / 2 - 100, 'lever', 0)
    lever.setOrigin(0.5)
    lever.setScale(2)
    lever.setDepth(1)
    this.physics.add.existing(lever, true)
    ;(lever as any).currentLeverFrame = roomData?.visited ? 4 : 0
    
    // Set frame based on room state
    if (roomData?.visited) {
      lever.setFrame(4)
    }
    
    // Only make it interactable if room hasn't been visited
    if (!roomData?.visited) {
      ;(lever as any).interactable = {
        onInteract: (_player: Player) => {
          // Play lever SFX
          try { AudioManager.getInstance().playSfx('sfx_Lever') } catch (e) {}

          // Set lever to fully open (frame 4) on first interact
          lever.setFrame(4)
          ;(lever as any).currentLeverFrame = 4
          
          // Mark room as visited
          // persist current door directions and appearance so locked rooms keep the same doors and visuals
          this.roomManager.setRoomDoors(this.currentRoomId, Array.from(this.doors.keys()) as any, this.floorKey, this.wallKey)
          this.roomManager.markVisited(this.currentRoomId);
          
          // Check win condition
          if (this.roomManager.hasWon()) {
            this.scene.start('CreditsScene')
            return
          }
        }
      }
    }
  }

  generateRoom () {
    // Clear existing doors
    this.doors.clear()
    // Clear existing tiles
    if (this.tiles && this.tiles.length > 0) {
      this.tiles.forEach(t => t.destroy())
      this.tiles = []
    }

    const centerCoords = this.roomManager.getCurrentRoomCoords()
    // calculate effective wall thickness used for visuals and door placement
    const thickness = Math.max(1, Math.round(this.wallThickness * 2))
    // If this room already has persisted doors, use them
    const roomData = this.roomManager.getRoomData(this.currentRoomId)
    if (roomData && roomData.doors && roomData.doors.length > 0) {
      // restore saved visuals if present
      this.createTilesAndWalls(roomData.floorKey, roomData.wallKey)
      const allConfigs: DoorConfig[] = [
        { direction: 'north', x: this.roomWidth / 2, y: this.doorSize / 2 },
        { direction: 'south', x: this.roomWidth / 2, y: this.roomHeight - this.doorSize / 2 },
        { direction: 'east', x: this.roomWidth - this.doorSize / 2, y: this.roomHeight / 2 },
        { direction: 'west', x: this.doorSize / 2, y: this.roomHeight / 2 },
      ]
      for (const dir of roomData.doors) {
        const cfg = allConfigs.find(c => c.direction === dir)
        if (cfg) {
            // compute door size and pushed position so door sits into the wall
            let dw = this.doorSize
            let dh = this.doorSize
            let dx = cfg.x
            let dy = cfg.y

            if (cfg.direction === 'north' || cfg.direction === 'south') {
              // door spans across wall horizontally; make it taller so it isn't squashed
              dw = this.doorSize
              dh = Math.max(this.doorSize, Math.round(thickness * 1.8))
              // place so the door's bottom (inner edge) aligns with the room inner boundary
              if (cfg.direction === 'north') {
                dy = -Math.round(dh / 2)
              } else {
                dy = Math.round(this.roomHeight + dh / 2)
              }
            } else {
              // east/west doors: make them wider so they fit wall height
              dw = Math.max(this.doorSize, Math.round(thickness * 1.8))
              dh = this.doorSize
              if (cfg.direction === 'west') {
                dx = -Math.round(dw / 2)
              } else {
                dx = Math.round(this.roomWidth + dw / 2)
              }
            }

            const door = new Door(this, dx, dy, dw, dh, () => this.transitionRoom(cfg.direction), cfg.direction, this.chooseDoorTexture())
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
      let dw = this.doorSize
      let dh = this.doorSize
      let dx = cfg.x
      let dy = cfg.y

      if (cfg.direction === 'north' || cfg.direction === 'south') {
        dw = this.doorSize
        dh = Math.max(this.doorSize, Math.round(thickness * 1.8))
        if (cfg.direction === 'north') {
          dy = -Math.round(dh / 2)
        } else {
          dy = Math.round(this.roomHeight + dh / 2)
        }
      } else {
        dw = Math.max(this.doorSize, Math.round(thickness * 1.8))
        dh = this.doorSize
        if (cfg.direction === 'west') {
          dx = -Math.round(dw / 2)
        } else {
          dx = Math.round(this.roomWidth + dw / 2)
        }
      }

      const door = new Door(this, dx, dy, dw, dh, () => this.transitionRoom(cfg.direction), cfg.direction, this.chooseDoorTexture())
      this.doors.set(cfg.direction, door)
    }

    // After doors are set, create tiled floor and walls for this room
    this.createTilesAndWalls()
  }

  createTilesAndWalls (floorKeyParam?: string, wallKeyParam?: string) {
    // Create a 4x4 grid of floor tiles stretched to fill the room
    const cols = 4
    const rows = 4
    const tileW = this.roomWidth / cols
    const tileH = this.roomHeight / rows

    const floorKeys = ['tiles_floor_1', 'tiles_floor_2', 'tiles_floor_3']

    // pick a single floor texture for this room so the whole floor repeats the same tile
    let chosenKey: string
    let chosenWallKey: string
    if (typeof floorKeyParam !== 'undefined' || typeof wallKeyParam !== 'undefined') {
      chosenKey = floorKeyParam ?? floorKeys[0]
      chosenWallKey = wallKeyParam ?? 'tiles_wall_1'
    } else {
      const coords = this.roomManager.getCurrentRoomCoords()
      const seed = Math.abs(coords.x * 31 + coords.y * 17)
      chosenKey = floorKeys[seed % floorKeys.length]
      const wallKeys = ['tiles_wall_1', 'tiles_wall_2']
      const wallSeed = Math.abs(coords.x * 7 + coords.y * 11)
      chosenWallKey = wallKeys[wallSeed % wallKeys.length]
    }

    // store chosen appearance for potential saving later
    this.floorKey = chosenKey
    this.wallKey = chosenWallKey

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const imgX = x * tileW + tileW / 2
        const imgY = y * tileH + tileH / 2
        const img = this.add.image(imgX, imgY, chosenKey)
        img.setDisplaySize(tileW, tileH)
        img.setDepth(0) // ensure floor is at the lowest level
        this.tiles.push(img)
      }
    }

    // Walls: chosenWallKey already selected above

    // increase thickness a bit so walls are not so tight
    const thickness = Math.max(1, Math.round(this.wallThickness * 2))

    // Place walls outside the room bounds so they visually sit on the room edges
    // Add extra padding so the vertical wall bars extend further up/down (expand 'black rectangle' height)
      // Shorter extension so walls don't stretch too far past doors
      const extra = Math.max(Math.round(thickness * 4), Math.round(this.roomHeight * 0.06))
    // Top/bottom should span beyond the room width; left/right should be taller than room height
    const outerWidth = this.roomWidth + thickness * 2 + extra
    const outerHeight = this.roomHeight + thickness * 2 + extra

    // Draw simple solid black wall bands whose inner edges align with the room edges
    // so they visually start exactly where doors' inner edges sit.
    const wallBandExtra = extra

    // Top/bottom: height includes thickness plus outward padding; bottom edge of top = 0
    const topHeight = thickness + wallBandExtra
    const top = this.add.rectangle(this.roomWidth / 2, -topHeight / 2, outerWidth, topHeight, 0x000000)
    top.setOrigin(0.5)
    top.setDepth(1)

    const bottom = this.add.rectangle(this.roomWidth / 2, this.roomHeight + topHeight / 2, outerWidth, topHeight, 0x000000)
    bottom.setOrigin(0.5)
    bottom.setDepth(1)

    // Left/right: width includes thickness plus outward padding; right edge of left = 0
    const sideWidth = thickness + wallBandExtra
    const left = this.add.rectangle(-sideWidth / 2, this.roomHeight / 2, sideWidth, outerHeight, 0x000000)
    left.setOrigin(0.5)
    left.setDepth(1)

    const right = this.add.rectangle(this.roomWidth + sideWidth / 2, this.roomHeight / 2, sideWidth, outerHeight, 0x000000)
    right.setOrigin(0.5)
    right.setDepth(1)

    this.tiles.push(top, bottom, left, right)

    // Add textured TileSprites on top of the black wall bands so visuals return
    try {
      const topTS = this.add.tileSprite(this.roomWidth / 2, -topHeight / 2, outerWidth, topHeight, chosenWallKey)
      topTS.setOrigin(0.5)
      topTS.setDepth(1.05)

      const bottomTS = this.add.tileSprite(this.roomWidth / 2, this.roomHeight + topHeight / 2, outerWidth, topHeight, chosenWallKey)
      bottomTS.setOrigin(0.5)
      bottomTS.setDepth(1.05)

      const leftTS = this.add.tileSprite(-sideWidth / 2, this.roomHeight / 2, sideWidth, outerHeight, chosenWallKey)
      leftTS.setOrigin(0.5)
      leftTS.setDepth(1.05)

      const rightTS = this.add.tileSprite(this.roomWidth + sideWidth / 2, this.roomHeight / 2, sideWidth, outerHeight, chosenWallKey)
      rightTS.setOrigin(0.5)
      rightTS.setDepth(1.05)

      // Attempt to set sensible tileScale based on source texture size
      const tex = (this.textures.get(chosenWallKey) as any)
      const srcImg = typeof tex.getSourceImage === 'function' ? tex.getSourceImage() : (tex.source && tex.source[0] && (tex.source[0].image || tex.source[0]))
      const srcW = (srcImg && srcImg.width) || 32
      const srcH = (srcImg && srcImg.height) || 32

      const horizRepeats = Math.max(1, Math.ceil(outerWidth / srcW))
      ;(topTS as any).tileScaleX = outerWidth / (horizRepeats * srcW)
      ;(topTS as any).tileScaleY = Math.max(0.05, topHeight / srcH)
      if (typeof (topTS as any).setTileScale === 'function') (topTS as any).setTileScale((topTS as any).tileScaleX, (topTS as any).tileScaleY)

      ;(bottomTS as any).tileScaleX = outerWidth / (horizRepeats * srcW)
      ;(bottomTS as any).tileScaleY = Math.max(0.05, topHeight / srcH)
      if (typeof (bottomTS as any).setTileScale === 'function') (bottomTS as any).setTileScale((bottomTS as any).tileScaleX, (bottomTS as any).tileScaleY)

      const vertRepeats = Math.max(1, Math.ceil(outerHeight / srcH))
      ;(leftTS as any).tileScaleX = Math.max(0.05, sideWidth / srcW)
      ;(leftTS as any).tileScaleY = Math.max(0.05, outerHeight / (vertRepeats * srcH))
      if (typeof (leftTS as any).setTileScale === 'function') (leftTS as any).setTileScale((leftTS as any).tileScaleX, (leftTS as any).tileScaleY)

      ;(rightTS as any).tileScaleX = Math.max(0.05, sideWidth / srcW)
      ;(rightTS as any).tileScaleY = Math.max(0.05, outerHeight / (vertRepeats * srcH))
      if (typeof (rightTS as any).setTileScale === 'function') (rightTS as any).setTileScale((rightTS as any).tileScaleX, (rightTS as any).tileScaleY)

      this.tiles.push(topTS, bottomTS, leftTS, rightTS)
    } catch (e) {
      // ignore if textures aren't available yet
    }

    // After walls/floor are created, optionally populate furniture for special room types
    const roomType = this.chooseRoomType()
    // if (roomType === 'kitchen') {
    //   this.createKitchenFurniture(tileW, tileH, thickness)
    // }
  }

  chooseRoomType () {
    // Deterministic room type selection based on coords so layouts persist visually per-room
    const coords = this.roomManager.getCurrentRoomCoords()
    const seed = Math.abs(coords.x * 5 + coords.y * 11)
    // Make roughly 1 in 4 rooms a kitchen
    if (seed % 4 === 0) return 'kitchen'
    return 'default'
  }

  chooseDoorTexture () {
    const doorKeys = [
      'door_baige_door_closed',
      'door_brown_door_closed',
      'door_dark_baige_brown_door_closed',
      'door_dark_brown_door_closed'
    ]
    const coords = this.roomManager.getCurrentRoomCoords()
    const seed = Math.abs(coords.x * 13 + coords.y * 7)
    return doorKeys[seed % doorKeys.length]
  }

  update (time: number, delta: number) {
    // Update player
    this.player.update(delta)
    
    // Update minimap
    this.miniMap.update(this.currentRoomId)

    // Handle restart hold
    const rKey = this.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.R]
    if (rKey && rKey.isDown) {
      this.restartHoldDuration += delta
      
      // Check if restart threshold reached
      if (this.restartHoldDuration >= this.restartThreshold) {
        this.scene.start("RoomBootScene");
        return
      }
    } else {
      this.restartHoldDuration = 0
    }

    // Render
    this.render()
    this.renderRestartIndicator()
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

  renderRestartIndicator () {
    this.restartGraphics.clear()

    // Only show if R is being held
    const rKey = this.input.keyboard!.keys[Phaser.Input.Keyboard.KeyCodes.R]

    const circleX = 40
    const circleY = 40
    const circleRadius = 25
    const progress = Math.min(this.restartHoldDuration / this.restartThreshold, 1)

    // Draw circle background (unfilled part)
    this.restartGraphics.fillStyle(0x333333, 0.7)
    this.restartGraphics.fillCircle(circleX, circleY, circleRadius)

    // Draw filled progress arc
    this.restartGraphics.fillStyle(0xff0000, 0.8)
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (Math.PI * 2 * progress)
    this.restartGraphics.beginPath()
    this.restartGraphics.moveTo(circleX, circleY)
    this.restartGraphics.arc(circleX, circleY, circleRadius, startAngle, endAngle)
    this.restartGraphics.lineTo(circleX, circleY)
    this.restartGraphics.fillPath()

    // Draw R text in center
    this.add.text(circleX, circleY, 'R', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0, 0).setDepth(102)
  }
}
