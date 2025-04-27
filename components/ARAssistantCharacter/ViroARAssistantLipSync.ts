/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroARAssistantLipSync
 */

import { NativeModules, Platform } from "react-native";
import { AssistantCharacterMouthShape } from "./ViroARAssistantCharacter";

export interface LipSyncOptions {
  /**
   * The intensity of the lip sync (0.0 - 1.0)
   */
  intensity?: number;
  
  /**
   * The smoothing factor for lip sync transitions (0.0 - 1.0)
   */
  smoothing?: number;
  
  /**
   * Mapping of phonemes to mouth shapes
   */
  phonemeMapping?: { [phoneme: string]: AssistantCharacterMouthShape };
}

export interface LipSyncResult {
  /**
   * The current mouth shape
   */
  mouthShape: AssistantCharacterMouthShape;
  
  /**
   * The current phoneme being spoken
   */
  phoneme: string;
  
  /**
   * The current word being spoken
   */
  word: string;
  
  /**
   * The current character index in the text
   */
  charIndex: number;
  
  /**
   * The timestamp of the current phoneme
   */
  timestamp: number;
}

const LINKING_ERROR =
  `The package 'ViroARAssistantLipSync' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const NativeLipSync = NativeModules.ViroARAssistantLipSync
  ? NativeModules.ViroARAssistantLipSync
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
 * Default phoneme to mouth shape mapping
 */
const DEFAULT_PHONEME_MAPPING: { [phoneme: string]: AssistantCharacterMouthShape } = {
  // Vowels
  'AA': { name: 'A', blendShapeIndex: 0, weight: 0.8 }, // "odd"
  'AE': { name: 'A', blendShapeIndex: 0, weight: 0.7 }, // "at"
  'AH': { name: 'AH', blendShapeIndex: 1, weight: 0.5 }, // "hut"
  'AO': { name: 'O', blendShapeIndex: 2, weight: 0.8 }, // "ought"
  'AW': { name: 'AW', blendShapeIndex: 3, weight: 0.7 }, // "cow"
  'AY': { name: 'AI', blendShapeIndex: 4, weight: 0.7 }, // "hide"
  'EH': { name: 'E', blendShapeIndex: 5, weight: 0.6 }, // "ed"
  'ER': { name: 'ER', blendShapeIndex: 6, weight: 0.5 }, // "hurt"
  'EY': { name: 'EI', blendShapeIndex: 7, weight: 0.7 }, // "ate"
  'IH': { name: 'I', blendShapeIndex: 8, weight: 0.4 }, // "it"
  'IY': { name: 'EE', blendShapeIndex: 9, weight: 0.6 }, // "eat"
  'OW': { name: 'O', blendShapeIndex: 2, weight: 0.7 }, // "oat"
  'OY': { name: 'OI', blendShapeIndex: 10, weight: 0.7 }, // "toy"
  'UH': { name: 'U', blendShapeIndex: 11, weight: 0.5 }, // "hood"
  'UW': { name: 'U', blendShapeIndex: 11, weight: 0.6 }, // "two"
  
  // Consonants
  'B': { name: 'B', blendShapeIndex: 12, weight: 0.8 }, // "be"
  'CH': { name: 'CH', blendShapeIndex: 13, weight: 0.7 }, // "cheese"
  'D': { name: 'D', blendShapeIndex: 14, weight: 0.6 }, // "dee"
  'DH': { name: 'TH', blendShapeIndex: 15, weight: 0.6 }, // "thee"
  'F': { name: 'F', blendShapeIndex: 16, weight: 0.8 }, // "fee"
  'G': { name: 'G', blendShapeIndex: 17, weight: 0.6 }, // "green"
  'HH': { name: 'H', blendShapeIndex: 18, weight: 0.3 }, // "he"
  'JH': { name: 'J', blendShapeIndex: 19, weight: 0.7 }, // "gee"
  'K': { name: 'K', blendShapeIndex: 20, weight: 0.7 }, // "key"
  'L': { name: 'L', blendShapeIndex: 21, weight: 0.6 }, // "lee"
  'M': { name: 'M', blendShapeIndex: 22, weight: 0.8 }, // "me"
  'N': { name: 'N', blendShapeIndex: 23, weight: 0.6 }, // "knee"
  'NG': { name: 'NG', blendShapeIndex: 24, weight: 0.6 }, // "ping"
  'P': { name: 'P', blendShapeIndex: 25, weight: 0.8 }, // "pee"
  'R': { name: 'R', blendShapeIndex: 26, weight: 0.6 }, // "read"
  'S': { name: 'S', blendShapeIndex: 27, weight: 0.7 }, // "sea"
  'SH': { name: 'SH', blendShapeIndex: 28, weight: 0.7 }, // "she"
  'T': { name: 'T', blendShapeIndex: 29, weight: 0.6 }, // "tea"
  'TH': { name: 'TH', blendShapeIndex: 15, weight: 0.7 }, // "theta"
  'V': { name: 'V', blendShapeIndex: 30, weight: 0.7 }, // "vee"
  'W': { name: 'W', blendShapeIndex: 31, weight: 0.7 }, // "we"
  'Y': { name: 'Y', blendShapeIndex: 32, weight: 0.5 }, // "yield"
  'Z': { name: 'Z', blendShapeIndex: 33, weight: 0.6 }, // "zee"
  'ZH': { name: 'ZH', blendShapeIndex: 34, weight: 0.6 }, // "seizure"
  
  // Silence
  'SIL': { name: 'Neutral', blendShapeIndex: 35, weight: 0.0 }, // Silence
};

/**
 * ViroARAssistantLipSync provides lip-syncing capabilities for AR assistant characters.
 */
export class ViroARAssistantLipSync {
  private static instance: ViroARAssistantLipSync;
  private options: LipSyncOptions;
  private isInitialized: boolean = false;
  private currentMouthShape: AssistantCharacterMouthShape = DEFAULT_PHONEME_MAPPING['SIL'];
  private phonemeMapping: { [phoneme: string]: AssistantCharacterMouthShape };
  private audioAnalyzer: any = null; // In a real implementation, this would be an audio analyzer
  
  private constructor(options: LipSyncOptions = {}) {
    this.options = {
      intensity: 1.0,
      smoothing: 0.3,
      ...options
    };
    
    this.phonemeMapping = options.phonemeMapping || DEFAULT_PHONEME_MAPPING;
  }
  
  /**
   * Get the singleton instance of ViroARAssistantLipSync
   */
  public static getInstance(options?: LipSyncOptions): ViroARAssistantLipSync {
    if (!ViroARAssistantLipSync.instance) {
      ViroARAssistantLipSync.instance = new ViroARAssistantLipSync(options);
    } else if (options) {
      ViroARAssistantLipSync.instance.setOptions(options);
    }
    return ViroARAssistantLipSync.instance;
  }
  
  /**
   * Update lip sync options
   */
  public setOptions(options: Partial<LipSyncOptions>): void {
    this.options = { ...this.options, ...options };
    
    if (options.phonemeMapping) {
      this.phonemeMapping = options.phonemeMapping;
    }
    
    if (this.isInitialized) {
      // Update native module options
      NativeLipSync.setOptions(this.options);
    }
  }
  
  /**
   * Initialize the lip sync system
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // In a real implementation, this would initialize the native module
      // await NativeLipSync.initialize(this.options);
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize lip sync:", error);
      return false;
    }
  }
  
  /**
   * Start lip-syncing for the given text
   * @param text The text to lip-sync
   * @param audioSource Optional audio source to sync with
   */
  public async startLipSync(text: string, audioSource?: any): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      // In a real implementation, this would start the native lip sync process
      // await NativeLipSync.startLipSync(text, audioSource);
      
      // For now, we'll simulate lip sync with a simple timer
      this.simulateLipSync(text);
      
      return true;
    } catch (error) {
      console.error("Failed to start lip sync:", error);
      return false;
    }
  }
  
  /**
   * Stop lip-syncing
   */
  public async stopLipSync(): Promise<void> {
    try {
      // In a real implementation, this would stop the native lip sync process
      // await NativeLipSync.stopLipSync();
      
      // Reset to neutral mouth shape
      this.currentMouthShape = this.phonemeMapping['SIL'];
      
      // Clear any timers or audio analyzers
      if (this.audioAnalyzer) {
        this.audioAnalyzer = null;
      }
    } catch (error) {
      console.error("Failed to stop lip sync:", error);
    }
  }
  
  /**
   * Get the current mouth shape
   */
  public getCurrentMouthShape(): AssistantCharacterMouthShape {
    return this.currentMouthShape;
  }
  
  /**
   * Simulate lip sync for the given text
   * This is a simple simulation for demonstration purposes
   */
  private simulateLipSync(text: string): void {
    // Split text into words
    const words = text.split(' ');
    let wordIndex = 0;
    let charIndex = 0;
    
    // Create a simple timer to cycle through phonemes
    const interval = setInterval(() => {
      if (wordIndex >= words.length) {
        clearInterval(interval);
        this.currentMouthShape = this.phonemeMapping['SIL'];
        return;
      }
      
      const word = words[wordIndex];
      
      // Simulate phonemes based on characters in the word
      if (charIndex < word.length) {
        const char = word[charIndex].toUpperCase();
        let phoneme = 'AH'; // Default phoneme
        
        // Map characters to phonemes (very simplified)
        if ('AEIOU'.includes(char)) {
          // Vowels
          switch (char) {
            case 'A': phoneme = 'AA'; break;
            case 'E': phoneme = 'EH'; break;
            case 'I': phoneme = 'IH'; break;
            case 'O': phoneme = 'AO'; break;
            case 'U': phoneme = 'UH'; break;
          }
        } else {
          // Consonants
          if ('BCDFGHJKLMNPQRSTVWXYZ'.includes(char)) {
            phoneme = char;
          }
        }
        
        // Get mouth shape for phoneme
        const mouthShape = this.phonemeMapping[phoneme] || this.phonemeMapping['AH'];
        
        // Apply intensity
        const intensity = this.options.intensity || 1.0;
        mouthShape.weight = mouthShape.weight * intensity;
        
        // Update current mouth shape
        this.currentMouthShape = mouthShape;
        
        charIndex++;
      } else {
        // Move to next word
        wordIndex++;
        charIndex = 0;
        
        // Brief pause between words
        this.currentMouthShape = this.phonemeMapping['SIL'];
      }
    }, 100); // Update every 100ms
  }
  
  /**
   * Release resources
   */
  public release(): void {
    this.stopLipSync();
    
    if (this.isInitialized) {
      // In a real implementation, this would release native resources
      // NativeLipSync.release();
      
      this.isInitialized = false;
    }
  }
}

export default ViroARAssistantLipSync;