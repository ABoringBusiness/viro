# ViroVideoRecorder

The ViroVideoRecorder component provides video recording and AI editing functionality in AR. It allows users to record videos, edit them with various operations, and apply AI-powered enhancements.

## Features

- **Video Recording**: Record videos in AR with customizable quality and settings
- **Editing Operations**: Apply various editing operations like trim, crop, filter, text, etc.
- **AI Editing**: Apply AI-powered enhancements and transformations
- **Export Options**: Export videos with different quality, format, and settings
- **Visual Indicators**: Display visual indicators for recording status
- **Project Management**: Create and manage editing projects

## Usage

```jsx
import { 
  ViroARScene, 
  ViroARSceneNavigator, 
  ViroVideoRecorder 
} from '@reactvision/react-viro';

// Inside your AR scene component
<ViroVideoRecorder
  config={{
    apiKey: "your-api-key",
    useOpenAI: true,
    openAIApiKey: "your-openai-api-key",
    openAIModel: "gpt-4-vision-preview",
    maxRecordingDuration: 60, // 60 seconds
    videoQuality: "high",
    recordAudio: true,
    saveToGallery: true,
  }}
  enabled={true}
  showRecordingIndicator={true}
  recordingIndicatorColor="#FF0000"
  recordingIndicatorSize={0.1}
  recordingIndicatorPosition={[0, 0.8, -1]}
  recordingIndicatorAnimation="pulse"
  onRecordingStart={() => {
    console.log('Recording started');
  }}
  onRecordingStop={(videoInfo) => {
    console.log('Recording stopped:', videoInfo);
  }}
  onRecordingPause={() => {
    console.log('Recording paused');
  }}
  onRecordingResume={() => {
    console.log('Recording resumed');
  }}
  onRecordingStatusUpdate={(status) => {
    console.log('Recording status:', status);
  }}
  onProjectCreated={(project) => {
    console.log('Project created:', project);
  }}
  onEditOperationAdded={(operation) => {
    console.log('Edit operation added:', operation);
  }}
  onProjectExported={(result) => {
    console.log('Project exported:', result);
  }}
  autoCreateProject={true}
  autoApplyAIEditing={true}
  aiEditingOptions={{
    prompt: "Make it look cinematic",
    style: "Cinematic",
    intensity: 0.7,
  }}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | object | Video Recorder configuration |
| `enabled` | boolean | Flag to enable/disable video recording |
| `onRecordingStart` | function | Callback when recording starts |
| `onRecordingStop` | function | Callback when recording stops |
| `onRecordingPause` | function | Callback when recording pauses |
| `onRecordingResume` | function | Callback when recording resumes |
| `onRecordingStatusUpdate` | function | Callback when recording status updates |
| `onProjectCreated` | function | Callback when an editing project is created |
| `onEditOperationAdded` | function | Callback when an edit operation is added |
| `onEditOperationRemoved` | function | Callback when an edit operation is removed |
| `onEditOperationUpdated` | function | Callback when an edit operation is updated |
| `onProjectExported` | function | Callback when a project is exported |
| `onExportProgress` | function | Callback when export progress updates |
| `onAIEditingApplied` | function | Callback when AI editing is applied |
| `showRecordingIndicator` | boolean | Flag to show/hide recording indicator |
| `recordingIndicatorColor` | string | Color of the recording indicator |
| `recordingIndicatorSize` | number | Size of the recording indicator |
| `recordingIndicatorPosition` | array | Position of the recording indicator |
| `recordingIndicatorAnimation` | string | Animation name for the recording indicator |
| `renderRecordingIndicator` | function | Custom renderer for recording indicator |
| `renderRecordingTimer` | function | Custom renderer for recording timer |
| `autoCreateProject` | boolean | Flag to automatically create an editing project after recording |
| `autoApplyAIEditing` | boolean | Flag to automatically apply AI editing after creating a project |
| `aiEditingOptions` | object | AI editing options for automatic AI editing |

## Video Recording

The `ViroVideoRecorder` component provides methods for controlling video recording:

- `startRecording()`: Start recording a video
- `stopRecording()`: Stop recording and return video info
- `pauseRecording()`: Pause recording
- `resumeRecording()`: Resume recording

## Video Editing

After recording a video, you can create an editing project and apply various operations:

- `createEditingProject(videoId, name)`: Create a new editing project
- `addEditOperation(operation)`: Add an edit operation to the current project
- `removeEditOperation(operationId)`: Remove an edit operation
- `updateEditOperation(operationId, updates)`: Update an edit operation
- `generatePreview()`: Generate a preview of the current project
- `exportProject(options)`: Export the current project with the given options
- `applyAIEditing(options)`: Apply AI editing to the current project

## Edit Operations

The following edit operations are supported:

- **Trim**: Trim the video to a specific time range
- **Crop**: Crop the video to a specific region
- **Rotate**: Rotate the video by a specific angle
- **Filter**: Apply a filter to the video
- **Text**: Add text overlay to the video
- **Sticker**: Add sticker overlay to the video
- **Audio**: Add or replace audio in the video
- **Speed**: Change the playback speed of the video
- **Transition**: Add transitions between video segments
- **Stabilize**: Stabilize shaky video
- **Enhance**: Enhance video quality (brightness, contrast, etc.)
- **AI**: Apply AI-powered operations (remove objects, replace background, etc.)

## AI Editing

The `applyAIEditing` method allows you to apply AI-powered enhancements and transformations:

```javascript
videoRecorder.applyAIEditing({
  prompt: "Make it look cinematic and enhance the colors",
  style: "Cinematic",
  intensity: 0.7,
});
```

AI operations include:
- Remove objects
- Replace background
- Enhance quality
- Colorize
- Stylize
- Add captions
- Summarize
- Generate highlights

## Demo

Check out the `ViroVideoRecorderDemo` component for a complete example of how to use the Video Recorder integration.

```jsx
import { ViroVideoRecorderDemo } from '@reactvision/react-viro';

// In your app
<ViroVideoRecorderDemo
  apiKey="your-api-key"
  useOpenAI={true}
  openAIApiKey="your-openai-api-key"
  openAIModel="gpt-4-vision-preview"
  maxRecordingDuration={60}
  videoQuality="high"
  recordAudio={true}
  saveToGallery={true}
/>
```

## Requirements

- React Native 0.63+
- Viro React 2.20+
- iOS 11+ or Android API Level 24+
- OpenAI API key for AI editing (optional)

## Notes

- The current implementation uses simulated data for demonstration purposes
- For production use, you would need to implement the native module for video recording and editing
- AI editing requires an OpenAI API key or similar service