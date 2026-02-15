import Phaser from 'phaser'
import './index.css'
import { GameConfig } from './game/Game'

document.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(GameConfig)
  ;(window as any).game = game
})
