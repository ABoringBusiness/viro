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
exports.ViroObjectRecognition = void 0;
const React = __importStar(require("react"));
const ViroAnimations_1 = require("../Animation/ViroAnimations");
const ViroNode_1 = require("../ViroNode");
const ViroSphere_1 = require("../ViroSphere");
const ViroText_1 = require("../ViroText");
const ViroFlexView_1 = require("../ViroFlexView");
// Register animations for object recognition indicators
ViroAnimations_1.ViroAnimations.registerAnimations({
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
/**
 * ViroObjectRecognition is a component that uses ML Kit or other object detection
 * libraries to recognize objects in the camera view and display visual indicators.
 */
class ViroObjectRecognition extends React.Component {
    _recognitionInterval = null;
    _arScene = null;
    constructor(props) {
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
    componentDidUpdate(prevProps) {
        if (prevProps.enabled !== this.props.enabled) {
            if (this.props.enabled) {
                this._startObjectRecognition();
            }
            else {
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
            const objects = [];
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
                    }
                    catch (error) {
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
        }
        catch (error) {
            console.error("Error in object recognition:", error);
            this.setState({ isProcessing: false });
        }
    };
    _onObjectSelected = (object) => {
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
                return (<ViroNode_1.ViroNode key={`indicator-${index}`} position={object.position} onClick={() => this._onObjectSelected(object)}>
            {this.props.renderIndicator(object)}
          </ViroNode_1.ViroNode>);
            }
            // Default indicator is a white sphere with pulse animation
            const animation = this.props.indicatorAnimation || "pulse";
            return (<ViroNode_1.ViroNode key={`indicator-${index}`} position={object.position} onClick={() => this._onObjectSelected(object)}>
          <ViroSphere_1.ViroSphere radius={indicatorSize} materials={["objectIndicator"]} animation={{
                    name: typeof animation === "string" ? animation : animation.name,
                    run: true,
                    loop: true,
                }} physicsBody={{
                    type: "Kinematic",
                }}/>
          
          {this.props.showLabels && this._renderLabel(object, index)}
        </ViroNode_1.ViroNode>);
        });
    }
    _renderLabel(object, index) {
        // If custom label renderer is provided, use it
        if (this.props.renderLabel) {
            return this.props.renderLabel(object);
        }
        // Default label is a text with object type and confidence
        return (<ViroNode_1.ViroNode position={[0, 0.15, 0]}>
        <ViroFlexView_1.ViroFlexView style={{
                padding: 0.05,
                backgroundColor: "#000000AA",
                borderRadius: 0.05,
            }} width={0.5} height={0.3}>
          <ViroText_1.ViroText text={`${object.type}`} style={{
                fontFamily: "Arial",
                fontSize: 12,
                color: "#FFFFFF",
                textAlignVertical: "center",
                textAlign: "center",
            }}/>
          <ViroText_1.ViroText text={`${Math.round(object.confidence * 100)}%`} style={{
                fontFamily: "Arial",
                fontSize: 10,
                color: "#CCCCCC",
                textAlignVertical: "center",
                textAlign: "center",
            }}/>
        </ViroFlexView_1.ViroFlexView>
      </ViroNode_1.ViroNode>);
    }
    render() {
        return (<>
        {this._renderObjectIndicators()}
      </>);
    }
}
exports.ViroObjectRecognition = ViroObjectRecognition;
