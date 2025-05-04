"use strict";
/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroObjectDetection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViroObjectDetection = void 0;
const react_native_1 = require("react-native");
const LINKING_ERROR = `The package 'ViroObjectDetection' doesn't seem to be linked. Make sure: \n\n` +
    react_native_1.Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo managed workflow\n';
const NativeObjectDetection = react_native_1.NativeModules.ViroObjectDetection
    ? react_native_1.NativeModules.ViroObjectDetection
    : new Proxy({}, {
        get() {
            throw new Error(LINKING_ERROR);
        },
    });
/**
 * ViroObjectDetection provides object detection and tracking capabilities using Google ML Kit.
 */
class ViroObjectDetection {
    /**
     * Detects objects in the provided image.
     *
     * @param imageURL The URL of the image to process. Can be a remote URL or a local file URL (starting with `file://`).
     * @param options Detection options
     * @returns Promise resolving to an array of detected objects
     */
    static detect(imageURL, options = {}) {
        return NativeObjectDetection.detect(imageURL, options);
    }
}
exports.ViroObjectDetection = ViroObjectDetection;
exports.default = ViroObjectDetection;
