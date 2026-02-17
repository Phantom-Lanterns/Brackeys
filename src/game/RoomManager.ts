export interface RoomCoords {
  x: number
  y: number
}

export interface RoomData extends RoomCoords {
  scene: string
  color?: number
  visited?: boolean
  doors?: ('north' | 'south' | 'east' | 'west')[]
}

export class RoomManager {
  // All generated rooms (visited flag indicates if the player "locked" the room)
  private rooms: Map<string, RoomData> = new Map()
  private currentRoomCoords: RoomCoords = { x: 0, y: 0 }

  private availableScenes = [
    'RoomScene',
  ]

  private availableColors = [0x2a2a2a, 0x3a2a2a, 0x2a2a3a, 0x3a3a2a, 0x2a3a3a]

  constructor () {
    // Create starting room (not necessarily visited until player interacts)
    this.rooms.set('0,0', { x: 0, y: 0, scene: 'RoomScene', color: this.availableColors[0], visited: false })
  }

  getCurrentRoomId (): string {
    return `${this.currentRoomCoords.x},${this.currentRoomCoords.y}`
  }

  getCurrentRoomCoords (): RoomCoords {
    return { ...this.currentRoomCoords }
  }

  // Return only rooms marked as visited
  getVisitedRooms (): Map<string, RoomData> {
    const visited = new Map<string, RoomData>()
    this.rooms.forEach((data, id) => {
      if (data.visited) visited.set(id, data)
    })
    return visited
  }

  // Ensure a room exists at the given coords (create if missing)
  private ensureRoomExists (coords: RoomCoords): string {
    const roomId = `${coords.x},${coords.y}`
    if (!this.rooms.has(roomId)) {
      const scene = this.availableScenes[Math.floor(Math.random() * this.availableScenes.length)]
      const color = this.availableColors[Math.floor(Math.random() * this.availableColors.length)]
      this.rooms.set(roomId, { x: coords.x, y: coords.y, scene, color, visited: false })
    }
    return roomId
  }

  moveToRoom (direction: 'north' | 'south' | 'east' | 'west'): string {
    const targetCoords = { ...this.currentRoomCoords }

    switch (direction) {
      case 'north':
        targetCoords.y -= 1
        break
      case 'south':
        targetCoords.y += 1
        break
      case 'east':
        targetCoords.x += 1
        break
      case 'west':
        targetCoords.x -= 1
        break
    }

    const currentId = this.getCurrentRoomId()
    const currentRoom = this.rooms.get(currentId)

    // If current room is visited (locked), move normally
    if (currentRoom && currentRoom.visited) {
      const roomId = this.ensureRoomExists(targetCoords)
      this.currentRoomCoords = targetCoords
      return roomId
    }

    // If current room is NOT visited:
    // - if the target already exists and is visited, allow moving into it
    // - otherwise, generate a new room at the CURRENT coordinates (do not change coords)
    const targetId = `${targetCoords.x},${targetCoords.y}`
    const targetRoom = this.rooms.get(targetId)

    if (targetRoom && targetRoom.visited) {
      this.currentRoomCoords = targetCoords
      return targetId
    }

    // generate a new room at the target coordinates and move there
    const scene = this.availableScenes[Math.floor(Math.random() * this.availableScenes.length)]
    const color = this.availableColors[Math.floor(Math.random() * this.availableColors.length)]
    this.rooms.set(targetId, { x: targetCoords.x, y: targetCoords.y, scene, color, visited: false })
    this.currentRoomCoords = targetCoords
    return targetId
  }

  getRoomData (roomId: string): RoomData | null {
    return this.rooms.get(roomId) ?? null
  }

  getSceneForRoom (roomId: string): string {
    return this.rooms.get(roomId)?.scene ?? 'RoomScene'
  }

  // Mark a room as visited (e.g., when player interacts with a lock)
  markVisited (roomId: string) {
    const r = this.rooms.get(roomId)
    if (r) r.visited = true
  }

  // Persist door directions for a room so locked rooms keep their doors
  setRoomDoors (roomId: string, doors: ('north' | 'south' | 'east' | 'west')[]) {
    const r = this.rooms.get(roomId)
    if (r) r.doors = doors
  }
}
