/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroSpeechRecognition
 */

import { NativeModules, Platform, NativeEventEmitter } from "react-native";

export enum SpeechRecognitionEngine {
  /**
   * Google's Cloud Speech-to-Text API
   */
  GOOGLE = "google",
  
  /**
   * Apple's Speech Framework (iOS only)
   */
  APPLE = "apple",
  
  /**
   * On-device ML Kit Speech Recognition
   */
  ML_KIT = "mlkit",
  
  /**
   * Default engine based on platform (Apple on iOS, Google on Android)
   */
  DEFAULT = "default"
}

export enum SpeechRecognitionState {
  /**
   * Speech recognition is not active
   */
  INACTIVE = "inactive",
  
  /**
   * Speech recognition is listening for audio
   */
  LISTENING = "listening",
  
  /**
   * Speech recognition is processing audio
   */
  PROCESSING = "processing",
  
  /**
   * Speech recognition has been stopped
   */
  STOPPED = "stopped",
  
  /**
   * Speech recognition encountered an error
   */
  ERROR = "error"
}

export interface SpeechRecognitionOptions {
  /**
   * The speech recognition engine to use
   * @default SpeechRecognitionEngine.DEFAULT
   */
  engine?: SpeechRecognitionEngine;
  
  /**
   * The language code to use for recognition (BCP-47 format)
   * @default "en-US"
   */
  languageCode?: string;
  
  /**
   * Maximum duration in milliseconds to listen for speech
   * @default 10000 (10 seconds)
   */
  maxDuration?: number;
  
  /**
   * Whether to use continuous recognition (keeps listening after results)
   * @default false
   */
  continuous?: boolean;
  
  /**
   * Whether to return partial results while speaking
   * @default true
   */
  partialResults?: boolean;
  
  /**
   * API key for Google Cloud Speech (required if using Google engine)
   */
  apiKey?: string;
  
  /**
   * Whether to use on-device recognition when available
   * @default true
   */
  preferOnDevice?: boolean;
  
  /**
   * Whether to enable wake word detection
   * @default false
   */
  enableWakeWord?: boolean;
  
  /**
   * Custom wake word or phrase to listen for
   * @default "Hey Assistant"
   */
  wakeWord?: string;
  
  /**
   * Whether to filter out profanity in results
   * @default false
   */
  filterProfanity?: boolean;
  
  /**
   * Whether to automatically stop recognition on silence
   * @default true
   */
  stopOnSilence?: boolean;
  
  /**
   * Duration of silence in milliseconds before automatically stopping
   * @default 1500 (1.5 seconds)
   */
  silenceTimeout?: number;
}

export interface SpeechRecognitionResult {
  /**
   * The recognized text
   */
  text: string;
  
  /**
   * Whether this is a final result or partial result
   */
  isFinal: boolean;
  
  /**
   * Confidence score between 0 and 1
   */
  confidence: number;
  
  /**
   * Alternative recognition results
   */
  alternatives?: {
    text: string;
    confidence: number;
  }[];
}

export interface SpeechRecognitionError {
  /**
   * Error code
   */
  code: string;
  
  /**
   * Error message
   */
  message: string;
}

export type SpeechRecognitionEventHandler = (event: SpeechRecognitionResult) => void;
export type SpeechRecognitionErrorHandler = (error: SpeechRecognitionError) => void;
export type SpeechRecognitionStateChangeHandler = (state: SpeechRecognitionState) => void;
export type SpeechRecognitionVolumeChangeHandler = (volume: number) => void;

