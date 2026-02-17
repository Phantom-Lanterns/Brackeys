import Phaser from 'phaser'

type AssetGroup = {
  folder: string
  prefix: string
  files: string[]
}

// List of assets found in public/assets grouped by folder.
// Keys loaded will be `<prefix>_<filenameWithoutExt>` so they're easy to reference.
const ASSET_GROUPS: AssetGroup[] = [
  {
    folder: 'Doors and Windows',
    prefix: 'door',
    files: [
      'baige_door_closed.png',
      'baige_door_opened.png',
      'brown_door_closed.png',
      'brown_door_opened.png',
      'dark_baige_brown_door_closed.png',
      'dark_baige_brown_door_opened.png.png',
      'dark_brown_door_closed.png',
      'dark_brown_door_opened.png',
      'window_1.png',
      'window_2.png',
      'window_3.png',
      'window_4.png',
      'window_5.png',
      'window_6.png',
      'window_7.png',
      'window_8.png',
      'window_9.png',
      'window_10.png',
      'window_11.png',
      'window_12.png'
    ]
  },
  {
    folder: 'Furniture',
    prefix: 'furniture',
    files: [
      'bathtub.png',
      'big_bookshelf_1.png',
      'big_bookshelf_2.png',
      'bookshelf.png',
      'carpet.png',
      'chair_looking_down.png',
      'chair_looking_right.png',
      'chair_looking_up.png',
      'coat_hanger_stand.png',
      'desk_looking_down.png',
      'desk_looking_right.png',
      'dresser_looking_down.png',
      'dresser_looking_right.png',
      'fridge.png',
      'gramphone.png',
      'ironing_board.png',
      'kitchen_equipment.png',
      'lamp.png',
      'pet_bed.png',
      'plant.png',
      'sink.png',
      'small_table.png',
      'sofa_chair_looking_right.png',
      'sofa_looking_right.png',
      'standing_lamp.png',
      'table.png',
      'table_sideways.png',
      'wall_mirror.png'
    ]
  },
  {
    folder: 'Items',
    prefix: 'item',
    files: [
      'apple.png',
      'ball.png',
      'bathroom_tissue_hanger_1.png',
      'bath_duck.png',
      'book_1.png',
      'book_2.png',
      'candle.png',
      'can_1.png',
      'can_2.png',
      'can_3.png',
      'can_4.png',
      'cup_1.png',
      'cup_2.png',
      'cup_3.png',
      'cup_4.png',
      'cup_5.png',
      'cup_6.png',
      'cup_7.png',
      'cup_8.png',
      'cup_9.png',
      'cup_10.png',
      'cup_11.png',
      'cup_12.png',
      'cutboard.png',
      'dogbone_toy.png',
      'fishtank.png',
      'paper.png',
      'pencils_cup.png',
      'pie.png',
      'plate_1.png',
      'plate_2.png',
      'plate_3.png',
      'plate_4.png',
      'pot_1.png',
      'pot_2.png',
      'pot_3.png',
      'pot_4.png',
      'soap.png',
      'table_plant_1.png',
      'table_plant_2.png',
      'teapot.png',
      'telephone.png',
      'tissue_paper.png',
      'vase.png',
      'wall_bulb.png',
      'wall_clock.png',
      'wall_portrait_1.png',
      'wall_portrait_2.png',
      'wall_towel_hanger.png'
    ]
  },
  {
    folder: 'OpenDoors',
    prefix: 'opendoor',
    files: ['wall_1_door.png', 'wall_2_door.png']
  },
  {
    folder: 'Top Wall and Bottom Floors',
    prefix: 'tiles',
    files: ['floor_1.png', 'floor_2.png', 'floor_3.png', 'wall_1.png', 'wall_2.png']
  }
]

function stripExtension (filename: string) {
  return filename.replace(/\.[^/.]+$/, '')
}

export function getAssetKey (prefix: string, filename: string) {
  return `${prefix}_${stripExtension(filename)}`
}

export function loadAllAssets (scene: Phaser.Scene) {
  ASSET_GROUPS.forEach(group => {
    group.files.forEach(file => {
      const key = getAssetKey(group.prefix, file)
      const path = `assets/${group.folder}/${file}`
      scene.load.image(key, path)
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
