/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroARInteractionManager
 */

import * as React from "react";
import { NativeModules, Platform, NativeEventEmitter } from "react-native";
import { ViroARScene } from "../AR/ViroARScene";
import { ViroNode } from "../ViroNode";
import { ViroARPlaneSelector } from "../AR/ViroARPlaneSelector";
import { ViroObjectRecognition } from "../ObjectRecognition";
import { Viro3DObject } from "../Viro3DObject";
import { ViroMaterials } from "../Material/ViroMaterials";
import { ViroAnimations } from "../Animation/ViroAnimations";
import { Viro3DPoint, Viro3DRotation } from "../Types/ViroUtils";

export enum InteractionType {
  /**
   * Tap interaction
   */
  TAP = "tap",
  
  /**
   * Pinch interaction (for scaling)
   */
  PINCH = "pinch",
  
  /**
   * Rotation interaction
   */
  ROTATION = "rotation",
  
  /**
   * Drag interaction
   */
  DRAG = "drag",
  
  /**
   * Voice command interaction
   */
  VOICE = "voice",
  
  /**
   * Gaze interaction
   */
  GAZE = "gaze",
  
  /**
   * Gesture interaction
   */
  GESTURE = "gesture",
  
  /**
   * Object detection interaction
   */
  OBJECT_DETECTION = "object_detection"
}

export enum InteractionState {
  /**
   * Interaction is idle
   */
  IDLE = "idle",
  
  /**
   * Interaction is in progress
   */
  IN_PROGRESS = "in_progress",
  
  /**
   * Interaction has completed
   */
  COMPLETED = "completed",
  
  /**
   * Interaction has been cancelled
   */
  CANCELLED = "cancelled",
  
  /**
   * Interaction has failed
   */
  FAILED = "failed"
}

export interface InteractionEvent {
  /**
   * The type of interaction
   */
  type: InteractionType;
  
  /**
   * The state of the interaction
   */
  state: InteractionState;
  
  /**
   * The source of the interaction (e.g., object name, voice command)
   */
  source: string;
  
  /**
   * The target of the interaction (e.g., object name)
   */
  target?: string;
  
  /**
   * The position of the interaction in 3D space
   */
  position?: Viro3DPoint;
  
  /**
   * The rotation of the interaction in 3D space
   */
  rotation?: Viro3DRotation;
  
  /**
   * The scale of the interaction
   */
  scale?: Viro3DPoint;
  
  /**
   * Additional parameters for the interaction
   */
  params?: { [key: string]: any };
  
  /**
   * Timestamp of the interaction
   */
  timestamp: number;
}

export interface RecognizedObject {
  /**
   * The type of object recognized
   */
  type: string;
  
  /**
   * Confidence score for the recognition (0.0 - 1.0)
   */
  confidence: number;
  
  /**
   * The position of the object in 3D space
   */
  position: Viro3DPoint;
  
  /**
   * The bounding box of the object in screen space [x, y, width, height]
   */
  boundingBox: [number, number, number, number];
  
  /**
   * Estimated distance to the object in meters
   */
  distance?: number;
  
  /**
   * Estimated size of the object in meters [width, height, depth]
   */
  size?: [number, number, number];
  
  /**
   * Additional metadata for the object
   */
  metadata?: { [key: string]: any };
}

export interface ARInteractionManagerProps {
  /**
   * Whether to enable object recognition
   * @default true
   */
  enableObjectRecognition?: boolean;
  
  /**
   * Minimum confidence threshold for object recognition (0.0 - 1.0)
   * @default 0.7
   */
  objectRecognitionConfidence?: number;
  
  /**
   * Types of objects to recognize
   * @default all types
   */
  objectTypes?: string[];
  
  /**
   * Whether to enable gesture recognition
   * @default true
   */
  enableGestureRecognition?: boolean;
  
  /**
   * Whether to enable voice command recognition
   * @default false
   */
  enableVoiceCommands?: boolean;
  
  /**
   * Whether to enable gaze interaction
   * @default false
   */
  enableGazeInteraction?: boolean;
  
