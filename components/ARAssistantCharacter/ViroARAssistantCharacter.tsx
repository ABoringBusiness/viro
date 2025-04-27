/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroARAssistantCharacter
 */

import * as React from "react";
import {
  NativeSyntheticEvent,
  StyleSheet,
} from "react-native";
import { ViroNode } from "../ViroNode";
import { Viro3DObject } from "../Viro3DObject";
import { ViroAnimations } from "../Animation/ViroAnimations";
import { ViroMaterials } from "../Material/ViroMaterials";
import { ViroSpotLight } from "../ViroSpotLight";
import { ViroQuad } from "../ViroQuad";
import { Viro3DPoint, Viro3DRotation } from "../Types/ViroUtils";

// Register default animations for the assistant character
ViroAnimations.registerAnimations({
  // Idle animations
  idleBreathing: {
    properties: {
      scaleX: [1.0, 1.02, 1.0],
      scaleY: [1.0, 1.02, 1.0],
      scaleZ: [1.0, 1.02, 1.0],
    },
    duration: 3000,
    easing: "Linear",
  },
  idleLookAround: {
    properties: {
      rotateY: [0, 15, 0, -15, 0],
    },
    duration: 6000,
    easing: "Linear",
  },
  idle: [
    ["idleBreathing", "idleLookAround"],
  ],
  
  // Listening animation
  listeningPulse: {
    properties: {
      opacity: [0.7, 1.0, 0.7],
    },
    duration: 1500,
    easing: "Linear",
  },
  listeningRotate: {
    properties: {
      rotateY: "+=15",
    },
    duration: 1000,
    easing: "EaseInEaseOut",
  },
  listening: [
    ["listeningPulse"],
  ],
  
  // Thinking animation
  thinkingPulse: {
    properties: {
      scaleX: [1.0, 0.95, 1.0],
      scaleY: [1.0, 0.95, 1.0],
      scaleZ: [1.0, 0.95, 1.0],
    },
    duration: 800,
    easing: "EaseInEaseOut",
  },
  thinking: [
    ["thinkingPulse"],
  ],
  
  // Speaking animation
  speakingBob: {
    properties: {
      positionY: [0, 0.02, 0, -0.02, 0],
    },
    duration: 1000,
    easing: "Linear",
  },
  speakingGesture: {
    properties: {
      rotateZ: [0, 5, 0, -5, 0],
    },
    duration: 2000,
    easing: "EaseInEaseOut",
  },
  speaking: [
    ["speakingBob", "speakingGesture"],
  ],
  
  // Appear animation
  appearScale: {
    properties: {
      scaleX: [0.0, 1.0],
      scaleY: [0.0, 1.0],
      scaleZ: [0.0, 1.0],
      opacity: [0.0, 1.0],
    },
    duration: 500,
    easing: "EaseOutBounce",
  },
  appear: [
    ["appearScale"],
  ],
  
  // Disappear animation
  disappearScale: {
    properties: {
      scaleX: [1.0, 0.0],
      scaleY: [1.0, 0.0],
      scaleZ: [1.0, 0.0],
      opacity: [1.0, 0.0],
    },
    duration: 300,
    easing: "EaseIn",
  },
  disappear: [
    ["disappearScale"],
  ],
  
  // Pointing animation
  pointingGesture: {
    properties: {
      rotateZ: [0, 25],
      rotateX: [0, 15],
    },
    duration: 500,
    easing: "EaseOut",
  },
  pointingReturn: {
    properties: {
      rotateZ: [25, 0],
      rotateX: [15, 0],
    },
    duration: 300,
    easing: "EaseIn",
  },
  pointing: [
    ["pointingGesture", "pointingReturn"],
  ],
  
  // Nodding animation
  noddingGesture: {
    properties: {
      rotateX: [0, 20, 0, 20, 0],
    },
    duration: 1500,
    easing: "EaseInEaseOut",
  },
  nodding: [
    ["noddingGesture"],
  ],
  
  // Shaking head animation
  shakingHeadGesture: {
    properties: {
      rotateY: [0, -15, 0, 15, 0],
    },
    duration: 1000,
    easing: "EaseInEaseOut",
  },
  shakingHead: [
    ["shakingHeadGesture"],
  ],
});

// Register default materials for the assistant character
ViroMaterials.createMaterials({
  assistantDefault: {
    lightingModel: "PBR",
    diffuseColor: "#88CCFF",
    roughness: 0.3,
    metalness: 0.8,
  },
  assistantShadow: {
    lightingModel: "Lambert",
    diffuseColor: "#00000044",
  },
});

export enum AssistantCharacterState {
  IDLE = "idle",
  LISTENING = "listening",
  THINKING = "thinking",
  SPEAKING = "speaking",
  POINTING = "pointing",
  NODDING = "nodding",
  SHAKING_HEAD = "shakingHead",
  HIDDEN = "hidden",
}

export enum AssistantCharacterType {
  ROBOT = "robot",
  HUMANOID = "humanoid",
  ABSTRACT = "abstract",
  ANIMAL = "animal",
  CUSTOM = "custom",
}

