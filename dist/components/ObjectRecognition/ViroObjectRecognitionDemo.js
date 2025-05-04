"use strict";
/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroObjectRecognitionDemo
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViroObjectRecognitionDemo = void 0;
const React = __importStar(require("react"));
const __1 = require("../..");
const ViroObjectRecognition_1 = require("./ViroObjectRecognition");
const ViroObjectRecognitionService_1 = require("./ViroObjectRecognitionService");
// Register materials for the demo
__1.ViroMaterials.createMaterials({
    infoCard: {
        diffuseColor: "#FFFFFF",
        diffuseTexture: require("../Resources/card_texture.jpg"),
    },
});
// Register animations for the demo
__1.ViroAnimations.registerAnimations({
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
/**
 * AR Scene component for object recognition demo
 */
class ObjectRecognitionARScene extends React.Component {
    objectRecognitionService = ViroObjectRecognitionService_1.ViroObjectRecognitionService.getInstance();
    constructor(props) {
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
    _onInitialized = (state, reason) => {
        if (state === __1.ViroConstants.TRACKING_NORMAL) {
            this.setState({
                trackingInitialized: true,
            });
        }
        else if (state === __1.ViroConstants.TRACKING_NONE) {
            this.setState({
                trackingInitialized: false,
            });
        }
    };
    _onObjectsRecognized = (objects) => {
        this.setState({
            recognizedObjects: objects,
        });
    };
    _onObjectSelected = (object) => {
        this.setState({
            selectedObject: object,
            showObjectInfo: true,
        });
    };
    _onQueryObjectData = async (object) => {
        // Query additional data for the recognized object
        return await this.objectRecognitionService.queryObjectData(object);
    };
    _renderObjectInfo() {
        const { selectedObject, showObjectInfo } = this.state;
        if (!selectedObject || !showObjectInfo) {
            return null;
        }
        const metadata = selectedObject.metadata || {};
        return (<__1.ViroNode position={[0, 0.5, -1]} animation={{
                name: "showInfoCard",
                run: showObjectInfo,
                loop: false,
            }}>
        <__1.ViroFlexView style={{
                padding: 0.1,
                backgroundColor: "#FFFFFF",
                borderRadius: 0.05,
            }} width={2} height={1.5} materials={["infoCard"]}>
          <__1.ViroText text={`${selectedObject.type.toUpperCase()}`} style={{
                fontFamily: "Arial",
                fontSize: 30,
                color: "#000000",
                textAlignVertical: "center",
                textAlign: "center",
                fontWeight: "bold",
            }}/>
          
          <__1.ViroText text={`Confidence: ${Math.round(selectedObject.confidence * 100)}%`} style={{
                fontFamily: "Arial",
                fontSize: 20,
                color: "#333333",
                textAlignVertical: "center",
                textAlign: "center",
            }}/>
          
          {/* Render metadata based on object type */}
          {this._renderMetadata(selectedObject, metadata)}
          
          <__1.ViroText text="Tap anywhere to dismiss" style={{
                fontFamily: "Arial",
                fontSize: 15,
                color: "#666666",
                textAlignVertical: "center",
                textAlign: "center",
            }} position={[0, -0.6, 0]}/>
        </__1.ViroFlexView>
      </__1.ViroNode>);
    }
    _renderMetadata(object, metadata) {
        // Render different metadata based on object type
        switch (object.type.toLowerCase()) {
            case "food":
            case "fruit":
            case "vegetable":
                return (<>
            <__1.ViroText text={`Calories: ${metadata.calories || "Unknown"}`} style={styles.metadataText}/>
            <__1.ViroText text={`Protein: ${metadata.nutrients?.protein || "Unknown"}g`} style={styles.metadataText}/>
            <__1.ViroText text={`Recipe: ${metadata.recipes?.[0] || "No recipes found"}`} style={styles.metadataText}/>
          </>);
            case "house":
            case "building":
            case "property":
                return (<>
            <__1.ViroText text={`Est. Value: ${metadata.estimatedValue || "Unknown"}`} style={styles.metadataText}/>
            <__1.ViroText text={`Size: ${metadata.squareFeet || "Unknown"} sq ft`} style={styles.metadataText}/>
            <__1.ViroText text={`Bedrooms: ${metadata.bedrooms || "Unknown"}`} style={styles.metadataText}/>
          </>);
            case "clothing":
            case "shoe":
            case "accessory":
                return (<>
            <__1.ViroText text={`Price: ${metadata.price || "Unknown"}`} style={styles.metadataText}/>
            <__1.ViroText text={`Brand: ${metadata.brand || "Unknown"}`} style={styles.metadataText}/>
            <__1.ViroText text={`Rating: ${metadata.rating || "Unknown"}`} style={styles.metadataText}/>
            <__1.ViroText text={`In Stock: ${metadata.inStock ? "Yes" : "No"}`} style={styles.metadataText}/>
          </>);
            default:
                return (<>
            <__1.ViroText text={metadata.description || "No additional information available"} style={styles.metadataText}/>
            {metadata.commonUses && (<__1.ViroText text={`Common Uses: ${metadata.commonUses[0]}`} style={styles.metadataText}/>)}
          </>);
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
        return (<__1.ViroARScene onTrackingUpdated={this._onInitialized} onClick={this._onSceneTap}>
        {/* Show loading text if tracking not initialized */}
        {!this.state.trackingInitialized && (<__1.ViroText text="Initializing AR..." position={[0, 0, -1]} style={{
                    fontSize: 20,
                    color: "#ffffff",
                    textAlignVertical: "center",
                    textAlign: "center",
                }}/>)}
        
        {/* Object recognition component */}
        <ViroObjectRecognition_1.ViroObjectRecognition enabled={this.state.trackingInitialized} minConfidence={0.7} maxObjects={5} showIndicators={true} showLabels={true} indicatorColor="#FFFFFF" indicatorSize={0.1} indicatorAnimation="pulse" onObjectsRecognized={this._onObjectsRecognized} onObjectSelected={this._onObjectSelected} onQueryObjectData={this._onQueryObjectData}/>
        
        {/* Render info card for selected object */}
        {this._renderObjectInfo()}
      </__1.ViroARScene>);
    }
}
/**
 * Main component for the object recognition demo
 */
class ViroObjectRecognitionDemo extends React.Component {
    render() {
        return (<__1.ViroARSceneNavigator initialScene={{
                scene: ObjectRecognitionARScene,
            }} viroAppProps={this.props} autofocus={true}/>);
    }
}
exports.ViroObjectRecognitionDemo = ViroObjectRecognitionDemo;
const styles = {
    metadataText: {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#333333",
        textAlignVertical: "center",
        textAlign: "center",
    },
};
