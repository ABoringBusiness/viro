/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroObjectRecognition
 */
import * as React from "react";
import { ViewProps } from "react-native";
import { ViroAnimation } from "../Animation/ViroAnimations";
import { ViroARScene } from "../AR/ViroARScene";
import { Viro3DPoint } from "../Types/ViroUtils";
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
export declare class ViroObjectRecognition extends React.Component<Props, State> {
    _recognitionInterval: NodeJS.Timeout | null;
    _arScene: ViroARScene | null;
    constructor(props: Props);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    componentWillUnmount(): void;
    _startObjectRecognition: () => void;
    _stopObjectRecognition: () => void;
    _simulateObjectRecognition: () => Promise<void>;
    _onObjectSelected: (object: RecognizedObject) => void;
    _renderObjectIndicators(): React.JSX.Element[] | null;
    _renderLabel(object: RecognizedObject, index: number): string | number | boolean | Iterable<React.ReactNode> | React.JSX.Element | null | undefined;
    render(): React.JSX.Element;
}
export {};
