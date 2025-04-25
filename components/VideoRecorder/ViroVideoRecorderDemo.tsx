/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroVideoRecorderDemo
 */

import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert, Modal, ScrollView, Image, TextInput, Slider } from "react-native";
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroConstants,
  ViroARPlane,
  ViroMaterials,
  ViroNode,
  ViroAnimations,
  ViroFlexView,
  ViroImage,
  ViroButton,
} from "../..";
import { ViroVideoRecorder } from "./ViroVideoRecorder";
import { 
  ViroVideoRecorderService, 
  VideoRecorderConfig, 
  RecordingStatus,
  VideoInfo,
  EditingProject,
  EditOperation,
  ExportOptions,
  ExportProgress,
  ExportResult,
  AIEditingOptions,
  AIEditingResult
} from "./ViroVideoRecorderService";

// Register materials for the demo
ViroMaterials.createMaterials({
  videoCard: {
    diffuseColor: "#FFFFFF",
    diffuseTexture: require("../Resources/card_texture.jpg"),
  },
  recordButton: {
    diffuseColor: "#FF0000",
  },
  stopButton: {
    diffuseColor: "#000000",
  },
  pauseButton: {
    diffuseColor: "#FFA500",
  },
  editButton: {
    diffuseColor: "#2196F3",
  },
  aiButton: {
    diffuseColor: "#9C27B0",
  },
});

// Register animations for the demo
ViroAnimations.registerAnimations({
  fadeIn: {
    properties: {
      opacity: 1.0,
    },
    duration: 500,
  },
  fadeOut: {
    properties: {
      opacity: 0.0,
    },
    duration: 500,
  },
  scaleUp: {
    properties: {
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
    },
    duration: 500,
    easing: "bounce",
  },
  scaleDown: {
    properties: {
      scaleX: 0.5,
      scaleY: 0.5,
      scaleZ: 0.5,
    },
    duration: 500,
    easing: "bounce",
  },
  showVideoCard: [
    ["fadeIn", "scaleUp"],
  ],
  hideVideoCard: [
    ["fadeOut", "scaleDown"],
  ],
});

type Props = {
  apiKey?: string;
  useOpenAI?: boolean;
  openAIApiKey?: string;
  openAIModel?: string;
  maxRecordingDuration?: number;
  videoQuality?: "low" | "medium" | "high" | "ultra";
  recordAudio?: boolean;
  saveToGallery?: boolean;
};

type State = {
  trackingInitialized: boolean;
  isRecording: boolean;
  isPaused: boolean;
  recordingStatus: RecordingStatus | null;
  currentVideoInfo: VideoInfo | null;
  currentProject: EditingProject | null;
  isExporting: boolean;
  exportProgress: ExportProgress | null;
  showVideoInfo: boolean;
  showEditingOptions: boolean;
  showExportOptions: boolean;
  showAIOptions: boolean;
  aiPrompt: string;
  aiStyle: string;
  aiIntensity: number;
  exportQuality: "low" | "medium" | "high" | "ultra";
  exportFormat: "mp4" | "mov" | "webm" | "gif";
  includeAudio: boolean;
  projectName: string;
};

/**
 * AR Scene component for Video Recorder demo
 */
class VideoRecorderARScene extends React.Component<Props, State> {
  private videoRecorderService = ViroVideoRecorderService.getInstance();
  private videoRecorderRef = React.createRef<ViroVideoRecorder>();

  constructor(props: Props) {
    super(props);
    this.state = {
      trackingInitialized: false,
      isRecording: false,
      isPaused: false,
      recordingStatus: null,
      currentVideoInfo: null,
      currentProject: null,
      isExporting: false,
      exportProgress: null,
      showVideoInfo: false,
      showEditingOptions: false,
      showExportOptions: false,
      showAIOptions: false,
      aiPrompt: "",
      aiStyle: "",
      aiIntensity: 0.7,
      exportQuality: "high",
      exportFormat: "mp4",
      includeAudio: true,
      projectName: `Project ${new Date().toLocaleString()}`,
    };
  }

  componentDidMount() {
    // Initialize the Video Recorder service
    this.videoRecorderService.initialize({
      apiKey: this.props.apiKey,
      useOpenAI: this.props.useOpenAI,
      openAIApiKey: this.props.openAIApiKey,
      openAIModel: this.props.openAIModel,
      maxRecordingDuration: this.props.maxRecordingDuration,
      videoQuality: this.props.videoQuality,
      recordAudio: this.props.recordAudio,
      saveToGallery: this.props.saveToGallery,
    });
  }

