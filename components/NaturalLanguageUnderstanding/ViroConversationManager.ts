/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroConversationManager
 */

import { EventEmitter } from "events";
import { ViroNaturalLanguageUnderstanding, NLUResponse, NLUOptions } from "./ViroNaturalLanguageUnderstanding";
import { ViroIntentHandler, IntentHandlerResult } from "./ViroIntentHandler";

export enum ConversationState {
  /**
   * Conversation is idle, waiting for user input
   */
  IDLE = "idle",
  
  /**
   * Conversation is processing user input
   */
  PROCESSING = "processing",
  
  /**
   * Conversation is responding to user
   */
  RESPONDING = "responding",
  
  /**
   * Conversation has ended
   */
  ENDED = "ended",
  
  /**
   * Conversation encountered an error
   */
  ERROR = "error"
}

export interface ConversationMessage {
  /**
   * The text of the message
   */
  text: string;
  
  /**
   * Whether the message is from the user (true) or assistant (false)
   */
  isUserMessage: boolean;
  
  /**
   * Timestamp of the message
   */
  timestamp: number;
  
  /**
   * The intent of the message (for user messages)
   */
  intent?: string;
  
  /**
   * The action to take (for assistant messages)
   */
  action?: string;
  
  /**
   * Parameters for the action
   */
  actionParams?: { [key: string]: any };
  
  /**
   * Additional metadata
   */
  metadata?: { [key: string]: any };
}

export interface ConversationOptions {
  /**
   * Options for the NLU engine
   */
  nluOptions?: NLUOptions;
  
  /**
   * Maximum number of messages to keep in history
   * @default 50
   */
  maxHistorySize?: number;
  
  /**
   * Whether to automatically end the conversation after a period of inactivity
   * @default true
   */
  autoEndConversation?: boolean;
  
  /**
   * Inactivity timeout in milliseconds before ending the conversation
   * @default 300000 (5 minutes)
   */
  inactivityTimeout?: number;
  
  /**
   * Initial conversation state
   */
  initialState?: { [key: string]: any };
  
  /**
   * User profile information
   */
  userProfile?: { [key: string]: any };
  
  /**
   * Additional context information
   */
  additionalContext?: { [key: string]: any };
}

/**
 * ViroConversationManager manages conversations for natural language understanding.
 */
export class ViroConversationManager extends EventEmitter {
  private static instance: ViroConversationManager;
  private nlu: ViroNaturalLanguageUnderstanding;
  private intentHandler: ViroIntentHandler;
  private state: ConversationState = ConversationState.IDLE;
  private messageHistory: ConversationMessage[] = [];
  private options: ConversationOptions;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private conversationId: string;
  
