/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroIntentHandler
 */

import { NLUIntent, NLUResponse } from "./ViroNaturalLanguageUnderstanding";

export interface IntentHandlerContext {
  /**
   * The current conversation state
   */
  conversationState: { [key: string]: any };
  
  /**
   * The user's profile information
   */
  userProfile?: { [key: string]: any };
  
  /**
   * The current AR scene information
   */
  arScene?: { [key: string]: any };
  
  /**
   * The current device information
   */
  deviceInfo?: { [key: string]: any };
  
  /**
   * The current location information
   */
  locationInfo?: { [key: string]: any };
  
  /**
   * Additional context information
   */
  [key: string]: any;
}

export interface IntentHandlerResult {
  /**
   * The response text to be spoken or displayed
   */
  responseText: string;
  
  /**
   * Whether the intent was successfully handled
   */
  success: boolean;
  
  /**
   * The action to take (if any)
   */
  action?: string;
  
  /**
   * Parameters for the action
   */
  actionParams?: { [key: string]: any };
  
  /**
   * Updated conversation state
   */
  updatedState?: { [key: string]: any };
  
  /**
   * Whether to end the conversation
   */
  endConversation?: boolean;
  
  /**
   * Follow-up intent to suggest
   */
  followUpIntent?: string;
  
  /**
   * Additional data
   */
  [key: string]: any;
}

export type IntentHandlerFunction = (
  intent: NLUIntent,
  context: IntentHandlerContext
) => Promise<IntentHandlerResult> | IntentHandlerResult;

/**
 * ViroIntentHandler manages intent handlers for natural language understanding.
 */
export class ViroIntentHandler {
  private static instance: ViroIntentHandler;
  private intentHandlers: Map<string, IntentHandlerFunction> = new Map();
  private fallbackHandler: IntentHandlerFunction;
  private conversationState: { [key: string]: any } = {};
  
  private constructor() {
    // Default fallback handler
    this.fallbackHandler = async (intent, context) => {
      return {
        responseText: "I'm sorry, I didn't understand that. Can you please rephrase?",
        success: false
      };
    };
    
    // Register default handlers
    this.registerDefaultHandlers();
  }
  
  /**
   * Get the singleton instance of ViroIntentHandler
   */
  public static getInstance(): ViroIntentHandler {
    if (!ViroIntentHandler.instance) {
      ViroIntentHandler.instance = new ViroIntentHandler();
    }
    return ViroIntentHandler.instance;
  }
  
  /**
   * Register an intent handler
   * @param intentName The name of the intent to handle
   * @param handler The handler function
   */
  public registerHandler(intentName: string, handler: IntentHandlerFunction): void {
    this.intentHandlers.set(intentName, handler);
  }
  
  /**
   * Register multiple intent handlers
   * @param handlers A map of intent names to handler functions
   */
  public registerHandlers(handlers: { [intentName: string]: IntentHandlerFunction }): void {
    for (const [intentName, handler] of Object.entries(handlers)) {
      this.registerHandler(intentName, handler);
    }
  }
  
  /**
   * Unregister an intent handler
   * @param intentName The name of the intent to unregister
   */
  public unregisterHandler(intentName: string): void {
    this.intentHandlers.delete(intentName);
  }
  
  /**
   * Set the fallback handler for unrecognized intents
   * @param handler The fallback handler function
   */
  public setFallbackHandler(handler: IntentHandlerFunction): void {
    this.fallbackHandler = handler;
  }
  
  /**
   * Handle an NLU response
   * @param response The NLU response to handle
   * @param additionalContext Additional context for the handler
   * @returns The result of handling the intent
   */
  public async handleIntent(
    response: NLUResponse,
    additionalContext: { [key: string]: any } = {}
  ): Promise<IntentHandlerResult> {
    const { intent } = response;
    
    // Create context for handler
    const context: IntentHandlerContext = {
      conversationState: { ...this.conversationState },
      ...additionalContext
    };
    
    // Find handler for intent
    const handler = this.intentHandlers.get(intent.name) || this.fallbackHandler;
    
    try {
      // Call handler
      const result = await handler(intent, context);
      
      // Update conversation state if provided
      if (result.updatedState) {
        this.conversationState = {
          ...this.conversationState,
          ...result.updatedState
        };
      }
      
      return result;
    } catch (error) {
      console.error(`Error handling intent ${intent.name}:`, error);
      
      // Call fallback handler
      return this.fallbackHandler(intent, context);
    }
  }
  
  /**
   * Get the current conversation state
   */
  public getConversationState(): { [key: string]: any } {
    return { ...this.conversationState };
  }
  
  /**
   * Set the conversation state
   * @param state The new conversation state
   */
  public setConversationState(state: { [key: string]: any }): void {
    this.conversationState = { ...state };
  }
  
  /**
   * Update the conversation state
   * @param updates Updates to apply to the conversation state
   */
  public updateConversationState(updates: { [key: string]: any }): void {
    this.conversationState = {
      ...this.conversationState,
      ...updates
    };
  }
  
  /**
   * Clear the conversation state
   */
  public clearConversationState(): void {
    this.conversationState = {};
  }
  
  /**
   * Register default handlers for common intents
   */
  private registerDefaultHandlers(): void {
    // Greeting handler
    this.registerHandler("greeting", async (intent, context) => {
      const greetings = [
        "Hello! How can I help you today?",
        "Hi there! What can I do for you?",
        "Hey! How can I assist you?",
        "Greetings! How may I help you?"
      ];
      
      return {
        responseText: greetings[Math.floor(Math.random() * greetings.length)],
        success: true
      };
    });
    
    // Farewell handler
    this.registerHandler("farewell", async (intent, context) => {
      const farewells = [
        "Goodbye! Have a great day!",
        "See you later!",
        "Bye for now!",
        "Until next time!"
      ];
      
      return {
        responseText: farewells[Math.floor(Math.random() * farewells.length)],
        success: true,
        endConversation: true
      };
    });
    
    // Help handler
    this.registerHandler("help", async (intent, context) => {
      return {
        responseText: "I can help you with various AR tasks. You can ask me to place objects, remove objects, take photos, identify objects, and more. What would you like to do?",
        success: true
      };
    });
    
    // Fallback handler
    this.setFallbackHandler(async (intent, context) => {
      const fallbacks = [
        "I'm sorry, I didn't understand that. Can you please rephrase?",
        "I'm not sure what you mean. Could you try saying it differently?",
        "I didn't catch that. Can you say it another way?",
        "I'm still learning and didn't understand your request. Can you try again?"
      ];
      
      return {
        responseText: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        success: false
      };
    });
  }
}

export default ViroIntentHandler;