  _onInitialized = (state: string, reason: string) => {
    if (state === ViroConstants.TRACKING_NORMAL) {
      this.setState({
        trackingInitialized: true,
      });
    } else if (state === ViroConstants.TRACKING_NONE) {
      this.setState({
        trackingInitialized: false,
      });
    }
  };

  _onRecordingStart = () => {
    this.setState({
      isRecording: true,
      isPaused: false,
    });
    
    Alert.alert("Recording", "Recording started");
  };

  _onRecordingStop = (videoInfo: VideoInfo) => {
    this.setState({
      isRecording: false,
      isPaused: false,
      currentVideoInfo: videoInfo,
      showVideoInfo: true,
    });
    
    Alert.alert(
      "Recording Stopped",
      `Video saved: ${videoInfo.duration.toFixed(1)} seconds, ${(videoInfo.size / (1024 * 1024)).toFixed(1)} MB`,
      [
        {
          text: "OK",
          onPress: () => {
            // Show video info modal
            this.setState({ showVideoInfo: true });
          },
        },
      ]
    );
  };

  _onRecordingPause = () => {
    this.setState({
      isPaused: true,
    });
    
    Alert.alert("Recording", "Recording paused");
  };

  _onRecordingResume = () => {
    this.setState({
      isPaused: false,
    });
    
    Alert.alert("Recording", "Recording resumed");
  };

  _onRecordingStatusUpdate = (status: RecordingStatus) => {
    this.setState({
      recordingStatus: status,
    });
  };

  _onProjectCreated = (project: EditingProject) => {
    this.setState({
      currentProject: project,
      showEditingOptions: true,
    });
    
    Alert.alert("Project Created", `Project "${project.name}" created`);
  };

  _onEditOperationAdded = (operation: EditOperation) => {
    Alert.alert("Edit Operation Added", `Added ${operation.type} operation`);
  };

  _onEditOperationRemoved = (operationId: string) => {
    Alert.alert("Edit Operation Removed", `Removed operation ${operationId}`);
  };

  _onEditOperationUpdated = (operation: EditOperation) => {
    Alert.alert("Edit Operation Updated", `Updated ${operation.type} operation`);
  };

  _onProjectExported = (result: ExportResult) => {
    this.setState({
      isExporting: false,
      exportProgress: null,
      showExportOptions: false,
    });
    
    Alert.alert(
      "Export Complete",
      `Video exported: ${result.duration.toFixed(1)} seconds, ${(result.size / (1024 * 1024)).toFixed(1)} MB`,
      [
        {
          text: "OK",
          onPress: () => {
            // Close export options modal
            this.setState({ showExportOptions: false });
          },
        },
      ]
    );
  };

  _onExportProgress = (progress: ExportProgress) => {
    this.setState({
      exportProgress: progress,
    });
  };

  _onAIEditingApplied = (result: AIEditingResult) => {
    this.setState({
      showAIOptions: false,
    });
    
    Alert.alert(
      "AI Editing Applied",
      `Applied ${result.operations?.length || 0} AI operations`,
      [
        {
          text: "OK",
          onPress: () => {
            // Close AI options modal
            this.setState({ showAIOptions: false });
          },
        },
      ]
    );
  };

  _startRecording = () => {
    if (this.videoRecorderRef.current) {
      this.videoRecorderRef.current.startRecording();
    }
  };

  _stopRecording = () => {
    if (this.videoRecorderRef.current) {
      this.videoRecorderRef.current.stopRecording();
    }
  };

  _pauseRecording = () => {
    if (this.videoRecorderRef.current) {
      this.videoRecorderRef.current.pauseRecording();
    }
  };

  _resumeRecording = () => {
    if (this.videoRecorderRef.current) {
      this.videoRecorderRef.current.resumeRecording();
    }
  };

  _createEditingProject = () => {
    if (this.videoRecorderRef.current && this.state.currentVideoInfo) {
      this.videoRecorderRef.current.createEditingProject(
        this.state.currentVideoInfo.id,
        this.state.projectName
      );
    }
  };

  _applyAIEditing = () => {
    if (this.videoRecorderRef.current) {
      this.videoRecorderRef.current.applyAIEditing({
        prompt: this.state.aiPrompt,
        style: this.state.aiStyle,
        intensity: this.state.aiIntensity,
      });
    }
  };

