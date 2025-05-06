/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroObjectRecognition
 */

"use strict";

import * as React from "react";
import {
  findNodeHandle,
  NativeModules,
  NativeSyntheticEvent,
  requireNativeComponent,
  ViewProps,
} from "react-native";
import { ViroAnimations, ViroAnimation } from "../Animation/ViroAnimations";
import { ViroNode } from "../ViroNode";
import { ViroSphere } from "../ViroSphere";
import { ViroText } from "../ViroText";
import { ViroFlexView } from "../ViroFlexView";
import { ViroARScene } from "../AR/ViroARScene";
import { Viro3DPoint } from "../Types/ViroUtils";

// Register animations for object recognition indicators
ViroAnimations.registerAnimations({
  scaleUp: {
    properties: {
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
    },
    duration: 500,
    easing: "bounce",
  },
  scaleDown: {
    properties: {
      scaleX: 0.5,
      scaleY: 0.5,
      scaleZ: 0.5,
    },
    duration: 500,
    easing: "bounce",
  },
  pulse: [
    ["scaleUp", "scaleDown"],
  ],
  rotate: {
    properties: {
      rotateY: "+=90",
    },
    duration: 1000,
  },
  fadeIn: {
    properties: {
      opacity: 1.0,
    },
    duration: 500,
  },
  fadeOut: {
    properties: {
      opacity: 0.0,
    },
    duration: 500,
  },
});

export type RecognizedObject = {
  type: string;
  confidence: number;
  position: Viro3DPoint;
  boundingBox?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  metadata?: any;
};

type Props = ViewProps & {
  /**
   * Flag to enable/disable object recognition
   */
  enabled?: boolean;

  /**
   * Minimum confidence level (0-1) for object detection
   */
  minConfidence?: number;

  /**
   * Maximum number of objects to detect simultaneously
   */
  maxObjects?: number;

  /**
   * Custom model path for ML Kit or other object detection models
   */
  modelPath?: string;

  /**
   * Array of object types to detect. If empty, all objects will be detected.
   */
  objectTypes?: string[];

  /**
   * Callback when objects are recognized
   */
  onObjectsRecognized?: (objects: RecognizedObject[]) => void;

  /**
   * Callback when an object is selected/tapped
   */
  onObjectSelected?: (object: RecognizedObject) => void;

  /**
   * Flag to show/hide visual indicators for recognized objects
   */
  showIndicators?: boolean;

  /**
   * Color of the indicator dot
   */
  indicatorColor?: string;

  /**
   * Size of the indicator dot
   */
  indicatorSize?: number;

  /**
   * Animation name for the indicator
   */
  indicatorAnimation?: string | ViroAnimation;

  /**
   * Flag to show/hide object labels
   */
  showLabels?: boolean;

  /**
   * Custom renderer for object indicators
   */
  renderIndicator?: (object: RecognizedObject) => React.ReactNode;

  /**
   * Custom renderer for object labels
   */
  renderLabel?: (object: RecognizedObject) => React.ReactNode;

  /**
   * Callback to query additional data for recognized objects
   */
  onQueryObjectData?: (object: RecognizedObject) => Promise<any>;
};

type State = {
  recognizedObjects: RecognizedObject[];
  isProcessing: boolean;
};

/**
 * ViroObjectRecognition is a component that uses ML Kit or other object detection
 * libraries to recognize objects in the camera view and display visual indicators.
 */
