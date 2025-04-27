/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroNaturalLanguageUnderstanding
 */

import { NativeModules, Platform } from "react-native";

export enum NLUEngine {
  /**
   * OpenAI's API for advanced language understanding
   */
  OPENAI = "openai",
  
  /**
   * Google's Dialogflow for intent recognition
   */
  DIALOGFLOW = "dialogflow",
  
  /**
   * Custom intent recognition using ML Kit
   */
  ML_KIT = "mlkit",
  
  /**
   * Simple rule-based intent recognition
   */
  RULE_BASED = "rule_based",
  
  /**
   * Default engine (rule-based)
   */
  DEFAULT = "default"
}

export interface NLUEntity {
  /**
   * The type of entity (e.g., "location", "person", "datetime", etc.)
   */
  type: string;
  
  /**
   * The value of the entity
   */
  value: string;
  
  /**
   * The raw text that was recognized as this entity
   */
  text: string;
  
  /**
   * The start position of the entity in the original text
   */
  startPosition?: number;
  
  /**
   * The end position of the entity in the original text
   */
  endPosition?: number;
  
  /**
   * Confidence score for the entity recognition (0.0 - 1.0)
   */
  confidence?: number;
  
  /**
   * Additional metadata for the entity
   */
  metadata?: { [key: string]: any };
}

export interface NLUIntent {
  /**
   * The name of the recognized intent
   */
  name: string;
  
  /**
   * Confidence score for the intent recognition (0.0 - 1.0)
   */
  confidence: number;
  
  /**
   * Entities extracted from the text
   */
  entities: NLUEntity[];
  
  /**
   * Additional parameters for the intent
   */
  parameters?: { [key: string]: any };
}

export interface NLUResponse {
  /**
   * The original query text
   */
  query: string;
  
  /**
   * The recognized intent
   */
  intent: NLUIntent;
  
  /**
   * Alternative intents that were considered
   */
  alternativeIntents?: NLUIntent[];
  
  /**
   * The language detected in the query
   */
  language?: string;
  
  /**
   * The sentiment of the query (-1.0 to 1.0, where -1.0 is very negative and 1.0 is very positive)
   */
  sentiment?: number;
  
  /**
   * The raw response from the NLU engine
   */
  rawResponse?: any;
}

export interface NLUOptions {
  /**
   * The NLU engine to use
   * @default NLUEngine.DEFAULT
   */
  engine?: NLUEngine;
  
  /**
   * The language code to use for NLU (BCP-47 format)
   * @default "en-US"
   */
  languageCode?: string;
  
  /**
   * API key for the NLU engine (required for OpenAI and Dialogflow)
   */
  apiKey?: string;
  
  /**
   * Project ID for Dialogflow
   */
  projectId?: string;
  
  /**
   * Session ID for maintaining conversation context
   */
  sessionId?: string;
  
  /**
   * Minimum confidence threshold for intent recognition (0.0 - 1.0)
   * @default 0.5
   */
  confidenceThreshold?: number;
  
  /**
   * Whether to use on-device processing when available
   * @default true
   */
  preferOnDevice?: boolean;
  
  /**
   * Custom intents for rule-based recognition
   */
  customIntents?: {
    name: string;
    examples: string[];
    entities?: string[];
  }[];
  
  /**
   * Timeout in milliseconds for NLU requests
   * @default 5000
   */
  timeout?: number;
  
  /**
   * Whether to enable sentiment analysis
   * @default false
   */
  enableSentiment?: boolean;
  
  /**
   * Whether to enable entity recognition
   * @default true
   */
  enableEntityRecognition?: boolean;
  
  /**
   * Maximum number of alternative intents to return
   * @default 1
   */
  maxAlternativeIntents?: number;
  
  /**
   * Context for the conversation
   */
  context?: {
    name: string;
    parameters?: { [key: string]: any };
    lifespan?: number;
  }[];
}

