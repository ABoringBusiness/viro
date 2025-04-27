/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroVoiceInteraction
 */

import { NativeModules, Platform, NativeEventEmitter } from "react-native";
import { ViroSpeechRecognition } from "../SpeechRecognition";
import { ViroNaturalLanguageUnderstanding, NLUResponse } from "../NaturalLanguageUnderstanding";

export enum VoiceInteractionState {
  /**
   * Voice interaction is idle
   */
  IDLE = "idle",
  
  /**
   * Voice interaction is listening
   */
  LISTENING = "listening",
  
  /**
   * Voice interaction is processing
   */
  PROCESSING = "processing",
  
  /**
   * Voice interaction is responding
   */
  RESPONDING = "responding",
  
  /**
   * Voice interaction has encountered an error
   */
  ERROR = "error"
}

export interface VoiceCommand {
  /**
   * The name of the command
   */
  name: string;
  
  /**
   * The phrases that trigger the command
   */
  phrases: string[];
  
  /**
   * The action to perform when the command is recognized
   */
  action: string;
  
  /**
   * Parameters for the action
   */
  params?: { [key: string]: any };
}

export interface VoiceInteractionOptions {
  /**
   * Whether to use wake word detection
   * @default false
   */
  useWakeWord?: boolean;
  
  /**
   * The wake word to listen for
   * @default "Hey Assistant"
   */
  wakeWord?: string;
  
  /**
   * Whether to use continuous listening
   * @default false
   */
  continuousListening?: boolean;
  
  /**
   * Whether to use natural language understanding
   * @default true
   */
  useNLU?: boolean;
  
  /**
   * Custom voice commands
   */
  commands?: VoiceCommand[];
  
  /**
   * Timeout for listening in milliseconds
   * @default 10000 (10 seconds)
   */
  listenTimeout?: number;
  
  /**
   * Whether to show visual feedback during voice interaction
   * @default true
   */
  showVisualFeedback?: boolean;
  
  /**
   * Whether to play audio feedback during voice interaction
   * @default true
   */
  playAudioFeedback?: boolean;
  
  /**
   * Language code for speech recognition
   * @default "en-US"
   */
  languageCode?: string;
}

export interface VoiceInteractionResult {
  /**
   * The recognized text
   */
  text: string;
  
  /**
   * The recognized command
   */
  command?: string;
  
  /**
   * The action to perform
   */
  action?: string;
  
  /**
   * Parameters for the action
   */
  params?: { [key: string]: any };
  
  /**
   * The NLU response (if NLU is enabled)
   */
  nluResponse?: NLUResponse;
  
  /**
   * Whether the interaction was successful
   */
  success: boolean;
}

export type VoiceInteractionCallback = (result: VoiceInteractionResult) => void;
export type VoiceStateChangeCallback = (state: VoiceInteractionState) => void;

/**
 * ViroVoiceInteraction provides voice interaction capabilities for AR applications.
 */
export class ViroVoiceInteraction {
  private static instance: ViroVoiceInteraction;
  private options: VoiceInteractionOptions;
  private speechRecognition: ViroSpeechRecognition;
  private nlu: ViroNaturalLanguageUnderstanding | null = null;
  private state: VoiceInteractionState = VoiceInteractionState.IDLE;
  private commands: VoiceCommand[] = [];
  private callbacks: VoiceInteractionCallback[] = [];
  private stateCallbacks: VoiceStateChangeCallback[] = [];
  private listenTimeoutId: NodeJS.Timeout | null = null;
  
  private constructor(options: VoiceInteractionOptions = {}) {
    this.options = {
      useWakeWord: false,
      wakeWord: "Hey Assistant",
      continuousListening: false,
      useNLU: true,
      listenTimeout: 10000,
      showVisualFeedback: true,
      playAudioFeedback: true,
      languageCode: "en-US",
      ...options
    };
    
    // Initialize speech recognition
    this.speechRecognition = ViroSpeechRecognition.getInstance({
      continuous: this.options.continuousListening,
      partialResults: true,
      enableWakeWord: this.options.useWakeWord,
      wakeWord: this.options.wakeWord,
      languageCode: this.options.languageCode
    });
    
    // Initialize NLU if enabled
    if (this.options.useNLU) {
      this.nlu = ViroNaturalLanguageUnderstanding.getInstance();
    }
    
    // Set up commands
    this.commands = options.commands || this.getDefaultCommands();
    
    // Set up speech recognition listeners
    this.setupListeners();
  }
  
