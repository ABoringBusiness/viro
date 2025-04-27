/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroTextToSpeech
 */

import { NativeModules, Platform, NativeEventEmitter } from "react-native";

export enum TextToSpeechEngine {
  /**
   * Google's Cloud Text-to-Speech API
   */
  GOOGLE = "google",
  
  /**
   * Apple's AVSpeechSynthesizer (iOS only)
   */
  APPLE = "apple",
  
  /**
   * Android's TextToSpeech (Android only)
   */
  ANDROID = "android",
  
  /**
   * Default engine based on platform (Apple on iOS, Android on Android)
   */
  DEFAULT = "default"
}

export enum TextToSpeechVoiceGender {
  /**
   * Male voice
   */
  MALE = "male",
  
  /**
   * Female voice
   */
  FEMALE = "female",
  
  /**
   * Neutral voice
   */
  NEUTRAL = "neutral"
}

export enum TextToSpeechState {
  /**
   * Text-to-speech is not active
   */
  IDLE = "idle",
  
  /**
   * Text-to-speech is speaking
   */
  SPEAKING = "speaking",
  
  /**
   * Text-to-speech is paused
   */
  PAUSED = "paused",
  
  /**
   * Text-to-speech has been stopped
   */
  STOPPED = "stopped",
  
  /**
   * Text-to-speech encountered an error
   */
  ERROR = "error"
}

export interface TextToSpeechVoice {
  /**
   * Unique identifier for the voice
   */
  id: string;
  
  /**
   * Display name of the voice
   */
  name: string;
  
  /**
   * Language code for the voice (BCP-47 format)
   */
  languageCode: string;
  
  /**
   * Gender of the voice
   */
  gender: TextToSpeechVoiceGender;
  
  /**
   * Whether the voice is available for offline use
   */
  isOfflineAvailable?: boolean;
  
  /**
   * Whether the voice is a neural voice (higher quality)
   */
  isNeural?: boolean;
}

export interface TextToSpeechOptions {
  /**
   * The text-to-speech engine to use
   * @default TextToSpeechEngine.DEFAULT
   */
  engine?: TextToSpeechEngine;
  
  /**
   * The language code to use for speech (BCP-47 format)
   * @default "en-US"
   */
  languageCode?: string;
  
  /**
   * The voice to use for speech
   * If not provided, the default voice for the language will be used
   */
  voiceId?: string;
  
  /**
   * The gender of the voice to use
   * Only used if voiceId is not provided
   * @default TextToSpeechVoiceGender.FEMALE
   */
  voiceGender?: TextToSpeechVoiceGender;
  
  /**
   * The speech rate
   * 1.0 is normal speed, 0.5 is half speed, 2.0 is double speed
   * @default 1.0
   */
  rate?: number;
  
  /**
   * The speech pitch
   * 1.0 is normal pitch, 0.5 is lower pitch, 2.0 is higher pitch
   * @default 1.0
   */
  pitch?: number;
  
  /**
   * The speech volume
   * 0.0 is silent, 1.0 is maximum volume
   * @default 1.0
   */
  volume?: number;
  
  /**
   * API key for Google Cloud Text-to-Speech (required if using Google engine)
   */
  apiKey?: string;
  
  /**
   * Whether to use on-device synthesis when available
   * @default true
   */
  preferOnDevice?: boolean;
  
  /**
   * Whether to use SSML markup in the text
   * @default false
   */
  useSsml?: boolean;
  
  /**
   * Whether to use audio ducking (lower volume of other audio)
   * @default true
   */
  audioDucking?: boolean;
  
  /**
   * Whether to queue utterances or interrupt current speech
   * @default false
   */
  queueUtterances?: boolean;
}

export interface TextToSpeechUtterance {
  /**
   * The text to speak
   */
  text: string;
  
  /**
   * Unique identifier for the utterance
   */
  id: string;
  
  /**
   * Options specific to this utterance
   * These will override the global options
   */
  options?: Partial<TextToSpeechOptions>;
}

export interface TextToSpeechMarker {
  /**
   * The utterance ID this marker belongs to
   */
  utteranceId: string;
  
  /**
   * The character index in the text where the marker occurs
   */
  charIndex: number;
  
  /**
   * The name of the marker (if using SSML mark tags)
   */
  name?: string;
}

