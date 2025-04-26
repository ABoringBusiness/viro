/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroSmartReplies
 */

import { NativeModules, Platform } from "react-native";

export interface TextMessage {
  /**
   * The text content of the message.
   */
  text: string;

  /**
   * Whether the message was sent by the local user (true) or received from someone else (false).
   */
  isLocalUser: boolean;

  /**
   * Timestamp of the message in milliseconds since epoch.
   * If not provided, the current time will be used.
   */
  timestamp?: number;
}

export interface SmartReply {
  /**
   * The text of the suggested reply.
   */
  text: string;
}

const LINKING_ERROR =
  `The package 'ViroSmartReplies' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const NativeSmartReplies = NativeModules.ViroSmartReplies
  ? NativeModules.ViroSmartReplies
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
 * ViroSmartReplies provides smart reply suggestions for conversations using Google ML Kit.
 */
export class ViroSmartReplies {
  /**
   * Generates smart reply suggestions based on previous conversation messages.
   * 
   * @param conversation Array of conversation messages
   * @returns Promise resolving to an array of smart reply suggestions
   */
  static suggestReplies(
    conversation: TextMessage[]
  ): Promise<SmartReply[]> {
    return NativeSmartReplies.suggestReplies(conversation);
  }
}

export default ViroSmartReplies;