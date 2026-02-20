import Phaser from 'phaser';
import Player from '../Player';
import { IInteractable } from './IInteractable';

export default class PlayerInteractComponent {
  scene: Phaser.Scene;
  player: Player;
  square: Phaser.GameObjects.Rectangle;
  size: number;
  offset: number;
  interactText: Phaser.GameObjects.Text; // text for "Press E"

  constructor(scene: Phaser.Scene, player: Player, size = 60, offset = 30) {
    this.scene = scene;
    this.player = player;
    this.size = size;
    this.offset = offset;

    // visible square
    this.square = scene.add.rectangle(player.sprite.x, player.sprite.y, size, size, 0x00ff00, 0.0)
      .setOrigin(0.5)
      .setDepth(100);

    // text for interaction prompt
    this.interactText = scene.add.text(player.sprite.x, player.sprite.y - size, 'Press E', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5)
      .setDepth(200)
      .setVisible(false); // start hidden
  }

  update() {
    const x = this.player.sprite.x;
    const y = this.player.sprite.y;

    // position square in front of player, rotated with the player's current velocity direction
    const vx = this.player.body.velocity.x;
    const vy = this.player.body.velocity.y;
    
    // Calculate angle from velocity; default to last direction if not moving
    let angle = 0;
    if (vx !== 0 || vy !== 0) {
      angle = Math.atan2(vy, vx);
    } else {
      // Use angle based on lastDirection when idle
      const directionAngles: { [key: string]: number } = {
        'down': Math.PI / 2,    // 90°
        'up': -Math.PI / 2,     // -90°
        'right': 0,              // 0°
        'left': Math.PI          // 180°
      };
      angle = directionAngles[(this.player as any).lastDirection] || 0;
    }
    
    const dx = Math.cos(angle) * this.offset;
    const dy = Math.sin(angle) * this.offset;
    this.square.setPosition(x + dx, y + dy);

    // check for overlaps
    const overlapping = this.getOverlappingInteractables();

    if (overlapping.length > 0) {
      this.interactText.setVisible(true);
      this.interactText.setPosition(x + dx, y + dy - this.size); // above the square
    } else {
      this.interactText.setVisible(false);
    }
  }

  
  getOverlappingInteractables(): IInteractable[] {
    const overlaps: IInteractable[] = [];
    const rect = new Phaser.Geom.Rectangle(
      this.square.x - this.size / 2,
      this.square.y - this.size / 2,
      this.size,
      this.size,
    );

    this.scene.children.list.forEach(obj => {
      const body = (obj as any).body as Phaser.Physics.Arcade.Body;
      if (!body) return;

      const interactable = (obj as any).interactable as IInteractable;
      if (!interactable) return;

      const objRect = new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height);

      if (Phaser.Geom.Intersects.RectangleToRectangle(rect, objRect)) {
        overlaps.push(interactable);
      }
    });

    return overlaps;
  }


  interact() {
    this.getOverlappingInteractables().forEach(i => i.onInteract(this.player));
  }

  destroy() {
    this.square.destroy();
    this.interactText.destroy();
  }
}
