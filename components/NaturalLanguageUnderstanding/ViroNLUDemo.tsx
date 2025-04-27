/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroNLUDemo
 */

import * as React from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { ViroNaturalLanguageUnderstanding, NLUEngine, NLUResponse } from "./ViroNaturalLanguageUnderstanding";
import { ViroIntentHandler, IntentHandlerResult } from "./ViroIntentHandler";
import { ViroConversationManager, ConversationMessage, ConversationState } from "./ViroConversationManager";
import { ViroEntityExtractor, EntityType } from "./ViroEntityExtractor";

interface DemoState {
  userInput: string;
  processing: boolean;
  conversation: ConversationMessage[];
  nluResponse: NLUResponse | null;
  intentResult: IntentHandlerResult | null;
  entities: any[];
  conversationState: ConversationState;
  selectedEngine: NLUEngine;
  showRawResponse: boolean;
}

/**
 * ViroNLUDemo is a component that demonstrates the Natural Language Understanding module.
 */
export const ViroNLUDemo: React.FC = () => {
  const [state, setState] = React.useState<DemoState>({
    userInput: "",
    processing: false,
    conversation: [],
    nluResponse: null,
    intentResult: null,
    entities: [],
    conversationState: ConversationState.IDLE,
    selectedEngine: NLUEngine.RULE_BASED,
    showRawResponse: false,
  });
  
  const conversationManager = React.useRef<ViroConversationManager | null>(null);
  const entityExtractor = React.useRef<ViroEntityExtractor | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  React.useEffect(() => {
    // Initialize conversation manager
    conversationManager.current = ViroConversationManager.getInstance({
      nluOptions: {
        engine: state.selectedEngine,
        confidenceThreshold: 0.5,
        enableEntityRecognition: true,
      },
      maxHistorySize: 100,
      autoEndConversation: false,
    });
    
    // Initialize entity extractor
    entityExtractor.current = ViroEntityExtractor.getInstance();
    
    // Set up event listeners
    const stateChangeListener = conversationManager.current.on(
      "stateChange",
      (newState: ConversationState) => {
        setState(prevState => ({ ...prevState, conversationState: newState }));
      }
    );
    
    const messageListener = conversationManager.current.on(
      "message",
      (message: ConversationMessage) => {
        setState(prevState => ({
          ...prevState,
          conversation: [...prevState.conversation, message],
        }));
        
        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    
    // Start new conversation
    conversationManager.current.startNewConversation();
    
    // Clean up on unmount
    return () => {
      if (conversationManager.current) {
        conversationManager.current.removeListener("stateChange", stateChangeListener);
        conversationManager.current.removeListener("message", messageListener);
        conversationManager.current.release();
      }
      
      if (entityExtractor.current) {
        entityExtractor.current.release();
      }
    };
  }, [state.selectedEngine]);
  
  /**
   * Handle user input submission
   */
  const handleSubmit = async () => {
    if (!state.userInput.trim() || state.processing) {
      return;
    }
    
    setState(prevState => ({ ...prevState, processing: true }));
    
    try {
      // Extract entities
      let entities: any[] = [];
      if (entityExtractor.current) {
        entities = await entityExtractor.current.extractEntities(state.userInput);
      }
      
      // Process message with conversation manager
      let response: ConversationMessage | null = null;
      let nluResponse: NLUResponse | null = null;
      let intentResult: IntentHandlerResult | null = null;
      
      if (conversationManager.current) {
        // Process message
        response = await conversationManager.current.processMessage(state.userInput);
        
        // Get NLU response and intent result from conversation state
        const conversationState = conversationManager.current.getConversationState();
        nluResponse = conversationState._lastNluResponse || null;
        intentResult = conversationState._lastIntentResult || null;
      }
      
      // Update state
      setState(prevState => ({
        ...prevState,
        userInput: "",
        processing: false,
        entities,
        nluResponse,
        intentResult,
      }));
    } catch (error) {
      console.error("Error processing input:", error);
      
      setState(prevState => ({
        ...prevState,
        processing: false,
      }));
    }
  };
  
  /**
   * Change the NLU engine
   */
  const changeEngine = (engine: NLUEngine) => {
    setState(prevState => ({
      ...prevState,
      selectedEngine: engine,
      conversation: [],
      nluResponse: null,
      intentResult: null,
      entities: [],
    }));
  };
  
  /**
   * Start a new conversation
   */
  const startNewConversation = () => {
    if (conversationManager.current) {
      conversationManager.current.startNewConversation();
      
      setState(prevState => ({
        ...prevState,
        conversation: [],
        nluResponse: null,
        intentResult: null,
        entities: [],
      }));
    }
  };
  
  /**
   * Toggle raw response display
   */
  const toggleRawResponse = () => {
    setState(prevState => ({
      ...prevState,
      showRawResponse: !prevState.showRawResponse,
    }));
  };
  
  /**
   * Render a message bubble
   */
  const renderMessage = (message: ConversationMessage, index: number) => {
    const isUser = message.isUserMessage;
    
    return (
      <View
        key={`message-${index}`}
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <Text style={styles.messageText}>{message.text}</Text>
        {message.intent && (
          <Text style={styles.intentText}>Intent: {message.intent}</Text>
        )}
        {message.action && (
          <Text style={styles.actionText}>Action: {message.action}</Text>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Natural Language Understanding Demo</Text>
        <Text style={styles.subtitle}>
          Current Engine: {state.selectedEngine}
        </Text>
      </View>
      
      <View style={styles.engineSelector}>
        <TouchableOpacity
          style={[
            styles.engineButton,
            state.selectedEngine === NLUEngine.RULE_BASED && styles.selectedEngine,
          ]}
          onPress={() => changeEngine(NLUEngine.RULE_BASED)}
        >
          <Text style={styles.engineButtonText}>Rule-Based</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.engineButton,
            state.selectedEngine === NLUEngine.ML_KIT && styles.selectedEngine,
          ]}
          onPress={() => changeEngine(NLUEngine.ML_KIT)}
        >
          <Text style={styles.engineButtonText}>ML Kit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.engineButton,
            state.selectedEngine === NLUEngine.DIALOGFLOW && styles.selectedEngine,
          ]}
          onPress={() => changeEngine(NLUEngine.DIALOGFLOW)}
        >
          <Text style={styles.engineButtonText}>Dialogflow</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.conversationContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {state.conversation.map(renderMessage)}
          {state.conversation.length === 0 && (
            <Text style={styles.emptyConversation}>
              Type a message to start the conversation.
            </Text>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={state.userInput}
            onChangeText={(text) => setState(prevState => ({ ...prevState, userInput: text }))}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            editable={!state.processing}
          />
          <TouchableOpacity
            style={[styles.sendButton, state.processing && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={state.processing}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={startNewConversation}>
          <Text style={styles.footerButtonText}>New Conversation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={toggleRawResponse}>
          <Text style={styles.footerButtonText}>
            {state.showRawResponse ? "Hide Details" : "Show Details"}
          </Text>
        </TouchableOpacity>
      </View>
      
      {state.showRawResponse && state.nluResponse && (
        <View style={styles.rawResponseContainer}>
          <Text style={styles.rawResponseTitle}>NLU Response:</Text>
          <ScrollView style={styles.rawResponseScroll}>
            <Text style={styles.rawResponseText}>
              {JSON.stringify(state.nluResponse, null, 2)}
            </Text>
          </ScrollView>
        </View>
      )}
      
      {state.showRawResponse && state.entities.length > 0 && (
        <View style={styles.rawResponseContainer}>
          <Text style={styles.rawResponseTitle}>Extracted Entities:</Text>
          <ScrollView style={styles.rawResponseScroll}>
            <Text style={styles.rawResponseText}>
              {JSON.stringify(state.entities, null, 2)}
            </Text>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    padding: 16,
    backgroundColor: "#4285F4",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  engineSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 8,
    backgroundColor: "#E1E1E1",
  },
  engineButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  selectedEngine: {
    backgroundColor: "#4285F4",
  },
  engineButtonText: {
    fontSize: 14,
    color: "#333333",
  },
  conversationContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ECECEC",
  },
  messageText: {
    fontSize: 16,
    color: "#333333",
  },
  intentText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  emptyConversation: {
    textAlign: "center",
    color: "#999999",
    marginTop: 40,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#4285F4",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 8,
    backgroundColor: "#E1E1E1",
  },
  footerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#4285F4",
  },
  footerButtonText: {
    color: "white",
    fontSize: 14,
  },
  rawResponseContainer: {
    backgroundColor: "#333333",
    padding: 8,
    maxHeight: 200,
  },
  rawResponseTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rawResponseScroll: {
    maxHeight: 180,
  },
  rawResponseText: {
    color: "#00FF00",
    fontFamily: "monospace",
    fontSize: 12,
  },
});

export default ViroNLUDemo;