export class ViroObjectRecognition extends React.Component<Props, State> {
  _recognitionInterval: NodeJS.Timeout | null = null;
  _arScene: ViroARScene | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      recognizedObjects: [],
      isProcessing: false,
    };
  }

  componentDidMount() {
    if (this.props.enabled !== false) {
      this._startObjectRecognition();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.enabled !== this.props.enabled) {
      if (this.props.enabled) {
        this._startObjectRecognition();
      } else {
        this._stopObjectRecognition();
      }
    }
  }

  componentWillUnmount() {
    this._stopObjectRecognition();
  }

  _startObjectRecognition = () => {
    // In a real implementation, this would connect to ML Kit or another object detection service
    // For this demo, we'll simulate object detection with a timer
    this._recognitionInterval = setInterval(() => {
      if (this.state.isProcessing) {
        return;
      }

      this._simulateObjectRecognition();
    }, 2000); // Detect objects every 2 seconds
  };

  _stopObjectRecognition = () => {
    if (this._recognitionInterval) {
      clearInterval(this._recognitionInterval);
      this._recognitionInterval = null;
    }
  };

  _simulateObjectRecognition = async () => {
    this.setState({ isProcessing: true });

    try {
      // In a real implementation, this would use ML Kit or another object detection service
      // For this demo, we'll simulate random object detection
      const objectTypes = [
        "chair", "table", "person", "car", "dog", "cat", "plant", 
        "book", "bottle", "cup", "phone", "laptop", "tv", "shoe"
      ];
      
      // Filter by allowed object types if specified
      const allowedTypes = this.props.objectTypes || objectTypes;
      
      // Simulate 0-3 random objects
      const numObjects = Math.floor(Math.random() * 4);
      const maxObjects = this.props.maxObjects || 5;
      const minConfidence = this.props.minConfidence || 0.7;
      
      const objects: RecognizedObject[] = [];
      
      for (let i = 0; i < Math.min(numObjects, maxObjects); i++) {
        const typeIndex = Math.floor(Math.random() * allowedTypes.length);
        const confidence = Math.random() * 0.3 + 0.7; // Random confidence between 0.7-1.0
        
        if (confidence >= minConfidence) {
          // Generate random position in front of camera
          const x = (Math.random() - 0.5) * 2; // -1 to 1
          const y = (Math.random() - 0.5) * 2; // -1 to 1
          const z = -Math.random() * 3 - 1; // -1 to -4
          
          objects.push({
            type: allowedTypes[typeIndex],
            confidence,
            position: [x, y, z],
            boundingBox: {
              minX: 0.4,
              minY: 0.4,
              maxX: 0.6,
              maxY: 0.6,
            },
          });
        }
      }
      
      // If we have a callback for querying additional data, call it for each object
      if (this.props.onQueryObjectData) {
        for (const object of objects) {
          try {
            const additionalData = await this.props.onQueryObjectData(object);
            object.metadata = additionalData;
          } catch (error) {
            console.error("Error querying additional data:", error);
          }
        }
      }
      
      this.setState({ 
        recognizedObjects: objects,
        isProcessing: false 
      });
      
      // Call the callback if provided
      if (this.props.onObjectsRecognized) {
        this.props.onObjectsRecognized(objects);
      }
    } catch (error) {
      console.error("Error in object recognition:", error);
      this.setState({ isProcessing: false });
    }
  };

  _onObjectSelected = (object: RecognizedObject) => {
    if (this.props.onObjectSelected) {
      this.props.onObjectSelected(object);
    }
  };

  _renderObjectIndicators() {
    const { showIndicators = true, indicatorColor = "#FFFFFF", indicatorSize = 0.1 } = this.props;
    
    if (!showIndicators) {
      return null;
    }
    
    return this.state.recognizedObjects.map((object, index) => {
      // If custom renderer is provided, use it
      if (this.props.renderIndicator) {
        return (
          <ViroNode
            key={`indicator-${index}`}
            position={object.position}
            onClick={() => this._onObjectSelected(object)}
          >
            {this.props.renderIndicator(object)}
          </ViroNode>
        );
      }
      
      // Default indicator is a white sphere with pulse animation
      const animation = this.props.indicatorAnimation || "pulse";
      
      return (
        <ViroNode
          key={`indicator-${index}`}
          position={object.position}
          onClick={() => this._onObjectSelected(object)}
        >
          <ViroSphere
            radius={indicatorSize}
            materials={["objectIndicator"]}
            animation={{
              name: typeof animation === "string" ? animation : animation.name,
              run: true,
              loop: true,
            }}
            physicsBody={{
              type: "Kinematic",
            }}
          />
          
          {this.props.showLabels && this._renderLabel(object, index)}
        </ViroNode>
      );
    });
  }
  
  _renderLabel(object: RecognizedObject, index: number) {
    // If custom label renderer is provided, use it
    if (this.props.renderLabel) {
      return this.props.renderLabel(object);
    }
    
    // Default label is a text with object type and confidence
    return (
      <ViroNode position={[0, 0.15, 0]}>
        <ViroFlexView
          style={{
            padding: 0.05,
            backgroundColor: "#000000AA",
            borderRadius: 0.05,
          }}
          width={0.5}
          height={0.3}
        >
          <ViroText
            text={`${object.type}`}
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#FFFFFF",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
          <ViroText
            text={`${Math.round(object.confidence * 100)}%`}
            style={{
              fontFamily: "Arial",
              fontSize: 10,
              color: "#CCCCCC",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
        </ViroFlexView>
      </ViroNode>
    );
  }

  render() {
    return (
      <>
        {this._renderObjectIndicators()}
      </>
    );
  }
}