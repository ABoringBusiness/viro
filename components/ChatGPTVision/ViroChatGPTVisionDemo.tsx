/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroChatGPTVisionDemo
 */

import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroConstants,
  ViroARPlane,
  ViroMaterials,
  ViroNode,
  ViroAnimations,
  ViroFlexView,
  ViroImage,
  ViroButton,
} from "../..";
import { ViroChatGPTVision } from "./ViroChatGPTVision";
import { ViroChatGPTVisionService, DetectedObject, ImageAnalysisResult } from "./ViroChatGPTVisionService";

// Register materials for the demo
ViroMaterials.createMaterials({
  infoCard: {
    diffuseColor: "#FFFFFF",
    diffuseTexture: require("../Resources/card_texture.jpg"),
  },
  captureButton: {
    diffuseColor: "#2196F3",
  },
  editButton: {
    diffuseColor: "#4CAF50",
  },
});

// Register animations for the demo
ViroAnimations.registerAnimations({
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
  showInfoCard: [
    ["fadeIn", "scaleUp"],
  ],
  hideInfoCard: [
    ["fadeOut", "scaleDown"],
  ],
});

type Props = {
  apiKey: string;
};

type State = {
  trackingInitialized: boolean;
  selectedObject: DetectedObject | null;
  detectedObjects: DetectedObject[];
  showObjectInfo: boolean;
  capturedImageBase64: string | null;
  editedImageBase64: string | null;
  showImagePreview: boolean;
  analysisResult: ImageAnalysisResult | null;
  editPrompt: string;
};

/**
 * AR Scene component for ChatGPT Vision demo
 */
class ChatGPTVisionARScene extends React.Component<Props, State> {
  private visionService = ViroChatGPTVisionService.getInstance();
  private chatGPTVisionRef = React.createRef<ViroChatGPTVision>();

  constructor(props: Props) {
    super(props);
    this.state = {
      trackingInitialized: false,
      selectedObject: null,
      detectedObjects: [],
      showObjectInfo: false,
      capturedImageBase64: null,
      editedImageBase64: null,
      showImagePreview: false,
      analysisResult: null,
      editPrompt: "Make the image more vibrant and enhance the colors",
    };
  }

  componentDidMount() {
    // Initialize the ChatGPT Vision service
    this.visionService.initialize({
      apiKey: this.props.apiKey,
      model: "gpt-4-vision-preview",
      maxTokens: 300,
      temperature: 0.7,
    });
  }

  _onInitialized = (state: string, reason: string) => {
    if (state === ViroConstants.TRACKING_NORMAL) {
      this.setState({
        trackingInitialized: true,
      });
    } else if (state === ViroConstants.TRACKING_NONE) {
      this.setState({
        trackingInitialized: false,
      });
    }
  };

  _onObjectsDetected = (objects: DetectedObject[]) => {
    this.setState({
      detectedObjects: objects,
    });
  };

  _onObjectSelected = (object: DetectedObject) => {
    this.setState({
      selectedObject: object,
      showObjectInfo: true,
    });
  };

  _onImageAnalysisComplete = (result: ImageAnalysisResult) => {
    this.setState({
      analysisResult: result,
    });
  };

  _onImageCaptured = (imageBase64: string) => {
    this.setState({
      capturedImageBase64: imageBase64,
    });
  };

  _onImageEdited = (originalImage: string, editedImage: string) => {
    this.setState({
      editedImageBase64: editedImage,
      showImagePreview: true,
    });
  };

  _captureImage = () => {
    if (this.chatGPTVisionRef.current) {
      // Manually trigger image capture
      this.chatGPTVisionRef.current._captureAndAnalyzeImage();
    }
  };

  _editImage = () => {
    if (this.chatGPTVisionRef.current) {
      // Manually trigger image editing
      this.chatGPTVisionRef.current._editImage(this.state.editPrompt);
    }
  };

