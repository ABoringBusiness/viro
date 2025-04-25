/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroVideoRecorder
 */

"use strict";

import * as React from "react";
import {
  findNodeHandle,
  NativeModules,
  NativeSyntheticEvent,
  requireNativeComponent,
  ViewProps,
} from "react-native";
import { ViroAnimations, ViroAnimation } from "../Animation/ViroAnimations";
import { ViroNode } from "../ViroNode";
import { ViroSphere } from "../ViroSphere";
import { ViroText } from "../ViroText";
import { ViroFlexView } from "../ViroFlexView";
import { ViroImage } from "../ViroImage";
import { ViroARScene } from "../AR/ViroARScene";
import { Viro3DPoint } from "../Types/ViroUtils";
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

// Register animations for video recorder
ViroAnimations.registerAnimations({
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
  pulse: [
    ["scaleUp", "scaleDown"],
  ],
  rotate: {
    properties: {
      rotateY: "+=90",
    },
    duration: 1000,
  },
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
  showRecordingIndicator: [
    ["fadeIn", "pulse"],
  ],
  hideRecordingIndicator: [
    ["fadeOut"],
  ],
});

type Props = ViewProps & {
  /**
   * Video Recorder configuration
   */
  config: VideoRecorderConfig;

  /**
   * Flag to enable/disable video recording
   */
  enabled?: boolean;

  /**
   * Callback when recording starts
   */
  onRecordingStart?: () => void;

  /**
   * Callback when recording stops
   */
  onRecordingStop?: (videoInfo: VideoInfo) => void;

  /**
   * Callback when recording pauses
   */
  onRecordingPause?: () => void;

  /**
   * Callback when recording resumes
   */
  onRecordingResume?: () => void;

  /**
   * Callback when recording status updates
   */
  onRecordingStatusUpdate?: (status: RecordingStatus) => void;

  /**
   * Callback when an editing project is created
   */
  onProjectCreated?: (project: EditingProject) => void;

  /**
   * Callback when an edit operation is added
   */
  onEditOperationAdded?: (operation: EditOperation) => void;

  /**
   * Callback when an edit operation is removed
   */
  onEditOperationRemoved?: (operationId: string) => void;

  /**
   * Callback when an edit operation is updated
   */
  onEditOperationUpdated?: (operation: EditOperation) => void;

  /**
   * Callback when a project is exported
   */
  onProjectExported?: (result: ExportResult) => void;

  /**
   * Callback when export progress updates
   */
  onExportProgress?: (progress: ExportProgress) => void;

  /**
   * Callback when AI editing is applied
   */
  onAIEditingApplied?: (result: AIEditingResult) => void;

  /**
   * Flag to show/hide recording indicator
   */
  showRecordingIndicator?: boolean;

  /**
   * Color of the recording indicator
   */
  recordingIndicatorColor?: string;

  /**
   * Size of the recording indicator
   */
  recordingIndicatorSize?: number;

  /**
   * Position of the recording indicator
   */
  recordingIndicatorPosition?: Viro3DPoint;

  /**
   * Animation name for the recording indicator
   */
  recordingIndicatorAnimation?: string | ViroAnimation;

  /**
   * Custom renderer for recording indicator
   */
  renderRecordingIndicator?: (status: RecordingStatus) => React.ReactNode;

  /**
   * Custom renderer for recording timer
   */
  renderRecordingTimer?: (status: RecordingStatus) => React.ReactNode;

  /**
   * Flag to automatically create an editing project after recording
   */
  autoCreateProject?: boolean;

  /**
   * Flag to automatically apply AI editing after creating a project
   */
  autoApplyAIEditing?: boolean;

  /**
   * AI editing options for automatic AI editing
   */
  aiEditingOptions?: AIEditingOptions;
};

type State = {
  recordingStatus: RecordingStatus | null;
  currentVideoInfo: VideoInfo | null;
  currentProject: EditingProject | null;
  isExporting: boolean;
  exportProgress: ExportProgress | null;
  error: string | null;
};

/**
 * ViroVideoRecorder is a component that provides video recording and AI editing
 * functionality in AR.
 */
