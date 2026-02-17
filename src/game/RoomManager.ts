export interface RoomCoords {
  x: number
  y: number
}

export class RoomManager {
  private visitedRooms: Map<string, RoomCoords> = new Map()
  private currentRoomCoords: RoomCoords = { x: 0, y: 0 }
  private nextRoomId: number = 1

  constructor () {
    // Starting room is at 0,0
    this.visitedRooms.set('0,0', { x: 0, y: 0 })
  }

  getCurrentRoomId (): string {
    return `${this.currentRoomCoords.x},${this.currentRoomCoords.y}`
  }

  getCurrentRoomCoords (): RoomCoords {
    return { ...this.currentRoomCoords }
  }

  getVisitedRooms (): Map<string, RoomCoords> {
    return new Map(this.visitedRooms)
  }

  moveToRoom (direction: 'north' | 'south' | 'east' | 'west'): string {
    const newCoords = { ...this.currentRoomCoords }

    switch (direction) {
      case 'north':
        newCoords.y -= 1
        break
      case 'south':
        newCoords.y += 1
        break
      case 'east':
        newCoords.x += 1
        break
      case 'west':
        newCoords.x -= 1
        break
    }

    const roomId = `${newCoords.x},${newCoords.y}`

    if (this.visitedRooms.has(roomId)) {
      // Return to previously visited room
      this.currentRoomCoords = newCoords
      return roomId
    } else {
      // Create new random room
      this.visitedRooms.set(roomId, newCoords)
      this.currentRoomCoords = newCoords
      return roomId
    }
  }

  getRoomCoords (roomId: string): RoomCoords | null {
    return this.visitedRooms.get(roomId) ?? null
  }
}
