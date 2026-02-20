import Phaser from 'phaser';
import Player from '../player/Player';
import TutorialHUD from '../ui/TutorialHUD';
import Door from '../player/Interaction/Door';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private hud?: TutorialHUD;
  private door?: Door; // store door reference

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // const { width, height } = this.scale;

    // // create player
    // this.player = new Player(this, width / 2, height / 2);

    // // world bounds
    // this.physics.world.setBounds(0, 0, width, height);

    // // example obstacles
    // const obstacle = this.add.rectangle(width / 2 + 100, height / 2, 64, 64, 0x666666);
    // this.physics.add.existing(obstacle, true);
    // try { (obstacle as any).setPipeline('Light2D'); } catch (e) {}

    // this.player.collideWith(obstacle, (_playerObj: any, _ob: any) => {
    //   const body = (_playerObj && _playerObj.body) as Phaser.Physics.Arcade.Body | undefined;
    //   if (body) body.stop();
    // });

    // const farObstacle = this.add.rectangle(width / 2 + 360, height / 2, 64, 64, 0x777777);
    // this.physics.add.existing(farObstacle, true);
    // try { (farObstacle as any).setPipeline('Light2D'); } catch (e) {}

    // // tutorial HUD
    // this.hud = new TutorialHUD(this, 20, 20);

    // // --- Add a door to the scene ---
    // this.door = new Door(this, width / 2 + 200, height / 2);
    // the door can now be interacted with using the player's interactComponent
  }

  update(time: number, delta: number) {
    this.player.update(delta / 1000);
  }
}
