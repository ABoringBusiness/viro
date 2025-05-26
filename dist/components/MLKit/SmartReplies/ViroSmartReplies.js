"use strict";
/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroSmartReplies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViroSmartReplies = void 0;
const react_native_1 = require("react-native");
const LINKING_ERROR = `The package 'ViroSmartReplies' doesn't seem to be linked. Make sure: \n\n` +
    react_native_1.Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo managed workflow\n';
const NativeSmartReplies = react_native_1.NativeModules.ViroSmartReplies
    ? react_native_1.NativeModules.ViroSmartReplies
    : new Proxy({}, {
        get() {
            throw new Error(LINKING_ERROR);
        },
    });
/**
 * ViroSmartReplies provides smart reply suggestions for conversations using Google ML Kit.
 */
class ViroSmartReplies {
    /**
     * Generates smart reply suggestions based on previous conversation messages.
     *
     * @param conversation Array of conversation messages
     * @returns Promise resolving to an array of smart reply suggestions
     */
    static suggestReplies(conversation) {
        return NativeSmartReplies.suggestReplies(conversation);
    }
}
exports.ViroSmartReplies = ViroSmartReplies;
exports.default = ViroSmartReplies;
