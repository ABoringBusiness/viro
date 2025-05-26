"use strict";
/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroDigitalInkRecognition
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViroDigitalInkRecognition = void 0;
const react_native_1 = require("react-native");
const LINKING_ERROR = `The package 'ViroDigitalInkRecognition' doesn't seem to be linked. Make sure: \n\n` +
    react_native_1.Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo managed workflow\n';
const NativeDigitalInkRecognition = react_native_1.NativeModules.ViroDigitalInkRecognition
    ? react_native_1.NativeModules.ViroDigitalInkRecognition
    : new Proxy({}, {
        get() {
            throw new Error(LINKING_ERROR);
        },
    });
/**
 * ViroDigitalInkRecognition provides handwriting recognition capabilities using Google ML Kit.
 */
class ViroDigitalInkRecognition {
    /**
     * Recognizes handwritten text from a series of strokes.
     *
     * @param strokes Array of strokes, each containing points with x, y coordinates and timestamp
     * @param options Recognition options
     * @returns Promise resolving to an array of recognition candidates
     */
    static recognize(strokes, options = {}) {
        return NativeDigitalInkRecognition.recognize(strokes, options);
    }
    /**
     * Checks if a language model is downloaded and available for use.
     *
     * @param languageCode BCP-47 language code
     * @returns Promise resolving to a boolean indicating if the model is available
     */
    static isLanguageModelAvailable(languageCode) {
        return NativeDigitalInkRecognition.isLanguageModelAvailable(languageCode);
    }
    /**
     * Downloads a language model for digital ink recognition.
     *
     * @param languageCode BCP-47 language code
     * @returns Promise resolving when the model is downloaded
     */
    static downloadLanguageModel(languageCode) {
        return NativeDigitalInkRecognition.downloadLanguageModel(languageCode);
    }
    /**
     * Deletes a downloaded language model.
     *
     * @param languageCode BCP-47 language code
     * @returns Promise resolving when the model is deleted
     */
    static deleteLanguageModel(languageCode) {
        return NativeDigitalInkRecognition.deleteLanguageModel(languageCode);
    }
    /**
     * Gets all available language models that can be downloaded.
     *
     * @returns Promise resolving to an array of language codes
     */
    static getAvailableLanguages() {
        return NativeDigitalInkRecognition.getAvailableLanguages();
    }
}
exports.ViroDigitalInkRecognition = ViroDigitalInkRecognition;
exports.default = ViroDigitalInkRecognition;
