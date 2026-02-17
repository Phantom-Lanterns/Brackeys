import Phaser from 'phaser';
import Player from '../Player';
import { IInteractable } from './IInteractable';

export type DoorDirection = 'north' | 'south' | 'east' | 'west'

export default class Door implements IInteractable {
  scene: Phaser.Scene;
  sprite: any;
  isOpen: boolean;
  onInteractCallback?: (player: Player) => void;

  // constructor now accepts an optional direction so the door can be oriented correctly
  constructor(scene: Phaser.Scene, x: number, y: number, width = 64, height = 96, onInteractCallback?: (player: Player) => void, direction?: DoorDirection, textureKey?: string) {
    this.scene = scene;
    this.isOpen = false;
    this.onInteractCallback = onInteractCallback;
    const key = textureKey ?? 'door_brown_door_closed'

    // create image for door and size it to requested dimensions WITHOUT squashing
    this.sprite = scene.add.image(x, y, key).setOrigin(0.5)
    this.sprite.setDepth(2)

    // Preserve aspect ratio: scale uniformly so door fits within width/height
    try {
      const srcW = this.sprite.width
      const srcH = this.sprite.height
      const scaleX = width / srcW
      const scaleY = height / srcH
      const scale = Math.min(scaleX, scaleY)
      this.sprite.setScale(scale)
    } catch (e) {
      // fallback: set display size if we couldn't read source size
      this.sprite.setDisplaySize(width, height)
    }

    // orient the door so its "bottom" faces into the room
    if (direction) {
      switch (direction) {
        case 'north':
          this.sprite.setAngle(0)
          break
        case 'south':
          this.sprite.setAngle(180)
          break
        case 'west':
          this.sprite.setAngle(-90)
          break
        case 'east':
          this.sprite.setAngle(90)
          break
      }
    }

    // make it immovable physics body so player collides with closed door
    scene.physics.add.existing(this.sprite, true)

    // ensure body size matches displayed size, account for rotation
    try {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body
      const dispW = Math.round(Math.abs(this.sprite.displayWidth))
      const dispH = Math.round(Math.abs(this.sprite.displayHeight))
      body.setSize(dispW, dispH)
      // center the physics body within the sprite's display area
      const offsetX = Math.round((this.sprite.displayWidth - body.width) / 2)
      const offsetY = Math.round((this.sprite.displayHeight - body.height) / 2)
      body.setOffset(offsetX, offsetY)
    } catch (e) {}

    // mark as interactable
    ;(this.sprite as any).interactable = this

    try { this.sprite.setPipeline('Light2D') } catch (e) {}
  }

  onInteract(player: Player) {
    if (this.onInteractCallback) {
      this.onInteractCallback(player)
      return
    }

    this.isOpen = !this.isOpen

    // if we have a corresponding opened texture, switch to it; otherwise toggle alpha
    try {
      const currentKey = this.sprite.texture.key as string
      const openedKey = currentKey.replace('_closed', '_opened')
      if (this.scene.textures.exists(openedKey)) {
        this.sprite.setTexture(openedKey)
      } else {
        this.sprite.setAlpha(this.isOpen ? 0.5 : 1)
      }
    } catch (e) {
      this.sprite.setAlpha(this.isOpen ? 0.5 : 1)
    }
  }
}
