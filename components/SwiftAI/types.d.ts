declare module 'react-native-sound' {
  export interface SoundOptions {
    onError?: (error: any) => void;
    onLoad?: () => void;
  }

  export default class Sound {
    static setCategory(category: string, mixWithOthers?: boolean): void;
    
    constructor(
      path: string,
      type: string,
      callback?: (error: any) => void,
      options?: SoundOptions
    );
    
    play(callback?: (success: boolean) => void): void;
    stop(): void;
    release(): void;
    getDuration(): number;
    setVolume(volume: number): void;
    setNumberOfLoops(loops: number): void;
    getCurrentTime(callback: (seconds: number) => void): void;
    setCurrentTime(seconds: number): void;
  }
}

declare module 'react-native-audio-record' {
  export interface AudioRecordOptions {
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
    wavFile: string;
  }

  export default class AudioRecord {
    static init(options: AudioRecordOptions): void;
    static start(): void;
    static stop(): Promise<string>;
  }
}

// Fix for Blob constructor
interface BlobOptions {
  type?: string;
  lastModified?: number;
}