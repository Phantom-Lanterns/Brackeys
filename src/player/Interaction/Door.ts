import Phaser from 'phaser';
import Player from '../Player';
import { InteractableBase } from './InteractableBase';

export default class Door extends InteractableBase {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Rectangle;
  isOpen: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, width = 64, height = 96) {
    super();

    this.scene = scene;
    this.isOpen = false;

    this.sprite = scene.add.rectangle(x, y, width, height, 0x888888).setOrigin(0.5);
    scene.physics.add.existing(this.sprite, true);

    // 🔥 THIS IS THE IMPORTANT PART
    (this.sprite as any).interactable = this;

    try { this.sprite.setPipeline('Light2D'); } catch (e) {}
  }

  onInteract(player: Player) {
    this.isOpen = !this.isOpen;
    this.sprite.setFillStyle(this.isOpen ? 0x00ff00 : 0x888888);
    console.log(`Door is now ${this.isOpen ? 'open' : 'closed'}`);
  }
}
