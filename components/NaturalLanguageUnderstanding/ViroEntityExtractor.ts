/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroEntityExtractor
 */

import { NativeModules, Platform } from "react-native";
import { NLUEntity } from "./ViroNaturalLanguageUnderstanding";

export enum EntityType {
  /**
   * Person names
   */
  PERSON = "PERSON",
  
  /**
   * Locations
   */
  LOCATION = "LOCATION",
  
  /**
   * Organizations
   */
  ORGANIZATION = "ORGANIZATION",
  
  /**
   * Date and time expressions
   */
  DATETIME = "DATETIME",
  
  /**
   * Monetary values
   */
  MONEY = "MONEY",
  
  /**
   * Percentages
   */
  PERCENTAGE = "PERCENTAGE",
  
  /**
   * Phone numbers
   */
  PHONE_NUMBER = "PHONE_NUMBER",
  
  /**
   * Email addresses
   */
  EMAIL = "EMAIL",
  
  /**
   * URLs
   */
  URL = "URL",
  
  /**
   * Quantities with units
   */
  QUANTITY = "QUANTITY",
  
  /**
   * Colors
   */
  COLOR = "COLOR",
  
  /**
   * Directions (left, right, north, etc.)
   */
  DIRECTION = "DIRECTION",
  
  /**
   * 3D objects
   */
  OBJECT = "OBJECT",
  
  /**
   * Surfaces (table, floor, wall, etc.)
   */
  SURFACE = "SURFACE",
  
  /**
   * Sizes (small, large, etc.)
   */
  SIZE = "SIZE",
  
  /**
   * Custom entity type
   */
  CUSTOM = "CUSTOM"
}

export interface EntityExtractionOptions {
  /**
   * The language code to use for entity extraction (BCP-47 format)
   * @default "en-US"
   */
  languageCode?: string;
  
  /**
   * Entity types to extract
   * @default all types
   */
  entityTypes?: EntityType[];
  
  /**
   * Minimum confidence threshold for entity extraction (0.0 - 1.0)
   * @default 0.5
   */
  confidenceThreshold?: number;
  
  /**
   * Whether to use on-device processing when available
   * @default true
   */
  preferOnDevice?: boolean;
  
  /**
   * Custom entity definitions for rule-based extraction
   */
  customEntities?: {
    type: string;
    values: string[];
    patterns?: string[];
  }[];
}

