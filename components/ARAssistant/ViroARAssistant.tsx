/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroARAssistant
 */

import * as React from "react";
import { StyleSheet, Platform } from "react-native";
import { ViroNode } from "../ViroNode";
import { ViroARScene } from "../AR/ViroARScene";
import { ViroARPlaneSelector } from "../AR/ViroARPlaneSelector";
import { ViroText } from "../ViroText";
import { ViroFlexView } from "../ViroFlexView";

// Import Speech Recognition module
import { 
  ViroSpeechRecognition, 
  SpeechRecognitionEngine, 
  SpeechRecognitionState 
} from "../SpeechRecognition";

// Import Text-to-Speech module
import { 
  ViroTextToSpeech, 
  TextToSpeechEngine, 
  TextToSpeechState 
} from "../TextToSpeech";

// Import AR Assistant Character module
import { 
  ViroARAssistantCharacter, 
  AssistantCharacterState, 
  AssistantCharacterType 
} from "../ARAssistantCharacter";

// Import Natural Language Understanding module
import { 
  ViroNaturalLanguageUnderstanding, 
  NLUEngine, 
  ViroIntentHandler, 
  ViroConversationManager, 
  ConversationState 
} from "../NaturalLanguageUnderstanding";

// Import AR Interaction Enhancement module
import { 
  ViroARInteractionManager, 
  InteractionType, 
  InteractionState, 
  ViroARObjectInteraction, 
  ObjectInteractionMode 
} from "../ARInteractionEnhancement";

export enum ARAssistantState {
  /**
   * Assistant is idle, waiting for activation
   */
  IDLE = "idle",
  
  /**
   * Assistant is listening to user input
   */
  LISTENING = "listening",
  
  /**
   * Assistant is processing user input
   */
  PROCESSING = "processing",
  
  /**
   * Assistant is responding to user
   */
  RESPONDING = "responding",
  
  /**
   * Assistant is performing an action
   */
  ACTING = "acting",
  
  /**
   * Assistant has encountered an error
   */
  ERROR = "error"
}

export interface ARAssistantConfig {
  /**
   * The name of the assistant
   */
  name?: string;
  
  /**
   * The type of character to display
   */
  characterType?: AssistantCharacterType;
  
  /**
   * Character customization options
   */
  characterCustomization?: {
    primaryColor?: string;
    secondaryColor?: string;
    scale?: number;
    showShadow?: boolean;
  };
  
  /**
   * Speech recognition options
   */
  speechRecognition?: {
    engine?: SpeechRecognitionEngine;
    languageCode?: string;
    continuous?: boolean;
    enableWakeWord?: boolean;
    wakeWord?: string;
  };
  
  /**
   * Text-to-speech options
   */
  textToSpeech?: {
    engine?: TextToSpeechEngine;
    languageCode?: string;
    voiceId?: string;
    voiceGender?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  };
  
  /**
   * Natural language understanding options
   */
  nlu?: {
    engine?: NLUEngine;
    confidenceThreshold?: number;
    enableEntityRecognition?: boolean;
  };
  
  /**
   * AR interaction options
   */
  interaction?: {
    enableObjectRecognition?: boolean;
    enableGestureRecognition?: boolean;
    enableVoiceCommands?: boolean;
    enableGazeInteraction?: boolean;
    showVisualFeedback?: boolean;
  };
  
  /**
   * Whether to enable debug mode
   */
  debug?: boolean;
  
  /**
   * Initial position of the assistant character
   */
  initialPosition?: [number, number, number];
  
  /**
   * Whether to auto-activate the assistant on mount
   */
  autoActivate?: boolean;
  
  /**
   * Whether to show the assistant UI
   */
  showUI?: boolean;
  
  /**
   * Custom intents for the assistant
   */
  customIntents?: {
    name: string;
    examples: string[];
    entities?: string[];
    action?: string;
    response?: string;
  }[];
  
  /**
   * Custom voice commands for the assistant
   */
  customVoiceCommands?: {
    name: string;
    phrases: string[];
    action: string;
    params?: { [key: string]: any };
  }[];
}

export interface ARAssistantProps {
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
  children?: React.ReactNode;
}

