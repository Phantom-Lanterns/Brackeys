import Phaser from 'phaser'
import { ASSET_GROUPS } from './assetManifest'

function stripExtension (filename: string) {
  return filename.replace(/\.[^/.]+$/, '')
}

export function getAssetKey (prefix: string, filename: string) {
  return `${prefix}_${stripExtension(filename)}`
}

export function loadAllAssets (scene: Phaser.Scene) {
  const imageExts = ['png', 'jpg', 'jpeg', 'webp', 'gif']
  const audioExts = ['wav', 'mp3', 'ogg']

  ASSET_GROUPS.forEach(group => {
    group.files.forEach(file => {
      const key = getAssetKey(group.prefix, file)
      const path = `assets/${group.folder}/${file}`
      const ext = (file.split('.').pop() || '').toLowerCase()
      if (audioExts.includes(ext)) {
        // load as audio
        try { scene.load.audio(key, path) } catch (e) { /* ignore */ }
      } else if (imageExts.includes(ext)) {
        // load as image
        try { scene.load.image(key, path) } catch (e) { /* ignore */ }
      } else {
        // fallback to image loader for unknown types
        try { scene.load.image(key, path) } catch (e) { /* ignore */ }
      }
    })
  })
}

export function loadAllAssetsAsync (scene: Phaser.Scene) {
  return new Promise<void>((resolve) => {
    scene.load.once('complete', () => resolve())
    loadAllAssets(scene)
    // If called outside of the scene's automatic preload, start the loader.
    // Calling start during preload is harmless in Phaser.
    try {
      // @ts-ignore - Phaser LoaderPlugin may not expose start signature in types here
      scene.load.start()
    } catch (e) {
      // ignore
    }
  })
}

export default loadAllAssets
