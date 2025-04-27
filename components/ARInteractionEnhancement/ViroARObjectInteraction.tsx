/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroARObjectInteraction
 */

import * as React from "react";
import { ViroNode } from "../ViroNode";
import { Viro3DObject } from "../Viro3DObject";
import { ViroMaterials } from "../Material/ViroMaterials";
import { ViroAnimations } from "../Animation/ViroAnimations";
import { Viro3DPoint, Viro3DRotation } from "../Types/ViroUtils";
import { RecognizedObject } from "./ViroARInteractionManager";

export enum ObjectInteractionMode {
  /**
   * No interaction
   */
  NONE = "none",
  
  /**
   * Move the object
   */
  MOVE = "move",
  
  /**
   * Rotate the object
   */
  ROTATE = "rotate",
  
  /**
   * Scale the object
   */
  SCALE = "scale",
  
  /**
   * Delete the object
   */
  DELETE = "delete"
}

export interface ObjectInteractionEvent {
  /**
   * The mode of interaction
   */
  mode: ObjectInteractionMode;
  
  /**
   * The object being interacted with
   */
  object: string;
  
  /**
   * The original position of the object
   */
  originalPosition?: Viro3DPoint;
  
  /**
   * The new position of the object
   */
  newPosition?: Viro3DPoint;
  
  /**
   * The original rotation of the object
   */
  originalRotation?: Viro3DRotation;
  
  /**
   * The new rotation of the object
   */
  newRotation?: Viro3DRotation;
  
  /**
   * The original scale of the object
   */
  originalScale?: Viro3DPoint;
  
  /**
   * The new scale of the object
   */
  newScale?: Viro3DPoint;
  
  /**
   * Whether the interaction was successful
   */
  success: boolean;
  
  /**
   * Additional parameters for the interaction
   */
  params?: { [key: string]: any };
}

export interface ARObjectInteractionProps {
  /**
   * The recognized object to interact with
   */
  object: RecognizedObject;
  
  /**
   * The current interaction mode
   */
  mode?: ObjectInteractionMode;
  
  /**
   * Whether to show visual feedback during interaction
   * @default true
   */
  showVisualFeedback?: boolean;
  
  /**
   * Whether to enable snapping to grid
   * @default false
   */
  enableSnapping?: boolean;
  
  /**
   * Grid size for snapping (in meters)
   * @default 0.1
   */
  gridSize?: number;
  
  /**
   * Whether to enable collision detection
   * @default true
   */
  enableCollision?: boolean;
  
  /**
   * Whether to enable physics
   * @default false
   */
  enablePhysics?: boolean;
  
  /**
   * Whether to enable shadows
   * @default true
   */
  enableShadows?: boolean;
  
  /**
   * Callback when interaction starts
   */
  onInteractionStart?: (event: ObjectInteractionEvent) => void;
  
  /**
   * Callback when interaction updates
   */
  onInteractionUpdate?: (event: ObjectInteractionEvent) => void;
  
  /**
   * Callback when interaction ends
   */
  onInteractionEnd?: (event: ObjectInteractionEvent) => void;
  
  /**
   * Callback when object is selected
   */
  onSelect?: (object: string) => void;
  
  /**
   * Callback when object is deselected
   */
  onDeselect?: (object: string) => void;
  
  /**
   * Children components
   */
  children?: React.ReactNode;
}

interface ARObjectInteractionState {
  position: Viro3DPoint;
  rotation: Viro3DRotation;
  scale: Viro3DPoint;
  isSelected: boolean;
  isInteracting: boolean;
  interactionMode: ObjectInteractionMode;
  originalPosition: Viro3DPoint;
  originalRotation: Viro3DRotation;
  originalScale: Viro3DPoint;
}

// Register materials for visual feedback
ViroMaterials.createMaterials({
  objectHighlight: {
    lightingModel: "Blinn",
    diffuseColor: "#88CCFF88",
    shininess: 10.0,
  },
  objectSelected: {
    lightingModel: "Blinn",
    diffuseColor: "#FFCC0088",
    shininess: 10.0,
  },
  objectShadow: {
    lightingModel: "Lambert",
    diffuseColor: "#00000044",
  },
});

// Register animations for visual feedback
ViroAnimations.registerAnimations({
  objectSelect: {
    properties: {
      scaleX: [1.0, 1.05, 1.0],
      scaleY: [1.0, 1.05, 1.0],
      scaleZ: [1.0, 1.05, 1.0],
    },
    duration: 300,
    easing: "EaseInEaseOut",
  },
  objectDeselect: {
    properties: {
      scaleX: [1.05, 1.0],
      scaleY: [1.05, 1.0],
      scaleZ: [1.05, 1.0],
    },
    duration: 150,
    easing: "EaseOut",
  },
  objectDelete: {
    properties: {
      scaleX: [1.0, 0.0],
      scaleY: [1.0, 0.0],
      scaleZ: [1.0, 0.0],
      opacity: [1.0, 0.0],
    },
    duration: 300,
    easing: "EaseIn",
  },
});

/**
 * ViroARObjectInteraction provides interaction capabilities for recognized objects in AR.
 */
