import Phaser from 'phaser';
import PlayerLight from './PlayerLight';
import PlayerInteractComponent from './Interaction/PlayerInteractComponent';

export default class Player {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Rectangle;
  body!: Phaser.Physics.Arcade.Body;
  speed: number;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private playerLight?: PlayerLight;
  private interactComponent?: PlayerInteractComponent;

  constructor (scene: Phaser.Scene, x: number, y: number, enableLight = true) {
    this.scene = scene;
    this.sprite = scene.add.rectangle(x, y, 48, 48, 0xff0000).setOrigin(0.5);

    try { this.sprite.setPipeline('Light2D'); } catch (e) {}

    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);

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

    if (enableLight) this.playerLight = new PlayerLight(scene, this.sprite);

    this.interactComponent = new PlayerInteractComponent(scene, this, 100, 60);
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

    if (vx !== 0 || vy !== 0) {
      this.sprite.rotation = Phaser.Math.Angle.Between(0, 0, vx, vy);
    }

    try { this.playerLight?.update(this.scene.input.activePointer); } catch (e) {}
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
    try { this.playerLight?.destroy(); } catch (e) {}
    try { this.interactComponent?.destroy(); } catch (e) {}
    try { this.sprite.destroy(); } catch (e) {}
  }
}
