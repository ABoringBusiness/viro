/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroARAssistantContext
 */

import * as React from "react";
import { ViroARAssistant, ARAssistantState, ARAssistantConfig } from "./ViroARAssistant";
import { AssistantCharacterState } from "../ARAssistantCharacter";

interface ARAssistantContextValue {
  /**
   * The current state of the assistant
   */
  assistantState: ARAssistantState;
  
  /**
   * The current state of the character
   */
  characterState: AssistantCharacterState;
  
  /**
   * The last recognized speech
   */
  recognizedSpeech: string;
  
  /**
   * The last response from the assistant
   */
  lastResponse: string;
  
  /**
   * The last recognized intent
   */
  lastIntent: string;
  
  /**
   * The last action performed
   */
  lastAction: string;
  
  /**
   * Activate the assistant
   */
  activate: () => void;
  
  /**
   * Deactivate the assistant
   */
  deactivate: () => void;
  
  /**
   * Start listening for user input
   */
  startListening: () => Promise<void>;
  
  /**
   * Stop listening for user input
   */
  stopListening: () => Promise<void>;
  
  /**
   * Stop speaking
   */
  stopSpeaking: () => Promise<void>;
  
  /**
   * Speak a message
   */
  speak: (text: string) => Promise<void>;
  
  /**
   * Process a text input directly (without speech recognition)
   */
  processText: (text: string) => Promise<void>;
  
  /**
   * The assistant instance
   */
  assistantRef: React.RefObject<ViroARAssistant>;
}

// Create the context with a default value
const ARAssistantContext = React.createContext<ARAssistantContextValue>({
  assistantState: ARAssistantState.IDLE,
  characterState: AssistantCharacterState.IDLE,
  recognizedSpeech: "",
  lastResponse: "",
  lastIntent: "",
  lastAction: "",
  activate: () => {},
  deactivate: () => {},
  startListening: async () => {},
  stopListening: async () => {},
  stopSpeaking: async () => {},
  speak: async () => {},
  processText: async () => {},
  assistantRef: { current: null },
});

interface ARAssistantProviderProps {
  /**
   * Configuration options for the assistant
   */
  config?: ARAssistantConfig;
  
  /**
   * Callback when the assistant state changes
   */
  onStateChange?: (state: ARAssistantState) => void;
  
  /**
   * Callback when the assistant recognizes speech
   */
  onSpeechRecognized?: (text: string) => void;
  
  /**
   * Callback when the assistant processes an intent
   */
  onIntentRecognized?: (intent: string, params: any) => void;
  
  /**
   * Callback when the assistant speaks
   */
  onSpeak?: (text: string) => void;
  
  /**
   * Callback when the assistant performs an action
   */
  onAction?: (action: string, params: any) => void;
  
  /**
   * Callback when the assistant encounters an error
   */
  onError?: (error: any) => void;
  
  /**
   * Children components
   */
  children: React.ReactNode;
}

/**
 * Provider component for the AR Assistant context
 */
export const ARAssistantProvider: React.FC<ARAssistantProviderProps> = ({
  config,
  onStateChange,
  onSpeechRecognized,
  onIntentRecognized,
  onSpeak,
  onAction,
  onError,
  children,
}) => {
  const assistantRef = React.useRef<ViroARAssistant>(null);
  const [assistantState, setAssistantState] = React.useState<ARAssistantState>(ARAssistantState.IDLE);
  const [characterState, setCharacterState] = React.useState<AssistantCharacterState>(AssistantCharacterState.IDLE);
  const [recognizedSpeech, setRecognizedSpeech] = React.useState("");
  const [lastResponse, setLastResponse] = React.useState("");
  const [lastIntent, setLastIntent] = React.useState("");
  const [lastAction, setLastAction] = React.useState("");
  
  /**
   * Handle assistant state change
   */
  const handleStateChange = (state: ARAssistantState) => {
    setAssistantState(state);
    
    if (onStateChange) {
      onStateChange(state);
    }
  };
  
  /**
   * Handle speech recognition
   */
  const handleSpeechRecognized = (text: string) => {
    setRecognizedSpeech(text);
    
    if (onSpeechRecognized) {
      onSpeechRecognized(text);
    }
  };
  
  /**
   * Handle intent recognition
   */
  const handleIntentRecognized = (intent: string, params: any) => {
    setLastIntent(intent);
    
    if (onIntentRecognized) {
      onIntentRecognized(intent, params);
    }
  };
  
  /**
   * Handle assistant speaking
   */
  const handleSpeak = (text: string) => {
    setLastResponse(text);
    
    if (onSpeak) {
      onSpeak(text);
    }
  };
  
  /**
   * Handle assistant action
   */
  const handleAction = (action: string, params: any) => {
    setLastAction(action);
    
    if (onAction) {
      onAction(action, params);
    }
  };
  
  /**
   * Activate the assistant
   */
  const activate = () => {
    if (assistantRef.current) {
      assistantRef.current.activate();
    }
  };
  
  /**
   * Deactivate the assistant
   */
  const deactivate = () => {
    if (assistantRef.current) {
      assistantRef.current.deactivate();
    }
  };
  
  /**
   * Start listening for user input
   */
  const startListening = async () => {
    if (assistantRef.current) {
      await assistantRef.current.startListening();
    }
  };
  
  /**
   * Stop listening for user input
   */
  const stopListening = async () => {
    if (assistantRef.current) {
      await assistantRef.current.stopListening();
    }
  };
  
  /**
   * Stop speaking
   */
  const stopSpeaking = async () => {
    if (assistantRef.current) {
      await assistantRef.current.stopSpeaking();
    }
  };
  
  /**
   * Speak a message
   */
  const speak = async (text: string) => {
    if (assistantRef.current) {
      await assistantRef.current.speak(text);
    }
  };
  
  /**
   * Process a text input directly (without speech recognition)
   */
  const processText = async (text: string) => {
    if (assistantRef.current) {
      await assistantRef.current.processText(text);
    }
  };
  
  // Create the context value
  const contextValue: ARAssistantContextValue = {
    assistantState,
    characterState,
    recognizedSpeech,
    lastResponse,
    lastIntent,
    lastAction,
    activate,
    deactivate,
    startListening,
    stopListening,
    stopSpeaking,
    speak,
    processText,
    assistantRef,
  };
  
  return (
    <ARAssistantContext.Provider value={contextValue}>
      <ViroARAssistant
        ref={assistantRef}
        config={config}
        onStateChange={handleStateChange}
        onSpeechRecognized={handleSpeechRecognized}
        onIntentRecognized={handleIntentRecognized}
        onSpeak={handleSpeak}
        onAction={handleAction}
        onError={onError}
      />
      {children}
    </ARAssistantContext.Provider>
  );
};

/**
 * Hook to use the AR Assistant context
 */
export const useARAssistant = () => {
  const context = React.useContext(ARAssistantContext);
  
  if (!context) {
    throw new Error("useARAssistant must be used within an ARAssistantProvider");
  }
  
  return context;
};

export default ARAssistantContext;