  /**
   * Duration in milliseconds for gaze interaction to trigger
   * @default 2000
   */
  gazeDuration?: number;
  
  /**
   * Whether to show visual feedback for interactions
   * @default true
   */
  showVisualFeedback?: boolean;
  
  /**
   * Whether to enable haptic feedback for interactions
   * @default true
   */
  enableHapticFeedback?: boolean;
  
  /**
   * Whether to enable debug mode
   * @default false
   */
  debug?: boolean;
  
  /**
   * Callback when an interaction occurs
   */
  onInteraction?: (event: InteractionEvent) => void;
  
  /**
   * Callback when an object is recognized
   */
  onObjectRecognized?: (object: RecognizedObject) => void;
  
  /**
   * Callback when an object is no longer recognized
   */
  onObjectLost?: (objectType: string) => void;
  
  /**
   * Callback when a gesture is recognized
   */
  onGestureRecognized?: (gesture: string, params: any) => void;
  
  /**
   * Callback when a voice command is recognized
   */
  onVoiceCommandRecognized?: (command: string, params: any) => void;
  
  /**
   * Children components
   */
  children?: React.ReactNode;
}

interface ARInteractionManagerState {
  recognizedObjects: RecognizedObject[];
  lastInteraction: InteractionEvent | null;
  isObjectRecognitionActive: boolean;
  isGestureRecognitionActive: boolean;
  isVoiceCommandActive: boolean;
  isGazeInteractionActive: boolean;
  debugInfo: { [key: string]: any };
}

// Register materials for visual feedback
ViroMaterials.createMaterials({
  interactionHighlight: {
    lightingModel: "Blinn",
    diffuseColor: "#88CCFF88",
    shininess: 10.0,
  },
  selectionRing: {
    lightingModel: "Constant",
    diffuseColor: "#00AAFF",
    shininess: 10.0,
  },
  debugMaterial: {
    lightingModel: "Constant",
    diffuseColor: "#FF00FF",
  },
});

// Register animations for visual feedback
ViroAnimations.registerAnimations({
  selectionAnimation: {
    properties: {
      scaleX: [1.0, 1.1, 1.0],
      scaleY: [1.0, 1.1, 1.0],
      scaleZ: [1.0, 1.1, 1.0],
    },
    duration: 500,
    easing: "EaseInEaseOut",
  },
  highlightAnimation: {
    properties: {
      opacity: [0.0, 0.5, 0.0],
    },
    duration: 1000,
    easing: "Linear",
  },
});

/**
 * ViroARInteractionManager enhances AR interactions with object detection and advanced interaction techniques.
 */
export class ViroARInteractionManager extends React.Component<ARInteractionManagerProps, ARInteractionManagerState> {
  private objectRecognition = React.createRef<ViroObjectRecognition>();
  private sceneNode = React.createRef<ViroARScene>();
  private interactionNode = React.createRef<ViroNode>();
  private recognizedObjectNodes: { [key: string]: React.RefObject<ViroNode> } = {};
  private lastGazeTarget: string | null = null;
  private gazeTimer: NodeJS.Timeout | null = null;
  
  static defaultProps: Partial<ARInteractionManagerProps> = {
    enableObjectRecognition: true,
    objectRecognitionConfidence: 0.7,
    enableGestureRecognition: true,
    enableVoiceCommands: false,
    enableGazeInteraction: false,
    gazeDuration: 2000,
    showVisualFeedback: true,
    enableHapticFeedback: true,
    debug: false,
  };
  
  constructor(props: ARInteractionManagerProps) {
    super(props);
    
    this.state = {
      recognizedObjects: [],
      lastInteraction: null,
      isObjectRecognitionActive: props.enableObjectRecognition || false,
      isGestureRecognitionActive: props.enableGestureRecognition || false,
      isVoiceCommandActive: props.enableVoiceCommands || false,
      isGazeInteractionActive: props.enableGazeInteraction || false,
      debugInfo: {},
    };
  }
  
