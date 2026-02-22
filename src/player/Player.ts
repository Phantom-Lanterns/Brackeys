import Phaser from 'phaser';
import PlayerInteractComponent from './Interaction/PlayerInteractComponent';
import AudioManager from '../audio/AudioManager';

export default class Player {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite;
  body!: Phaser.Physics.Arcade.Body;
  speed: number;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private interactComponent?: PlayerInteractComponent;
  private lastDirection: 'down' | 'up' | 'left' | 'right' = 'down';
  private wasMovingVertically: boolean = false;

  constructor (scene: Phaser.Scene, x: number, y: number, enableLight = true) {
    this.scene = scene;

    // Create sprite from spritesheet; frame 0 is the default standing frame
    this.sprite = scene.add.sprite(x, y, 'player_walk', 0).setOrigin(0.5)
    this.sprite.setDepth(2)

    this.sprite.setScale(3) // scale to desired player size (e.g. 48px) while preserving aspect ratio

    // Add physics body
    scene.physics.add.existing(this.sprite)
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body
    this.body.setCollideWorldBounds(true)


    const kb = scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    this.cursors = kb.createCursorKeys();
    this.keys = kb.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      E: Phaser.Input.Keyboard.KeyCodes.E
    }) as { [key: string]: Phaser.Input.Keyboard.Key };

    this.speed = 200;

    // Create directional animations if they don't exist yet
    this.createAnimations()

    this.interactComponent = new PlayerInteractComponent(scene, this, 100, 60);
  }

  private createAnimations() {
    const anims = this.scene.anims
    if (!anims.exists('player_down')) {
      anims.create({ key: 'player_down', frames: anims.generateFrameNumbers('player_walk', { start: 0, end: 3 }), frameRate: 8, repeat: -1 })
    }
    if (!anims.exists('player_up')) {
      anims.create({ key: 'player_up', frames: anims.generateFrameNumbers('player_walk', { start: 4, end: 7 }), frameRate: 8, repeat: -1 })
    }
    if (!anims.exists('player_right')) {
      anims.create({ key: 'player_right', frames: anims.generateFrameNumbers('player_walk', { start: 8, end: 11 }), frameRate: 8, repeat: -1 })
    }
    if (!anims.exists('player_left')) {
      anims.create({ key: 'player_left', frames: anims.generateFrameNumbers('player_walk', { start: 12, end: 15 }), frameRate: 8, repeat: -1 })
    }
  }

  update(dt: number) {
    if (!this.body) return;

    let vx = 0;
    let vy = 0;

    const left = !!(this.cursors.left && this.cursors.left.isDown) || !!(this.keys.A && this.keys.A.isDown);
    const right = !!(this.cursors.right && this.cursors.right.isDown) || !!(this.keys.D && this.keys.D.isDown);
    const up = !!(this.cursors.up && this.cursors.up.isDown) || !!(this.keys.W && this.keys.W.isDown);
    const down = !!(this.cursors.down && this.cursors.down.isDown) || !!(this.keys.S && this.keys.S.isDown);

    if (left) vx = -1;
    if (right) vx = 1;
    if (up) vy = -1;
    if (down) vy = 1;

    if (vx !== 0 && vy !== 0) {
      const inv = Math.SQRT1_2;
      vx *= inv;
      vy *= inv;
    }

    this.body.setVelocity(vx * this.speed, vy * this.speed);

    // Play animations based on movement direction (priority: vertical)
    if (vy > 0) {
      this.sprite.anims.play('player_down', true)
      this.lastDirection = 'down'
    } else if (vy < 0) {
      this.sprite.anims.play('player_up', true)
      this.lastDirection = 'up'
    } else if (vx > 0) {
      this.sprite.anims.play('player_right', true)
      this.lastDirection = 'right'
    } else if (vx < 0) {
      this.sprite.anims.play('player_left', true)
      this.lastDirection = 'left'
    } else {
      // not moving: stop and show first frame of lastDirection
      if (this.sprite.anims.isPlaying) this.sprite.anims.stop()
      switch (this.lastDirection) {
        case 'down': this.sprite.setFrame(0); break
        case 'up': this.sprite.setFrame(4); break
        case 'right': this.sprite.setFrame(8); break
        case 'left': this.sprite.setFrame(12); break
      }
    }

    // Play step SFX when starting vertical movement (up or down)
    try {
      const audio = AudioManager.getInstance()
      if (vy !== 0) {
        if (!this.wasMovingVertically) {
          audio.playSfx('sfx_Step')
          this.wasMovingVertically = true
        }
      } else {
        this.wasMovingVertically = false
      }
    } catch (e) {}

    try { this.interactComponent?.update(); } catch (e) {}

    const keyE = this.keys['E'];
    if (Phaser.Input.Keyboard.JustDown(keyE)) this.interact();
  }

  interact() {
    this.interactComponent?.interact();
  }

  collideWith(target: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group | Phaser.Physics.Arcade.Group,
              cb?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback) {
    return (this.scene.physics as Phaser.Physics.Arcade.ArcadePhysics).add.collider(this.sprite, target, cb);
  }

  getGameObject() {
    return this.sprite;
  }

  destroy() {
    try { this.interactComponent?.destroy(); } catch (e) {}
    try { this.sprite.destroy(); } catch (e) {}
  }
}
