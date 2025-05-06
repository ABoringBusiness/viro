/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroObjectRecognitionDemo
 */

import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
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
} from "../..";
import { ViroObjectRecognition, RecognizedObject } from "./ViroObjectRecognition";
import { ViroObjectRecognitionService } from "./ViroObjectRecognitionService";

// Register materials for the demo
ViroMaterials.createMaterials({
  infoCard: {
    diffuseColor: "#FFFFFF",
    diffuseTexture: require("../Resources/card_texture.jpg"),
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
  apiKey?: string;
};

type State = {
  trackingInitialized: boolean;
  selectedObject: RecognizedObject | null;
  recognizedObjects: RecognizedObject[];
  showObjectInfo: boolean;
};

/**
 * AR Scene component for object recognition demo
 */
class ObjectRecognitionARScene extends React.Component<Props, State> {
  private objectRecognitionService = ViroObjectRecognitionService.getInstance();

  constructor(props: Props) {
    super(props);
    this.state = {
      trackingInitialized: false,
      selectedObject: null,
      recognizedObjects: [],
      showObjectInfo: false,
    };
  }

  componentDidMount() {
    // Initialize the object recognition service
    this.objectRecognitionService.initialize();
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

  _onObjectsRecognized = (objects: RecognizedObject[]) => {
    this.setState({
      recognizedObjects: objects,
    });
  };

  _onObjectSelected = (object: RecognizedObject) => {
    this.setState({
      selectedObject: object,
      showObjectInfo: true,
    });
  };

  _onQueryObjectData = async (object: RecognizedObject) => {
    // Query additional data for the recognized object
    return await this.objectRecognitionService.queryObjectData(object);
  };

  _renderObjectInfo() {
    const { selectedObject, showObjectInfo } = this.state;
    
    if (!selectedObject || !showObjectInfo) {
      return null;
    }
    
    const metadata = selectedObject.metadata || {};
    
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
          
          {/* Render metadata based on object type */}
          {this._renderMetadata(selectedObject, metadata)}
          
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
  
  _renderMetadata(object: RecognizedObject, metadata: any) {
    // Render different metadata based on object type
    switch (object.type.toLowerCase()) {
      case "food":
      case "fruit":
      case "vegetable":
        return (
          <>
            <ViroText
              text={`Calories: ${metadata.calories || "Unknown"}`}
              style={styles.metadataText}
            />
            <ViroText
              text={`Protein: ${metadata.nutrients?.protein || "Unknown"}g`}
              style={styles.metadataText}
            />
            <ViroText
              text={`Recipe: ${metadata.recipes?.[0] || "No recipes found"}`}
              style={styles.metadataText}
            />
          </>
        );
        
      case "house":
      case "building":
      case "property":
        return (
          <>
            <ViroText
              text={`Est. Value: ${metadata.estimatedValue || "Unknown"}`}
              style={styles.metadataText}
            />
            <ViroText
              text={`Size: ${metadata.squareFeet || "Unknown"} sq ft`}
              style={styles.metadataText}
            />
            <ViroText
              text={`Bedrooms: ${metadata.bedrooms || "Unknown"}`}
              style={styles.metadataText}
            />
          </>
        );
        
      case "clothing":
      case "shoe":
      case "accessory":
        return (
          <>
            <ViroText
              text={`Price: ${metadata.price || "Unknown"}`}
              style={styles.metadataText}
            />
            <ViroText
              text={`Brand: ${metadata.brand || "Unknown"}`}
              style={styles.metadataText}
            />
            <ViroText
              text={`Rating: ${metadata.rating || "Unknown"}`}
              style={styles.metadataText}
            />
            <ViroText
              text={`In Stock: ${metadata.inStock ? "Yes" : "No"}`}
              style={styles.metadataText}
            />
          </>
        );
        
      default:
        return (
          <>
            <ViroText
              text={metadata.description || "No additional information available"}
              style={styles.metadataText}
            />
            {metadata.commonUses && (
              <ViroText
                text={`Common Uses: ${metadata.commonUses[0]}`}
                style={styles.metadataText}
              />
            )}
          </>
        );
    }
  }

  _onSceneTap = () => {
    if (this.state.showObjectInfo) {
      this.setState({
        showObjectInfo: false,
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
        
        {/* Object recognition component */}
        <ViroObjectRecognition
          enabled={this.state.trackingInitialized}
          minConfidence={0.7}
          maxObjects={5}
          showIndicators={true}
          showLabels={true}
          indicatorColor="#FFFFFF"
          indicatorSize={0.1}
          indicatorAnimation="pulse"
          onObjectsRecognized={this._onObjectsRecognized}
          onObjectSelected={this._onObjectSelected}
          onQueryObjectData={this._onQueryObjectData}
        />
        
        {/* Render info card for selected object */}
        {this._renderObjectInfo()}
      </ViroARScene>
    );
  }
}

/**
 * Main component for the object recognition demo
 */
export class ViroObjectRecognitionDemo extends React.Component<Props> {
  render() {
    return (
      <ViroARSceneNavigator
        initialScene={{
          scene: ObjectRecognitionARScene,
        }}
        viroAppProps={this.props}
        autofocus={true}
      />
    );
  }
}

const styles = {
  metadataText: {
    fontFamily: "Arial",
    fontSize: 18,
    color: "#333333",
    textAlignVertical: "center",
    textAlign: "center",
  },
};