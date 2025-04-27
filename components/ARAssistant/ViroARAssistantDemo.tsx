/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroARAssistantDemo
 */

import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView } from "react-native";
import { ViroARScene } from "../AR/ViroARScene";
import { ViroARSceneNavigator } from "../AR/ViroARSceneNavigator";
import { ViroARPlaneSelector } from "../AR/ViroARPlaneSelector";
import { ViroNode } from "../ViroNode";
import { ViroText } from "../ViroText";
import { ViroFlexView } from "../ViroFlexView";
import { ViroBox } from "../ViroBox";
import { ViroSphere } from "../ViroSphere";
import { ViroARAssistant, ARAssistantState, ARAssistantConfig } from "./ViroARAssistant";
import { ARAssistantProvider, useARAssistant } from "./ViroARAssistantContext";
import { AssistantCharacterType } from "../ARAssistantCharacter";
import { SpeechRecognitionEngine } from "../SpeechRecognition";
import { TextToSpeechEngine } from "../TextToSpeech";
import { NLUEngine } from "../NaturalLanguageUnderstanding";

/**
 * AR Scene component that uses the AR Assistant
 */
const ARAssistantScene: React.FC = () => {
  const {
    assistantState,
    characterState,
    recognizedSpeech,
    lastResponse,
    activate,
    deactivate,
    startListening,
    stopListening,
    stopSpeaking,
    speak,
    processText,
  } = useARAssistant();
  
  const [textInput, setTextInput] = React.useState("");
  const [placedObjects, setPlacedObjects] = React.useState<{ type: string; position: [number, number, number] }[]>([]);
  
  /**
   * Handle action from the assistant
   */
  const handleAction = (action: string, params: any) => {
    console.log("Action:", action, params);
    
    switch (action) {
      case "place_object":
        // Place an object in the scene
        const objectType = params?.objectType || "cube";
        const position: [number, number, number] = [
          Math.random() * 2 - 1,
          0,
          Math.random() * -2 - 1,
        ];
        
        setPlacedObjects(prev => [...prev, { type: objectType, position }]);
        break;
        
      case "remove_object":
        // Remove an object from the scene
        const objectToRemove = params?.objectType;
        
        if (objectToRemove) {
          setPlacedObjects(prev => prev.filter(obj => obj.type !== objectToRemove));
        }
        break;
        
      case "remove_all_objects":
        // Remove all objects from the scene
        setPlacedObjects([]);
        break;
    }
  };
  
  /**
   * Handle text input submission
   */
  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    
    processText(textInput);
    setTextInput("");
  };
  
  /**
   * Render placed objects
   */
  const renderPlacedObjects = () => {
    return placedObjects.map((object, index) => {
      if (object.type === "cube") {
        return (
          <ViroBox
            key={`object_${index}`}
            position={object.position}
            scale={[0.2, 0.2, 0.2]}
            materials={["objectMaterial"]}
          />
        );
      } else if (object.type === "sphere") {
        return (
          <ViroSphere
            key={`object_${index}`}
            position={object.position}
            radius={0.1}
            materials={["objectMaterial"]}
          />
        );
      }
      
      // Default to a box
      return (
        <ViroBox
          key={`object_${index}`}
          position={object.position}
          scale={[0.2, 0.2, 0.2]}
          materials={["objectMaterial"]}
        />
      );
    });
  };
  
  return (
    <ViroARScene>
      <ViroARPlaneSelector>
        {/* Placed Objects */}
        {renderPlacedObjects()}
        
        {/* Text Input UI */}
        <ViroFlexView
          position={[0, -0.8, -1.5]}
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
          <ViroText
            text={`State: ${assistantState} | Character: ${characterState}`}
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#FFFFFF",
              textAlign: "center",
            }}
            width={1.9}
            height={0.1}
          />
          
          {recognizedSpeech && (
            <ViroText
              text={`You: ${recognizedSpeech}`}
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
          
          {lastResponse && (
            <ViroText
              text={`Assistant: ${lastResponse}`}
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
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};

interface DemoState {
  showAR: boolean;
  config: ARAssistantConfig;
  logs: string[];
}

/**
 * ViroARAssistantDemo is a component that demonstrates the AR Assistant.
 */
export class ViroARAssistantDemo extends React.Component<{}, DemoState> {
  constructor(props: {}) {
    super(props);
    
    this.state = {
      showAR: false,
      config: {
        name: "AR Assistant",
        characterType: AssistantCharacterType.ROBOT,
        characterCustomization: {
          primaryColor: "#88CCFF",
          scale: 1.0,
          showShadow: true,
        },
        speechRecognition: {
          engine: SpeechRecognitionEngine.DEFAULT,
          languageCode: "en-US",
          continuous: false,
          enableWakeWord: false,
        },
        textToSpeech: {
          engine: TextToSpeechEngine.DEFAULT,
          languageCode: "en-US",
          voiceGender: "female",
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        },
        nlu: {
          engine: NLUEngine.DEFAULT,
          confidenceThreshold: 0.5,
          enableEntityRecognition: true,
        },
        interaction: {
          enableObjectRecognition: true,
          enableGestureRecognition: true,
          enableVoiceCommands: false,
          showVisualFeedback: true,
        },
        initialPosition: [0, 0, -1],
        autoActivate: true,
        showUI: true,
        debug: true,
      },
      logs: [],
    };
  }
  
  /**
   * Handle assistant state change
   */
  private handleStateChange = (state: ARAssistantState) => {
    this.addLog(`Assistant state changed: ${state}`);
  };
  
  /**
   * Handle speech recognition
   */
  private handleSpeechRecognized = (text: string) => {
    this.addLog(`Speech recognized: "${text}"`);
  };
  
  /**
   * Handle intent recognition
   */
  private handleIntentRecognized = (intent: string, params: any) => {
    this.addLog(`Intent recognized: ${intent}`);
  };
  
  /**
   * Handle assistant speaking
   */
  private handleSpeak = (text: string) => {
    this.addLog(`Assistant speaking: "${text}"`);
  };
  
  /**
   * Handle assistant action
   */
  private handleAction = (action: string, params: any) => {
    this.addLog(`Action: ${action} with params: ${JSON.stringify(params)}`);
  };
  
  /**
   * Handle assistant error
   */
  private handleError = (error: any) => {
    this.addLog(`Error: ${error.message || JSON.stringify(error)}`);
  };
  
  /**
   * Add a log message
   */
  private addLog = (message: string) => {
    this.setState(prevState => ({
      logs: [...prevState.logs, `[${new Date().toLocaleTimeString()}] ${message}`],
    }));
  };
  
  /**
   * Start the AR demo
   */
  private startARDemo = () => {
    this.setState({ showAR: true });
  };
  
  /**
   * Exit the AR demo
   */
  private exitARDemo = () => {
    this.setState({ showAR: false });
  };
  
  /**
   * Update a configuration value
   */
  private updateConfig = (path: string, value: any) => {
    const pathParts = path.split(".");
    const newConfig = { ...this.state.config };
    
    let current: any = newConfig;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    
    this.setState({ config: newConfig });
  };
  
  /**
   * Render the configuration UI
   */
  private renderConfigUI() {
    const { config } = this.state;
    
    return (
      <View style={styles.configContainer}>
        <Text style={styles.configTitle}>AR Assistant Configuration</Text>
        
        {/* Basic Configuration */}
        <View style={styles.configSection}>
          <Text style={styles.configSectionTitle}>Basic Configuration</Text>
          
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Assistant Name:</Text>
            <TextInput
              style={styles.configInput}
              value={config.name}
              onChangeText={(value) => this.updateConfig("name", value)}
            />
          </View>
          
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Character Type:</Text>
            <View style={styles.configOptions}>
              {Object.values(AssistantCharacterType).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.configOption,
                    config.characterType === type && styles.configOptionSelected,
                  ]}
                  onPress={() => this.updateConfig("characterType", type)}
                >
                  <Text style={styles.configOptionText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Auto Activate:</Text>
            <TouchableOpacity
              style={[
                styles.configToggle,
                config.autoActivate ? styles.configToggleOn : styles.configToggleOff,
              ]}
              onPress={() => this.updateConfig("autoActivate", !config.autoActivate)}
            >
              <Text style={styles.configToggleText}>
                {config.autoActivate ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Show UI:</Text>
            <TouchableOpacity
              style={[
                styles.configToggle,
                config.showUI ? styles.configToggleOn : styles.configToggleOff,
              ]}
              onPress={() => this.updateConfig("showUI", !config.showUI)}
            >
              <Text style={styles.configToggleText}>
                {config.showUI ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Debug Mode:</Text>
            <TouchableOpacity
              style={[
                styles.configToggle,
                config.debug ? styles.configToggleOn : styles.configToggleOff,
              ]}
              onPress={() => this.updateConfig("debug", !config.debug)}
            >
              <Text style={styles.configToggleText}>
                {config.debug ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Character Customization */}
        <View style={styles.configSection}>
          <Text style={styles.configSectionTitle}>Character Customization</Text>
          
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Primary Color:</Text>
            <TextInput
              style={styles.configInput}
              value={config.characterCustomization?.primaryColor}
              onChangeText={(value) => this.updateConfig("characterCustomization.primaryColor", value)}
            />
          </View>
          
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Scale:</Text>
            <TextInput
              style={styles.configInput}
              value={config.characterCustomization?.scale?.toString()}
              onChangeText={(value) => this.updateConfig("characterCustomization.scale", parseFloat(value) || 1.0)}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Show Shadow:</Text>
            <TouchableOpacity
              style={[
                styles.configToggle,
                config.characterCustomization?.showShadow ? styles.configToggleOn : styles.configToggleOff,
              ]}
              onPress={() => this.updateConfig("characterCustomization.showShadow", !config.characterCustomization?.showShadow)}
            >
              <Text style={styles.configToggleText}>
                {config.characterCustomization?.showShadow ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  
  /**
   * Render the logs UI
   */
  private renderLogsUI() {
    return (
      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Event Logs</Text>
        
        <ScrollView style={styles.logsScrollView}>
          {this.state.logs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>
              {log}
            </Text>
          ))}
          
          {this.state.logs.length === 0 && (
            <Text style={styles.noLogsText}>No logs yet. Start the AR demo to see events.</Text>
          )}
        </ScrollView>
      </View>
    );
  }
  
  render() {
    const { showAR, config } = this.state;
    
    if (showAR) {
      return (
        <View style={styles.arContainer}>
          <ARAssistantProvider
            config={config}
            onStateChange={this.handleStateChange}
            onSpeechRecognized={this.handleSpeechRecognized}
            onIntentRecognized={this.handleIntentRecognized}
            onSpeak={this.handleSpeak}
            onAction={this.handleAction}
            onError={this.handleError}
          >
            <ViroARSceneNavigator
              initialScene={{
                scene: ARAssistantScene,
              }}
              style={styles.arView}
            />
            
            <TouchableOpacity
              style={styles.exitButton}
              onPress={this.exitARDemo}
            >
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          </ARAssistantProvider>
        </View>
      );
    }
    
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>AR Assistant Demo</Text>
        <Text style={styles.description}>
          This demo showcases the AR Assistant, which integrates speech recognition, text-to-speech,
          AR character, natural language understanding, and AR interaction enhancement into a
          cohesive AR assistant experience.
        </Text>
        
        {this.renderConfigUI()}
        {this.renderLogsUI()}
        
        <TouchableOpacity
          style={styles.startButton}
          onPress={this.startARDemo}
        >
          <Text style={styles.startButtonText}>Start AR Demo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333333",
  },
  configContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  configSection: {
    marginBottom: 15,
  },
  configSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555555",
  },
  configRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  configLabel: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
  },
  configInput: {
    flex: 2,
    height: 40,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  configOptions: {
    flex: 2,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  configOption: {
    backgroundColor: "#EEEEEE",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  configOptionSelected: {
    backgroundColor: "#4285F4",
  },
  configOptionText: {
    fontSize: 12,
    color: "#333333",
  },
  configToggle: {
    width: 60,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  configToggleOn: {
    backgroundColor: "#4CAF50",
  },
  configToggleOff: {
    backgroundColor: "#F44336",
  },
  configToggleText: {
    color: "white",
    fontWeight: "bold",
  },
  logsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flex: 1,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  logsScrollView: {
    flex: 1,
  },
  logEntry: {
    fontSize: 12,
    color: "#333333",
    marginBottom: 5,
    fontFamily: "monospace",
  },
  noLogsText: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    marginTop: 20,
  },
  startButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  startButtonText: {
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
  exitButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  exitButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ViroARAssistantDemo;