interface ARAssistantInternalState {
  assistantState: ARAssistantState;
  characterState: AssistantCharacterState;
  speechState: SpeechRecognitionState;
  ttsState: TextToSpeechState;
  conversationState: ConversationState;
  recognizedSpeech: string;
  lastResponse: string;
  lastIntent: string;
  lastAction: string;
  isInitialized: boolean;
  debugInfo: { [key: string]: any };
}

/**
 * ViroARAssistant is the core component that integrates all AR assistant modules.
 */
export class ViroARAssistant extends React.Component<ARAssistantProps, ARAssistantInternalState> {
  private speechRecognition: ViroSpeechRecognition;
  private textToSpeech: ViroTextToSpeech;
  private nlu: ViroNaturalLanguageUnderstanding;
  private conversationManager: ViroConversationManager;
  private intentHandler: ViroIntentHandler;
  private characterRef = React.createRef<ViroARAssistantCharacter>();
  private interactionManagerRef = React.createRef<ViroARInteractionManager>();
  private speechListeners: (() => void)[] = [];
  private ttsListeners: (() => void)[] = [];
  private conversationListeners: (() => void)[] = [];
  
  static defaultProps: Partial<ARAssistantProps> = {
    config: {
      name: "Assistant",
      characterType: AssistantCharacterType.ROBOT,
      autoActivate: false,
      showUI: true,
      debug: false,
    },
  };
  
  constructor(props: ARAssistantProps) {
    super(props);
    
    this.state = {
      assistantState: ARAssistantState.IDLE,
      characterState: AssistantCharacterState.IDLE,
      speechState: SpeechRecognitionState.IDLE,
      ttsState: TextToSpeechState.IDLE,
      conversationState: ConversationState.IDLE,
      recognizedSpeech: "",
      lastResponse: "",
      lastIntent: "",
      lastAction: "",
      isInitialized: false,
      debugInfo: {},
    };
    
    // Initialize speech recognition
    this.speechRecognition = ViroSpeechRecognition.getInstance({
      engine: props.config?.speechRecognition?.engine || SpeechRecognitionEngine.DEFAULT,
      languageCode: props.config?.speechRecognition?.languageCode || "en-US",
      continuous: props.config?.speechRecognition?.continuous || false,
      enableWakeWord: props.config?.speechRecognition?.enableWakeWord || false,
      wakeWord: props.config?.speechRecognition?.wakeWord || "Hey Assistant",
    });
    
    // Initialize text-to-speech
    this.textToSpeech = ViroTextToSpeech.getInstance({
      engine: props.config?.textToSpeech?.engine || TextToSpeechEngine.DEFAULT,
      languageCode: props.config?.textToSpeech?.languageCode || "en-US",
      voiceId: props.config?.textToSpeech?.voiceId,
      voiceGender: props.config?.textToSpeech?.voiceGender || "female",
      rate: props.config?.textToSpeech?.rate || 1.0,
      pitch: props.config?.textToSpeech?.pitch || 1.0,
      volume: props.config?.textToSpeech?.volume || 1.0,
    });
    
    // Initialize NLU
    this.nlu = ViroNaturalLanguageUnderstanding.getInstance({
      engine: props.config?.nlu?.engine || NLUEngine.DEFAULT,
      confidenceThreshold: props.config?.nlu?.confidenceThreshold || 0.5,
      enableEntityRecognition: props.config?.nlu?.enableEntityRecognition !== false,
    });
    
    // Initialize conversation manager
    this.conversationManager = ViroConversationManager.getInstance({
      nluOptions: {
        engine: props.config?.nlu?.engine || NLUEngine.DEFAULT,
        confidenceThreshold: props.config?.nlu?.confidenceThreshold || 0.5,
      },
    });
    
    // Initialize intent handler
    this.intentHandler = ViroIntentHandler.getInstance();
    
    // Register custom intents if provided
    if (props.config?.customIntents) {
      props.config.customIntents.forEach(intent => {
        this.nlu.addCustomIntent(intent);
        
        // Register intent handler if action or response is provided
        if (intent.action || intent.response) {
          this.intentHandler.registerHandler(intent.name, async (intentData, context) => {
            return {
              responseText: intent.response || `I'll ${intent.action} for you.`,
              success: true,
              action: intent.action,
              actionParams: { entities: intentData.entities },
            };
          });
        }
      });
    }
  }
  
