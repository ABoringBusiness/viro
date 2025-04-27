/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroARInteractionDemo
 */

import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { ViroARScene } from "../AR/ViroARScene";
import { ViroARSceneNavigator } from "../AR/ViroARSceneNavigator";
import { ViroARPlaneSelector } from "../AR/ViroARPlaneSelector";
import { ViroNode } from "../ViroNode";
import { ViroText } from "../ViroText";
import { ViroFlexView } from "../ViroFlexView";
import { Viro3DObject } from "../Viro3DObject";
import { ViroARInteractionManager, InteractionType, InteractionEvent, RecognizedObject } from "./ViroARInteractionManager";
import { ViroARObjectInteraction, ObjectInteractionMode } from "./ViroARObjectInteraction";
import { ViroGestureRecognizer, GestureType, GestureEvent } from "./ViroGestureRecognizer";
import { ViroVoiceInteraction, VoiceInteractionState, VoiceInteractionResult } from "./ViroVoiceInteraction";

interface DemoState {
  showAR: boolean;
  recognizedObjects: RecognizedObject[];
  selectedObject: string | null;
  interactionMode: ObjectInteractionMode;
  lastInteraction: InteractionEvent | null;
  lastVoiceCommand: string | null;
  voiceInteractionState: VoiceInteractionState;
  showDebug: boolean;
  debugInfo: { [key: string]: any };
}

/**
 * ViroARInteractionDemo is a component that demonstrates the AR Interaction Enhancement module.
 */
