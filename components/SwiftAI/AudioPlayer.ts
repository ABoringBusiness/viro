/**
 * AudioPlayer - A utility for playing audio in React Native
 * Adapted from https://github.com/ai-ng/swift for React Native
 */
import { Platform } from 'react-native';
import Sound from 'react-native-sound';

// Enable playback in silence mode (iOS only)
Sound.setCategory('Playback');

export interface AudioPlayerOptions {
  onPlaybackComplete?: () => void;
}

/**
 * AudioPlayer - A utility for playing audio in React Native
 */
export class AudioPlayer {
  private sound: Sound | null = null;
  private isPlaying: boolean = false;
  private onPlaybackComplete?: () => void;

  constructor(options: AudioPlayerOptions = {}) {
    this.onPlaybackComplete = options.onPlaybackComplete;
  }

  /**
   * Play audio from an ArrayBuffer by converting it to a temporary file
   * @param audioData - The audio data to play
   */
  async playFromArrayBuffer(audioData: ArrayBuffer): Promise<void> {
    this.stop();
    
    try {
      // In a real implementation, we would:
      // 1. Convert the ArrayBuffer to a temporary file
      // 2. Create a Sound object from the file path
      // 3. Play the sound
      
      console.log('Playing audio from ArrayBuffer (simulated)');
      this.isPlaying = true;
      
      // Simulate playback completion after 2 seconds
      setTimeout(() => {
        this.isPlaying = false;
        if (this.onPlaybackComplete) {
          this.onPlaybackComplete();
        }
      }, 2000);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.stop();
      throw error;
    }
  }

  /**
   * Play audio from a URL
   * @param url - The URL of the audio to play
   */
  async playFromUrl(url: string): Promise<void> {
    this.stop();
    
    try {
      this.sound = new Sound(url, '', (error) => {
        if (error) {
          console.error('Error loading sound:', error);
          this.stop();
          return;
        }
        
        this.isPlaying = true;
        this.sound?.play((success) => {
          this.isPlaying = false;
          if (success && this.onPlaybackComplete) {
            this.onPlaybackComplete();
          }
        });
      });
    } catch (error) {
      console.error('Error playing audio from URL:', error);
      this.stop();
      throw error;
    }
  }

  /**
   * Stop audio playback
   */
  stop(): void {
    if (this.sound) {
      this.sound.stop();
      this.sound.release();
      this.sound = null;
    }
    
    this.isPlaying = false;
  }

  /**
   * Check if audio is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}