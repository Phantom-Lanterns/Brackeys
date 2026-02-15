import Phaser from 'phaser'

const MUSIC_KEY = 'bgm'

export default class AudioManager {
  private static _instance: AudioManager | null = null
  private scene?: Phaser.Scene
  private music?: any
  private musicEnabled = true
  private sfxEnabled = true
  private musicVolume = 1
  private sfxVolume = 1

  private constructor () {
    // read persisted settings
    try {
      const m = localStorage.getItem('musicEnabled')
      const s = localStorage.getItem('sfxEnabled')
      const mv = localStorage.getItem('musicVolume')
      const sv = localStorage.getItem('sfxVolume')
      if (m != null) this.musicEnabled = m === 'true'
      if (s != null) this.sfxEnabled = s === 'true'
      if (mv != null) this.musicVolume = Number(mv)
      if (sv != null) this.sfxVolume = Number(sv)
    } catch (e) {
      // ignore
    }
  }

  static getInstance () {
    if (!AudioManager._instance) AudioManager._instance = new AudioManager()
    return AudioManager._instance
  }

  initWithScene (scene: Phaser.Scene) {
    this.scene = scene
    // try to grab existing sound if present
    try {
      const s = scene.sound.get(MUSIC_KEY)
      if (s) {
        this.music = s
        ;(this.music as any).setVolume(this.musicVolume)
        if (this.musicEnabled && !(this.music as any).isPlaying) (this.music as any).play({ loop: true })
      }
    } catch (e) {
      // ignore missing audio
    }
  }

  playMusicIfAvailable () {
    if (!this.scene) return
    if (!this.music && this.scene.sound) {
      const loaded = this.scene.sound.get(MUSIC_KEY)
      if (loaded) this.music = loaded
    }
    if (this.music && this.musicEnabled && !(this.music as any).isPlaying) (this.music as any).play({ loop: true })
  }

  toggleMusic () {
    this.musicEnabled = !this.musicEnabled
    try { localStorage.setItem('musicEnabled', String(this.musicEnabled)) } catch (e) {}
    if (this.music) {
      if (this.musicEnabled) (this.music as any).play({ loop: true })
      else (this.music as any).stop()
    }
  }

  toggleSfx () {
    this.sfxEnabled = !this.sfxEnabled
    try { localStorage.setItem('sfxEnabled', String(this.sfxEnabled)) } catch (e) {}
  }

  setMusicVolume (v: number) {
    this.musicVolume = Phaser.Math.Clamp(v, 0, 1)
    try { localStorage.setItem('musicVolume', String(this.musicVolume)) } catch (e) {}
    if (this.music) (this.music as any).setVolume(this.musicVolume)
  }

  setSfxVolume (v: number) {
    this.sfxVolume = Phaser.Math.Clamp(v, 0, 1)
    try { localStorage.setItem('sfxVolume', String(this.sfxVolume)) } catch (e) {}
  }

  isMusicEnabled () { return this.musicEnabled }
  isSfxEnabled () { return this.sfxEnabled }
  getMusicVolume () { return this.musicVolume }
  getSfxVolume () { return this.sfxVolume }

  // play a short sfx if allowed
  playSfx (key: string) {
    if (!this.scene) return
    if (!this.sfxEnabled) return
    const s = this.scene.sound.get(key) || this.scene.sound.add(key)
    if (s) s.play({ volume: this.sfxVolume })
  }
}