const LINKING_ERROR =
  `The package 'ViroEntityExtractor' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const NativeEntityExtractor = NativeModules.ViroEntityExtractor
  ? NativeModules.ViroEntityExtractor
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
 * Default entity definitions for AR-related entities
 */
const DEFAULT_AR_ENTITIES = [
  {
    type: EntityType.OBJECT,
    values: [
      "cube", "sphere", "cylinder", "cone", "pyramid", "torus",
      "chair", "table", "desk", "sofa", "lamp", "plant", "tree",
      "car", "bike", "motorcycle", "truck", "airplane", "helicopter",
      "animal", "dog", "cat", "bird", "fish", "person", "character",
      "building", "house", "skyscraper", "bridge", "tower",
      "phone", "computer", "laptop", "tablet", "tv", "monitor",
      "box", "ball", "toy", "game", "model", "statue", "sculpture"
    ]
  },
  {
    type: EntityType.SURFACE,
    values: [
      "floor", "ground", "wall", "ceiling", "table", "desk", "counter",
      "surface", "platform", "stage", "shelf", "plane", "board"
    ]
  },
  {
    type: EntityType.COLOR,
    values: [
      "red", "green", "blue", "yellow", "orange", "purple", "pink",
      "brown", "black", "white", "gray", "grey", "cyan", "magenta",
      "teal", "lime", "maroon", "navy", "olive", "silver", "gold"
    ]
  },
  {
    type: EntityType.DIRECTION,
    values: [
      "up", "down", "left", "right", "forward", "backward", "back",
      "north", "south", "east", "west", "northeast", "northwest",
      "southeast", "southwest", "above", "below", "behind", "in front"
    ]
  },
  {
    type: EntityType.SIZE,
    values: [
      "tiny", "small", "medium", "large", "huge", "enormous", "gigantic",
      "bigger", "smaller", "taller", "shorter", "wider", "narrower",
      "thicker", "thinner", "double", "half", "twice", "triple"
    ]
  }
];

/**
 * ViroEntityExtractor provides entity extraction capabilities for natural language understanding.
 */
export class ViroEntityExtractor {
  private static instance: ViroEntityExtractor;
  private options: EntityExtractionOptions;
  private isInitialized: boolean = false;
  private customEntities: any[] = [];
  
  private constructor(options: EntityExtractionOptions = {}) {
    this.options = {
      languageCode: "en-US",
      confidenceThreshold: 0.5,
      preferOnDevice: true,
      ...options
    };
    
    // Initialize custom entities with default AR entities
    this.customEntities = options.customEntities || DEFAULT_AR_ENTITIES;
  }
  
  /**
   * Get the singleton instance of ViroEntityExtractor
   */
  public static getInstance(options?: EntityExtractionOptions): ViroEntityExtractor {
    if (!ViroEntityExtractor.instance) {
      ViroEntityExtractor.instance = new ViroEntityExtractor(options);
    } else if (options) {
      ViroEntityExtractor.instance.setOptions(options);
    }
    return ViroEntityExtractor.instance;
  }
  
  /**
   * Update entity extraction options
   */
  public setOptions(options: Partial<EntityExtractionOptions>): void {
    this.options = { ...this.options, ...options };
    
    if (options.customEntities) {
      this.customEntities = options.customEntities;
    }
    
    if (this.isInitialized && NativeEntityExtractor.setOptions) {
      NativeEntityExtractor.setOptions(this.options);
    }
  }
  
  /**
   * Initialize the entity extractor
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // Try to initialize native module
      if (NativeEntityExtractor.initialize) {
        await NativeEntityExtractor.initialize(this.options);
        this.isInitialized = true;
        return true;
      }
      
      // Fallback to rule-based if native module is not available
      console.warn("Native entity extractor not available, falling back to rule-based extraction");
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize entity extractor:", error);
      return false;
    }
  }
  
  /**
   * Extract entities from text
   * @param text The text to extract entities from
   * @param options Optional extraction options for this specific extraction
   * @returns A promise that resolves with the extracted entities
   */
  public async extractEntities(
    text: string,
    options?: Partial<EntityExtractionOptions>
  ): Promise<NLUEntity[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      // Try to use native module
      if (NativeEntityExtractor.extractEntities) {
        return await NativeEntityExtractor.extractEntities(text, options || this.options);
      }
      
      // Fallback to rule-based extraction
      return this.extractEntitiesRuleBased(text, options);
    } catch (error) {
      console.error("Error extracting entities:", error);
      return [];
    }
  }
  
  /**
   * Extract entities using rule-based approach
   * @param text The text to extract entities from
   * @param options Optional extraction options
   * @returns The extracted entities
   */
  private extractEntitiesRuleBased(
    text: string,
    options?: Partial<EntityExtractionOptions>
  ): NLUEntity[] {
    const mergedOptions = { ...this.options, ...options };
    const normalizedText = text.toLowerCase();
    const entities: NLUEntity[] = [];
    
    // Get entity types to extract
    const entityTypes = mergedOptions.entityTypes || this.customEntities.map(e => e.type);
    
    // Extract entities for each type
    for (const entityDef of this.customEntities) {
      // Skip if entity type is not requested
      if (!entityTypes.includes(entityDef.type as EntityType) && 
          !entityTypes.includes(entityDef.type as any)) {
        continue;
      }
      
      // Extract from values list
      for (const value of entityDef.values) {
        const normalizedValue = value.toLowerCase();
        let startIndex = 0;
        let index: number;
        
        // Find all occurrences of the value in the text
        while ((index = normalizedText.indexOf(normalizedValue, startIndex)) !== -1) {
          // Check if the value is a whole word
          const isWholeWord = (
            (index === 0 || !normalizedText[index - 1].match(/[a-z0-9]/i)) &&
            (index + normalizedValue.length === normalizedText.length || 
             !normalizedText[index + normalizedValue.length].match(/[a-z0-9]/i))
          );
          
          if (isWholeWord) {
            entities.push({
              type: entityDef.type,
              value: value,
              text: text.substring(index, index + normalizedValue.length),
              startPosition: index,
              endPosition: index + normalizedValue.length,
              confidence: 1.0
            });
          }
          
          startIndex = index + normalizedValue.length;
        }
      }
      
      // Extract from patterns if defined
      if (entityDef.patterns) {
        for (const pattern of entityDef.patterns) {
          try {
            const regex = new RegExp(pattern, "gi");
            let match;
            
            while ((match = regex.exec(text)) !== null) {
              entities.push({
                type: entityDef.type,
                value: match[0],
                text: match[0],
                startPosition: match.index,
                endPosition: match.index + match[0].length,
                confidence: 0.9
              });
            }
          } catch (error) {
            console.error(`Invalid regex pattern: ${pattern}`, error);
          }
        }
      }
    }
    
    // Filter by confidence threshold
    return entities.filter(entity => 
      (entity.confidence || 0) >= (mergedOptions.confidenceThreshold || 0.5)
    );
  }
  
  /**
   * Add a custom entity definition
   * @param entityDef The custom entity definition to add
   */
  public addCustomEntity(entityDef: {
    type: string;
    values: string[];
    patterns?: string[];
  }): void {
    // Check if entity type already exists
    const existingIndex = this.customEntities.findIndex(e => e.type === entityDef.type);
    
    if (existingIndex >= 0) {
      // Update existing entity
      this.customEntities[existingIndex] = entityDef;
    } else {
      // Add new entity
      this.customEntities.push(entityDef);
    }
    
    // Update native module if initialized
    if (this.isInitialized && NativeEntityExtractor.setCustomEntities) {
      NativeEntityExtractor.setCustomEntities(this.customEntities);
    }
  }
  
  /**
   * Remove a custom entity definition
   * @param entityType The type of entity to remove
   */
  public removeCustomEntity(entityType: string): void {
    this.customEntities = this.customEntities.filter(e => e.type !== entityType);
    
    // Update native module if initialized
    if (this.isInitialized && NativeEntityExtractor.setCustomEntities) {
      NativeEntityExtractor.setCustomEntities(this.customEntities);
    }
  }
  
  /**
   * Get all custom entity definitions
   */
  public getCustomEntities(): any[] {
    return [...this.customEntities];
  }
  
  /**
   * Release resources
   */
  public release(): void {
    if (this.isInitialized && NativeEntityExtractor.release) {
      NativeEntityExtractor.release();
      this.isInitialized = false;
    }
  }
}

export default ViroEntityExtractor;