  async componentDidMount() {
    // Set up speech recognition listeners
    this.setupSpeechRecognitionListeners();
    
    // Set up text-to-speech listeners
    this.setupTextToSpeechListeners();
    
    // Set up conversation manager listeners
    this.setupConversationListeners();
    
    // Register default intent handlers
    this.registerDefaultIntentHandlers();
    
    // Auto-activate if configured
    if (this.props.config?.autoActivate) {
      // Wait a moment for everything to initialize
      setTimeout(() => {
        this.activate();
      }, 1000);
    }
    
    this.setState({ isInitialized: true });
  }
  
  componentWillUnmount() {
    // Clean up speech recognition listeners
    this.speechListeners.forEach(unregister => unregister());
    
    // Clean up text-to-speech listeners
    this.ttsListeners.forEach(unregister => unregister());
    
    // Clean up conversation listeners
    this.conversationListeners.forEach(unregister => unregister());
    
    // Stop speech recognition
    this.speechRecognition.stop();
    
    // Stop text-to-speech
    this.textToSpeech.stop();
  }
  
  /**
   * Set up speech recognition listeners
   */
  private setupSpeechRecognitionListeners() {
    // Listen for speech recognition state changes
    const stateListener = this.speechRecognition.onStateChange((state) => {
      this.setState({ speechState: state });
      
      // Update character state based on speech recognition state
      if (state === SpeechRecognitionState.LISTENING) {
        this.updateCharacterState(AssistantCharacterState.LISTENING);
      } else if (state === SpeechRecognitionState.PROCESSING) {
        this.updateCharacterState(AssistantCharacterState.THINKING);
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            speechRecognition: {
              state,
              timestamp: Date.now(),
            },
          },
        }));
      }
    });
    
    // Listen for speech recognition results
    const resultListener = this.speechRecognition.onResult((result) => {
      // Only process final results
      if (!result.isFinal) return;
      
      const recognizedText = result.text;
      
      this.setState({ 
        recognizedSpeech: recognizedText,
        assistantState: ARAssistantState.PROCESSING,
      });
      
      // Notify callback
      if (this.props.onSpeechRecognized) {
        this.props.onSpeechRecognized(recognizedText);
      }
      
      // Process the recognized speech
      this.processUserInput(recognizedText);
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            speechRecognition: {
              ...prevState.debugInfo.speechRecognition,
              lastResult: recognizedText,
            },
          },
        }));
      }
    });
    
    // Listen for speech recognition errors
    const errorListener = this.speechRecognition.onError((error) => {
      this.setState({ assistantState: ARAssistantState.ERROR });
      
      // Update character state
      this.updateCharacterState(AssistantCharacterState.IDLE);
      
      // Notify callback
      if (this.props.onError) {
        this.props.onError(error);
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            speechRecognition: {
              ...prevState.debugInfo.speechRecognition,
              error,
            },
          },
        }));
      }
    });
    
    // Store listeners for cleanup
    this.speechListeners.push(stateListener, resultListener, errorListener);
  }
  
  /**
   * Set up text-to-speech listeners
   */
  private setupTextToSpeechListeners() {
    // Listen for text-to-speech state changes
    const stateListener = this.textToSpeech.onStateChange((state) => {
      this.setState({ ttsState: state });
      
      // Update character state based on text-to-speech state
      if (state === TextToSpeechState.SPEAKING) {
        this.updateCharacterState(AssistantCharacterState.SPEAKING);
      } else if (state === TextToSpeechState.IDLE || state === TextToSpeechState.STOPPED) {
        // Only update character state if we're not in the middle of something else
        if (this.state.assistantState === ARAssistantState.RESPONDING) {
          this.updateCharacterState(AssistantCharacterState.IDLE);
          this.setState({ assistantState: ARAssistantState.IDLE });
        }
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            textToSpeech: {
              state,
              timestamp: Date.now(),
            },
          },
        }));
      }
    });
    
    // Listen for text-to-speech start
    const startListener = this.textToSpeech.onStart((utterance) => {
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            textToSpeech: {
              ...prevState.debugInfo.textToSpeech,
              utterance,
            },
          },
        }));
      }
    });
    
    // Listen for text-to-speech end
    const endListener = this.textToSpeech.onEnd((utterance) => {
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            textToSpeech: {
              ...prevState.debugInfo.textToSpeech,
              lastUtterance: utterance,
            },
          },
        }));
      }
    });
    
    // Store listeners for cleanup
    this.ttsListeners.push(stateListener, startListener, endListener);
  }
  
  /**
   * Set up conversation manager listeners
   */
  private setupConversationListeners() {
    // Listen for conversation state changes
    const stateListener = this.conversationManager.on(
      "stateChange",
      (state: ConversationState) => {
        this.setState({ conversationState: state });
        
        // Update debug info
        if (this.props.config?.debug) {
          this.setState(prevState => ({
            debugInfo: {
              ...prevState.debugInfo,
              conversation: {
                state,
                timestamp: Date.now(),
              },
            },
          }));
        }
      }
    );
    
    // Listen for conversation messages
    const messageListener = this.conversationManager.on(
      "message",
      (message: any) => {
        // Update debug info
        if (this.props.config?.debug) {
          this.setState(prevState => ({
            debugInfo: {
              ...prevState.debugInfo,
              conversation: {
                ...prevState.debugInfo.conversation,
                lastMessage: message,
              },
            },
          }));
        }
      }
    );
    
    // Store listeners for cleanup
    this.conversationListeners.push(
      () => this.conversationManager.removeListener("stateChange", stateListener),
      () => this.conversationManager.removeListener("message", messageListener)
    );
  }
  
  /**
   * Register default intent handlers
   */
  private registerDefaultIntentHandlers() {
    // Greeting intent
    this.intentHandler.registerHandler("greeting", async (intent, context) => {
      const responses = [
        `Hello! I'm ${this.props.config?.name || "Assistant"}. How can I help you?`,
        `Hi there! I'm ${this.props.config?.name || "Assistant"}. What can I do for you?`,
        `Greetings! I'm ${this.props.config?.name || "Assistant"}. How may I assist you?`,
      ];
      
      return {
        responseText: responses[Math.floor(Math.random() * responses.length)],
        success: true,
      };
    });
    
    // Farewell intent
    this.intentHandler.registerHandler("farewell", async (intent, context) => {
      const responses = [
        "Goodbye! Have a great day!",
        "See you later!",
        "Bye for now!",
        "Until next time!",
      ];
      
      return {
        responseText: responses[Math.floor(Math.random() * responses.length)],
        success: true,
        endConversation: true,
      };
    });
    
    // Help intent
    this.intentHandler.registerHandler("help", async (intent, context) => {
      return {
        responseText: "I can help you with various AR tasks. You can ask me to place objects, remove objects, take photos, identify objects, and more. What would you like to do?",
        success: true,
      };
    });
    
    // Place object intent
    this.intentHandler.registerHandler("place_object", async (intent, context) => {
      // Extract object entity
      const objectEntity = intent.entities.find(e => e.type === "object");
      const object = objectEntity ? objectEntity.value : "cube";
      
      return {
        responseText: `Placing a ${object} in the scene.`,
        success: true,
        action: "place_object",
        actionParams: { objectType: object },
      };
    });
    
    // Remove object intent
    this.intentHandler.registerHandler("remove_object", async (intent, context) => {
      // Extract object entity
      const objectEntity = intent.entities.find(e => e.type === "object");
      
      if (objectEntity) {
        return {
          responseText: `Removing the ${objectEntity.value}.`,
          success: true,
          action: "remove_object",
          actionParams: { objectType: objectEntity.value },
        };
      } else {
        return {
          responseText: "Removing all objects from the scene.",
          success: true,
          action: "remove_all_objects",
        };
      }
    });
  }
  
  /**
   * Process user input
   * @param text The user's input text
   */
  private async processUserInput(text: string) {
    try {
      // Update assistant state
      this.setState({ 
        assistantState: ARAssistantState.PROCESSING,
      });
      
      // Update character state
      this.updateCharacterState(AssistantCharacterState.THINKING);
      
      // Process with conversation manager
      const response = await this.conversationManager.processMessage(text);
      
      // Extract intent and action from response
      const intent = response.metadata?.intent;
      const action = response.metadata?.action;
      
      // Update state
      this.setState({
        lastResponse: response.text,
        lastIntent: intent,
        lastAction: action,
      });
      
      // Notify intent callback
      if (intent && this.props.onIntentRecognized) {
        this.props.onIntentRecognized(intent, response.metadata);
      }
      
      // Respond to the user
      this.respondToUser(response.text);
      
      // Perform action if needed
      if (action) {
        this.performAction(action, response.metadata?.actionParams);
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            processing: {
              input: text,
              response,
              timestamp: Date.now(),
            },
          },
        }));
      }
    } catch (error) {
      console.error("Error processing user input:", error);
      
      // Update assistant state
      this.setState({ assistantState: ARAssistantState.ERROR });
      
      // Update character state
      this.updateCharacterState(AssistantCharacterState.IDLE);
      
      // Notify error callback
      if (this.props.onError) {
        this.props.onError(error);
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            processing: {
              input: text,
              error,
              timestamp: Date.now(),
            },
          },
        }));
      }
    }
  }
  
  /**
   * Respond to the user
   * @param text The response text
   */
  private async respondToUser(text: string) {
    try {
      // Update assistant state
      this.setState({ assistantState: ARAssistantState.RESPONDING });
      
      // Update character state
      this.updateCharacterState(AssistantCharacterState.SPEAKING);
      
      // Notify speak callback
      if (this.props.onSpeak) {
        this.props.onSpeak(text);
      }
      
      // Speak the response
      await this.textToSpeech.speak(text);
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            responding: {
              text,
              timestamp: Date.now(),
            },
          },
        }));
      }
    } catch (error) {
      console.error("Error responding to user:", error);
      
      // Update assistant state
      this.setState({ assistantState: ARAssistantState.ERROR });
      
      // Update character state
      this.updateCharacterState(AssistantCharacterState.IDLE);
      
      // Notify error callback
      if (this.props.onError) {
        this.props.onError(error);
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            responding: {
              text,
              error,
              timestamp: Date.now(),
            },
          },
        }));
      }
    }
  }
  
  /**
   * Perform an action
   * @param action The action to perform
   * @param params Parameters for the action
   */
  private async performAction(action: string, params?: any) {
    try {
      // Update assistant state
      this.setState({ assistantState: ARAssistantState.ACTING });
      
      // Notify action callback
      if (this.props.onAction) {
        this.props.onAction(action, params);
      }
      
      // Handle different actions
      switch (action) {
        case "place_object":
          // Place an object in the scene
          // This would be handled by the AR interaction manager
          break;
          
        case "remove_object":
          // Remove an object from the scene
          // This would be handled by the AR interaction manager
          break;
          
        case "remove_all_objects":
          // Remove all objects from the scene
          // This would be handled by the AR interaction manager
          break;
          
        case "take_photo":
          // Take a photo
          // This would be handled by the AR scene navigator
          break;
          
        // Add more actions as needed
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            action: {
              action,
              params,
              timestamp: Date.now(),
            },
          },
        }));
      }
    } catch (error) {
      console.error("Error performing action:", error);
      
      // Update assistant state
      this.setState({ assistantState: ARAssistantState.ERROR });
      
      // Notify error callback
      if (this.props.onError) {
        this.props.onError(error);
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            action: {
              action,
              params,
              error,
              timestamp: Date.now(),
            },
          },
        }));
      }
    }
  }
  
  /**
   * Update the character state
   * @param state The new character state
   */
  private updateCharacterState(state: AssistantCharacterState) {
    this.setState({ characterState: state });
    
    // Update debug info
    if (this.props.config?.debug) {
      this.setState(prevState => ({
        debugInfo: {
          ...prevState.debugInfo,
          character: {
            state,
            timestamp: Date.now(),
          },
        },
      }));
    }
  }
  
  /**
   * Activate the assistant
   */
  public activate() {
    // Start listening
    this.startListening();
    
    // Update character state
    this.updateCharacterState(AssistantCharacterState.IDLE);
  }
  
  /**
   * Deactivate the assistant
   */
  public deactivate() {
    // Stop listening
    this.stopListening();
    
    // Stop speaking
    this.stopSpeaking();
    
    // Update character state
    this.updateCharacterState(AssistantCharacterState.HIDDEN);
  }
  
  /**
   * Start listening for user input
   */
  public async startListening() {
    try {
      // Update assistant state
      this.setState({ assistantState: ARAssistantState.LISTENING });
      
      // Update character state
      this.updateCharacterState(AssistantCharacterState.LISTENING);
      
      // Start speech recognition
      await this.speechRecognition.start();
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            listening: {
              started: true,
              timestamp: Date.now(),
            },
          },
        }));
      }
    } catch (error) {
      console.error("Error starting listening:", error);
      
      // Update assistant state
      this.setState({ assistantState: ARAssistantState.ERROR });
      
      // Update character state
      this.updateCharacterState(AssistantCharacterState.IDLE);
      
      // Notify error callback
      if (this.props.onError) {
        this.props.onError(error);
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            listening: {
              error,
              timestamp: Date.now(),
            },
          },
        }));
      }
    }
  }
  
  /**
   * Stop listening for user input
   */
  public async stopListening() {
    try {
      // Stop speech recognition
      await this.speechRecognition.stop();
      
      // Update assistant state if we're currently listening
      if (this.state.assistantState === ARAssistantState.LISTENING) {
        this.setState({ assistantState: ARAssistantState.IDLE });
      }
      
      // Update character state if we're currently listening
      if (this.state.characterState === AssistantCharacterState.LISTENING) {
        this.updateCharacterState(AssistantCharacterState.IDLE);
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            listening: {
              stopped: true,
              timestamp: Date.now(),
            },
          },
        }));
      }
    } catch (error) {
      console.error("Error stopping listening:", error);
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            listening: {
              error,
              timestamp: Date.now(),
            },
          },
        }));
      }
    }
  }
  
  /**
   * Stop speaking
   */
  public async stopSpeaking() {
    try {
      // Stop text-to-speech
      await this.textToSpeech.stop();
      
      // Update assistant state if we're currently responding
      if (this.state.assistantState === ARAssistantState.RESPONDING) {
        this.setState({ assistantState: ARAssistantState.IDLE });
      }
      
      // Update character state if we're currently speaking
      if (this.state.characterState === AssistantCharacterState.SPEAKING) {
        this.updateCharacterState(AssistantCharacterState.IDLE);
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            speaking: {
              stopped: true,
              timestamp: Date.now(),
            },
          },
        }));
      }
    } catch (error) {
      console.error("Error stopping speaking:", error);
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            speaking: {
              error,
              timestamp: Date.now(),
            },
          },
        }));
      }
    }
  }
  
  /**
   * Speak a message
   * @param text The text to speak
   */
  public async speak(text: string) {
    try {
      // Update assistant state
      this.setState({ assistantState: ARAssistantState.RESPONDING });
      
      // Update character state
      this.updateCharacterState(AssistantCharacterState.SPEAKING);
      
      // Notify speak callback
      if (this.props.onSpeak) {
        this.props.onSpeak(text);
      }
      
      // Speak the text
      await this.textToSpeech.speak(text);
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            speaking: {
              text,
              timestamp: Date.now(),
            },
          },
        }));
      }
    } catch (error) {
      console.error("Error speaking:", error);
      
      // Update assistant state
      this.setState({ assistantState: ARAssistantState.ERROR });
      
      // Update character state
      this.updateCharacterState(AssistantCharacterState.IDLE);
      
      // Notify error callback
      if (this.props.onError) {
        this.props.onError(error);
      }
      
      // Update debug info
      if (this.props.config?.debug) {
        this.setState(prevState => ({
          debugInfo: {
            ...prevState.debugInfo,
            speaking: {
              text,
              error,
              timestamp: Date.now(),
            },
          },
        }));
      }
    }
  }
  
  /**
   * Process a text input directly (without speech recognition)
   * @param text The text to process
   */
  public async processText(text: string) {
    // Process the text input
    await this.processUserInput(text);
  }
  
  /**
   * Render the assistant UI
   */
  private renderUI() {
    if (!this.props.config?.showUI) return null;
    
    return (
      <ViroFlexView
        position={[0, -0.5, -1]}
        width={2}
        height={0.3}
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 0.05,
        }}
        backgroundColor="#00000080"
      >
        {/* Assistant state */}
        <ViroText
          text={`State: ${this.state.assistantState}`}
          style={{
            fontFamily: "Arial",
            fontSize: 12,
            color: "#FFFFFF",
            textAlign: "center",
          }}
          width={1.9}
          height={0.1}
        />
        
        {/* Recognized speech */}
        {this.state.recognizedSpeech && (
          <ViroText
            text={`You: ${this.state.recognizedSpeech}`}
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#AAFFAA",
              textAlign: "center",
            }}
            width={1.9}
            height={0.1}
          />
        )}
        
        {/* Assistant response */}
        {this.state.lastResponse && (
          <ViroText
            text={`${this.props.config?.name || "Assistant"}: ${this.state.lastResponse}`}
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#AAAAFF",
              textAlign: "center",
            }}
            width={1.9}
            height={0.1}
          />
        )}
      </ViroFlexView>
    );
  }
  
  /**
   * Render debug information
   */
  private renderDebugInfo() {
    if (!this.props.config?.debug) return null;
    
    return (
      <ViroFlexView
        position={[0, 0.5, -1]}
        width={2}
        height={0.5}
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 0.05,
        }}
        backgroundColor="#00000080"
      >
        <ViroText
          text={`Assistant: ${this.state.assistantState} | Character: ${this.state.characterState}`}
          style={{
            fontFamily: "Arial",
            fontSize: 10,
            color: "#FFFFFF",
            textAlign: "center",
          }}
          width={1.9}
          height={0.1}
        />
        
        <ViroText
          text={`Speech: ${this.state.speechState} | TTS: ${this.state.ttsState} | Conversation: ${this.state.conversationState}`}
          style={{
            fontFamily: "Arial",
            fontSize: 10,
            color: "#FFFFFF",
            textAlign: "center",
          }}
          width={1.9}
          height={0.1}
        />
        
        <ViroText
          text={`Intent: ${this.state.lastIntent || "None"} | Action: ${this.state.lastAction || "None"}`}
          style={{
            fontFamily: "Arial",
            fontSize: 10,
            color: "#FFFFFF",
            textAlign: "center",
          }}
          width={1.9}
          height={0.1}
        />
      </ViroFlexView>
    );
  }
  
  render() {
    const { config } = this.props;
    const { characterState } = this.state;
    
    return (
      <ViroNode>
        {/* AR Assistant Character */}
        <ViroARAssistantCharacter
          ref={this.characterRef}
          type={config?.characterType || AssistantCharacterType.ROBOT}
          state={characterState}
          position={config?.initialPosition || [0, 0, -1]}
          customization={{
            primaryColor: config?.characterCustomization?.primaryColor,
            secondaryColor: config?.characterCustomization?.secondaryColor,
            scale: config?.characterCustomization?.scale,
            showShadow: config?.characterCustomization?.showShadow,
          }}
        />
        
        {/* AR Interaction Manager */}
        <ViroARInteractionManager
          ref={this.interactionManagerRef}
          enableObjectRecognition={config?.interaction?.enableObjectRecognition !== false}
          enableGestureRecognition={config?.interaction?.enableGestureRecognition !== false}
          enableVoiceCommands={config?.interaction?.enableVoiceCommands || false}
          showVisualFeedback={config?.interaction?.showVisualFeedback !== false}
          debug={config?.debug || false}
        />
        
        {/* Assistant UI */}
        {this.renderUI()}
        
        {/* Debug Information */}
        {this.renderDebugInfo()}
        
        {/* Children Components */}
        {this.props.children}
      </ViroNode>
    );
  }
}

export default ViroARAssistant;