export class ViroARObjectInteraction extends React.Component<ARObjectInteractionProps, ARObjectInteractionState> {
  private objectNode = React.createRef<ViroNode>();
  private objectModel = React.createRef<Viro3DObject>();
  
  static defaultProps: Partial<ARObjectInteractionProps> = {
    mode: ObjectInteractionMode.NONE,
    showVisualFeedback: true,
    enableSnapping: false,
    gridSize: 0.1,
    enableCollision: true,
    enablePhysics: false,
    enableShadows: true,
  };
  
  constructor(props: ARObjectInteractionProps) {
    super(props);
    
    const position = props.object.position || [0, 0, 0];
    
    this.state = {
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isSelected: false,
      isInteracting: false,
      interactionMode: props.mode || ObjectInteractionMode.NONE,
      originalPosition: position,
      originalRotation: [0, 0, 0],
      originalScale: [1, 1, 1],
    };
  }
  
  componentDidUpdate(prevProps: ARObjectInteractionProps) {
    // Update position if object position changed
    if (
      this.props.object.position &&
      (prevProps.object.position[0] !== this.props.object.position[0] ||
       prevProps.object.position[1] !== this.props.object.position[1] ||
       prevProps.object.position[2] !== this.props.object.position[2])
    ) {
      this.setState({ position: this.props.object.position });
    }
    
    // Update interaction mode if it changed
    if (prevProps.mode !== this.props.mode) {
      this.setState({ interactionMode: this.props.mode || ObjectInteractionMode.NONE });
      
      // If switching to delete mode, start delete animation
      if (this.props.mode === ObjectInteractionMode.DELETE) {
        this.handleDelete();
      }
    }
  }
  
  /**
   * Handle object selection
   */
  private handleSelect = () => {
    if (this.state.isSelected) return;
    
    this.setState({
      isSelected: true,
      originalPosition: [...this.state.position],
      originalRotation: [...this.state.rotation],
      originalScale: [...this.state.scale],
    });
    
    // Call onSelect callback
    if (this.props.onSelect) {
      this.props.onSelect(this.props.object.type);
    }
  };
  
  /**
   * Handle object deselection
   */
  private handleDeselect = () => {
    if (!this.state.isSelected) return;
    
    this.setState({
      isSelected: false,
      isInteracting: false,
    });
    
    // Call onDeselect callback
    if (this.props.onDeselect) {
      this.props.onDeselect(this.props.object.type);
    }
  };
  
  /**
   * Handle object drag (move)
   */
  private handleDrag = (dragToPosition: Viro3DPoint, source: any) => {
    if (!this.state.isSelected || this.state.interactionMode !== ObjectInteractionMode.MOVE) return;
    
    // Apply snapping if enabled
    let newPosition = [...dragToPosition];
    
    if (this.props.enableSnapping) {
      const gridSize = this.props.gridSize || 0.1;
      newPosition = [
        Math.round(dragToPosition[0] / gridSize) * gridSize,
        Math.round(dragToPosition[1] / gridSize) * gridSize,
        Math.round(dragToPosition[2] / gridSize) * gridSize,
      ];
    }
    
    // Update position
    this.setState({
      position: newPosition,
      isInteracting: true,
    });
    
    // Call onInteractionUpdate callback
    if (this.props.onInteractionUpdate) {
      const event: ObjectInteractionEvent = {
        mode: ObjectInteractionMode.MOVE,
        object: this.props.object.type,
        originalPosition: this.state.originalPosition,
        newPosition,
        success: true,
      };
      
      this.props.onInteractionUpdate(event);
    }
  };
  
  /**
   * Handle object rotation
   */
  private handleRotate = (rotateState: string, rotationFactor: number, source: any) => {
    if (!this.state.isSelected || this.state.interactionMode !== ObjectInteractionMode.ROTATE) return;
    
    if (rotateState === "onRotate") {
      // Calculate new rotation
      const newRotation: Viro3DRotation = [
        this.state.rotation[0],
        this.state.rotation[1] + rotationFactor,
        this.state.rotation[2],
      ];
      
      // Update rotation
      this.setState({
        rotation: newRotation,
        isInteracting: true,
      });
      
      // Call onInteractionUpdate callback
      if (this.props.onInteractionUpdate) {
        const event: ObjectInteractionEvent = {
          mode: ObjectInteractionMode.ROTATE,
          object: this.props.object.type,
          originalRotation: this.state.originalRotation,
          newRotation,
          success: true,
        };
        
        this.props.onInteractionUpdate(event);
      }
    }
  };
  