export type TextToSpeechStateChangeHandler = (state: TextToSpeechState) => void;
export type TextToSpeechStartHandler = (utterance: TextToSpeechUtterance) => void;
export type TextToSpeechEndHandler = (utterance: TextToSpeechUtterance) => void;
export type TextToSpeechErrorHandler = (error: { code: string; message: string; utterance?: TextToSpeechUtterance }) => void;
export type TextToSpeechMarkerHandler = (marker: TextToSpeechMarker) => void;
export type TextToSpeechRangeHandler = (range: { utteranceId: string; start: number; end: number }) => void;

const LINKING_ERROR =
  `The package 'ViroTextToSpeech' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const NativeTextToSpeech = NativeModules.ViroTextToSpeech
  ? NativeModules.ViroTextToSpeech
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const eventEmitter = new NativeEventEmitter(NativeTextToSpeech);

/**
 * ViroTextToSpeech provides text-to-speech capabilities for AR applications.
 */
export class ViroTextToSpeech {
  private static instance: ViroTextToSpeech;
  private options: TextToSpeechOptions;
  private state: TextToSpeechState = TextToSpeechState.IDLE;
  private listeners: { [key: string]: any } = {};
  private utteranceQueue: TextToSpeechUtterance[] = [];
  private currentUtterance: TextToSpeechUtterance | null = null;
  
  private constructor(options: TextToSpeechOptions = {}) {
    this.options = {
      engine: TextToSpeechEngine.DEFAULT,
      languageCode: "en-US",
      voiceGender: TextToSpeechVoiceGender.FEMALE,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      preferOnDevice: true,
      useSsml: false,
      audioDucking: true,
      queueUtterances: false,
      ...options
    };
    
    // Set up event listeners
    this._setupEventListeners();
  }
  
  /**
   * Get the singleton instance of ViroTextToSpeech
   */
  public static getInstance(options?: TextToSpeechOptions): ViroTextToSpeech {
    if (!ViroTextToSpeech.instance) {
      ViroTextToSpeech.instance = new ViroTextToSpeech(options);
    } else if (options) {
      ViroTextToSpeech.instance.setOptions(options);
    }
    return ViroTextToSpeech.instance;
  }
  
  /**
   * Update text-to-speech options
   */
  public setOptions(options: Partial<TextToSpeechOptions>): void {
    this.options = { ...this.options, ...options };
    NativeTextToSpeech.setOptions(this.options);
  }
  
  /**
   * Speak the provided text
   * @param text The text to speak
   * @param options Options specific to this utterance
   * @returns A promise that resolves with the utterance ID
   */
  public async speak(text: string, options?: Partial<TextToSpeechOptions>): Promise<string> {
    const utteranceId = `utterance_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const utterance: TextToSpeechUtterance = {
      text,
      id: utteranceId,
      options
    };
    
    if (this.options.queueUtterances && (this.state === TextToSpeechState.SPEAKING || this.utteranceQueue.length > 0)) {
      // Add to queue if we're already speaking and queueing is enabled
      this.utteranceQueue.push(utterance);
      return utteranceId;
    } else {
      // Speak immediately
      return this._speakUtterance(utterance);
    }
  }
  
  /**
   * Speak the provided SSML text
   * @param ssml The SSML text to speak
   * @param options Options specific to this utterance
   * @returns A promise that resolves with the utterance ID
   */
  public async speakSsml(ssml: string, options?: Partial<TextToSpeechOptions>): Promise<string> {
    const mergedOptions = { ...options, useSsml: true };
    return this.speak(ssml, mergedOptions);
  }
  
  /**
   * Stop speaking and clear the queue
   */
  public async stop(): Promise<void> {
    this.utteranceQueue = [];
    this.currentUtterance = null;
    return NativeTextToSpeech.stop();
  }
  
  /**
   * Pause the current speech
   */
  public async pause(): Promise<void> {
    if (this.state !== TextToSpeechState.SPEAKING) {
      return;
    }
    return NativeTextToSpeech.pause();
  }
  
  /**
   * Resume the paused speech
   */
  public async resume(): Promise<void> {
    if (this.state !== TextToSpeechState.PAUSED) {
      return;
    }
    return NativeTextToSpeech.resume();
  }
  
  /**
   * Get the current state of text-to-speech
   */
  public getState(): TextToSpeechState {
    return this.state;
  }
  
  /**
   * Get the available voices for the specified language
   * @param languageCode Optional language code to filter voices
   */
  public static async getVoices(languageCode?: string): Promise<TextToSpeechVoice[]> {
    return NativeTextToSpeech.getVoices(languageCode);
  }
  
  /**
   * Check if text-to-speech is supported on the device
   * @param engine The engine to check
   */
  public static async isSupported(engine: TextToSpeechEngine = TextToSpeechEngine.DEFAULT): Promise<boolean> {
    return NativeTextToSpeech.isSupported(engine);
  }
  
  /**
   * Add a listener for text-to-speech state changes
   */
  public onStateChange(callback: TextToSpeechStateChangeHandler): () => void {
    this.listeners.stateChange = eventEmitter.addListener('onTtsStateChange', callback);
    return () => this.listeners.stateChange.remove();
  }
  
  /**
   * Add a listener for when speech starts
   */
  public onStart(callback: TextToSpeechStartHandler): () => void {
    this.listeners.start = eventEmitter.addListener('onTtsStart', callback);
    return () => this.listeners.start.remove();
  }
  
  /**
   * Add a listener for when speech ends
   */
  public onEnd(callback: TextToSpeechEndHandler): () => void {
    this.listeners.end = eventEmitter.addListener('onTtsEnd', callback);
    return () => this.listeners.end.remove();
  }
  
  /**
   * Add a listener for text-to-speech errors
   */
  public onError(callback: TextToSpeechErrorHandler): () => void {
    this.listeners.error = eventEmitter.addListener('onTtsError', callback);
    return () => this.listeners.error.remove();
  }
  
  /**
   * Add a listener for SSML markers
   */
  public onMarker(callback: TextToSpeechMarkerHandler): () => void {
    this.listeners.marker = eventEmitter.addListener('onTtsMarker', callback);
    return () => this.listeners.marker.remove();
  }
  
  /**
   * Add a listener for speech ranges (for highlighting text as it's spoken)
   */
  public onRange(callback: TextToSpeechRangeHandler): () => void {
    this.listeners.range = eventEmitter.addListener('onTtsRange', callback);
    return () => this.listeners.range.remove();
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
    this._setupEventListeners();
  }
  
  /**
   * Synthesize speech to an audio file without playing it
   * @param text The text to synthesize
   * @param filePath The path to save the audio file
   * @param options Options for synthesis
   */
  public static async synthesizeToFile(
    text: string,
    filePath: string,
    options?: Partial<TextToSpeechOptions>
  ): Promise<string> {
    return NativeTextToSpeech.synthesizeToFile(text, filePath, options || {});
  }
  
  /**
   * Get the current utterance being spoken
   */
  public getCurrentUtterance(): TextToSpeechUtterance | null {
    return this.currentUtterance;
  }
  
  /**
   * Get the utterance queue
   */
  public getUtteranceQueue(): TextToSpeechUtterance[] {
    return [...this.utteranceQueue];
  }
  
  /**
   * Clear the utterance queue without stopping current speech
   */
  public clearQueue(): void {
    this.utteranceQueue = [];
  }
  
  /**
   * Set up internal event listeners
   */
  private _setupEventListeners(): void {
    // Listen for state changes
    this.listeners._internalStateChange = eventEmitter.addListener('onTtsStateChange', (state: TextToSpeechState) => {
      this.state = state;
      
      if (state === TextToSpeechState.IDLE && this.utteranceQueue.length > 0 && this.options.queueUtterances) {
        // If we're idle and have queued utterances, speak the next one
        const nextUtterance = this.utteranceQueue.shift();
        if (nextUtterance) {
          this._speakUtterance(nextUtterance);
        }
      }
    });
    
    // Listen for speech end
    this.listeners._internalEnd = eventEmitter.addListener('onTtsEnd', (utterance: TextToSpeechUtterance) => {
      if (utterance.id === this.currentUtterance?.id) {
        this.currentUtterance = null;
      }
    });
    
    // Listen for errors
    this.listeners._internalError = eventEmitter.addListener('onTtsError', (error: { code: string; message: string; utterance?: TextToSpeechUtterance }) => {
      if (error.utterance?.id === this.currentUtterance?.id) {
        this.currentUtterance = null;
      }
    });
  }
  
  /**
   * Speak an utterance
   */
  private async _speakUtterance(utterance: TextToSpeechUtterance): Promise<string> {
    try {
      this.currentUtterance = utterance;
      
      // Merge global options with utterance-specific options
      const mergedOptions = { ...this.options, ...(utterance.options || {}) };
      
      await NativeTextToSpeech.speak(utterance.text, utterance.id, mergedOptions);
      return utterance.id;
    } catch (error) {
      this.currentUtterance = null;
      throw error;
    }
  }
}

export default ViroTextToSpeech;