  _exportProject = () => {
    if (this.videoRecorderRef.current) {
      this.setState({ isExporting: true });
      
      this.videoRecorderRef.current.exportProject({
        quality: this.state.exportQuality,
        format: this.state.exportFormat,
        includeAudio: this.state.includeAudio,
        saveToGallery: this.props.saveToGallery,
      });
    }
  };

  _renderVideoInfoModal() {
    const { currentVideoInfo, showVideoInfo } = this.state;
    
    if (!currentVideoInfo) {
      return null;
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showVideoInfo}
        onRequestClose={() => this.setState({ showVideoInfo: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Video Information</Text>
            
            <View style={styles.videoInfoItem}>
              <Text style={styles.videoInfoLabel}>Duration:</Text>
              <Text style={styles.videoInfoValue}>{currentVideoInfo.duration.toFixed(1)} seconds</Text>
            </View>
            
            <View style={styles.videoInfoItem}>
              <Text style={styles.videoInfoLabel}>Size:</Text>
              <Text style={styles.videoInfoValue}>{(currentVideoInfo.size / (1024 * 1024)).toFixed(1)} MB</Text>
            </View>
            
            <View style={styles.videoInfoItem}>
              <Text style={styles.videoInfoLabel}>Resolution:</Text>
              <Text style={styles.videoInfoValue}>{currentVideoInfo.resolution.width} x {currentVideoInfo.resolution.height}</Text>
            </View>
            
            <View style={styles.videoInfoItem}>
              <Text style={styles.videoInfoLabel}>Format:</Text>
              <Text style={styles.videoInfoValue}>{currentVideoInfo.format}</Text>
            </View>
            
            <View style={styles.videoInfoItem}>
              <Text style={styles.videoInfoLabel}>Frame Rate:</Text>
              <Text style={styles.videoInfoValue}>{currentVideoInfo.frameRate} fps</Text>
            </View>
            
            <View style={styles.videoInfoItem}>
              <Text style={styles.videoInfoLabel}>Has Audio:</Text>
              <Text style={styles.videoInfoValue}>{currentVideoInfo.hasAudio ? "Yes" : "No"}</Text>
            </View>
            
            <View style={styles.videoInfoItem}>
              <Text style={styles.videoInfoLabel}>Created:</Text>
              <Text style={styles.videoInfoValue}>{new Date(currentVideoInfo.createdAt).toLocaleString()}</Text>
            </View>
            
            <Text style={styles.inputLabel}>Project Name:</Text>
            <TextInput
              style={styles.textInput}
              value={this.state.projectName}
              onChangeText={text => this.setState({ projectName: text })}
              placeholder="Enter project name"
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => this.setState({ showVideoInfo: false })}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => {
                  this._createEditingProject();
                  this.setState({ showVideoInfo: false });
                }}
              >
                <Text style={styles.buttonText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  _renderEditingOptionsModal() {
    const { currentProject, showEditingOptions } = this.state;
    
    if (!currentProject) {
      return null;
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditingOptions}
        onRequestClose={() => this.setState({ showEditingOptions: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editing Options</Text>
            
            <Text style={styles.projectName}>{currentProject.name}</Text>
            
            <View style={styles.editingOptionsContainer}>
              <TouchableOpacity
                style={styles.editingOptionButton}
                onPress={() => {
                  this.setState({ 
                    showEditingOptions: false,
                    showAIOptions: true,
                  });
                }}
              >
                <Text style={styles.editingOptionButtonText}>AI Editing</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.editingOptionButton}
                onPress={() => {
                  // Add trim operation
                  if (this.videoRecorderRef.current) {
                    this.videoRecorderRef.current.addEditOperation({
                      type: "trim",
                      params: {
                        startTime: 0,
                        endTime: currentProject.duration * 0.8, // Trim to 80% of original duration
                      },
                    });
                  }
                }}
              >
                <Text style={styles.editingOptionButtonText}>Trim</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.editingOptionButton}
                onPress={() => {
                  // Add filter operation
                  if (this.videoRecorderRef.current) {
                    this.videoRecorderRef.current.addEditOperation({
                      type: "filter",
                      params: {
                        name: "Vintage",
                        intensity: 0.7,
                      },
                    });
                  }
                }}
              >
                <Text style={styles.editingOptionButtonText}>Add Filter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.editingOptionButton}
                onPress={() => {
                  // Add text operation
                  if (this.videoRecorderRef.current) {
                    this.videoRecorderRef.current.addEditOperation({
                      type: "text",
                      params: {
                        text: "AR Video",
                        position: {
                          x: 0.5,
                          y: 0.1,
                        },
                        color: "#FFFFFF",
                        fontSize: 32,
                        backgroundColor: "#00000080",
                        opacity: 0.9,
                      },
                    });
                  }
                }}
              >
                <Text style={styles.editingOptionButtonText}>Add Text</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.editingOptionButton}
                onPress={() => {
                  // Add speed operation
                  if (this.videoRecorderRef.current) {
                    this.videoRecorderRef.current.addEditOperation({
                      type: "speed",
                      params: {
                        speed: 1.5, // 1.5x speed
                      },
                    });
                  }
                }}
              >
                <Text style={styles.editingOptionButtonText}>Speed Up</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.editingOptionButton}
                onPress={() => {
                  // Add enhance operation
                  if (this.videoRecorderRef.current) {
                    this.videoRecorderRef.current.addEditOperation({
                      type: "enhance",
                      params: {
                        brightness: 0.1,
                        contrast: 0.2,
                        saturation: 0.1,
                        sharpness: 0.3,
                      },
                    });
                  }
                }}
              >
                <Text style={styles.editingOptionButtonText}>Enhance</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.editingOptionButton}
                onPress={() => {
                  // Add stabilize operation
                  if (this.videoRecorderRef.current) {
                    this.videoRecorderRef.current.addEditOperation({
                      type: "stabilize",
                      params: {
                        intensity: 0.7,
                      },
                    });
                  }
                }}
              >
                <Text style={styles.editingOptionButtonText}>Stabilize</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.editingOptionButton}
                onPress={() => {
                  // Generate preview
                  if (this.videoRecorderRef.current) {
                    this.videoRecorderRef.current.generatePreview()
                      .then(previewUrl => {
                        if (previewUrl) {
                          Alert.alert("Preview Generated", `Preview available at: ${previewUrl}`);
                        }
                      });
                  }
                }}
              >
                <Text style={styles.editingOptionButtonText}>Generate Preview</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => this.setState({ showEditingOptions: false })}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.exportButton]}
                onPress={() => {
                  this.setState({ 
                    showEditingOptions: false,
                    showExportOptions: true,
                  });
                }}
              >
                <Text style={styles.buttonText}>Export</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  _renderExportOptionsModal() {
    const { showExportOptions, exportQuality, exportFormat, includeAudio, isExporting, exportProgress } = this.state;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showExportOptions}
        onRequestClose={() => this.setState({ showExportOptions: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Options</Text>
            
            <Text style={styles.inputLabel}>Quality:</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  exportQuality === "low" && styles.pickerOptionSelected,
                ]}
                onPress={() => this.setState({ exportQuality: "low" })}
              >
                <Text style={styles.pickerOptionText}>Low</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  exportQuality === "medium" && styles.pickerOptionSelected,
                ]}
                onPress={() => this.setState({ exportQuality: "medium" })}
              >
                <Text style={styles.pickerOptionText}>Medium</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  exportQuality === "high" && styles.pickerOptionSelected,
                ]}
                onPress={() => this.setState({ exportQuality: "high" })}
              >
                <Text style={styles.pickerOptionText}>High</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  exportQuality === "ultra" && styles.pickerOptionSelected,
                ]}
                onPress={() => this.setState({ exportQuality: "ultra" })}
              >
                <Text style={styles.pickerOptionText}>Ultra</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Format:</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  exportFormat === "mp4" && styles.pickerOptionSelected,
                ]}
                onPress={() => this.setState({ exportFormat: "mp4" })}
              >
                <Text style={styles.pickerOptionText}>MP4</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  exportFormat === "mov" && styles.pickerOptionSelected,
                ]}
                onPress={() => this.setState({ exportFormat: "mov" })}
              >
                <Text style={styles.pickerOptionText}>MOV</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  exportFormat === "webm" && styles.pickerOptionSelected,
                ]}
                onPress={() => this.setState({ exportFormat: "webm" })}
              >
                <Text style={styles.pickerOptionText}>WebM</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  exportFormat === "gif" && styles.pickerOptionSelected,
                ]}
                onPress={() => this.setState({ exportFormat: "gif" })}
              >
                <Text style={styles.pickerOptionText}>GIF</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Include Audio:</Text>
              <Switch
                value={includeAudio}
                onValueChange={value => this.setState({ includeAudio: value })}
                trackColor={{ false: "#CCCCCC", true: "#81C784" }}
                thumbColor={includeAudio ? "#4CAF50" : "#F5F5F5"}
              />
            </View>
            
            {isExporting && exportProgress && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {exportProgress.currentOperation}: {Math.round(exportProgress.progress * 100)}%
                </Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${Math.round(exportProgress.progress * 100)}%` }
                    ]} 
                  />
                </View>
                {exportProgress.timeRemaining !== undefined && (
                  <Text style={styles.progressTimeText}>
                    Time remaining: {exportProgress.timeRemaining} seconds
                  </Text>
                )}
              </View>
            )}
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => this.setState({ showExportOptions: false })}
                disabled={isExporting}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.exportButton]}
                onPress={this._exportProject}
                disabled={isExporting}
              >
                <Text style={styles.buttonText}>
                  {isExporting ? "Exporting..." : "Export"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  _renderAIOptionsModal() {
    const { showAIOptions, aiPrompt, aiStyle, aiIntensity } = this.state;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAIOptions}
        onRequestClose={() => this.setState({ showAIOptions: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>AI Editing Options</Text>
            
            <Text style={styles.inputLabel}>Prompt:</Text>
            <TextInput
              style={styles.textInput}
              value={aiPrompt}
              onChangeText={text => this.setState({ aiPrompt: text })}
              placeholder="Enter AI prompt (e.g., 'Make it look cinematic')"
              multiline
            />
            
            <Text style={styles.inputLabel}>Style:</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  aiStyle === "Cartoon" && styles.pickerOptionSelected,
                ]}
                onPress={() => this.setState({ aiStyle: "Cartoon" })}
              >
                <Text style={styles.pickerOptionText}>Cartoon</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  aiStyle === "Cinematic" && styles.pickerOptionSelected,
                ]}
                onPress={() => this.setState({ aiStyle: "Cinematic" })}
              >
                <Text style={styles.pickerOptionText}>Cinematic</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  aiStyle === "Vintage" && styles.pickerOptionSelected,
                ]}
                onPress={() => this.setState({ aiStyle: "Vintage" })}
              >
                <Text style={styles.pickerOptionText}>Vintage</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Intensity: {aiIntensity.toFixed(1)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.1}
              maximumValue={1.0}
              step={0.1}
              value={aiIntensity}
              onValueChange={value => this.setState({ aiIntensity: value })}
              minimumTrackTintColor="#9C27B0"
              maximumTrackTintColor="#CCCCCC"
            />
            
            <View style={styles.aiOptionsContainer}>
              <TouchableOpacity
                style={styles.aiOptionButton}
                onPress={() => {
                  this.setState({ aiPrompt: "Enhance the video quality and make it look professional" });
                }}
              >
                <Text style={styles.aiOptionButtonText}>Enhance Quality</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.aiOptionButton}
                onPress={() => {
                  this.setState({ aiPrompt: "Add captions to the video" });
                }}
              >
                <Text style={styles.aiOptionButtonText}>Add Captions</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.aiOptionButton}
                onPress={() => {
                  this.setState({ aiPrompt: "Create a highlight reel from the video" });
                }}
              >
                <Text style={styles.aiOptionButtonText}>Create Highlights</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.aiOptionButton}
                onPress={() => {
                  this.setState({ aiPrompt: "Remove background noise from the audio" });
                }}
              >
                <Text style={styles.aiOptionButtonText}>Clean Audio</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => this.setState({ showAIOptions: false })}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.aiButton]}
                onPress={this._applyAIEditing}
              >
                <Text style={styles.buttonText}>Apply AI Editing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  _renderControlButtons() {
    const { isRecording, isPaused, currentProject } = this.state;
    
    return (
      <View style={styles.controlButtonsContainer}>
        {!isRecording ? (
          <TouchableOpacity
            style={[styles.controlButton, styles.recordButton]}
            onPress={this._startRecording}
          >
            <Text style={styles.controlButtonText}>Record</Text>
          </TouchableOpacity>
        ) : isPaused ? (
          <>
            <TouchableOpacity
              style={[styles.controlButton, styles.resumeButton]}
              onPress={this._resumeRecording}
            >
              <Text style={styles.controlButtonText}>Resume</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={this._stopRecording}
            >
              <Text style={styles.controlButtonText}>Stop</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton]}
              onPress={this._pauseRecording}
            >
              <Text style={styles.controlButtonText}>Pause</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={this._stopRecording}
            >
              <Text style={styles.controlButtonText}>Stop</Text>
            </TouchableOpacity>
          </>
        )}
        
        {currentProject && (
          <TouchableOpacity
            style={[styles.controlButton, styles.editButton]}
            onPress={() => this.setState({ showEditingOptions: true })}
          >
            <Text style={styles.controlButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  _renderStatusBar() {
    const { recordingStatus, isRecording, isPaused, currentProject } = this.state;
    
    let statusText = "Ready to record";
    
    if (isRecording) {
      if (isPaused) {
        statusText = "Recording paused";
      } else if (recordingStatus) {
        const minutes = Math.floor(recordingStatus.duration / 60);
        const seconds = Math.floor(recordingStatus.duration % 60);
        statusText = `Recording: ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      } else {
        statusText = "Recording...";
      }
    } else if (currentProject) {
      statusText = `Editing: ${currentProject.name}`;
    }
    
    return (
      <View style={styles.statusBarContainer}>
        <Text style={styles.statusBarText}>{statusText}</Text>
      </View>
    );
  }

  _onSceneTap = () => {
    // Handle scene tap if needed
  };

  render() {
    return (
      <View style={styles.container}>
        <ViroARScene onTrackingUpdated={this._onInitialized} onClick={this._onSceneTap}>
          {/* Show loading text if tracking not initialized */}
          {!this.state.trackingInitialized && (
            <ViroText
              text="Initializing AR..."
              position={[0, 0, -1]}
              style={{
                fontSize: 20,
                color: "#ffffff",
                textAlignVertical: "center",
                textAlign: "center",
              }}
            />
          )}
          
          {/* Video Recorder component */}
          <ViroVideoRecorder
            ref={this.videoRecorderRef}
            config={{
              apiKey: this.props.apiKey,
              useOpenAI: this.props.useOpenAI,
              openAIApiKey: this.props.openAIApiKey,
              openAIModel: this.props.openAIModel,
              maxRecordingDuration: this.props.maxRecordingDuration,
              videoQuality: this.props.videoQuality,
              recordAudio: this.props.recordAudio,
              saveToGallery: this.props.saveToGallery,
            }}
            enabled={this.state.trackingInitialized}
            showRecordingIndicator={true}
            recordingIndicatorColor="#FF0000"
            recordingIndicatorSize={0.1}
            recordingIndicatorPosition={[0, 0.8, -1]}
            recordingIndicatorAnimation="pulse"
            onRecordingStart={this._onRecordingStart}
            onRecordingStop={this._onRecordingStop}
            onRecordingPause={this._onRecordingPause}
            onRecordingResume={this._onRecordingResume}
            onRecordingStatusUpdate={this._onRecordingStatusUpdate}
            onProjectCreated={this._onProjectCreated}
            onEditOperationAdded={this._onEditOperationAdded}
            onEditOperationRemoved={this._onEditOperationRemoved}
            onEditOperationUpdated={this._onEditOperationUpdated}
            onProjectExported={this._onProjectExported}
            onExportProgress={this._onExportProgress}
            onAIEditingApplied={this._onAIEditingApplied}
            autoCreateProject={false}
            autoApplyAIEditing={false}
          />
        </ViroARScene>
        
        {this._renderControlButtons()}
        {this._renderStatusBar()}
        {this._renderVideoInfoModal()}
        {this._renderEditingOptionsModal()}
        {this._renderExportOptionsModal()}
        {this._renderAIOptionsModal()}
      </View>
    );
  }
}

/**
 * Main component for the Video Recorder demo
 */
export class ViroVideoRecorderDemo extends React.Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <ViroARSceneNavigator
          initialScene={{
            scene: VideoRecorderARScene,
          }}
          viroAppProps={this.props}
          autofocus={true}
          style={styles.arView}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  controlButtonsContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
  },
  controlButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#FF0000',
  },
  stopButton: {
    backgroundColor: '#000000',
  },
  pauseButton: {
    backgroundColor: '#FFA500',
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  exportButton: {
    backgroundColor: '#2196F3',
  },
  aiButton: {
    backgroundColor: '#9C27B0',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  statusBarText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  videoInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  videoInfoLabel: {
    fontSize: 16,
    color: '#333333',
  },
  videoInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  editingOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  editingOptionButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  editingOptionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  pickerOption: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  pickerOptionText: {
    color: '#333333',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333333',
  },
  progressContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#EEEEEE',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  progressTimeText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    color: '#666666',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 15,
  },
  aiOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  aiOptionButton: {
    backgroundColor: '#9C27B0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  aiOptionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});