export class ViroVideoRecorder extends React.Component<Props, State> {
  _arScene: ViroARScene | null = null;
  _videoRecorderService: ViroVideoRecorderService;
  _statusUpdateInterval: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      recordingStatus: null,
      currentVideoInfo: null,
      currentProject: null,
      isExporting: false,
      exportProgress: null,
      error: null,
    };
    this._videoRecorderService = ViroVideoRecorderService.getInstance();
  }

  async componentDidMount() {
    // Initialize the Video Recorder service
    await this._videoRecorderService.initialize(this.props.config);

    // Start status update interval
    this._startStatusUpdateInterval();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.config !== this.props.config) {
      this._videoRecorderService.initialize(this.props.config);
    }
  }

  componentWillUnmount() {
    this._stopStatusUpdateInterval();
    this._videoRecorderService.release();
  }

  _startStatusUpdateInterval() {
    this._statusUpdateInterval = setInterval(() => {
      const status = this._videoRecorderService.getRecordingStatus();
      
      if (status) {
        this.setState({ recordingStatus: status });
        
        if (this.props.onRecordingStatusUpdate) {
          this.props.onRecordingStatusUpdate(status);
        }
      }
    }, 500);
  }

  _stopStatusUpdateInterval() {
    if (this._statusUpdateInterval) {
      clearInterval(this._statusUpdateInterval);
      this._statusUpdateInterval = null;
    }
  }

  /**
   * Start recording a video
   */
  startRecording = async (): Promise<boolean> => {
    try {
      const result = await this._videoRecorderService.startRecording();
      
      if (result) {
        if (this.props.onRecordingStart) {
          this.props.onRecordingStart();
        }
      }
      
      return result;
    } catch (error) {
      console.error("Failed to start recording:", error);
      this.setState({ error: "Failed to start recording" });
      return false;
    }
  };

  /**
   * Stop recording and return video info
   */
  stopRecording = async (): Promise<VideoInfo | null> => {
    try {
      const videoInfo = await this._videoRecorderService.stopRecording();
      
      this.setState({ 
        recordingStatus: null,
        currentVideoInfo: videoInfo,
      });
      
      if (this.props.onRecordingStop) {
        this.props.onRecordingStop(videoInfo);
      }
      
      // Automatically create an editing project if enabled
      if (this.props.autoCreateProject && videoInfo) {
        this.createEditingProject(videoInfo.id, `Project ${new Date().toLocaleString()}`);
      }
      
      return videoInfo;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      this.setState({ error: "Failed to stop recording" });
      return null;
    }
  };

  /**
   * Pause recording
   */
  pauseRecording = async (): Promise<boolean> => {
    try {
      const result = await this._videoRecorderService.pauseRecording();
      
      if (result && this.props.onRecordingPause) {
        this.props.onRecordingPause();
      }
      
      return result;
    } catch (error) {
      console.error("Failed to pause recording:", error);
      this.setState({ error: "Failed to pause recording" });
      return false;
    }
  };

  /**
   * Resume recording
   */
  resumeRecording = async (): Promise<boolean> => {
    try {
      const result = await this._videoRecorderService.resumeRecording();
      
      if (result && this.props.onRecordingResume) {
        this.props.onRecordingResume();
      }
      
      return result;
    } catch (error) {
      console.error("Failed to resume recording:", error);
      this.setState({ error: "Failed to resume recording" });
      return false;
    }
  };

  /**
   * Create a new editing project from a video
   * @param videoId ID of the video to edit
   * @param name Name of the project
   */
  createEditingProject = async (videoId: string, name: string): Promise<EditingProject | null> => {
    try {
      const project = await this._videoRecorderService.createEditingProject(videoId, name);
      
      this.setState({ currentProject: project });
      
      if (this.props.onProjectCreated) {
        this.props.onProjectCreated(project);
      }
      
      // Automatically apply AI editing if enabled
      if (this.props.autoApplyAIEditing && this.props.aiEditingOptions) {
        this.applyAIEditing(this.props.aiEditingOptions);
      }
      
      return project;
    } catch (error) {
      console.error("Failed to create editing project:", error);
      this.setState({ error: "Failed to create editing project" });
      return null;
    }
  };

  /**
   * Add an edit operation to the current project
   * @param operation Edit operation to add
   */
  addEditOperation = async (operation: Omit<EditOperation, "id" | "createdAt">): Promise<EditOperation | null> => {
    try {
      const result = await this._videoRecorderService.addEditOperation(operation);
      
      if (this.props.onEditOperationAdded) {
        this.props.onEditOperationAdded(result);
      }
      
      return result;
    } catch (error) {
      console.error("Failed to add edit operation:", error);
      this.setState({ error: "Failed to add edit operation" });
      return null;
    }
  };

  /**
   * Remove an edit operation from the current project
   * @param operationId ID of the operation to remove
   */
  removeEditOperation = async (operationId: string): Promise<boolean> => {
    try {
      const result = await this._videoRecorderService.removeEditOperation(operationId);
      
      if (result && this.props.onEditOperationRemoved) {
        this.props.onEditOperationRemoved(operationId);
      }
      
      return result;
    } catch (error) {
      console.error("Failed to remove edit operation:", error);
      this.setState({ error: "Failed to remove edit operation" });
      return false;
    }
  };

  /**
   * Update an edit operation in the current project
   * @param operationId ID of the operation to update
   * @param updates Updates to apply to the operation
   */
  updateEditOperation = async (operationId: string, updates: Partial<Omit<EditOperation, "id" | "createdAt">>): Promise<EditOperation | null> => {
    try {
      const result = await this._videoRecorderService.updateEditOperation(operationId, updates);
      
      if (this.props.onEditOperationUpdated) {
        this.props.onEditOperationUpdated(result);
      }
      
      return result;
    } catch (error) {
      console.error("Failed to update edit operation:", error);
      this.setState({ error: "Failed to update edit operation" });
      return null;
    }
  };

  /**
   * Generate a preview of the current project
   */
  generatePreview = async (): Promise<string | null> => {
    try {
      return await this._videoRecorderService.generatePreview();
    } catch (error) {
      console.error("Failed to generate preview:", error);
      this.setState({ error: "Failed to generate preview" });
      return null;
    }
  };

  /**
   * Export the current project with the given options
   * @param options Export options
   */
  exportProject = async (options: ExportOptions = {}): Promise<ExportResult | null> => {
    try {
      this.setState({ isExporting: true, exportProgress: null });
      
      const result = await this._videoRecorderService.exportProject(options, (progress) => {
        this.setState({ exportProgress: progress });
        
        if (this.props.onExportProgress) {
          this.props.onExportProgress(progress);
        }
      });
      
      this.setState({ isExporting: false, exportProgress: null });
      
      if (this.props.onProjectExported) {
        this.props.onProjectExported(result);
      }
      
      return result;
    } catch (error) {
      console.error("Failed to export project:", error);
      this.setState({ 
        error: "Failed to export project",
        isExporting: false,
        exportProgress: null,
      });
      return null;
    }
  };

  /**
   * Apply AI editing to the current project
   * @param options AI editing options
   */
  applyAIEditing = async (options: AIEditingOptions): Promise<AIEditingResult | null> => {
    try {
      const result = await this._videoRecorderService.applyAIEditing(options);
      
      if (this.props.onAIEditingApplied) {
        this.props.onAIEditingApplied(result);
      }
      
      return result;
    } catch (error) {
      console.error("Failed to apply AI editing:", error);
      this.setState({ error: "Failed to apply AI editing" });
      return null;
    }
  };

  /**
   * Get video information by ID
   * @param videoId ID of the video
   */
  getVideoInfo = async (videoId: string): Promise<VideoInfo | null> => {
    try {
      return await this._videoRecorderService.getVideoInfo(videoId);
    } catch (error) {
      console.error("Failed to get video info:", error);
      this.setState({ error: "Failed to get video info" });
      return null;
    }
  };

  /**
   * Get editing project by ID
   * @param projectId ID of the project
   */
  getEditingProject = async (projectId: string): Promise<EditingProject | null> => {
    try {
      return await this._videoRecorderService.getEditingProject(projectId);
    } catch (error) {
      console.error("Failed to get editing project:", error);
      this.setState({ error: "Failed to get editing project" });
      return null;
    }
  };

  /**
   * Get all editing projects
   */
  getAllEditingProjects = async (): Promise<EditingProject[]> => {
    try {
      return await this._videoRecorderService.getAllEditingProjects();
    } catch (error) {
      console.error("Failed to get all editing projects:", error);
      this.setState({ error: "Failed to get all editing projects" });
      return [];
    }
  };

  /**
   * Delete an editing project
   * @param projectId ID of the project to delete
   */
  deleteEditingProject = async (projectId: string): Promise<boolean> => {
    try {
      const result = await this._videoRecorderService.deleteEditingProject(projectId);
      
      if (result && this.state.currentProject?.id === projectId) {
        this.setState({ currentProject: null });
      }
      
      return result;
    } catch (error) {
      console.error("Failed to delete editing project:", error);
      this.setState({ error: "Failed to delete editing project" });
      return false;
    }
  };

  /**
   * Delete a video
   * @param videoId ID of the video to delete
   */
  deleteVideo = async (videoId: string): Promise<boolean> => {
    try {
      const result = await this._videoRecorderService.deleteVideo(videoId);
      
      if (result && this.state.currentVideoInfo?.id === videoId) {
        this.setState({ currentVideoInfo: null });
      }
      
      return result;
    } catch (error) {
      console.error("Failed to delete video:", error);
      this.setState({ error: "Failed to delete video" });
      return false;
    }
  };

  /**
   * Get available filters
   */
  getAvailableFilters = async (): Promise<{ id: string; name: string; preview: string }[]> => {
    try {
      return await this._videoRecorderService.getAvailableFilters();
    } catch (error) {
      console.error("Failed to get available filters:", error);
      this.setState({ error: "Failed to get available filters" });
      return [];
    }
  };

  /**
   * Get available stickers
   */
  getAvailableStickers = async (): Promise<{ id: string; name: string; preview: string }[]> => {
    try {
      return await this._videoRecorderService.getAvailableStickers();
    } catch (error) {
      console.error("Failed to get available stickers:", error);
      this.setState({ error: "Failed to get available stickers" });
      return [];
    }
  };

  /**
   * Get available transitions
   */
  getAvailableTransitions = async (): Promise<{ id: string; name: string; preview: string }[]> => {
    try {
      return await this._videoRecorderService.getAvailableTransitions();
    } catch (error) {
      console.error("Failed to get available transitions:", error);
      this.setState({ error: "Failed to get available transitions" });
      return [];
    }
  };

  /**
   * Get available AI styles
   */
  getAvailableAIStyles = async (): Promise<{ id: string; name: string; preview: string }[]> => {
    try {
      return await this._videoRecorderService.getAvailableAIStyles();
    } catch (error) {
      console.error("Failed to get available AI styles:", error);
      this.setState({ error: "Failed to get available AI styles" });
      return [];
    }
  };

  _renderRecordingIndicator() {
    const { 
      showRecordingIndicator = true, 
      recordingIndicatorColor = "#FF0000", 
      recordingIndicatorSize = 0.1,
      recordingIndicatorPosition = [0, 0.8, -1],
      recordingIndicatorAnimation = "pulse"
    } = this.props;
    
    const { recordingStatus } = this.state;
    
    if (!showRecordingIndicator || !recordingStatus?.isRecording) {
      return null;
    }
    
    // If custom renderer is provided, use it
    if (this.props.renderRecordingIndicator) {
      return (
        <ViroNode position={recordingIndicatorPosition}>
          {this.props.renderRecordingIndicator(recordingStatus)}
        </ViroNode>
      );
    }
    
    // Default indicator is a red sphere with pulse animation
    const animation = recordingIndicatorAnimation;
    
    return (
      <ViroNode position={recordingIndicatorPosition}>
        <ViroSphere
          radius={recordingIndicatorSize}
          materials={["recordingIndicator"]}
          animation={{
            name: typeof animation === "string" ? animation : animation.name,
            run: true,
            loop: true,
          }}
        />
        
        {this._renderRecordingTimer()}
      </ViroNode>
    );
  }

  _renderRecordingTimer() {
    const { recordingStatus } = this.state;
    
    if (!recordingStatus) {
      return null;
    }
    
    // If custom renderer is provided, use it
    if (this.props.renderRecordingTimer) {
      return this.props.renderRecordingTimer(recordingStatus);
    }
    
    // Format duration as MM:SS
    const minutes = Math.floor(recordingStatus.duration / 60);
    const seconds = Math.floor(recordingStatus.duration % 60);
    const formattedDuration = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    
    // Default timer is a text below the recording indicator
    return (
      <ViroText
        text={formattedDuration}
        position={[0, -0.15, 0]}
        style={{
          fontFamily: "Arial",
          fontSize: 20,
          color: "#FFFFFF",
          textAlignVertical: "center",
          textAlign: "center",
        }}
        width={0.5}
        height={0.1}
      />
    );
  }

  render() {
    return (
      <>
        {this._renderRecordingIndicator()}
      </>
    );
  }
}