  componentDidMount() {
    // Initialize object recognition if enabled
    if (this.props.enableObjectRecognition) {
      this.startObjectRecognition();
    }
    
    // Initialize gesture recognition if enabled
    if (this.props.enableGestureRecognition) {
      this.startGestureRecognition();
    }
    
    // Initialize voice commands if enabled
    if (this.props.enableVoiceCommands) {
      this.startVoiceCommandRecognition();
    }
    
    // Initialize gaze interaction if enabled
    if (this.props.enableGazeInteraction) {
      this.startGazeInteraction();
    }
  }
  
  componentDidUpdate(prevProps: ARInteractionManagerProps) {
    // Handle changes to object recognition
    if (prevProps.enableObjectRecognition !== this.props.enableObjectRecognition) {
      if (this.props.enableObjectRecognition) {
        this.startObjectRecognition();
      } else {
        this.stopObjectRecognition();
      }
    }
    
    // Handle changes to gesture recognition
    if (prevProps.enableGestureRecognition !== this.props.enableGestureRecognition) {
      if (this.props.enableGestureRecognition) {
        this.startGestureRecognition();
      } else {
        this.stopGestureRecognition();
      }
    }
    
    // Handle changes to voice commands
    if (prevProps.enableVoiceCommands !== this.props.enableVoiceCommands) {
      if (this.props.enableVoiceCommands) {
        this.startVoiceCommandRecognition();
      } else {
        this.stopVoiceCommandRecognition();
      }
    }
    
    // Handle changes to gaze interaction
    if (prevProps.enableGazeInteraction !== this.props.enableGazeInteraction) {
      if (this.props.enableGazeInteraction) {
        this.startGazeInteraction();
      } else {
        this.stopGazeInteraction();
      }
    }
  }
  
  componentWillUnmount() {
    // Clean up all recognition systems
    this.stopObjectRecognition();
    this.stopGestureRecognition();
    this.stopVoiceCommandRecognition();
    this.stopGazeInteraction();
    
    // Clear any timers
    if (this.gazeTimer) {
      clearTimeout(this.gazeTimer);
      this.gazeTimer = null;
    }
  }
  
  /**
   * Start object recognition
   */
  private startObjectRecognition = () => {
    this.setState({ isObjectRecognitionActive: true });
  };
  
  /**
   * Stop object recognition
   */
  private stopObjectRecognition = () => {
    this.setState({ 
      isObjectRecognitionActive: false,
      recognizedObjects: []
    });
  };
  
  /**
   * Start gesture recognition
   */
  private startGestureRecognition = () => {
    this.setState({ isGestureRecognitionActive: true });
  };
  
  /**
   * Stop gesture recognition
   */
  private stopGestureRecognition = () => {
    this.setState({ isGestureRecognitionActive: false });
  };
  
  /**
   * Start voice command recognition
   */
  private startVoiceCommandRecognition = () => {
    this.setState({ isVoiceCommandActive: true });
  };
  
  /**
   * Stop voice command recognition
   */
  private stopVoiceCommandRecognition = () => {
    this.setState({ isVoiceCommandActive: false });
  };
  
  /**
   * Start gaze interaction
   */
  private startGazeInteraction = () => {
    this.setState({ isGazeInteractionActive: true });
  };
  
  /**
   * Stop gaze interaction
   */
  private stopGazeInteraction = () => {
    this.setState({ isGazeInteractionActive: false });
    
    if (this.gazeTimer) {
      clearTimeout(this.gazeTimer);
      this.gazeTimer = null;
    }
    
    this.lastGazeTarget = null;
  };
  
