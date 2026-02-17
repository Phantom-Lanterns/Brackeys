import Phaser from 'phaser';
import Player from '../Player';
import { IInteractable } from './IInteractable';

export default class Door implements IInteractable {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Rectangle;
  isOpen: boolean;
  onInteractCallback?: (player: Player) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, width = 64, height = 96, onInteractCallback?: (player: Player) => void) {
    this.scene = scene;
    this.isOpen = false;
    this.onInteractCallback = onInteractCallback;

    this.sprite = scene.add.rectangle(x, y, width, height, 0x888888).setOrigin(0.5);
    scene.physics.add.existing(this.sprite, true);

    // 🔥 THIS IS THE IMPORTANT PART
    (this.sprite as any).interactable = this;

    try { this.sprite.setPipeline('Light2D'); } catch (e) {}
  }

  onInteract(player: Player) {
    if (this.onInteractCallback) {
      this.onInteractCallback(player);
    } else {
      this.isOpen = !this.isOpen;
      this.sprite.setFillStyle(this.isOpen ? 0x00ff00 : 0x888888);
      console.log(`Door is now ${this.isOpen ? 'open' : 'closed'}`);
    }
  }
}
