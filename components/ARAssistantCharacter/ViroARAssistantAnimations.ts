/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroARAssistantAnimations
 */

import { ViroAnimations } from "../Animation/ViroAnimations";
import { AssistantCharacterState, AssistantCharacterType } from "./ViroARAssistantCharacter";

/**
 * Animation definitions for different character types
 */
export const CHARACTER_ANIMATIONS: { [key in AssistantCharacterType]?: { [key in AssistantCharacterState]?: any } } = {
  robot: {
    // Robot-specific animations
    [AssistantCharacterState.IDLE]: {
      properties: {
        rotateY: [0, 5, 0, -5, 0],
        positionY: [0, 0.02, 0],
      },
      duration: 5000,
      easing: "Linear",
    },
    [AssistantCharacterState.LISTENING]: {
      properties: {
        scaleX: [1.0, 1.05, 1.0],
        scaleY: [1.0, 1.05, 1.0],
        scaleZ: [1.0, 1.05, 1.0],
      },
      duration: 1000,
      easing: "EaseInEaseOut",
    },
    [AssistantCharacterState.THINKING]: {
      properties: {
        rotateZ: [0, 5, 0, -5, 0],
      },
      duration: 2000,
      easing: "EaseInEaseOut",
    },
    [AssistantCharacterState.SPEAKING]: {
      properties: {
        rotateY: [0, 10, 0, -10, 0],
      },
      duration: 3000,
      easing: "Linear",
    },
  },
  
  humanoid: {
    // Humanoid-specific animations
    [AssistantCharacterState.IDLE]: {
      properties: {
        rotateY: [0, 3, 0, -3, 0],
        positionY: [0, 0.01, 0],
      },
      duration: 4000,
      easing: "Linear",
    },
    [AssistantCharacterState.LISTENING]: {
      properties: {
        rotateX: [0, 5, 0],
      },
      duration: 1500,
      easing: "EaseInEaseOut",
    },
    [AssistantCharacterState.THINKING]: {
      properties: {
        rotateZ: [0, 3, 0, -3, 0],
      },
      duration: 2500,
      easing: "EaseInEaseOut",
    },
    [AssistantCharacterState.SPEAKING]: {
      properties: {
        rotateY: [0, 5, 0, -5, 0],
      },
      duration: 2000,
      easing: "Linear",
    },
  },
  
  abstract: {
    // Abstract-specific animations
    [AssistantCharacterState.IDLE]: {
      properties: {
        scaleX: [1.0, 1.03, 1.0],
        scaleY: [1.0, 1.03, 1.0],
        scaleZ: [1.0, 1.03, 1.0],
      },
      duration: 3000,
      easing: "Linear",
    },
    [AssistantCharacterState.LISTENING]: {
      properties: {
        opacity: [0.8, 1.0, 0.8],
      },
      duration: 1000,
      easing: "Linear",
    },
    [AssistantCharacterState.THINKING]: {
      properties: {
        rotateY: [0, 360],
      },
      duration: 5000,
      easing: "Linear",
    },
    [AssistantCharacterState.SPEAKING]: {
      properties: {
        scaleX: [1.0, 1.1, 1.0],
        scaleY: [1.0, 1.1, 1.0],
        scaleZ: [1.0, 1.1, 1.0],
      },
      duration: 500,
      easing: "EaseInEaseOut",
    },
  },
  
  animal: {
    // Animal-specific animations
    [AssistantCharacterState.IDLE]: {
      properties: {
        rotateY: [0, 10, 0, -10, 0],
        positionY: [0, 0.03, 0],
      },
      duration: 3500,
      easing: "Linear",
    },
    [AssistantCharacterState.LISTENING]: {
      properties: {
        rotateZ: [0, 10, 0, -10, 0],
      },
      duration: 1200,
      easing: "EaseInEaseOut",
    },
    [AssistantCharacterState.THINKING]: {
      properties: {
        rotateX: [0, 10, 0],
      },
      duration: 1800,
      easing: "EaseInEaseOut",
    },
    [AssistantCharacterState.SPEAKING]: {
      properties: {
        positionY: [0, 0.05, 0],
      },
      duration: 800,
      easing: "EaseInEaseOut",
    },
  },
};

/**
 * Common animations for all character types
 */
export const COMMON_ANIMATIONS = {
  // Appear animation
  appear: {
    properties: {
      scaleX: [0.0, 1.0],
      scaleY: [0.0, 1.0],
      scaleZ: [0.0, 1.0],
      opacity: [0.0, 1.0],
    },
    duration: 500,
    easing: "EaseOutBounce",
  },
  
  // Disappear animation
  disappear: {
    properties: {
      scaleX: [1.0, 0.0],
      scaleY: [1.0, 0.0],
      scaleZ: [1.0, 0.0],
      opacity: [1.0, 0.0],
    },
    duration: 300,
    easing: "EaseIn",
  },
  
  // Pointing animation
  pointing: {
    properties: {
      rotateZ: [0, 25, 0],
    },
    duration: 800,
    easing: "EaseInEaseOut",
  },
  
  // Nodding animation
  nodding: {
    properties: {
      rotateX: [0, 20, 0, 20, 0],
    },
    duration: 1500,
    easing: "EaseInEaseOut",
  },
  
  // Shaking head animation
  shakingHead: {
    properties: {
      rotateY: [0, -15, 0, 15, 0],
    },
    duration: 1000,
    easing: "EaseInEaseOut",
  },
};

/**
 * Register animations for a specific character type
 * @param characterType The type of character
 */
export function registerCharacterAnimations(characterType: AssistantCharacterType = AssistantCharacterType.ROBOT): void {
  // Get character-specific animations
  const characterAnimations = CHARACTER_ANIMATIONS[characterType] || CHARACTER_ANIMATIONS.robot;
  
  // Create animation definitions
  const animationDefinitions: { [key: string]: any } = {
    // Common animations
    ...COMMON_ANIMATIONS,
    
    // Character-specific animations
    idle: characterAnimations[AssistantCharacterState.IDLE] || COMMON_ANIMATIONS.idle,
    listening: characterAnimations[AssistantCharacterState.LISTENING] || COMMON_ANIMATIONS.listening,
    thinking: characterAnimations[AssistantCharacterState.THINKING] || COMMON_ANIMATIONS.thinking,
    speaking: characterAnimations[AssistantCharacterState.SPEAKING] || COMMON_ANIMATIONS.speaking,
  };
  
  // Register animations with ViroAnimations
  ViroAnimations.registerAnimations(animationDefinitions);
}

/**
 * Register custom animations for a character
 * @param animations Custom animation definitions
 */
export function registerCustomAnimations(animations: { [key: string]: any }): void {
  ViroAnimations.registerAnimations(animations);
}

/**
 * Get animation for a specific character state
 * @param state The character state
 * @param characterType The type of character
 */
export function getAnimationForState(
  state: AssistantCharacterState,
  characterType: AssistantCharacterType = AssistantCharacterType.ROBOT
): string {
  // Special states that use common animations
  if (state === AssistantCharacterState.HIDDEN) {
    return "disappear";
  } else if (state === AssistantCharacterState.POINTING) {
    return "pointing";
  } else if (state === AssistantCharacterState.NODDING) {
    return "nodding";
  } else if (state === AssistantCharacterState.SHAKING_HEAD) {
    return "shakingHead";
  }
  
  // Regular states
  return state;
}

export default {
  registerCharacterAnimations,
  registerCustomAnimations,
  getAnimationForState,
  CHARACTER_ANIMATIONS,
  COMMON_ANIMATIONS,
};