  /**
   * Handle object recognition results
   */
  private handleObjectRecognized = (objects: RecognizedObject[]) => {
    // Update state with recognized objects
    this.setState({ recognizedObjects: objects });
    
    // Call onObjectRecognized for each new object
    objects.forEach(object => {
      const existingObject = this.state.recognizedObjects.find(
        obj => obj.type === object.type && 
              Math.abs(obj.position[0] - object.position[0]) < 0.5 &&
              Math.abs(obj.position[1] - object.position[1]) < 0.5 &&
              Math.abs(obj.position[2] - object.position[2]) < 0.5
      );
      
      if (!existingObject && this.props.onObjectRecognized) {
        this.props.onObjectRecognized(object);
      }
    });
    
    // Check for objects that are no longer recognized
    this.state.recognizedObjects.forEach(existingObject => {
      const stillRecognized = objects.some(
        obj => obj.type === existingObject.type &&
              Math.abs(obj.position[0] - existingObject.position[0]) < 0.5 &&
              Math.abs(obj.position[1] - existingObject.position[1]) < 0.5 &&
              Math.abs(obj.position[2] - existingObject.position[2]) < 0.5
      );
      
      if (!stillRecognized && this.props.onObjectLost) {
        this.props.onObjectLost(existingObject.type);
      }
    });
    
    // Create interaction event for object detection
    if (objects.length > 0 && objects[0].confidence > (this.props.objectRecognitionConfidence || 0.7)) {
      const interactionEvent: InteractionEvent = {
        type: InteractionType.OBJECT_DETECTION,
        state: InteractionState.COMPLETED,
        source: "object_recognition",
        target: objects[0].type,
        position: objects[0].position,
        params: {
          confidence: objects[0].confidence,
          boundingBox: objects[0].boundingBox,
          allObjects: objects
        },
        timestamp: Date.now()
      };
      
      this.handleInteraction(interactionEvent);
    }
    
    // Update debug info
    if (this.props.debug) {
      this.setState(prevState => ({
        debugInfo: {
          ...prevState.debugInfo,
          objectRecognition: {
            objectCount: objects.length,
            objects: objects.map(obj => ({
              type: obj.type,
              confidence: obj.confidence,
              position: obj.position
            }))
          }
        }
      }));
    }
  };
  
  /**
   * Handle gesture recognition
   */
  private handleGestureRecognized = (gesture: string, params: any) => {
    if (!this.state.isGestureRecognitionActive) return;
    
    // Create interaction event for gesture
    const interactionEvent: InteractionEvent = {
      type: InteractionType.GESTURE,
      state: InteractionState.COMPLETED,
      source: "gesture_recognition",
      target: gesture,
      params,
      timestamp: Date.now()
    };
    
    this.handleInteraction(interactionEvent);
    
    // Call onGestureRecognized callback
    if (this.props.onGestureRecognized) {
      this.props.onGestureRecognized(gesture, params);
    }
    
    // Update debug info
    if (this.props.debug) {
      this.setState(prevState => ({
        debugInfo: {
          ...prevState.debugInfo,
          gestureRecognition: {
            lastGesture: gesture,
            params
          }
        }
      }));
    }
  };
  
  /**
   * Handle voice command recognition
   */
  private handleVoiceCommandRecognized = (command: string, params: any) => {
    if (!this.state.isVoiceCommandActive) return;
    
    // Create interaction event for voice command
    const interactionEvent: InteractionEvent = {
      type: InteractionType.VOICE,
      state: InteractionState.COMPLETED,
      source: "voice_recognition",
      target: command,
      params,
      timestamp: Date.now()
    };
    
    this.handleInteraction(interactionEvent);
    
    // Call onVoiceCommandRecognized callback
    if (this.props.onVoiceCommandRecognized) {
      this.props.onVoiceCommandRecognized(command, params);
    }
    
    // Update debug info
    if (this.props.debug) {
      this.setState(prevState => ({
        debugInfo: {
          ...prevState.debugInfo,
          voiceRecognition: {
            lastCommand: command,
            params
          }
        }
      }));
    }
  };
  