const LINKING_ERROR =
  `The package 'ViroSpeechRecognition' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const NativeSpeechRecognition = NativeModules.ViroSpeechRecognition
  ? NativeModules.ViroSpeechRecognition
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const eventEmitter = new NativeEventEmitter(NativeSpeechRecognition);

/**
 * ViroSpeechRecognition provides speech recognition capabilities for AR applications.
 */
export class ViroSpeechRecognition {
  private static instance: ViroSpeechRecognition;
  private options: SpeechRecognitionOptions;
  private state: SpeechRecognitionState = SpeechRecognitionState.INACTIVE;
  private listeners: { [key: string]: any } = {};
  
  private constructor(options: SpeechRecognitionOptions = {}) {
    this.options = {
      engine: SpeechRecognitionEngine.DEFAULT,
      languageCode: "en-US",
      maxDuration: 10000,
      continuous: false,
      partialResults: true,
      preferOnDevice: true,
      enableWakeWord: false,
      wakeWord: "Hey Assistant",
      filterProfanity: false,
      stopOnSilence: true,
      silenceTimeout: 1500,
      ...options
    };
  }
  
  /**
   * Get the singleton instance of ViroSpeechRecognition
   */
  public static getInstance(options?: SpeechRecognitionOptions): ViroSpeechRecognition {
    if (!ViroSpeechRecognition.instance) {
      ViroSpeechRecognition.instance = new ViroSpeechRecognition(options);
    } else if (options) {
      ViroSpeechRecognition.instance.setOptions(options);
    }
    return ViroSpeechRecognition.instance;
  }
  
  /**
   * Update speech recognition options
   */
  public setOptions(options: Partial<SpeechRecognitionOptions>): void {
    this.options = { ...this.options, ...options };
    NativeSpeechRecognition.setOptions(this.options);
  }
  
  /**
   * Start listening for speech
   */
  public async start(): Promise<void> {
    if (this.state === SpeechRecognitionState.LISTENING || 
        this.state === SpeechRecognitionState.PROCESSING) {
      return;
    }
    
    try {
      await NativeSpeechRecognition.start(this.options);
      this.state = SpeechRecognitionState.LISTENING;
    } catch (error) {
      this.state = SpeechRecognitionState.ERROR;
      throw error;
    }
  }
  
  /**
   * Stop listening for speech
   */
  public async stop(): Promise<void> {
    if (this.state === SpeechRecognitionState.INACTIVE || 
        this.state === SpeechRecognitionState.STOPPED) {
      return;
    }
    
    try {
      await NativeSpeechRecognition.stop();
      this.state = SpeechRecognitionState.STOPPED;
    } catch (error) {
      this.state = SpeechRecognitionState.ERROR;
      throw error;
    }
  }
  
  /**
   * Cancel speech recognition and discard any partial results
   */
  public async cancel(): Promise<void> {
    try {
      await NativeSpeechRecognition.cancel();
      this.state = SpeechRecognitionState.INACTIVE;
    } catch (error) {
      this.state = SpeechRecognitionState.ERROR;
      throw error;
    }
  }
  
  /**
   * Check if the device supports speech recognition
   */
  public static async isSupported(engine: SpeechRecognitionEngine = SpeechRecognitionEngine.DEFAULT): Promise<boolean> {
    return NativeSpeechRecognition.isSupported(engine);
  }
  
  /**
   * Get the current state of speech recognition
   */
  public getState(): SpeechRecognitionState {
    return this.state;
  }
  
  /**
   * Add a listener for speech recognition results
   */
  public onResult(callback: SpeechRecognitionEventHandler): () => void {
    this.listeners.result = eventEmitter.addListener('onSpeechResult', callback);
    return () => this.listeners.result.remove();
  }
  
  /**
   * Add a listener for speech recognition errors
   */
  public onError(callback: SpeechRecognitionErrorHandler): () => void {
    this.listeners.error = eventEmitter.addListener('onSpeechError', callback);
    return () => this.listeners.error.remove();
  }
  
  /**
   * Add a listener for speech recognition state changes
   */
  public onStateChange(callback: SpeechRecognitionStateChangeHandler): () => void {
    this.listeners.stateChange = eventEmitter.addListener('onSpeechStateChange', callback);
    return () => this.listeners.stateChange.remove();
  }
  
  /**
   * Add a listener for speech volume changes (useful for UI feedback)
   */
  public onVolumeChange(callback: SpeechRecognitionVolumeChangeHandler): () => void {
    this.listeners.volumeChange = eventEmitter.addListener('onSpeechVolumeChange', callback);
    return () => this.listeners.volumeChange.remove();
  }
  
  /**
   * Remove all listeners
   */
  public removeAllListeners(): void {
    Object.values(this.listeners).forEach(listener => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    });
    this.listeners = {};
  }
  
  /**
   * Get available languages for speech recognition
   */
  public static async getAvailableLanguages(): Promise<string[]> {
    return NativeSpeechRecognition.getAvailableLanguages();
  }
}

export default ViroSpeechRecognition;