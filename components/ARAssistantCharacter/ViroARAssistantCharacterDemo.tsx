/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroARAssistantCharacterDemo
 */

import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ViroARScene } from "../AR/ViroARScene";
import { ViroARSceneNavigator } from "../AR/ViroARSceneNavigator";
import { ViroARPlaneSelector } from "../AR/ViroARPlaneSelector";
import { ViroText } from "../ViroText";
import { ViroFlexView } from "../ViroFlexView";
import { ViroNode } from "../ViroNode";
import { ViroARAssistantCharacter, AssistantCharacterState, AssistantCharacterType } from "./ViroARAssistantCharacter";
import { ViroARAssistantLipSync } from "./ViroARAssistantLipSync";
import { ViroTextToSpeech } from "../TextToSpeech";

interface DemoState {
  characterType: AssistantCharacterType;
  characterState: AssistantCharacterState;
  showControls: boolean;
  message: string;
  customization: {
    primaryColor: string;
    showShadow: boolean;
    scale: number;
  };
}

/**
 * Demo scene for the AR Assistant Character
 */
const ARAssistantCharacterDemoScene = () => {
  const [state, setState] = React.useState<DemoState>({
    characterType: AssistantCharacterType.ROBOT,
    characterState: AssistantCharacterState.IDLE,
    showControls: true,
    message: "Tap the character to interact",
    customization: {
      primaryColor: "#88CCFF",
      showShadow: true,
      scale: 1.0,
    },
  });
  
  const lipSyncRef = React.useRef<ViroARAssistantLipSync | null>(null);
  const textToSpeechRef = React.useRef<ViroTextToSpeech | null>(null);
  
  React.useEffect(() => {
    // Initialize lip sync
    lipSyncRef.current = ViroARAssistantLipSync.getInstance({
      intensity: 0.8,
      smoothing: 0.3,
    });
    
    // Initialize text-to-speech
    textToSpeechRef.current = ViroTextToSpeech.getInstance({
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
    });
    
    // Clean up on unmount
    return () => {
      if (lipSyncRef.current) {
        lipSyncRef.current.release();
      }
    };
  }, []);
  
  /**
   * Handle character tap
   */
  const onCharacterTap = async () => {
    // Cycle through states for demo
    const states = [
      AssistantCharacterState.IDLE,
      AssistantCharacterState.LISTENING,
      AssistantCharacterState.THINKING,
      AssistantCharacterState.SPEAKING,
      AssistantCharacterState.POINTING,
      AssistantCharacterState.NODDING,
      AssistantCharacterState.SHAKING_HEAD,
    ];
    
    const currentIndex = states.indexOf(state.characterState);
    const nextIndex = (currentIndex + 1) % states.length;
    const nextState = states[nextIndex];
    
    setState({
      ...state,
      characterState: nextState,
      message: `Character state: ${nextState}`,
    });
    
    // If speaking state, demonstrate lip sync and text-to-speech
    if (nextState === AssistantCharacterState.SPEAKING) {
      const speechText = "Hello! I am your AR assistant. I can help you with various tasks in augmented reality.";
      
      // Start lip sync
      if (lipSyncRef.current) {
        lipSyncRef.current.startLipSync(speechText);
      }
      
      // Start text-to-speech
      if (textToSpeechRef.current) {
        await textToSpeechRef.current.speak(speechText);
      }
    } else {
      // Stop lip sync and speech for other states
      if (lipSyncRef.current) {
        lipSyncRef.current.stopLipSync();
      }
      
      if (textToSpeechRef.current) {
        textToSpeechRef.current.stop();
      }
    }
  };
  
  /**
   * Change character type
   */
  const changeCharacterType = (type: AssistantCharacterType) => {
    setState({
      ...state,
      characterType: type,
      message: `Character type: ${type}`,
    });
  };
  
  /**
   * Toggle shadow
   */
  const toggleShadow = () => {
    setState({
      ...state,
      customization: {
        ...state.customization,
        showShadow: !state.customization.showShadow,
      },
      message: `Shadow: ${!state.customization.showShadow ? 'On' : 'Off'}`,
    });
  };
  
  /**
   * Change character color
   */
  const changeColor = () => {
    const colors = ["#88CCFF", "#FF8888", "#88FF88", "#FFFF88", "#FF88FF"];
    const currentIndex = colors.indexOf(state.customization.primaryColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    
    setState({
      ...state,
      customization: {
        ...state.customization,
        primaryColor: colors[nextIndex],
      },
      message: `Color: ${colors[nextIndex]}`,
    });
  };
  
  /**
   * Change character scale
   */
  const changeScale = () => {
    const scales = [0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = scales.indexOf(state.customization.scale);
    const nextIndex = (currentIndex + 1) % scales.length;
    
    setState({
      ...state,
      customization: {
        ...state.customization,
        scale: scales[nextIndex],
      },
      message: `Scale: ${scales[nextIndex]}`,
    });
  };
  
  /**
   * Handle state change
   */
  const onStateChange = (newState: AssistantCharacterState) => {
    console.log("Character state changed:", newState);
  };
  
  return (
    <ViroARScene>
      {/* AR Plane Selector to place the character */}
      <ViroARPlaneSelector>
        {/* Assistant Character */}
        <ViroARAssistantCharacter
          type={state.characterType}
          state={state.characterState}
          position={[0, 0, 0]}
          scale={[state.customization.scale, state.customization.scale, state.customization.scale]}
          customization={{
            primaryColor: state.customization.primaryColor,
            showShadow: state.customization.showShadow,
          }}
          onTap={onCharacterTap}
          onStateChange={onStateChange}
        />
        
        {/* Information text */}
        <ViroNode position={[0, 0.5, 0]}>
          <ViroText
            text={state.message}
            scale={[0.5, 0.5, 0.5]}
            width={2}
            height={2}
            extrusionDepth={0.1}
            outerStroke={{ type: "Outline", width: 2, color: "#000000" }}
            style={{
              fontFamily: "Arial",
              fontSize: 20,
              color: "#FFFFFF",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
        </ViroNode>
      </ViroARPlaneSelector>
      
      {/* UI Controls */}
      {state.showControls && (
        <ViroFlexView
          position={[0, -1, -2]}
          width={2}
          height={0.5}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 0.1,
          }}
          backgroundColor="#00000080"
        >
          <ViroText
            text="Robot"
            style={{ color: state.characterType === AssistantCharacterType.ROBOT ? "#FFFF00" : "#FFFFFF" }}
            onClick={() => changeCharacterType(AssistantCharacterType.ROBOT)}
          />
          <ViroText
            text="Humanoid"
            style={{ color: state.characterType === AssistantCharacterType.HUMANOID ? "#FFFF00" : "#FFFFFF" }}
            onClick={() => changeCharacterType(AssistantCharacterType.HUMANOID)}
          />
          <ViroText
            text="Abstract"
            style={{ color: state.characterType === AssistantCharacterType.ABSTRACT ? "#FFFF00" : "#FFFFFF" }}
            onClick={() => changeCharacterType(AssistantCharacterType.ABSTRACT)}
          />
          <ViroText
            text="Animal"
            style={{ color: state.characterType === AssistantCharacterType.ANIMAL ? "#FFFF00" : "#FFFFFF" }}
            onClick={() => changeCharacterType(AssistantCharacterType.ANIMAL)}
          />
        </ViroFlexView>
      )}
    </ViroARScene>
  );
};

/**
 * ViroARAssistantCharacterDemo is a component that demonstrates the AR Assistant Character
 */
export const ViroARAssistantCharacterDemo: React.FC = () => {
  const [showAR, setShowAR] = React.useState(false);
  
  if (!showAR) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>AR Assistant Character Demo</Text>
        <Text style={styles.description}>
          This demo showcases the AR Assistant Character component, which displays a 3D character
          in AR that can be animated to show different states like idle, listening, thinking, and speaking.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => setShowAR(true)}>
          <Text style={styles.buttonText}>Start Demo</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.arContainer}>
      <ViroARSceneNavigator
        initialScene={{
          scene: ARAssistantCharacterDemoScene,
        }}
        style={styles.arView}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => setShowAR(false)}>
        <Text style={styles.backButtonText}>Exit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5FCFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#333333",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  arContainer: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ViroARAssistantCharacterDemo;