export interface AssistantCharacterMouthShape {
  /**
   * The name of the mouth shape (e.g., "A", "E", "O", etc.)
   */
  name: string;
  
  /**
   * The blend shape index or name in the 3D model
   */
  blendShapeIndex: number | string;
  
  /**
   * The weight of the blend shape (0.0 - 1.0)
   */
  weight: number;
}

export interface AssistantCharacterCustomization {
  /**
   * Primary color of the character
   */
  primaryColor?: string;
  
  /**
   * Secondary color of the character
   */
  secondaryColor?: string;
  
  /**
   * Accent color of the character
   */
  accentColor?: string;
  
  /**
   * Scale of the character (1.0 is default size)
   */
  scale?: number;
  
  /**
   * Whether to show a shadow under the character
   */
  showShadow?: boolean;
  
  /**
   * Custom materials to apply to the character
   */
  materials?: { [key: string]: any };
  
  /**
   * Custom animations to apply to the character
   */
  animations?: { [key: string]: any };
}

export interface AssistantCharacterLipSyncConfig {
  /**
   * Whether to enable lip sync
   */
  enabled: boolean;
  
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

export interface AssistantCharacterProps {
  /**
   * The type of character to display
   */
  type?: AssistantCharacterType;
  
  /**
   * The current state of the character
   */
  state?: AssistantCharacterState;
  
  /**
   * The position of the character in 3D space
   */
  position?: Viro3DPoint;
  
  /**
   * The rotation of the character in 3D space
   */
  rotation?: Viro3DRotation;
  
  /**
   * The scale of the character
   */
  scale?: Viro3DPoint;
  
  /**
   * Path to a custom 3D model for the character
   */
  source?: { uri: string } | number;
  
  /**
   * Type of the 3D model (OBJ, GLTF, etc.)
   */
  type?: string;
  
  /**
   * Customization options for the character
   */
  customization?: AssistantCharacterCustomization;
  
  /**
   * Lip sync configuration for the character
   */
  lipSync?: AssistantCharacterLipSyncConfig;
  
  /**
   * Direction the character should point in
   */
  pointingDirection?: Viro3DPoint;
  
  /**
   * Whether the character should cast a shadow
   */
  castShadow?: boolean;
  
  /**
   * Whether the character should receive shadows
   */
  receiveShadow?: boolean;
  
  /**
   * Callback when the character is tapped
   */
  onTap?: () => void;
  
  /**
   * Callback when the character state changes
   */
  onStateChange?: (state: AssistantCharacterState) => void;
  
  /**
   * Callback when the character finishes loading
   */
  onLoadEnd?: () => void;
  
  /**
   * Callback when the character fails to load
   */
  onError?: (error: NativeSyntheticEvent<any>) => void;
}

interface AssistantCharacterState {
  isLoaded: boolean;
  currentState: AssistantCharacterState;
  currentAnimation: string;
  isVisible: boolean;
}

/**
 * ViroARAssistantCharacter is a component that displays a 3D character in AR
 * that can be animated to show different states like idle, listening, thinking, and speaking.
 */
export class ViroARAssistantCharacter extends React.Component<AssistantCharacterProps, AssistantCharacterState> {
  private characterNode = React.createRef<ViroNode>();
  private characterModel = React.createRef<Viro3DObject>();
  private defaultModels: { [key in AssistantCharacterType]?: { uri: string, type: string } } = {
    robot: { uri: "https://cdn.example.com/models/assistant_robot.glb", type: "GLB" },
    humanoid: { uri: "https://cdn.example.com/models/assistant_humanoid.glb", type: "GLB" },
    abstract: { uri: "https://cdn.example.com/models/assistant_abstract.glb", type: "GLB" },
    animal: { uri: "https://cdn.example.com/models/assistant_animal.glb", type: "GLB" },
  };
  
  constructor(props: AssistantCharacterProps) {
    super(props);
    
    this.state = {
      isLoaded: false,
      currentState: props.state || AssistantCharacterState.IDLE,
      currentAnimation: "idle",
      isVisible: props.state !== AssistantCharacterState.HIDDEN,
    };
  }
  
  componentDidMount() {
    // Apply initial state
    this.updateCharacterState(this.props.state || AssistantCharacterState.IDLE);
    
    // Apply customizations
    this.applyCustomizations();
  }
  
  componentDidUpdate(prevProps: AssistantCharacterProps) {
    // Update state if it changed
    if (prevProps.state !== this.props.state && this.props.state) {
      this.updateCharacterState(this.props.state);
    }
    
    // Update customizations if they changed
    if (prevProps.customization !== this.props.customization) {
      this.applyCustomizations();
    }
    
    // Update pointing direction if it changed
    if (prevProps.pointingDirection !== this.props.pointingDirection && this.props.pointingDirection) {
      this.pointAt(this.props.pointingDirection);
    }
  }
  