  /**
   * Get the singleton instance of ViroVoiceInteraction
   */
  public static getInstance(options?: VoiceInteractionOptions): ViroVoiceInteraction {
    if (!ViroVoiceInteraction.instance) {
      ViroVoiceInteraction.instance = new ViroVoiceInteraction(options);
    } else if (options) {
      ViroVoiceInteraction.instance.setOptions(options);
    }
    return ViroVoiceInteraction.instance;
  }
  
  /**
   * Update voice interaction options
   */
  public setOptions(options: Partial<VoiceInteractionOptions>): void {
    this.options = { ...this.options, ...options };
    
    // Update speech recognition options
    this.speechRecognition.setOptions({
      continuous: this.options.continuousListening,
      enableWakeWord: this.options.useWakeWord,
      wakeWord: this.options.wakeWord,
      languageCode: this.options.languageCode
    });
    
    // Update commands if provided
    if (options.commands) {
      this.commands = options.commands;
    }
  }
  
  /**
   * Start listening for voice commands
   */
  public async startListening(): Promise<boolean> {
    if (this.state === VoiceInteractionState.LISTENING || 
        this.state === VoiceInteractionState.PROCESSING) {
      return false;
    }
    
    try {
      // Update state
      this.updateState(VoiceInteractionState.LISTENING);
      
      // Start speech recognition
      await this.speechRecognition.start();
      
      // Set timeout for listening
      if (this.options.listenTimeout && !this.options.continuousListening) {
        this.listenTimeoutId = setTimeout(() => {
          this.stopListening();
        }, this.options.listenTimeout);
      }
      
      return true;
    } catch (error) {
      console.error("Failed to start voice interaction:", error);
      this.updateState(VoiceInteractionState.ERROR);
      return false;
    }
  }
  
  /**
   * Stop listening for voice commands
   */
  public async stopListening(): Promise<boolean> {
    if (this.state !== VoiceInteractionState.LISTENING && 
        this.state !== VoiceInteractionState.PROCESSING) {
      return false;
    }
    
    try {
      // Clear timeout
      if (this.listenTimeoutId) {
        clearTimeout(this.listenTimeoutId);
        this.listenTimeoutId = null;
      }
      
      // Stop speech recognition
      await this.speechRecognition.stop();
      
      // Update state
      this.updateState(VoiceInteractionState.IDLE);
      
      return true;
    } catch (error) {
      console.error("Failed to stop voice interaction:", error);
      this.updateState(VoiceInteractionState.ERROR);
      return false;
    }
  }
  
