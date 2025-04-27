/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroARAssistantMaterials
 */

import { ViroMaterials } from "../Material/ViroMaterials";
import { AssistantCharacterType } from "./ViroARAssistantCharacter";

/**
 * Material definitions for different character types
 */
export const CHARACTER_MATERIALS: { [key in AssistantCharacterType]?: any } = {
  robot: {
    // Robot materials
    body: {
      lightingModel: "PBR",
      diffuseColor: "#88CCFF",
      roughness: 0.3,
      metalness: 0.8,
    },
    eyes: {
      lightingModel: "Blinn",
      diffuseColor: "#00FFFF",
      shininess: 10.0,
    },
    joints: {
      lightingModel: "PBR",
      diffuseColor: "#444444",
      roughness: 0.5,
      metalness: 0.9,
    },
  },
  
  humanoid: {
    // Humanoid materials
    skin: {
      lightingModel: "PBR",
      diffuseColor: "#FFD0B5",
      roughness: 0.7,
      metalness: 0.0,
    },
    hair: {
      lightingModel: "PBR",
      diffuseColor: "#553322",
      roughness: 0.8,
      metalness: 0.0,
    },
    clothing: {
      lightingModel: "PBR",
      diffuseColor: "#3366CC",
      roughness: 0.5,
      metalness: 0.1,
    },
    eyes: {
      lightingModel: "Blinn",
      diffuseColor: "#3366CC",
      shininess: 10.0,
    },
  },
  
  abstract: {
    // Abstract materials
    primary: {
      lightingModel: "Constant",
      diffuseColor: "#FF6600",
    },
    secondary: {
      lightingModel: "Constant",
      diffuseColor: "#00CCFF",
    },
    accent: {
      lightingModel: "Constant",
      diffuseColor: "#FFFFFF",
    },
  },
  
  animal: {
    // Animal materials
    fur: {
      lightingModel: "PBR",
      diffuseColor: "#BB8855",
      roughness: 0.9,
      metalness: 0.0,
    },
    nose: {
      lightingModel: "PBR",
      diffuseColor: "#000000",
      roughness: 0.5,
      metalness: 0.0,
    },
    eyes: {
      lightingModel: "Blinn",
      diffuseColor: "#663300",
      shininess: 10.0,
    },
  },
};

/**
 * Common materials for all character types
 */
export const COMMON_MATERIALS = {
  // Shadow material
  shadow: {
    lightingModel: "Lambert",
    diffuseColor: "#00000044",
  },
  
  // Highlight material
  highlight: {
    lightingModel: "Constant",
    diffuseColor: "#FFFFFF88",
  },
};

/**
 * Register materials for a specific character type
 * @param characterType The type of character
 * @param customization Optional customization options
 */
export function registerCharacterMaterials(
  characterType: AssistantCharacterType = AssistantCharacterType.ROBOT,
  customization?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  }
): void {
  // Get character-specific materials
  const characterMaterials = CHARACTER_MATERIALS[characterType] || CHARACTER_MATERIALS.robot;
  
  // Apply customizations if provided
  if (customization) {
    if (customization.primaryColor) {
      if (characterType === AssistantCharacterType.ROBOT) {
        characterMaterials.body.diffuseColor = customization.primaryColor;
      } else if (characterType === AssistantCharacterType.HUMANOID) {
        characterMaterials.clothing.diffuseColor = customization.primaryColor;
      } else if (characterType === AssistantCharacterType.ABSTRACT) {
        characterMaterials.primary.diffuseColor = customization.primaryColor;
      } else if (characterType === AssistantCharacterType.ANIMAL) {
        characterMaterials.fur.diffuseColor = customization.primaryColor;
      }
    }
    
    if (customization.secondaryColor) {
      if (characterType === AssistantCharacterType.ROBOT) {
        characterMaterials.joints.diffuseColor = customization.secondaryColor;
      } else if (characterType === AssistantCharacterType.HUMANOID) {
        characterMaterials.hair.diffuseColor = customization.secondaryColor;
      } else if (characterType === AssistantCharacterType.ABSTRACT) {
        characterMaterials.secondary.diffuseColor = customization.secondaryColor;
      } else if (characterType === AssistantCharacterType.ANIMAL) {
        characterMaterials.nose.diffuseColor = customization.secondaryColor;
      }
    }
    
    if (customization.accentColor) {
      if (characterType === AssistantCharacterType.ROBOT) {
        characterMaterials.eyes.diffuseColor = customization.accentColor;
      } else if (characterType === AssistantCharacterType.HUMANOID) {
        characterMaterials.eyes.diffuseColor = customization.accentColor;
      } else if (characterType === AssistantCharacterType.ABSTRACT) {
        characterMaterials.accent.diffuseColor = customization.accentColor;
      } else if (characterType === AssistantCharacterType.ANIMAL) {
        characterMaterials.eyes.diffuseColor = customization.accentColor;
      }
    }
  }
  
  // Create material definitions
  const materialDefinitions: { [key: string]: any } = {
    // Common materials
    ...COMMON_MATERIALS,
    
    // Character-specific materials
    ...characterMaterials,
    
    // Combined materials for convenience
    assistantDefault: characterType === AssistantCharacterType.ROBOT ? characterMaterials.body :
                      characterType === AssistantCharacterType.HUMANOID ? characterMaterials.skin :
                      characterType === AssistantCharacterType.ABSTRACT ? characterMaterials.primary :
                      characterMaterials.fur,
  };
  
  // Register materials with ViroMaterials
  ViroMaterials.createMaterials(materialDefinitions);
}

/**
 * Register custom materials for a character
 * @param materials Custom material definitions
 */
export function registerCustomMaterials(materials: { [key: string]: any }): void {
  ViroMaterials.createMaterials(materials);
}

/**
 * Get material names for a specific character type
 * @param characterType The type of character
 */
export function getMaterialsForCharacterType(characterType: AssistantCharacterType = AssistantCharacterType.ROBOT): string[] {
  switch (characterType) {
    case AssistantCharacterType.ROBOT:
      return ['body', 'eyes', 'joints'];
    case AssistantCharacterType.HUMANOID:
      return ['skin', 'hair', 'clothing', 'eyes'];
    case AssistantCharacterType.ABSTRACT:
      return ['primary', 'secondary', 'accent'];
    case AssistantCharacterType.ANIMAL:
      return ['fur', 'nose', 'eyes'];
    default:
      return ['assistantDefault'];
  }
}

export default {
  registerCharacterMaterials,
  registerCustomMaterials,
  getMaterialsForCharacterType,
  CHARACTER_MATERIALS,
  COMMON_MATERIALS,
};