const LINKING_ERROR =
  `The package 'ViroNaturalLanguageUnderstanding' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const NativeNLU = NativeModules.ViroNaturalLanguageUnderstanding
  ? NativeModules.ViroNaturalLanguageUnderstanding
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
 * Default intents for AR assistant
 */
const DEFAULT_AR_INTENTS = [
  {
    name: "greeting",
    examples: [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "what's up",
      "how are you"
    ]
  },
  {
    name: "farewell",
    examples: [
      "goodbye",
      "bye",
      "see you",
      "see you later",
      "talk to you later",
      "have a good day"
    ]
  },
  {
    name: "place_object",
    examples: [
      "place a {object} here",
      "put a {object} here",
      "add a {object} here",
      "create a {object} here",
      "spawn a {object} here",
      "place {object} on the {surface}",
      "put {object} on the {surface}"
    ],
    entities: ["object", "surface"]
  },
  {
    name: "remove_object",
    examples: [
      "remove this {object}",
      "delete this {object}",
      "get rid of this {object}",
      "remove all objects",
      "clear the scene",
      "delete everything"
    ],
    entities: ["object"]
  },
  {
    name: "move_object",
    examples: [
      "move this {object} {direction}",
      "move {object} to the {direction}",
      "push {object} {direction}",
      "drag {object} {direction}"
    ],
    entities: ["object", "direction"]
  },
  {
    name: "rotate_object",
    examples: [
      "rotate this {object} {direction}",
      "turn {object} {direction}",
      "spin {object} {direction}"
    ],
    entities: ["object", "direction"]
  },
  {
    name: "scale_object",
    examples: [
      "make this {object} {size}",
      "scale {object} {size}",
      "resize {object} to be {size}"
    ],
    entities: ["object", "size"]
  },
  {
    name: "change_color",
    examples: [
      "change the color of {object} to {color}",
      "make {object} {color}",
      "set {object} color to {color}"
    ],
    entities: ["object", "color"]
  },
  {
    name: "take_photo",
    examples: [
      "take a photo",
      "take a picture",
      "capture this",
      "screenshot",
      "save this view"
    ]
  },
  {
    name: "record_video",
    examples: [
      "record a video",
      "start recording",
      "capture video",
      "start video"
    ]
  },
  {
    name: "stop_recording",
    examples: [
      "stop recording",
      "end video",
      "stop video",
      "finish recording"
    ]
  },
  {
    name: "help",
    examples: [
      "help",
      "what can you do",
      "show me what you can do",
      "what commands can I use",
      "how does this work",
      "I need help"
    ]
  },
  {
    name: "identify_object",
    examples: [
      "what is this",
      "what am I looking at",
      "identify this object",
      "what do you see",
      "recognize this"
    ]
  },
  {
    name: "measure_distance",
    examples: [
      "measure the distance to that {object}",
      "how far is that {object}",
      "what's the distance to {object}"
    ],
    entities: ["object"]
  },
  {
    name: "get_information",
    examples: [
      "tell me about {subject}",
      "what is {subject}",
      "give me information about {subject}",
      "I want to know about {subject}"
    ],
    entities: ["subject"]
  }
];

/**
 * ViroNaturalLanguageUnderstanding provides natural language understanding capabilities for AR applications.
 */
export class ViroNaturalLanguageUnderstanding {
  private static instance: ViroNaturalLanguageUnderstanding;
  private options: NLUOptions;
  private isInitialized: boolean = false;
  private customIntents: any[] = [];
  private conversationContext: any[] = [];
  
  private constructor(options: NLUOptions = {}) {
    this.options = {
      engine: NLUEngine.DEFAULT,
      languageCode: "en-US",
      confidenceThreshold: 0.5,
      preferOnDevice: true,
      timeout: 5000,
      enableSentiment: false,
      enableEntityRecognition: true,
      maxAlternativeIntents: 1,
      ...options
    };
    
    // Initialize custom intents with default AR intents
    this.customIntents = options.customIntents || DEFAULT_AR_INTENTS;
  }
  
  /**
   * Get the singleton instance of ViroNaturalLanguageUnderstanding
   */
  public static getInstance(options?: NLUOptions): ViroNaturalLanguageUnderstanding {
    if (!ViroNaturalLanguageUnderstanding.instance) {
      ViroNaturalLanguageUnderstanding.instance = new ViroNaturalLanguageUnderstanding(options);
    } else if (options) {
      ViroNaturalLanguageUnderstanding.instance.setOptions(options);
    }
    return ViroNaturalLanguageUnderstanding.instance;
  }
  
  /**
   * Update NLU options
   */
  public setOptions(options: Partial<NLUOptions>): void {
    this.options = { ...this.options, ...options };
    
    if (options.customIntents) {
      this.customIntents = options.customIntents;
    }
    
    if (this.isInitialized && NativeNLU.setOptions) {
      NativeNLU.setOptions(this.options);
    }
  }
  
  /**
   * Initialize the NLU system
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // For rule-based engine, we don't need to initialize native module
      if (this.options.engine === NLUEngine.RULE_BASED || this.options.engine === NLUEngine.DEFAULT) {
        this.isInitialized = true;
        return true;
      }
      
      // For other engines, initialize native module
      if (NativeNLU.initialize) {
        await NativeNLU.initialize(this.options);
        this.isInitialized = true;
        return true;
      }
      
      // Fallback to rule-based if native module is not available
      console.warn("Native NLU module not available, falling back to rule-based engine");
      this.options.engine = NLUEngine.RULE_BASED;
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize NLU:", error);
      return false;
    }
  }
  
  /**
   * Process a natural language query
   * @param query The text query to process
   * @returns A promise that resolves with the NLU response
   */
  public async processQuery(query: string): Promise<NLUResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      // For rule-based engine, process query locally
      if (this.options.engine === NLUEngine.RULE_BASED || this.options.engine === NLUEngine.DEFAULT) {
        return this.processRuleBasedQuery(query);
      }
      
      // For other engines, use native module
      if (NativeNLU.processQuery) {
        const response = await NativeNLU.processQuery(query, this.options);
        
        // Update conversation context
        if (response.context) {
          this.conversationContext = response.context;
        }
        
        return response;
      }
      
      // Fallback to rule-based if native module is not available
      return this.processRuleBasedQuery(query);
    } catch (error) {
      console.error("Error processing query:", error);
      
      // Return a fallback response
      return {
        query,
        intent: {
          name: "fallback",
          confidence: 0,
          entities: []
        }
      };
    }
  }
  
  /**
   * Process a query using rule-based intent recognition
   * @param query The text query to process
   * @returns The NLU response
   */
  private processRuleBasedQuery(query: string): NLUResponse {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Find matching intent
    let bestMatch: { intent: any; confidence: number; entities: NLUEntity[] } = {
      intent: null,
      confidence: 0,
      entities: []
    };
    
    const alternativeIntents: NLUIntent[] = [];
    
    for (const intent of this.customIntents) {
      for (const example of intent.examples) {
        const { confidence, entities } = this.calculateSimilarity(normalizedQuery, example, intent.entities);
        
        if (confidence > bestMatch.confidence) {
          // If we already had a best match, add it to alternatives
          if (bestMatch.intent && bestMatch.confidence >= this.options.confidenceThreshold!) {
            alternativeIntents.push({
              name: bestMatch.intent.name,
              confidence: bestMatch.confidence,
              entities: bestMatch.entities
            });
          }
          
          bestMatch = {
            intent,
            confidence,
            entities
          };
        } else if (confidence >= this.options.confidenceThreshold! && 
                  alternativeIntents.length < (this.options.maxAlternativeIntents || 1)) {
          // Add to alternative intents if above threshold
          alternativeIntents.push({
            name: intent.name,
            confidence,
            entities
          });
        }
      }
    }
    
    // If no intent matched with sufficient confidence, use fallback
    if (bestMatch.confidence < (this.options.confidenceThreshold || 0.5)) {
      return {
        query,
        intent: {
          name: "fallback",
          confidence: 0,
          entities: []
        }
      };
    }
    
    // Create response
    const response: NLUResponse = {
      query,
      intent: {
        name: bestMatch.intent.name,
        confidence: bestMatch.confidence,
        entities: bestMatch.entities
      }
    };
    
    // Add alternative intents if available
    if (alternativeIntents.length > 0) {
      response.alternativeIntents = alternativeIntents;
    }
    
    // Add sentiment analysis if enabled
    if (this.options.enableSentiment) {
      response.sentiment = this.analyzeSentiment(normalizedQuery);
    }
    
    return response;
  }
  
  /**
   * Calculate similarity between query and example
   * @param query The normalized query
   * @param example The example pattern
   * @param entityTypes The entity types to extract
   * @returns The confidence score and extracted entities
   */
  private calculateSimilarity(
    query: string,
    example: string,
    entityTypes?: string[]
  ): { confidence: number; entities: NLUEntity[] } {
    // Extract entity placeholders from example
    const entityPlaceholders: { type: string; placeholder: string }[] = [];
    
    if (entityTypes) {
      const placeholderRegex = /\{([^}]+)\}/g;
      let match;
      
      while ((match = placeholderRegex.exec(example)) !== null) {
        const placeholder = match[0];
        const type = match[1];
        
        if (entityTypes.includes(type)) {
          entityPlaceholders.push({ type, placeholder });
        }
      }
    }
    
    // Replace entity placeholders with wildcards for pattern matching
    let pattern = example;
    for (const { placeholder } of entityPlaceholders) {
      pattern = pattern.replace(placeholder, "(.+)");
    }
    
    // Create regex pattern
    const regexPattern = new RegExp("^" + pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&").replace(/\\\(\\\.\\\+\\\)/g, "(.+)") + "$");
    
    // Check if query matches pattern
    const match = query.match(regexPattern);
    
    if (match) {
      // Extract entities
      const entities: NLUEntity[] = [];
      
      if (entityPlaceholders.length > 0 && match.length > 1) {
        for (let i = 0; i < entityPlaceholders.length; i++) {
          if (match[i + 1]) {
            entities.push({
              type: entityPlaceholders[i].type,
              value: match[i + 1],
              text: match[i + 1]
            });
          }
        }
      }
      
      return { confidence: 1.0, entities };
    }
    
    // If no exact match, calculate word similarity
    const queryWords = query.split(/\s+/);
    const exampleWords = example.split(/\s+/).filter(word => !word.match(/\{([^}]+)\}/));
    
    let matchedWords = 0;
    for (const queryWord of queryWords) {
      if (exampleWords.includes(queryWord)) {
        matchedWords++;
      }
    }
    
    const confidence = exampleWords.length > 0 ? matchedWords / exampleWords.length : 0;
    
    return { confidence, entities: [] };
  }
  
  /**
   * Simple sentiment analysis
   * @param text The text to analyze
   * @returns Sentiment score (-1.0 to 1.0)
   */
  private analyzeSentiment(text: string): number {
    const positiveWords = [
      "good", "great", "excellent", "amazing", "wonderful", "fantastic",
      "happy", "glad", "pleased", "love", "like", "enjoy", "awesome",
      "nice", "beautiful", "perfect", "best", "better", "positive"
    ];
    
    const negativeWords = [
      "bad", "terrible", "awful", "horrible", "poor", "worst",
      "sad", "unhappy", "disappointed", "hate", "dislike", "negative",
      "wrong", "problem", "issue", "error", "fail", "failure", "worse"
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) {
        positiveCount++;
      } else if (negativeWords.includes(word)) {
        negativeCount++;
      }
    }
    
    if (positiveCount === 0 && negativeCount === 0) {
      return 0;
    }
    
    return (positiveCount - negativeCount) / (positiveCount + negativeCount);
  }
  
  /**
   * Add a custom intent
   * @param intent The custom intent to add
   */
  public addCustomIntent(intent: {
    name: string;
    examples: string[];
    entities?: string[];
  }): void {
    // Check if intent already exists
    const existingIndex = this.customIntents.findIndex(i => i.name === intent.name);
    
    if (existingIndex >= 0) {
      // Update existing intent
      this.customIntents[existingIndex] = intent;
    } else {
      // Add new intent
      this.customIntents.push(intent);
    }
  }
  
  /**
   * Remove a custom intent
   * @param intentName The name of the intent to remove
   */
  public removeCustomIntent(intentName: string): void {
    this.customIntents = this.customIntents.filter(intent => intent.name !== intentName);
  }
  
  /**
   * Get all custom intents
   */
  public getCustomIntents(): any[] {
    return [...this.customIntents];
  }
  
  /**
   * Add context to the conversation
   * @param context The context to add
   */
  public addContext(context: {
    name: string;
    parameters?: { [key: string]: any };
    lifespan?: number;
  }): void {
    // Check if context already exists
    const existingIndex = this.conversationContext.findIndex(c => c.name === context.name);
    
    if (existingIndex >= 0) {
      // Update existing context
      this.conversationContext[existingIndex] = context;
    } else {
      // Add new context
      this.conversationContext.push(context);
    }
    
    // Update native module if initialized
    if (this.isInitialized && NativeNLU.setContext) {
      NativeNLU.setContext(this.conversationContext);
    }
  }
  
  /**
   * Remove context from the conversation
   * @param contextName The name of the context to remove
   */
  public removeContext(contextName: string): void {
    this.conversationContext = this.conversationContext.filter(context => context.name !== contextName);
    
    // Update native module if initialized
    if (this.isInitialized && NativeNLU.setContext) {
      NativeNLU.setContext(this.conversationContext);
    }
  }
  
  /**
   * Clear all conversation context
   */
  public clearContext(): void {
    this.conversationContext = [];
    
    // Update native module if initialized
    if (this.isInitialized && NativeNLU.clearContext) {
      NativeNLU.clearContext();
    }
  }
  
  /**
   * Get the current conversation context
   */
  public getContext(): any[] {
    return [...this.conversationContext];
  }
  
  /**
   * Release resources
   */
  public release(): void {
    if (this.isInitialized && NativeNLU.release) {
      NativeNLU.release();
      this.isInitialized = false;
    }
  }
}

export default ViroNaturalLanguageUnderstanding;