  /**
   * Handle object pinch (scale)
   */
  private handlePinch = (pinchState: string, scaleFactor: number, source: any) => {
    if (!this.state.isSelected || this.state.interactionMode !== ObjectInteractionMode.SCALE) return;
    
    if (pinchState === "onPinch") {
      // Calculate new scale
      const newScale: Viro3DPoint = [
        this.state.scale[0] * scaleFactor,
        this.state.scale[1] * scaleFactor,
        this.state.scale[2] * scaleFactor,
      ];
      
      // Limit scale to reasonable range
      const minScale = 0.1;
      const maxScale = 5.0;
      
      if (newScale[0] < minScale || newScale[0] > maxScale) {
        return;
      }
      
      // Update scale
      this.setState({
        scale: newScale,
        isInteracting: true,
      });
      
      // Call onInteractionUpdate callback
      if (this.props.onInteractionUpdate) {
        const event: ObjectInteractionEvent = {
          mode: ObjectInteractionMode.SCALE,
          object: this.props.object.type,
          originalScale: this.state.originalScale,
          newScale,
          success: true,
        };
        
        this.props.onInteractionUpdate(event);
      }
    }
  };
  
  /**
   * Handle object deletion
   */
  private handleDelete = () => {
    // Call onInteractionStart callback
    if (this.props.onInteractionStart) {
      const event: ObjectInteractionEvent = {
        mode: ObjectInteractionMode.DELETE,
        object: this.props.object.type,
        success: true,
      };
      
      this.props.onInteractionStart(event);
    }
    
    // Call onInteractionEnd callback after animation
    setTimeout(() => {
      if (this.props.onInteractionEnd) {
        const event: ObjectInteractionEvent = {
          mode: ObjectInteractionMode.DELETE,
          object: this.props.object.type,
          success: true,
        };
        
        this.props.onInteractionEnd(event);
      }
    }, 300); // Match animation duration
  };
  
  /**
   * Handle interaction start
   */
  private handleInteractionStart = () => {
    if (!this.state.isSelected) return;
    
    // Call onInteractionStart callback
    if (this.props.onInteractionStart) {
      const event: ObjectInteractionEvent = {
        mode: this.state.interactionMode,
        object: this.props.object.type,
        originalPosition: this.state.originalPosition,
        originalRotation: this.state.originalRotation,
        originalScale: this.state.originalScale,
        success: true,
      };
      
      this.props.onInteractionStart(event);
    }
  };
  
  /**
   * Handle interaction end
   */
  private handleInteractionEnd = () => {
    if (!this.state.isSelected || !this.state.isInteracting) return;
    
    this.setState({ isInteracting: false });
    
    // Call onInteractionEnd callback
    if (this.props.onInteractionEnd) {
      const event: ObjectInteractionEvent = {
        mode: this.state.interactionMode,
        object: this.props.object.type,
        originalPosition: this.state.originalPosition,
        newPosition: this.state.position,
        originalRotation: this.state.originalRotation,
        newRotation: this.state.rotation,
        originalScale: this.state.originalScale,
        newScale: this.state.scale,
        success: true,
      };
      
      this.props.onInteractionEnd(event);
    }
  };
  
  /**
   * Get the appropriate animation based on state
   */
  private getAnimation = () => {
    if (this.state.interactionMode === ObjectInteractionMode.DELETE) {
      return {
        name: "objectDelete",
        run: true,
        loop: false,
      };
    }
    
    if (this.state.isSelected && !this.state.isInteracting) {
      return {
        name: "objectSelect",
        run: true,
        loop: true,
      };
    }
    
    if (!this.state.isSelected) {
      return {
        name: "objectDeselect",
        run: true,
        loop: false,
      };
    }
    
    return null;
  };
  
  /**
   * Get the appropriate materials based on state
   */
  private getMaterials = () => {
    if (this.state.isSelected) {
      return ["objectSelected"];
    }
    
    return [];
  };
  
  render() {
    const { object, enableShadows } = this.props;
    const { position, rotation, scale, interactionMode } = this.state;
    
    // Don't render if in delete mode and animation has completed
    if (interactionMode === ObjectInteractionMode.DELETE && scale[0] <= 0.01) {
      return null;
    }
    
    return (
      <ViroNode
        ref={this.objectNode}
        position={position}
        rotation={rotation}
        scale={scale}
        animation={this.getAnimation()}
        onClick={this.handleSelect}
        onDrag={interactionMode === ObjectInteractionMode.MOVE ? this.handleDrag : undefined}
        onRotate={interactionMode === ObjectInteractionMode.ROTATE ? this.handleRotate : undefined}
        onPinch={interactionMode === ObjectInteractionMode.SCALE ? this.handlePinch : undefined}
        dragType="FixedToWorld"
        onDragStart={this.handleInteractionStart}
        onDragEnd={this.handleInteractionEnd}
        onRotateStart={this.handleInteractionStart}
        onRotateEnd={this.handleInteractionEnd}
        onPinchStart={this.handleInteractionStart}
        onPinchEnd={this.handleInteractionEnd}
      >
        {/* Object Model */}
        <Viro3DObject
          ref={this.objectModel}
          source={require('./models/placeholder_cube.obj')} // Replace with appropriate model based on object type
          materials={this.getMaterials()}
          type="OBJ"
        />
        
        {/* Shadow */}
        {enableShadows && (
          <ViroNode
            position={[0, -0.001, 0]}
            rotation={[-90, 0, 0]}
          >
            {/* Shadow Plane */}
          </ViroNode>
        )}
        
        {/* Children Components */}
        {this.props.children}
      </ViroNode>
    );
  }
}

export default ViroARObjectInteraction;