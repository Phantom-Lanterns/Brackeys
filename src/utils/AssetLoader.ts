import Phaser from 'phaser'
import loadAllAssets from './preloader'

export function loadCommonAssets (scene: Phaser.Scene) {
  // Delegate to the central preloader so all assets are loaded consistently.
  loadAllAssets(scene)
}
