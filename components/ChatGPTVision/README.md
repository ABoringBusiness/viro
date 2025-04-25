# ViroChatGPTVision

The ViroChatGPTVision component integrates ChatGPT Vision API with ViroReact to enable advanced object detection, image analysis, and image editing capabilities in AR scenes.

## Features

- **Object Detection**: Detect objects in the camera view using ChatGPT Vision API
- **Image Analysis**: Analyze images to extract detailed information about the scene
- **Image Editing**: Edit captured images using text prompts
- **Visual Feedback**: Display visual indicators over detected objects
- **Food Analysis**: Estimate calories and extract recipes from food images
- **Shopping Integration**: Identify products and suggest shopping options
- **Custom Prompts**: Use custom prompts to guide the image analysis

## Usage

```jsx
import { 
  ViroARScene, 
  ViroARSceneNavigator, 
  ViroChatGPTVision 
} from '@reactvision/react-viro';

// Inside your AR scene component
<ViroChatGPTVision
  apiConfig={{
    apiKey: "your-openai-api-key",
    model: "gpt-4-vision-preview",
    maxTokens: 300,
    temperature: 0.7,
  }}
  enabled={true}
  minConfidence={0.7}
  maxObjects={5}
  showIndicators={true}
  showLabels={true}
  indicatorColor="#FFFFFF"
  indicatorSize={0.1}
  indicatorAnimation="pulse"
  onObjectsDetected={(objects) => {
    console.log('Detected objects:', objects);
  }}
  onObjectSelected={(object) => {
    console.log('Selected object:', object);
  }}
  onImageAnalysisComplete={(result) => {
    console.log('Analysis result:', result);
  }}
  onImageCaptured={(imageBase64) => {
    console.log('Image captured');
  }}
  onImageEdited={(originalImage, editedImage) => {
    console.log('Image edited');
  }}
  captureInterval={5000} // 5 seconds
  autoCaptureEnabled={true}
  imageEditingEnabled={true}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `apiConfig` | object | ChatGPT Vision API configuration |
| `enabled` | boolean | Flag to enable/disable object detection |
| `minConfidence` | number | Minimum confidence level (0-1) for object detection |
| `maxObjects` | number | Maximum number of objects to detect simultaneously |
| `analysisPrompt` | string | Custom prompt for image analysis |
| `onObjectsDetected` | function | Callback when objects are detected |
| `onObjectSelected` | function | Callback when an object is selected/tapped |
| `onImageAnalysisComplete` | function | Callback when image analysis is complete |
| `showIndicators` | boolean | Flag to show/hide visual indicators for detected objects |
| `indicatorColor` | string | Color of the indicator dot |
| `indicatorSize` | number | Size of the indicator dot |
| `indicatorAnimation` | string | Animation name for the indicator |
| `showLabels` | boolean | Flag to show/hide object labels |
| `renderIndicator` | function | Custom renderer for object indicators |
| `renderLabel` | function | Custom renderer for object labels |
| `captureInterval` | number | Interval in milliseconds for capturing and analyzing images |
| `autoCaptureEnabled` | boolean | Flag to enable/disable automatic image capture |
| `onImageCaptured` | function | Callback when an image is captured |
| `imageEditingEnabled` | boolean | Flag to enable/disable image editing |
| `onImageEdited` | function | Callback when an image is edited |

## Object Data

The `onObjectsDetected` callback provides an array of detected objects with the following structure:

```typescript
type DetectedObject = {
  type: string;
  confidence: number;
  boundingBox?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  attributes?: Record<string, string>;
};
```

## Image Analysis Result

The `onImageAnalysisComplete` callback provides an analysis result with the following structure:

```typescript
type ImageAnalysisResult = {
  objects: DetectedObject[];
  description: string;
  tags: string[];
  metadata: any;
};
```

## Demo

Check out the `ViroChatGPTVisionDemo` component for a complete example of how to use the ChatGPT Vision integration.

```jsx
import { ViroChatGPTVisionDemo } from '@reactvision/react-viro';

// In your app
<ViroChatGPTVisionDemo apiKey="your-openai-api-key" />
```

## Additional Services

The `ViroChatGPTVisionService` provides additional methods for working with images:

- `estimateCalories(imageBase64)`: Estimate calories in a food image
- `extractRecipe(imageBase64)`: Extract a recipe from a food image
- `suggestShoppingOptions(imageBase64)`: Suggest shopping options for a product in an image
- `editImage(request)`: Edit an image using a text prompt
- `describeImage(imageBase64)`: Generate a detailed description of an image

## Requirements

- React Native 0.63+
- Viro React 2.20+
- iOS 11+ or Android API Level 24+
- OpenAI API key with access to GPT-4 Vision API

## Notes

- The current implementation uses a simulated image capture for demonstration purposes
- For production use, you should implement the native module to capture images from the AR camera
- API usage is subject to OpenAI's pricing and rate limits