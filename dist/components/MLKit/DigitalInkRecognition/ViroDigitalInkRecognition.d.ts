/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroDigitalInkRecognition
 */
export interface StrokePoint {
    x: number;
    y: number;
    t: number;
}
export interface Stroke {
    points: StrokePoint[];
}
export interface DigitalInkRecognitionOptions {
    /**
     * The language code for recognition.
     * Uses BCP-47 format (e.g., 'en', 'en-US', 'ja', 'zh-Hans', etc.)
     *
     * @default 'en'
     */
    languageCode?: string;
    /**
     * The number of recognition candidates to return.
     *
     * @default 1
     */
    maxResultCount?: number;
    /**
     * Whether to automatically download the language model if not available.
     *
     * @default true
     */
    autoDownloadModel?: boolean;
}
export interface RecognitionCandidate {
    text: string;
    score: number;
}
/**
 * ViroDigitalInkRecognition provides handwriting recognition capabilities using Google ML Kit.
 */
export declare class ViroDigitalInkRecognition {
    /**
     * Recognizes handwritten text from a series of strokes.
     *
     * @param strokes Array of strokes, each containing points with x, y coordinates and timestamp
     * @param options Recognition options
     * @returns Promise resolving to an array of recognition candidates
     */
    static recognize(strokes: Stroke[], options?: DigitalInkRecognitionOptions): Promise<RecognitionCandidate[]>;
    /**
     * Checks if a language model is downloaded and available for use.
     *
     * @param languageCode BCP-47 language code
     * @returns Promise resolving to a boolean indicating if the model is available
     */
    static isLanguageModelAvailable(languageCode: string): Promise<boolean>;
    /**
     * Downloads a language model for digital ink recognition.
     *
     * @param languageCode BCP-47 language code
     * @returns Promise resolving when the model is downloaded
     */
    static downloadLanguageModel(languageCode: string): Promise<void>;
    /**
     * Deletes a downloaded language model.
     *
     * @param languageCode BCP-47 language code
     * @returns Promise resolving when the model is deleted
     */
    static deleteLanguageModel(languageCode: string): Promise<void>;
    /**
     * Gets all available language models that can be downloaded.
     *
     * @returns Promise resolving to an array of language codes
     */
    static getAvailableLanguages(): Promise<string[]>;
}
export default ViroDigitalInkRecognition;