export const ViroARInteractionDemo: React.FC = () => {
  const [state, setState] = React.useState<DemoState>({
    showAR: false,
    recognizedObjects: [],
    selectedObject: null,
    interactionMode: ObjectInteractionMode.NONE,
    lastInteraction: null,
    lastVoiceCommand: null,
    voiceInteractionState: VoiceInteractionState.IDLE,
    showDebug: false,
    debugInfo: {},
  });
  
  const gestureRecognizer = React.useRef<ViroGestureRecognizer | null>(null);
  const voiceInteraction = React.useRef<ViroVoiceInteraction | null>(null);
  
  React.useEffect(() => {
    // Initialize gesture recognizer
    gestureRecognizer.current = ViroGestureRecognizer.getInstance();
    
    // Initialize voice interaction
    voiceInteraction.current = ViroVoiceInteraction.getInstance({
      continuousListening: false,
      useNLU: true,
      showVisualFeedback: true,
      playAudioFeedback: true,
    });
    
    // Set up voice interaction state callback
    const voiceStateUnregister = voiceInteraction.current.registerStateCallback((state) => {
      setState(prevState => ({
        ...prevState,
        voiceInteractionState: state,
      }));
    });
    
    // Set up voice interaction result callback
    const voiceResultUnregister = voiceInteraction.current.registerCallback((result) => {
      handleVoiceResult(result);
    });
    
    // Clean up on unmount
    return () => {
      if (gestureRecognizer.current) {
        gestureRecognizer.current.release();
      }
      
      if (voiceInteraction.current) {
        voiceInteraction.current.release();
      }
      
      voiceStateUnregister();
      voiceResultUnregister();
    };
  }, []);
  
  /**
   * Handle object recognition
   */
  const handleObjectRecognized = (object: RecognizedObject) => {
    setState(prevState => ({
      ...prevState,
      recognizedObjects: [...prevState.recognizedObjects, object],
      debugInfo: {
        ...prevState.debugInfo,
        objectRecognition: {
          lastObject: object,
          totalObjects: prevState.recognizedObjects.length + 1,
        },
      },
    }));
  };
  
  /**
   * Handle object lost
   */
  const handleObjectLost = (objectType: string) => {
    setState(prevState => ({
      ...prevState,
      recognizedObjects: prevState.recognizedObjects.filter(obj => obj.type !== objectType),
      debugInfo: {
        ...prevState.debugInfo,
        objectRecognition: {
          ...prevState.debugInfo.objectRecognition,
          totalObjects: prevState.recognizedObjects.length - 1,
        },
      },
    }));
  };
  
  /**
   * Handle interaction events
   */
  const handleInteraction = (event: InteractionEvent) => {
    setState(prevState => ({
      ...prevState,
      lastInteraction: event,
      debugInfo: {
        ...prevState.debugInfo,
        interaction: {
          type: event.type,
          state: event.state,
          source: event.source,
          target: event.target,
          timestamp: event.timestamp,
        },
      },
    }));
  };
  
  /**
   * Handle gesture recognition
   */
  const handleGestureRecognized = (gesture: string, params: any) => {
    setState(prevState => ({
      ...prevState,
      debugInfo: {
        ...prevState.debugInfo,
        gesture: {
          type: gesture,
          params,
        },
      },
    }));
  };
  
  /**
   * Handle voice interaction results
   */
  const handleVoiceResult = (result: VoiceInteractionResult) => {
    setState(prevState => ({
      ...prevState,
      lastVoiceCommand: result.text,
      debugInfo: {
        ...prevState.debugInfo,
        voice: {
          text: result.text,
          command: result.command,
          action: result.action,
          success: result.success,
        },
      },
    }));
    
    // Handle voice commands
    if (result.action) {
      handleVoiceAction(result.action, result.params);
    }
  };
  
  /**
   * Handle voice actions
   */
  const handleVoiceAction = (action: string, params?: { [key: string]: any }) => {
    switch (action) {
      case "place_object":
        // Handle place object action
        break;
        
      case "remove_object":
        // Handle remove object action
        if (state.selectedObject) {
          setState(prevState => ({
            ...prevState,
            interactionMode: ObjectInteractionMode.DELETE,
          }));
        }
        break;
        
      case "move_object":
        // Handle move object action
        if (state.selectedObject) {
          setState(prevState => ({
            ...prevState,
            interactionMode: ObjectInteractionMode.MOVE,
          }));
        }
        break;
        
      case "rotate_object":
        // Handle rotate object action
        if (state.selectedObject) {
          setState(prevState => ({
            ...prevState,
            interactionMode: ObjectInteractionMode.ROTATE,
          }));
        }
        break;
        
      case "scale_object":
        // Handle scale object action
        if (state.selectedObject) {
          setState(prevState => ({
            ...prevState,
            interactionMode: ObjectInteractionMode.SCALE,
          }));
        }
        break;
        
      case "take_photo":
        // Handle take photo action
        break;
        
      case "show_help":
        // Handle show help action
        break;
    }
  };
  
  /**
   * Handle object selection
   */
  const handleObjectSelect = (objectType: string) => {
    setState(prevState => ({
      ...prevState,
      selectedObject: objectType,
    }));
  };
  
  /**
   * Handle object deselection
   */
  const handleObjectDeselect = (objectType: string) => {
    setState(prevState => ({
      ...prevState,
      selectedObject: null,
      interactionMode: ObjectInteractionMode.NONE,
    }));
  };
  
  /**
   * Toggle voice listening
   */
  const toggleVoiceListening = async () => {
    if (voiceInteraction.current) {
      if (state.voiceInteractionState === VoiceInteractionState.LISTENING) {
        await voiceInteraction.current.stopListening();
      } else {
        await voiceInteraction.current.startListening();
      }
    }
  };
  
  /**
   * Toggle debug mode
   */
  const toggleDebug = () => {
    setState(prevState => ({
      ...prevState,
      showDebug: !prevState.showDebug,
    }));
  };
  
  /**
   * Set interaction mode
   */
  const setInteractionMode = (mode: ObjectInteractionMode) => {
    setState(prevState => ({
      ...prevState,
      interactionMode: mode,
    }));
  };
  
  /**
   * Render AR scene
   */
  const renderARScene = () => {
    return (
      <ViroARScene>
        {/* AR Interaction Manager */}
        <ViroARInteractionManager
          enableObjectRecognition={true}
          objectRecognitionConfidence={0.7}
          enableGestureRecognition={true}
          enableVoiceCommands={true}
          debug={state.showDebug}
          onInteraction={handleInteraction}
          onObjectRecognized={handleObjectRecognized}
          onObjectLost={handleObjectLost}
          onGestureRecognized={handleGestureRecognized}
        >
          {/* Recognized Objects */}
          {state.recognizedObjects.map((object, index) => (
            <ViroARObjectInteraction
              key={`object_${index}`}
              object={object}
              mode={state.selectedObject === object.type ? state.interactionMode : ObjectInteractionMode.NONE}
              showVisualFeedback={true}
              enableSnapping={true}
              enableShadows={true}
              onSelect={handleObjectSelect}
              onDeselect={handleObjectDeselect}
            />
          ))}
          
          {/* Debug Text */}
          {state.showDebug && (
            <ViroNode position={[0, 0, -2]}>
              <ViroText
                text={`Objects: ${state.recognizedObjects.length}\nSelected: ${state.selectedObject || 'None'}\nMode: ${state.interactionMode}\nVoice: ${state.voiceInteractionState}`}
                position={[0, 0.2, 0]}
                scale={[0.2, 0.2, 0.2]}
                style={{ color: '#FFFFFF', fontFamily: 'Arial', fontSize: 20 }}
              />
            </ViroNode>
          )}
          
          {/* Voice Feedback */}
          {state.voiceInteractionState === VoiceInteractionState.LISTENING && (
            <ViroNode position={[0, 0, -1]}>
              <ViroText
                text="Listening..."
                position={[0, 0.5, 0]}
                scale={[0.5, 0.5, 0.5]}
                style={{ color: '#00AAFF', fontFamily: 'Arial', fontSize: 24 }}
              />
            </ViroNode>
          )}
          
          {/* Last Voice Command */}
          {state.lastVoiceCommand && (
            <ViroNode position={[0, 0, -1]}>
              <ViroText
                text={`"${state.lastVoiceCommand}"`}
                position={[0, 0.3, 0]}
                scale={[0.3, 0.3, 0.3]}
                style={{ color: '#FFFFFF', fontFamily: 'Arial', fontSize: 18 }}
              />
            </ViroNode>
          )}
        </ViroARInteractionManager>
      </ViroARScene>
    );
  };
  
  /**
   * Render UI controls
   */
  const renderControls = () => {
    return (
      <View style={styles.controlsContainer}>
        {/* Voice Control Button */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            state.voiceInteractionState === VoiceInteractionState.LISTENING && styles.activeButton
          ]}
          onPress={toggleVoiceListening}
        >
          <Text style={styles.buttonText}>
            {state.voiceInteractionState === VoiceInteractionState.LISTENING ? 'Stop Listening' : 'Start Listening'}
          </Text>
        </TouchableOpacity>
        
        {/* Interaction Mode Buttons */}
        <View style={styles.modeButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              state.interactionMode === ObjectInteractionMode.MOVE && styles.activeModeButton
            ]}
            onPress={() => setInteractionMode(ObjectInteractionMode.MOVE)}
          >
            <Text style={styles.modeButtonText}>Move</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              state.interactionMode === ObjectInteractionMode.ROTATE && styles.activeModeButton
            ]}
            onPress={() => setInteractionMode(ObjectInteractionMode.ROTATE)}
          >
            <Text style={styles.modeButtonText}>Rotate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              state.interactionMode === ObjectInteractionMode.SCALE && styles.activeModeButton
            ]}
            onPress={() => setInteractionMode(ObjectInteractionMode.SCALE)}
          >
            <Text style={styles.modeButtonText}>Scale</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              state.interactionMode === ObjectInteractionMode.DELETE && styles.deleteModeButton
            ]}
            onPress={() => setInteractionMode(ObjectInteractionMode.DELETE)}
          >
            <Text style={styles.modeButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
        
        {/* Debug Button */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            state.showDebug && styles.activeButton
          ]}
          onPress={toggleDebug}
        >
          <Text style={styles.buttonText}>
            {state.showDebug ? 'Hide Debug' : 'Show Debug'}
          </Text>
        </TouchableOpacity>
        
        {/* Exit Button */}
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => setState(prevState => ({ ...prevState, showAR: false }))}
        >
          <Text style={styles.buttonText}>Exit</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  if (!state.showAR) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>AR Interaction Enhancement Demo</Text>
        <Text style={styles.description}>
          This demo showcases enhanced AR interactions with object detection, gesture recognition,
          and voice commands. You can interact with recognized objects using touch, gestures, or voice.
        </Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setState(prevState => ({ ...prevState, showAR: true }))}
        >
          <Text style={styles.startButtonText}>Start Demo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <View style={styles.arContainer}>
      <ViroARSceneNavigator
        initialScene={{
          scene: renderARScene,
        }}
        style={styles.arView}
      />
      {renderControls()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333333',
  },
  startButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  arContainer: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(0, 170, 255, 0.7)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: 'rgba(0, 170, 255, 0.7)',
  },
  deleteModeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
  },
  modeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exitButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
});

export default ViroARInteractionDemo;