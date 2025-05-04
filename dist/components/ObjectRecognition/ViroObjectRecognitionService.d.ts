/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroObjectRecognitionService
 */
import { RecognizedObject } from "./ViroObjectRecognition";
/**
 * Service class for handling object recognition using ML Kit
 */
export declare class ViroObjectRecognitionService {
    private static instance;
    private isInitialized;
    private modelPath;
    private constructor();
    /**
     * Get the singleton instance of the service
     */
    static getInstance(): ViroObjectRecognitionService;
    /**
     * Initialize the ML Kit object recognition
     * @param modelPath Optional custom model path
     */
    initialize(modelPath?: string): Promise<boolean>;
    /**
     * Detect objects in an image
     * @param imageData Base64 encoded image data
     * @param options Detection options
     */
    detectObjects(imageData: string, options?: {
        minConfidence?: number;
        maxObjects?: number;
        objectTypes?: string[];
    }): Promise<RecognizedObject[]>;
    /**
     * Query additional data for a recognized object using external APIs
     * @param object The recognized object
     */
    queryObjectData(object: RecognizedObject): Promise<any>;
    /**
     * Query food-related data (calories, recipes, etc.)
     */
    private queryFoodData;
    /**
     * Query real estate data for buildings or properties
     */
    private queryRealEstateData;
    /**
     * Query shopping data for clothing or products
     */
    private queryShoppingData;
    /**
     * Query general data for any object type
     */
    private queryGeneralData;
    /**
     * Release resources when the service is no longer needed
     */
    release(): void;
}
