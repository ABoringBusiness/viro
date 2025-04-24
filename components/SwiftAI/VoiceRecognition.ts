/**
 * VoiceRecognition - A utility for voice recognition in React Native
 * This is a simplified version of the VAD (Voice Activity Detection) used in Swift
 */
import { Platform, PermissionsAndroid } from 'react-native';
import AudioRecord from 'react-native-audio-record';

export interface VoiceRecognitionOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: (audioData: Blob) => void;
  onError?: (error: Error) => void;
}

/**
 * VoiceRecognition - A utility for voice recognition in React Native
 */
export class VoiceRecognition {
  private isRecording: boolean = false;
  private options: VoiceRecognitionOptions;

  constructor(options: VoiceRecognitionOptions = {}) {
    this.options = options;
    
    // Configure audio recording
    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: 'audio.wav',
    });
  }

  /**
   * Request microphone permission on Android
   */
  private async requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs access to your microphone to record audio.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }

  /**
   * Start voice recognition
   */
  async start(): Promise<void> {
    if (this.isRecording) {
      return;
    }

    try {
      // Request microphone permission
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Start recording
      AudioRecord.start();
      this.isRecording = true;
      
      if (this.options.onSpeechStart) {
        this.options.onSpeechStart();
      }
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      if (this.options.onError) {
        this.options.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  /**
   * Stop voice recognition
   */
  async stop(): Promise<void> {
    if (!this.isRecording) {
      return;
    }

    try {
      // Stop recording and get the audio file path
      const audioFile = await AudioRecord.stop();
      this.isRecording = false;
      
      // In a real implementation, we would:
      // 1. Read the audio file
      // 2. Convert it to a Blob
      // 3. Call the onSpeechEnd callback with the Blob
      
      console.log('Audio recorded to:', audioFile);
      
      // Create a mock Blob for demonstration purposes
      const mockBlob = new Blob([], { type: 'audio/wav', lastModified: Date.now() });
      
      if (this.options.onSpeechEnd) {
        this.options.onSpeechEnd(mockBlob);
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      if (this.options.onError) {
        this.options.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  /**
   * Check if voice recognition is currently active
   */
  isActive(): boolean {
    return this.isRecording;
  }
}