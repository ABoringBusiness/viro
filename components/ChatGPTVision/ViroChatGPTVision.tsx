/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroChatGPTVision
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
import { ViroChatGPTVisionService, DetectedObject, ChatGPTVisionConfig, ImageAnalysisResult } from "./ViroChatGPTVisionService";

// Register animations for object indicators
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

type Props = ViewProps & {
  /**
   * ChatGPT Vision API configuration
   */
  apiConfig: ChatGPTVisionConfig;

  /**
   * Flag to enable/disable object detection
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
   * Custom prompt for image analysis
   */
  analysisPrompt?: string;

  /**
   * Callback when objects are detected
   */
  onObjectsDetected?: (objects: DetectedObject[]) => void;

  /**
   * Callback when an object is selected/tapped
   */
  onObjectSelected?: (object: DetectedObject) => void;

  /**
   * Callback when image analysis is complete
   */
  onImageAnalysisComplete?: (result: ImageAnalysisResult) => void;

  /**
   * Flag to show/hide visual indicators for detected objects
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
  renderIndicator?: (object: DetectedObject) => React.ReactNode;

  /**
   * Custom renderer for object labels
   */
  renderLabel?: (object: DetectedObject) => React.ReactNode;

  /**
   * Interval in milliseconds for capturing and analyzing images
   */
  captureInterval?: number;

  /**
   * Flag to enable/disable automatic image capture
   */
  autoCaptureEnabled?: boolean;

  /**
   * Callback when an image is captured
   */
  onImageCaptured?: (imageBase64: string) => void;

  /**
   * Flag to enable/disable image editing
   */
  imageEditingEnabled?: boolean;

  /**
   * Callback when an image is edited
   */
  onImageEdited?: (originalImage: string, editedImage: string) => void;
};

type State = {
  detectedObjects: DetectedObject[];
  isProcessing: boolean;
  lastAnalysisResult: ImageAnalysisResult | null;
  capturedImageBase64: string | null;
};

/**
 * ViroChatGPTVision is a component that uses ChatGPT Vision API to detect objects
 * in the camera view and display visual indicators.
 */
export class ViroChatGPTVision extends React.Component<Props, State> {
  _captureInterval: NodeJS.Timeout | null = null;
  _arScene: ViroARScene | null = null;
  _visionService: ViroChatGPTVisionService;

  constructor(props: Props) {
    super(props);
    this.state = {
      detectedObjects: [],
      isProcessing: false,
      lastAnalysisResult: null,
      capturedImageBase64: null,
    };
    this._visionService = ViroChatGPTVisionService.getInstance();
  }

  async componentDidMount() {
    // Initialize the ChatGPT Vision service
    await this._visionService.initialize(this.props.apiConfig);

    if (this.props.enabled !== false) {
      this._startObjectDetection();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.enabled !== this.props.enabled) {
      if (this.props.enabled) {
        this._startObjectDetection();
      } else {
        this._stopObjectDetection();
      }
    }

    if (prevProps.apiConfig !== this.props.apiConfig) {
      this._visionService.initialize(this.props.apiConfig);
    }

    if (prevProps.captureInterval !== this.props.captureInterval && this.props.autoCaptureEnabled) {
      this._stopObjectDetection();
      this._startObjectDetection();
    }
  }

  componentWillUnmount() {
    this._stopObjectDetection();
    this._visionService.release();
  }

  _startObjectDetection = () => {
    if (this.props.autoCaptureEnabled !== false) {
      const interval = this.props.captureInterval || 5000; // Default to 5 seconds
      this._captureInterval = setInterval(() => {
        if (this.state.isProcessing) {
          return;
        }
        this._captureAndAnalyzeImage();
      }, interval);
    }
  };

  _stopObjectDetection = () => {
    if (this._captureInterval) {
      clearInterval(this._captureInterval);
      this._captureInterval = null;
    }
  };

  _captureAndAnalyzeImage = async () => {
    this.setState({ isProcessing: true });

    try {
      // In a real implementation, this would capture an image from the AR camera
      // const imageBase64 = await NativeModules.ViroARCameraModule.captureImage(findNodeHandle(this._arScene));
      
      // For demo purposes, we'll use a mock image
      const mockImageBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."; // This would be a real base64 image in production
      
      if (this.props.onImageCaptured) {
        this.props.onImageCaptured(mockImageBase64);
      }
      
      this.setState({ capturedImageBase64: mockImageBase64 });
      
      // Analyze the image using ChatGPT Vision API
      const analysisResult = await this._visionService.analyzeImage(
        mockImageBase64,
        this.props.analysisPrompt
      );
      
      // Filter objects by confidence threshold
      const minConfidence = this.props.minConfidence || 0.7;
      const maxObjects = this.props.maxObjects || 10;
      
      const filteredObjects = analysisResult.objects
        .filter(obj => obj.confidence >= minConfidence)
        .slice(0, maxObjects);
      
      this.setState({
        detectedObjects: filteredObjects,
        lastAnalysisResult: analysisResult,
        isProcessing: false,
      });
      
      if (this.props.onObjectsDetected) {
        this.props.onObjectsDetected(filteredObjects);
      }
      
      if (this.props.onImageAnalysisComplete) {
        this.props.onImageAnalysisComplete(analysisResult);
      }
    } catch (error) {
      console.error("Error in image capture and analysis:", error);
      this.setState({ isProcessing: false });
    }
  };

  _onObjectSelected = (object: DetectedObject) => {
    if (this.props.onObjectSelected) {
      this.props.onObjectSelected(object);
    }
  };

  _editImage = async (prompt: string) => {
    if (!this.state.capturedImageBase64 || !this.props.imageEditingEnabled) {
      return;
    }

    try {
      const editResult = await this._visionService.editImage({
        prompt,
        imageBase64: this.state.capturedImageBase64,
        size: "1024x1024",
        style: "vivid",
        quality: "hd",
        numberOfImages: 1,
      });

      if (editResult.editedImages.length > 0 && this.props.onImageEdited) {
        this.props.onImageEdited(this.state.capturedImageBase64, editResult.editedImages[0]);
      }
    } catch (error) {
      console.error("Error editing image:", error);
    }
  };

  _renderObjectIndicators() {
    const { showIndicators = true, indicatorColor = "#FFFFFF", indicatorSize = 0.1 } = this.props;
    
    if (!showIndicators) {
      return null;
    }
    
    return this.state.detectedObjects.map((object, index) => {
      // If custom renderer is provided, use it
      if (this.props.renderIndicator) {
        return (
          <ViroNode
            key={`indicator-${index}`}
            position={this._getPositionFromBoundingBox(object.boundingBox)}
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
          position={this._getPositionFromBoundingBox(object.boundingBox)}
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
  
  _getPositionFromBoundingBox(boundingBox?: DetectedObject["boundingBox"]): Viro3DPoint {
    if (!boundingBox) {
      // Default position if no bounding box is provided
      return [0, 0, -1];
    }
    
    // Convert normalized bounding box coordinates to 3D space
    // This is a simplified conversion and would need to be adjusted based on the AR scene
    const centerX = (boundingBox.minX + boundingBox.maxX) / 2;
    const centerY = (boundingBox.minY + boundingBox.maxY) / 2;
    
    // Map from [0,1] to [-1,1] range for X and Y
    const x = (centerX - 0.5) * 2;
    const y = (centerY - 0.5) * -2; // Invert Y axis
    
    // Z position is fixed at a distance from the camera
    const z = -1.5;
    
    return [x, y, z];
  }
  
  _renderLabel(object: DetectedObject, index: number) {
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