class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isEnabled: boolean = true;
  private masterVolume: number = 0.3;
  private ambientSounds: HTMLAudioElement[] = [];
  private audioContext: AudioContext | null = null;

  constructor() {
    this.loadSettings();
    this.initializeSounds();
  }

  private async initializeSounds() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
      return;
    }

    // Define all sound effects with their MP3 file mappings
    const soundDefinitions = {
      // Ambient sounds (looping)
      underwater_bubbles: { 
        volume: 0.15, 
        loop: true, 
        file: '/monlake_sounds/bubbles-14830.mp3' 
      },
      water_currents: { 
        volume: 0.15, 
        loop: true, 
        file: '/monlake_sounds/ocean-waves-250310.mp3' 
      },

      // Fish interaction sounds
      fish_spawn: { 
        volume: 0.2, 
        loop: false, 
        file: '/monlake_sounds/water-jump-splash-pool-180114.mp3' 
      },
      fish_disappear: { 
        volume: 0.15, 
        loop: false, 
        file: '/monlake_sounds/bubble-pop-283674.mp3' 
      },
      fishing_cast: { 
        volume: 0.25, 
        loop: false, 
        file: '/monlake_sounds/spinning-reel-27903.mp3' 
      },
      fish_caught: { 
        volume: 0.2, 
        loop: false, 
        file: '/monlake_sounds/water-jump-splash-pool-180114.mp3' 
      },

      // Transaction sounds
      jellyfish_spawn: { 
        volume: 0.15, 
        loop: false, 
        file: '/monlake_sounds/bubble-pop-283674.mp3' 
      },
      treasure_update: { 
        volume: 0.1, 
        loop: false, 
        file: '/monlake_sounds/bubbles-14830.mp3' 
      },
      block_processed: { 
        volume: 0.12, 
        loop: false, 
        file: '/monlake_sounds/water-jump-splash-pool-180114.mp3' 
      },

      // Interactive sounds
      fish_hover: { 
        volume: 0.08, 
        loop: false, 
        file: '/monlake_sounds/bubble-pop-283674.mp3' 
      },
      fish_drag: { 
        volume: 0.1, 
        loop: false, 
        file: '/monlake_sounds/bubbles-14830.mp3' 
      },
      panel_toggle: { 
        volume: 0.08, 
        loop: false, 
        file: '/monlake_sounds/bubble-pop-283674.mp3' 
      }
    };

    // Create audio elements for each sound
    for (const [key, config] of Object.entries(soundDefinitions)) {
      try {
        const audio = await this.loadAudioFile(config.file, config);
        audio.volume = config.volume * this.masterVolume;
        audio.loop = config.loop;
        this.sounds.set(key, audio);

        if (config.loop) {
          this.ambientSounds.push(audio);
        }
      } catch (error) {
        console.warn(`Failed to load sound: ${key}`, error);
        // Fallback to procedural sound if MP3 fails
        try {
          const fallbackAudio = await this.createProceduralSound(this.getTypeFromKey(key), config);
          fallbackAudio.volume = config.volume * this.masterVolume;
          fallbackAudio.loop = config.loop;
          this.sounds.set(key, fallbackAudio);
          
          if (config.loop) {
            this.ambientSounds.push(fallbackAudio);
          }
        } catch (fallbackError) {
          console.warn(`Failed to create fallback sound: ${key}`, fallbackError);
        }
      }
    }
  }

  private async loadAudioFile(filePath: string, config: any): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'auto';
      
      audio.oncanplaythrough = () => {
        resolve(audio);
      };
      
      audio.onerror = (error) => {
        reject(new Error(`Failed to load audio file: ${filePath}`));
      };
      
      audio.src = filePath;
      audio.load();
    });
  }

  private getTypeFromKey(key: string): string {
    if (key.includes('bubble')) return 'bubbles';
    if (key.includes('current') || key.includes('water')) return 'currents';
    if (key.includes('spawn')) return 'spawn';
    if (key.includes('disappear')) return 'disappear';
    if (key.includes('cast')) return 'cast';
    if (key.includes('caught')) return 'caught';
    if (key.includes('jellyfish')) return 'jellyfish';
    if (key.includes('treasure')) return 'treasure';
    if (key.includes('block')) return 'block';
    if (key.includes('hover')) return 'hover';
    if (key.includes('drag')) return 'drag';
    if (key.includes('toggle')) return 'toggle';
    return 'default';
  }

  private async createProceduralSound(soundType: string, config: any): Promise<HTMLAudioElement> {
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    const duration = config.loop ? 5 : 0.5;
    const sampleRate = this.audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const audioBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    // Generate different sound patterns based on type
    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (soundType) {
        case 'bubbles':
          // Gentle bubbling with random pops
          sample = (Math.random() - 0.5) * 0.1 * Math.sin(t * 200 + Math.random() * 10);
          if (Math.random() < 0.01) {
            sample += Math.sin(t * 800) * 0.3 * Math.exp(-t * 20);
          }
          break;

        case 'currents':
          // Low frequency whooshing
          sample = Math.sin(t * 50 + Math.sin(t * 5)) * 0.2 * (1 + Math.sin(t * 2));
          sample += (Math.random() - 0.5) * 0.05;
          break;

        case 'spawn':
          // Bright pop with decay
          sample = Math.sin(t * 800 + Math.sin(t * 1600)) * Math.exp(-t * 10);
          break;

        case 'disappear':
          // Reverse pop (fade out to high pitch)
          sample = Math.sin(t * 400 * (1 + t * 2)) * Math.exp(-t * 3) * (1 - t * 2);
          break;

        case 'cast':
          // Swoosh sound
          sample = (Math.random() - 0.5) * Math.exp(-t * 5) * Math.sin(t * 300 * (1 - t));
          break;

        case 'caught':
          // Success chime
          sample = Math.sin(t * 523) * Math.exp(-t * 2) + Math.sin(t * 659) * Math.exp(-t * 3);
          break;

        case 'jellyfish':
          // Ominous low tone
          sample = Math.sin(t * 150) * Math.exp(-t * 4) * Math.sin(t * 10);
          break;

        case 'treasure':
          // Crystal chime
          sample = Math.sin(t * 1047) * Math.exp(-t * 8) * 0.5;
          break;

        case 'block':
          // Soft thunk
          sample = Math.sin(t * 80) * Math.exp(-t * 12) + (Math.random() - 0.5) * 0.1 * Math.exp(-t * 20);
          break;

        case 'hover':
          // Gentle ripple
          sample = Math.sin(t * 400) * Math.exp(-t * 15) * 0.3;
          break;

        case 'drag':
          // Water movement
          sample = (Math.random() - 0.5) * 0.2 * Math.exp(-t * 3);
          break;

        case 'toggle':
          // Page flip
          sample = (Math.random() - 0.5) * Math.exp(-t * 10) * Math.sin(t * 200);
          break;

        default:
          sample = Math.sin(t * 440) * Math.exp(-t * 5);
      }

      channelData[i] = sample;
    }

    // Convert to audio element
    const wavData = this.bufferToWav(audioBuffer);
    const blob = new Blob([wavData], { type: 'audio/wav' });
    const audio = new Audio();
    audio.src = URL.createObjectURL(blob);
    
    return new Promise((resolve, reject) => {
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = reject;
      audio.load();
    });
  }

  private bufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const sampleRate = buffer.sampleRate;
    const channelData = buffer.getChannelData(0);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert samples
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('monlake_sound_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.isEnabled = settings.enabled ?? true;
        this.masterVolume = settings.volume ?? 0.3;
      }
    } catch (error) {
      console.warn('Failed to load sound settings:', error);
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('monlake_sound_settings', JSON.stringify({
        enabled: this.isEnabled,
        volume: this.masterVolume
      }));
    } catch (error) {
      console.warn('Failed to save sound settings:', error);
    }
  }

  // Public methods
  play(soundName: string, volume?: number, pitch?: number) {
    if (!this.isEnabled) return;

    const sound = this.sounds.get(soundName);
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      const playSound = sound.cloneNode() as HTMLAudioElement;
      playSound.volume = (volume ?? 1) * this.masterVolume;
      
      if (pitch && pitch !== 1) {
        playSound.playbackRate = pitch;
      }

      // Add random pitch variation to avoid repetitiveness
      if (!sound.loop) {
        playSound.playbackRate *= (0.9 + Math.random() * 0.2);
      }

      playSound.play().catch(e => console.warn('Failed to play sound:', e));
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }

  async startAmbient() {
    if (!this.isEnabled) return;

    for (const sound of this.ambientSounds) {
      if (sound.paused) {
        try {
          sound.volume = sound.volume * this.masterVolume;
          await sound.play();
        } catch (e) {
          console.warn('Failed to start ambient sound:', e);
        }
      }
    }
  }

  stopAmbient() {
    this.ambientSounds.forEach(sound => {
      if (!sound.paused) {
        sound.pause();
        sound.currentTime = 0;
      }
    });
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
    this.saveSettings();
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.volume = sound.volume * this.masterVolume;
    });
    this.saveSettings();
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  // Initialize audio context (needed for user interaction requirement)
  async initializeAudio() {
    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Start ambient sounds if enabled
      if (this.isEnabled) {
        setTimeout(() => this.startAmbient(), 1000);
      }
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }
}

// Create singleton instance
export const soundManager = new SoundManager();

// Auto-initialize on first user interaction
let audioInitialized = false;
const initializeOnInteraction = () => {
  if (!audioInitialized) {
    audioInitialized = true;
    soundManager.initializeAudio();
    document.removeEventListener('click', initializeOnInteraction);
    document.removeEventListener('keydown', initializeOnInteraction);
  }
};

document.addEventListener('click', initializeOnInteraction);
document.addEventListener('keydown', initializeOnInteraction); 