  /**
   * Update the character's state and play the corresponding animation
   */
  private updateCharacterState(state: AssistantCharacterState) {
    let animation = state;
    let isVisible = true;
    
    // Handle special states
    if (state === AssistantCharacterState.HIDDEN) {
      animation = "disappear";
      isVisible = false;
    } else if (this.state.currentState === AssistantCharacterState.HIDDEN && state !== AssistantCharacterState.HIDDEN) {
      animation = "appear";
      isVisible = true;
    }
    
    this.setState({
      currentState: state,
      currentAnimation: animation,
      isVisible,
    });
    
    // Notify state change
    if (this.props.onStateChange) {
      this.props.onStateChange(state);
    }
  }
  
  /**
   * Apply customizations to the character
   */
  private applyCustomizations() {
    const { customization } = this.props;
    
    if (!customization) return;
    
    // Apply custom materials
    if (customization.materials) {
      ViroMaterials.createMaterials(customization.materials);
    }
    
    // Apply custom animations
    if (customization.animations) {
      ViroAnimations.registerAnimations(customization.animations);
    }
    
    // Apply custom colors
    if (customization.primaryColor) {
      ViroMaterials.createMaterials({
        assistantDefault: {
          ...ViroMaterials.getMaterialsInfo().assistantDefault,
          diffuseColor: customization.primaryColor,
        },
      });
    }
  }
  
  /**
   * Point the character at a specific 3D position
   */
  private pointAt(position: Viro3DPoint) {
    // Calculate direction to point at
    if (this.characterNode.current) {
      // In a real implementation, we would calculate the rotation needed
      // to point at the target position. For now, we just play the pointing animation.
      this.setState({
        currentAnimation: "pointing",
      });
      
      // Return to previous state after pointing
      setTimeout(() => {
        this.setState({
          currentAnimation: this.state.currentState,
        });
      }, 2000);
    }
  }
  
  /**
   * Handle tap events on the character
   */
  private onTap = () => {
    if (this.props.onTap) {
      this.props.onTap();
    }
  };
  
  /**
   * Handle load end events for the character model
   */
  private onLoadEnd = () => {
    this.setState({ isLoaded: true });
    
    if (this.props.onLoadEnd) {
      this.props.onLoadEnd();
    }
  };
  
  /**
   * Handle error events for the character model
   */
  private onError = (event: NativeSyntheticEvent<any>) => {
    if (this.props.onError) {
      this.props.onError(event);
    }
  };
  
  /**
   * Get the appropriate 3D model source based on character type
   */
  private getModelSource() {
    const { source, type } = this.props;
    
    if (source) {
      return source;
    }
    
    const characterType = type || AssistantCharacterType.ROBOT;
    return this.defaultModels[characterType] || this.defaultModels.robot;
  }
  
  /**
   * Get the appropriate model type based on the source
   */
  private getModelType() {
    const { source, type } = this.props;
    
    if (source && typeof source !== 'number') {
      // Extract file extension from URI
      const uri = source.uri;
      const extension = uri.split('.').pop()?.toUpperCase();
      
      if (extension === 'GLB' || extension === 'GLTF') {
        return 'GLB';
      } else if (extension === 'OBJ') {
        return 'OBJ';
      } else if (extension === 'FBX') {
        return 'FBX';
      }
    }
    
    return type || 'GLB';
  }
  
  render() {
    const { position, rotation, scale, castShadow, receiveShadow } = this.props;
    const { currentAnimation, isVisible } = this.state;
    
    // Don't render if not visible
    if (!isVisible && currentAnimation !== "disappear") {
      return null;
    }
    
    const modelSource = this.getModelSource();
    const modelType = this.getModelType();
    
    return (
      <ViroNode
        ref={this.characterNode}
        position={position || [0, 0, -1]}
        rotation={rotation || [0, 0, 0]}
        scale={scale || [1, 1, 1]}
        animation={{
          name: currentAnimation,
          run: true,
          loop: currentAnimation !== "appear" && currentAnimation !== "disappear",
          onFinish: currentAnimation === "disappear" ? () => this.setState({ isVisible: false }) : undefined,
        }}
      >
        {/* Character model */}
        <Viro3DObject
          ref={this.characterModel}
          source={modelSource}
          type={modelType}
          materials={["assistantDefault"]}
          animation={{
            name: currentAnimation,
            run: true,
            loop: currentAnimation !== "appear" && currentAnimation !== "disappear",
          }}
          onLoadEnd={this.onLoadEnd}
          onError={this.onError}
          onClick={this.onTap}
          castsShadow={castShadow}
          lightReceivingBitMask={receiveShadow ? 1 : 0}
        />
        
        {/* Shadow */}
        {this.props.customization?.showShadow !== false && (
          <ViroQuad
            position={[0, -0.001, 0]}
            rotation={[-90, 0, 0]}
            width={0.5}
            height={0.5}
            materials={["assistantShadow"]}
            arShadowReceiver={true}
          />
        )}
        
        {/* Spotlight for better visibility */}
        <ViroSpotLight
          innerAngle={5}
          outerAngle={45}
          direction={[0, -1, -0.2]}
          position={[0, 3, 0]}
          color="#ffffff"
          castsShadow={true}
          shadowMapSize={2048}
          shadowNearZ={0.1}
          shadowFarZ={6}
          shadowOpacity={0.7}
        />
      </ViroNode>
    );
  }
}

export default ViroARAssistantCharacter;