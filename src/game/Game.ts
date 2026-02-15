import Phaser from 'phaser'
import BootScene from '../scenes/BootScene'
import MenuScene from '../scenes/MenuScene'
import GameScene from './GameScene'

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [BootScene, MenuScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
}

export default class Game extends Phaser.Game {
  constructor () {
    super(GameConfig)
  }
}