  _renderObjectInfo() {
    const { selectedObject, showObjectInfo } = this.state;
    
    if (!selectedObject || !showObjectInfo) {
      return null;
    }
    
    const attributes = selectedObject.attributes || {};
    
    return (
      <ViroNode
        position={[0, 0.5, -1]}
        animation={{
          name: "showInfoCard",
          run: showObjectInfo,
          loop: false,
        }}
      >
        <ViroFlexView
          style={{
            padding: 0.1,
            backgroundColor: "#FFFFFF",
            borderRadius: 0.05,
          }}
          width={2}
          height={1.5}
          materials={["infoCard"]}
        >
          <ViroText
            text={`${selectedObject.type.toUpperCase()}`}
            style={{
              fontFamily: "Arial",
              fontSize: 30,
              color: "#000000",
              textAlignVertical: "center",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
          
          <ViroText
            text={`Confidence: ${Math.round(selectedObject.confidence * 100)}%`}
            style={{
              fontFamily: "Arial",
              fontSize: 20,
              color: "#333333",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
          
          {/* Render attributes */}
          {Object.entries(attributes).map(([key, value], index) => (
            <ViroText
              key={`attr-${index}`}
              text={`${key}: ${value}`}
              style={{
                fontFamily: "Arial",
                fontSize: 18,
                color: "#333333",
                textAlignVertical: "center",
                textAlign: "center",
              }}
            />
          ))}
          
          <ViroText
            text="Tap anywhere to dismiss"
            style={{
              fontFamily: "Arial",
              fontSize: 15,
              color: "#666666",
              textAlignVertical: "center",
              textAlign: "center",
            }}
            position={[0, -0.6, 0]}
          />
        </ViroFlexView>
      </ViroNode>
    );
  }

  _renderImagePreview() {
    const { showImagePreview, editedImageBase64, capturedImageBase64 } = this.state;
    
    if (!showImagePreview || (!editedImageBase64 && !capturedImageBase64)) {
      return null;
    }
    
    const imageToShow = editedImageBase64 || capturedImageBase64;
    
    return (
      <ViroNode
        position={[0, 0, -2]}
        animation={{
          name: "showInfoCard",
          run: showImagePreview,
          loop: false,
        }}
      >
        <ViroFlexView
          style={{
            padding: 0.1,
            backgroundColor: "#FFFFFF",
            borderRadius: 0.05,
          }}
          width={2.5}
          height={2}
        >
          <ViroText
            text={editedImageBase64 ? "Edited Image" : "Captured Image"}
            style={{
              fontFamily: "Arial",
              fontSize: 20,
              color: "#000000",
              textAlignVertical: "center",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
          
          <ViroImage
            source={{ uri: imageToShow || "" }}
            width={2}
            height={1.5}
          />
          
          <ViroText
            text="Tap anywhere to dismiss"
            style={{
              fontFamily: "Arial",
              fontSize: 15,
              color: "#666666",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
        </ViroFlexView>
      </ViroNode>
    );
  }

  _renderControlButtons() {
    return (
      <ViroNode position={[0, -0.5, -1]}>
        <ViroFlexView
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 0.05,
          }}
          width={2}
          height={0.5}
        >
          <ViroButton
            source={require("../Resources/capture_button.jpg")}
            tapSource={require("../Resources/capture_button_pressed.jpg")}
            width={0.7}
            height={0.3}
            position={[-0.5, 0, 0]}
            onClick={this._captureImage}
          />
          
          <ViroButton
            source={require("../Resources/edit_button.jpg")}
            tapSource={require("../Resources/edit_button_pressed.jpg")}
            width={0.7}
            height={0.3}
            position={[0.5, 0, 0]}
            onClick={this._editImage}
          />
        </ViroFlexView>
      </ViroNode>
    );
  }

  _onSceneTap = () => {
    if (this.state.showObjectInfo) {
      this.setState({
        showObjectInfo: false,
      });
    }
    
    if (this.state.showImagePreview) {
      this.setState({
        showImagePreview: false,
      });
    }
  };

  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} onClick={this._onSceneTap}>
        {/* Show loading text if tracking not initialized */}
        {!this.state.trackingInitialized && (
          <ViroText
            text="Initializing AR..."
            position={[0, 0, -1]}
            style={{
              fontSize: 20,
              color: "#ffffff",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
        )}
        
        {/* ChatGPT Vision component */}
        <ViroChatGPTVision
          ref={this.chatGPTVisionRef}
          apiConfig={{
            apiKey: this.props.apiKey,
            model: "gpt-4-vision-preview",
            maxTokens: 300,
            temperature: 0.7,
          }}
          enabled={this.state.trackingInitialized}
          minConfidence={0.7}
          maxObjects={5}
          showIndicators={true}
          showLabels={true}
          indicatorColor="#FFFFFF"
          indicatorSize={0.1}
          indicatorAnimation="pulse"
          onObjectsDetected={this._onObjectsDetected}
          onObjectSelected={this._onObjectSelected}
          onImageAnalysisComplete={this._onImageAnalysisComplete}
          onImageCaptured={this._onImageCaptured}
          onImageEdited={this._onImageEdited}
          captureInterval={10000} // 10 seconds
          autoCaptureEnabled={true}
          imageEditingEnabled={true}
        />
        
        {/* Render info card for selected object */}
        {this._renderObjectInfo()}
        
        {/* Render image preview */}
        {this._renderImagePreview()}
        
        {/* Render control buttons */}
        {this._renderControlButtons()}
      </ViroARScene>
    );
  }
}

/**
 * Main component for the ChatGPT Vision demo
 */
export class ViroChatGPTVisionDemo extends React.Component<Props> {
  render() {
    return (
      <ViroARSceneNavigator
        initialScene={{
          scene: ChatGPTVisionARScene,
        }}
        viroAppProps={this.props}
        autofocus={true}
      />
    );
  }
}