  /**
   * Handle gaze interaction
   */
  private handleGaze = (target: string, position: Viro3DPoint) => {
    if (!this.state.isGazeInteractionActive) return;
    
    // If gazing at a new target, reset timer
    if (target !== this.lastGazeTarget) {
      if (this.gazeTimer) {
        clearTimeout(this.gazeTimer);
      }
      
      this.lastGazeTarget = target;
      
      // Start new gaze timer
      this.gazeTimer = setTimeout(() => {
        // Create interaction event for gaze
        const interactionEvent: InteractionEvent = {
          type: InteractionType.GAZE,
          state: InteractionState.COMPLETED,
          source: "gaze_interaction",
          target,
          position,
          timestamp: Date.now()
        };
        
        this.handleInteraction(interactionEvent);
        
        // Update debug info
        if (this.props.debug) {
          this.setState(prevState => ({
            debugInfo: {
              ...prevState.debugInfo,
              gazeInteraction: {
                target,
                position,
                duration: this.props.gazeDuration
              }
            }
          }));
        }
      }, this.props.gazeDuration);
    }
  };
  
  /**
   * Handle all interactions
   */
  private handleInteraction = (event: InteractionEvent) => {
    // Update last interaction
    this.setState({ lastInteraction: event });
    
    // Call onInteraction callback
    if (this.props.onInteraction) {
      this.props.onInteraction(event);
    }
    
    // Provide visual feedback if enabled
    if (this.props.showVisualFeedback) {
      this.showVisualFeedback(event);
    }
    
    // Provide haptic feedback if enabled
    if (this.props.enableHapticFeedback) {
      this.triggerHapticFeedback(event);
    }
  };
  
  /**
   * Show visual feedback for interaction
   */
  private showVisualFeedback = (event: InteractionEvent) => {
    // Different visual feedback based on interaction type
    switch (event.type) {
      case InteractionType.TAP:
        // Show tap feedback
        break;
        
      case InteractionType.OBJECT_DETECTION:
        // Highlight recognized object
        break;
        
      case InteractionType.GAZE:
        // Show gaze feedback
        break;
        
      default:
        // Default feedback
        break;
    }
  };
  
  /**
   * Trigger haptic feedback
   */
  private triggerHapticFeedback = (event: InteractionEvent) => {
    // Different haptic feedback based on interaction type
    if (Platform.OS === 'ios') {
      // iOS haptic feedback
      const ReactNativeHapticFeedback = NativeModules.ReactNativeHapticFeedback;
      if (ReactNativeHapticFeedback) {
        switch (event.type) {
          case InteractionType.TAP:
            ReactNativeHapticFeedback.trigger('impactLight');
            break;
            
          case InteractionType.OBJECT_DETECTION:
            ReactNativeHapticFeedback.trigger('notificationSuccess');
            break;
            
          default:
            ReactNativeHapticFeedback.trigger('impactLight');
            break;
        }
      }
    } else if (Platform.OS === 'android') {
      // Android haptic feedback
      const ReactNativeHapticFeedback = NativeModules.ReactNativeHapticFeedback;
      if (ReactNativeHapticFeedback) {
        ReactNativeHapticFeedback.trigger('impactLight');
      }
    }
  };
  
  /**
   * Render debug overlay
   */
  private renderDebugOverlay = () => {
    if (!this.props.debug) return null;
    
    return (
      <ViroNode position={[0, 0, -2]}>
        {/* Debug visualization for recognized objects */}
        {this.state.recognizedObjects.map((object, index) => (
          <ViroNode
            key={`debug_object_${index}`}
            position={object.position}
          >
            <Viro3DObject
              source={require('./debug_sphere.obj')}
              position={[0, 0, 0]}
              scale={[0.1, 0.1, 0.1]}
              materials={['debugMaterial']}
            />
          </ViroNode>
        ))}
      </ViroNode>
    );
  };
  
  render() {
    return (
      <ViroNode ref={this.interactionNode}>
        {/* Object Recognition */}
        {this.state.isObjectRecognitionActive && (
          <ViroObjectRecognition
            ref={this.objectRecognition}
            onObjectRecognized={this.handleObjectRecognized}
            minConfidence={this.props.objectRecognitionConfidence}
            objectTypes={this.props.objectTypes}
          />
        )}
        
        {/* Debug Overlay */}
        {this.props.debug && this.renderDebugOverlay()}
        
        {/* Children Components */}
        {this.props.children}
      </ViroNode>
    );
  }
}

export default ViroARInteractionManager;