  private constructor(options: ConversationOptions = {}) {
    super();
    
    this.options = {
      maxHistorySize: 50,
      autoEndConversation: true,
      inactivityTimeout: 300000, // 5 minutes
      ...options
    };
    
    // Initialize NLU and intent handler
    this.nlu = ViroNaturalLanguageUnderstanding.getInstance(options.nluOptions);
    this.intentHandler = ViroIntentHandler.getInstance();
    
    // Set initial conversation state if provided
    if (options.initialState) {
      this.intentHandler.setConversationState(options.initialState);
    }
    
    // Generate conversation ID
    this.conversationId = `conversation_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
  
  /**
   * Get the singleton instance of ViroConversationManager
   */
  public static getInstance(options?: ConversationOptions): ViroConversationManager {
    if (!ViroConversationManager.instance) {
      ViroConversationManager.instance = new ViroConversationManager(options);
    } else if (options) {
      ViroConversationManager.instance.setOptions(options);
    }
    return ViroConversationManager.instance;
  }
  
  /**
   * Update conversation options
   */
  public setOptions(options: Partial<ConversationOptions>): void {
    this.options = { ...this.options, ...options };
    
    // Update NLU options if provided
    if (options.nluOptions) {
      this.nlu.setOptions(options.nluOptions);
    }
    
    // Update conversation state if provided
    if (options.initialState) {
      this.intentHandler.setConversationState(options.initialState);
    }
  }
  
  /**
   * Process a user message
   * @param message The user's message
   * @returns The assistant's response
   */
  public async processMessage(message: string): Promise<ConversationMessage> {
    // Reset inactivity timer
    this.resetInactivityTimer();
    
    // Update state
    this.state = ConversationState.PROCESSING;
    this.emit("stateChange", this.state);
    
    try {
      // Add user message to history
      const userMessage: ConversationMessage = {
        text: message,
        isUserMessage: true,
        timestamp: Date.now()
      };
      
      this.addMessageToHistory(userMessage);
      this.emit("message", userMessage);
      
      // Process message with NLU
      const nluResponse = await this.nlu.processQuery(message);
      
      // Update user message with intent
      userMessage.intent = nluResponse.intent.name;
      userMessage.metadata = {
        confidence: nluResponse.intent.confidence,
        entities: nluResponse.intent.entities
      };
      
      // Handle intent
      const additionalContext = {
        userProfile: this.options.userProfile || {},
        messageHistory: this.messageHistory,
        ...this.options.additionalContext
      };
      
      const intentResult = await this.intentHandler.handleIntent(nluResponse, additionalContext);
      
      // Create assistant response
      const assistantMessage: ConversationMessage = {
        text: intentResult.responseText,
        isUserMessage: false,
        timestamp: Date.now(),
        action: intentResult.action,
        actionParams: intentResult.actionParams,
        metadata: {
          success: intentResult.success,
          followUpIntent: intentResult.followUpIntent,
          endConversation: intentResult.endConversation
        }
      };
      
      // Add assistant message to history
      this.addMessageToHistory(assistantMessage);
      
      // Update state
      this.state = ConversationState.RESPONDING;
      this.emit("stateChange", this.state);
      
      // Emit response event
      this.emit("response", assistantMessage);
      this.emit("message", assistantMessage);
      
      // Check if conversation should end
      if (intentResult.endConversation) {
        this.endConversation();
      } else {
        // Return to idle state
        this.state = ConversationState.IDLE;
        this.emit("stateChange", this.state);
      }
      
      return assistantMessage;
    } catch (error) {
      console.error("Error processing message:", error);
      
      // Update state
      this.state = ConversationState.ERROR;
      this.emit("stateChange", this.state);
      this.emit("error", error);
      
      // Create error response
      const errorMessage: ConversationMessage = {
        text: "I'm sorry, I encountered an error processing your request.",
        isUserMessage: false,
        timestamp: Date.now(),
        metadata: { error }
      };
      
      // Add error message to history
      this.addMessageToHistory(errorMessage);
      this.emit("message", errorMessage);
      
      // Return to idle state
      this.state = ConversationState.IDLE;
      this.emit("stateChange", this.state);
      
      return errorMessage;
    }
  }
  
  /**
   * End the conversation
   */
  public endConversation(): void {
    // Clear inactivity timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    
    // Update state
    this.state = ConversationState.ENDED;
    this.emit("stateChange", this.state);
    this.emit("conversationEnd", {
      conversationId: this.conversationId,
      messageCount: this.messageHistory.length,
      duration: this.messageHistory.length > 0 
        ? this.messageHistory[this.messageHistory.length - 1].timestamp - this.messageHistory[0].timestamp 
        : 0
    });
    
    // Generate new conversation ID for next conversation
    this.conversationId = `conversation_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
  
  /**
   * Start a new conversation
   */
  public startNewConversation(): void {
    // End current conversation if active
    if (this.state !== ConversationState.ENDED) {
      this.endConversation();
    }
    
    // Clear message history
    this.messageHistory = [];
    
    // Reset conversation state
    this.intentHandler.clearConversationState();
    if (this.options.initialState) {
      this.intentHandler.setConversationState(this.options.initialState);
    }
    
    // Reset NLU context
    this.nlu.clearContext();
    
    // Update state
    this.state = ConversationState.IDLE;
    this.emit("stateChange", this.state);
    this.emit("conversationStart", {
      conversationId: this.conversationId,
      timestamp: Date.now()
    });
    
    // Reset inactivity timer
    this.resetInactivityTimer();
  }
  
  /**
   * Get the current conversation state
   */
  public getState(): ConversationState {
    return this.state;
  }
  
  /**
   * Get the conversation message history
   */
  public getMessageHistory(): ConversationMessage[] {
    return [...this.messageHistory];
  }
  
  /**
   * Get the conversation ID
   */
  public getConversationId(): string {
    return this.conversationId;
  }
  
  /**
   * Get the conversation state data
   */
  public getConversationState(): { [key: string]: any } {
    return this.intentHandler.getConversationState();
  }
  
  /**
   * Update the conversation state data
   */
  public updateConversationState(updates: { [key: string]: any }): void {
    this.intentHandler.updateConversationState(updates);
  }
  
  /**
   * Add a message to the history
   */
  private addMessageToHistory(message: ConversationMessage): void {
    this.messageHistory.push(message);
    
    // Trim history if it exceeds max size
    if (this.messageHistory.length > (this.options.maxHistorySize || 50)) {
      this.messageHistory = this.messageHistory.slice(
        this.messageHistory.length - (this.options.maxHistorySize || 50)
      );
    }
  }
  
  /**
   * Reset the inactivity timer
   */
  private resetInactivityTimer(): void {
    // Clear existing timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    
    // Set new timer if auto-end is enabled
    if (this.options.autoEndConversation) {
      this.inactivityTimer = setTimeout(() => {
        // End conversation due to inactivity
        if (this.state !== ConversationState.ENDED) {
          this.endConversation();
        }
      }, this.options.inactivityTimeout || 300000);
    }
  }
  
  /**
   * Release resources
   */
  public release(): void {
    // Clear inactivity timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    
    // Remove all listeners
    this.removeAllListeners();
    
    // Release NLU resources
    this.nlu.release();
  }
}

export default ViroConversationManager;