  /**
   * Register a callback for voice interaction results
   * @param callback The callback function to register
   * @returns A function to unregister the callback
   */
  public registerCallback(callback: VoiceInteractionCallback): () => void {
    this.callbacks.push(callback);
    
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Register a callback for voice interaction state changes
   * @param callback The callback function to register
   * @returns A function to unregister the callback
   */
  public registerStateCallback(callback: VoiceStateChangeCallback): () => void {
    this.stateCallbacks.push(callback);
    
    return () => {
      this.stateCallbacks = this.stateCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Get the current state of voice interaction
   */
  public getState(): VoiceInteractionState {
    return this.state;
  }
  
  /**
   * Add a custom voice command
   * @param command The voice command to add
   */
  public addCommand(command: VoiceCommand): void {
    // Check if command already exists
    const existingIndex = this.commands.findIndex(cmd => cmd.name === command.name);
    
    if (existingIndex >= 0) {
      // Update existing command
      this.commands[existingIndex] = command;
    } else {
      // Add new command
      this.commands.push(command);
    }
  }
  
  /**
   * Remove a voice command
   * @param commandName The name of the command to remove
   */
  public removeCommand(commandName: string): void {
    this.commands = this.commands.filter(cmd => cmd.name !== commandName);
  }
  
  /**
   * Get all voice commands
   */
  public getCommands(): VoiceCommand[] {
    return [...this.commands];
  }
  
  /**
   * Release resources
   */
  public release(): void {
    // Stop listening
    this.stopListening();
    
    // Remove speech recognition listeners
    this.speechRecognition.removeAllListeners();
    
    // Clear callbacks
    this.callbacks = [];
    this.stateCallbacks = [];
  }
  
  /**
   * Set up speech recognition listeners
   */
  private setupListeners(): void {
    // Listen for speech recognition results
    const resultListener = this.speechRecognition.onResult(async (result) => {
      // Only process final results
      if (!result.isFinal) return;
      
      // Update state
      this.updateState(VoiceInteractionState.PROCESSING);
      
      // Process the result
      const interactionResult = await this.processVoiceInput(result.text);
      
      // Notify callbacks
      this.notifyCallbacks(interactionResult);
      
      // Update state
      this.updateState(VoiceInteractionState.RESPONDING);
      
      // Return to idle or listening state
      setTimeout(() => {
        if (this.options.continuousListening) {
          this.updateState(VoiceInteractionState.LISTENING);
        } else {
          this.updateState(VoiceInteractionState.IDLE);
        }
      }, 1000);
    });
    
    // Listen for speech recognition errors
    const errorListener = this.speechRecognition.onError((error) => {
      console.error("Speech recognition error:", error);
      this.updateState(VoiceInteractionState.ERROR);
      
      // Notify callbacks of error
      const errorResult: VoiceInteractionResult = {
        text: "",
        success: false
      };
      
      this.notifyCallbacks(errorResult);
      
      // Return to idle state
      setTimeout(() => {
        this.updateState(VoiceInteractionState.IDLE);
      }, 1000);
    });
  }
  
  /**
   * Process voice input
   * @param text The recognized text
   */
  private async processVoiceInput(text: string): Promise<VoiceInteractionResult> {
    // Check for direct command match
    const commandMatch = this.findCommandMatch(text);
    
    if (commandMatch) {
      return {
        text,
        command: commandMatch.name,
        action: commandMatch.action,
        params: commandMatch.params,
        success: true
      };
    }
    
    // Use NLU if enabled
    if (this.options.useNLU && this.nlu) {
      try {
        const nluResponse = await this.nlu.processQuery(text);
        
        // Check if intent was recognized
        if (nluResponse.intent && nluResponse.intent.confidence > 0.5) {
          // Find command that matches the intent
          const intentCommand = this.commands.find(cmd => cmd.name === nluResponse.intent.name);
          
          if (intentCommand) {
            return {
              text,
              command: intentCommand.name,
              action: intentCommand.action,
              params: {
                ...intentCommand.params,
                entities: nluResponse.intent.entities
              },
              nluResponse,
              success: true
            };
          }
          
          // No matching command, but we have an intent
          return {
            text,
            command: nluResponse.intent.name,
            nluResponse,
            success: true
          };
        }
      } catch (error) {
        console.error("Error processing with NLU:", error);
      }
    }
    
    // No command or intent match
    return {
      text,
      success: false
    };
  }
  
  /**
   * Find a direct match for a command
   * @param text The text to match against commands
   */
  private findCommandMatch(text: string): VoiceCommand | null {
    const normalizedText = text.toLowerCase().trim();
    
    for (const command of this.commands) {
      for (const phrase of command.phrases) {
        if (normalizedText === phrase.toLowerCase() || 
            normalizedText.includes(phrase.toLowerCase())) {
          return command;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Update the state and notify state callbacks
   * @param newState The new state
   */
  private updateState(newState: VoiceInteractionState): void {
    if (this.state === newState) return;
    
    this.state = newState;
    
    // Notify state callbacks
    this.stateCallbacks.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        console.error("Error in state callback:", error);
      }
    });
  }
  
  /**
   * Notify result callbacks
   * @param result The interaction result
   */
  private notifyCallbacks(result: VoiceInteractionResult): void {
    this.callbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error("Error in result callback:", error);
      }
    });
  }
  
  /**
   * Get default voice commands
   */
  private getDefaultCommands(): VoiceCommand[] {
    return [
      {
        name: "place_object",
        phrases: [
          "place object",
          "place a cube",
          "add object",
          "create object"
        ],
        action: "place_object",
        params: {
          type: "cube"
        }
      },
      {
        name: "remove_object",
        phrases: [
          "remove object",
          "delete object",
          "remove cube",
          "delete cube"
        ],
        action: "remove_object"
      },
      {
        name: "move_object",
        phrases: [
          "move object",
          "move cube",
          "move left",
          "move right",
          "move up",
          "move down"
        ],
        action: "move_object"
      },
      {
        name: "rotate_object",
        phrases: [
          "rotate object",
          "rotate cube",
          "turn object",
          "turn cube"
        ],
        action: "rotate_object"
      },
      {
        name: "scale_object",
        phrases: [
          "scale object",
          "resize object",
          "make bigger",
          "make smaller"
        ],
        action: "scale_object"
      },
      {
        name: "take_photo",
        phrases: [
          "take photo",
          "take picture",
          "capture this",
          "screenshot"
        ],
        action: "take_photo"
      },
      {
        name: "help",
        phrases: [
          "help",
          "what can you do",
          "show commands",
          "show help"
        ],
        action: "show_help"
      }
    ];
  }
}

export default ViroVoiceInteraction;