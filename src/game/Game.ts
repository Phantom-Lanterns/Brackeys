import Phaser from 'phaser'
import BootScene from '../scenes/BootScene'
import PreloadScene from '../scenes/PreloadScene'
import MenuScene from '../scenes/MenuScene'
import GameScene from './GameScene'
import RoomBootScene from '../scenes/RoomBootScene'
import RoomScene from '../scenes/Room'

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#000000',
  scene: [BootScene, PreloadScene, MenuScene, GameScene, RoomBootScene, RoomScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    }
  },
  scale: {
    parent: 'game-root',
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
}

export default class Game extends Phaser.Game {
  constructor () {
    super(GameConfig)
  }
}
