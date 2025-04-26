# ViroObjectRecognition

The ViroObjectRecognition component enables real-time object detection and recognition in AR scenes. It provides visual feedback by drawing white dots over recognized objects, animating them, and displaying relevant information.

## Features

- Real-time object detection using ML Kit or custom models
- Visual indicators for recognized objects with customizable animations
- Information display for recognized objects
- Integration with external APIs for additional object data
- Support for tracking object pricing and similar products
- Calorie estimation for food items
- Recipe suggestions from food photos
- Real estate information for buildings
- Shopping information for products

## Usage

```jsx
import { 
  ViroARScene, 
  ViroARSceneNavigator, 
  ViroObjectRecognition 
} from '@reactvision/react-viro';

// Inside your AR scene component
<ViroObjectRecognition
  enabled={true}
  minConfidence={0.7}
  maxObjects={5}
  showIndicators={true}
  showLabels={true}
  indicatorColor="#FFFFFF"
  indicatorSize={0.1}
  indicatorAnimation="pulse"
  onObjectsRecognized={(objects) => {
    console.log('Recognized objects:', objects);
  }}
  onObjectSelected={(object) => {
    console.log('Selected object:', object);
  }}
  onQueryObjectData={async (object) => {
    // Query additional data for the object
    return await fetchObjectData(object);
  }}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `enabled` | boolean | Flag to enable/disable object recognition |
| `minConfidence` | number | Minimum confidence level (0-1) for object detection |
| `maxObjects` | number | Maximum number of objects to detect simultaneously |
| `modelPath` | string | Custom model path for ML Kit or other object detection models |
| `objectTypes` | string[] | Array of object types to detect. If empty, all objects will be detected |
| `onObjectsRecognized` | function | Callback when objects are recognized |
| `onObjectSelected` | function | Callback when an object is selected/tapped |
| `showIndicators` | boolean | Flag to show/hide visual indicators for recognized objects |
| `indicatorColor` | string | Color of the indicator dot |
| `indicatorSize` | number | Size of the indicator dot |
| `indicatorAnimation` | string | Animation name for the indicator |
| `showLabels` | boolean | Flag to show/hide object labels |
| `renderIndicator` | function | Custom renderer for object indicators |
| `renderLabel` | function | Custom renderer for object labels |
| `onQueryObjectData` | function | Callback to query additional data for recognized objects |

## Object Data

The `onObjectsRecognized` callback provides an array of recognized objects with the following structure:

```typescript
type RecognizedObject = {
  type: string;
  confidence: number;
  position: [number, number, number];
  boundingBox?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  metadata?: any;
};
```

## Demo

Check out the `ViroObjectRecognitionDemo` component for a complete example of how to use the object recognition feature.

```jsx
import { ViroObjectRecognitionDemo } from '@reactvision/react-viro';

// In your app
<ViroObjectRecognitionDemo />
```

## Requirements

- React Native 0.63+
- Viro React 2.20+
- iOS 11+ or Android API Level 24+
- For ML Kit integration, follow the ML Kit setup instructions for your platform

## Notes

- The current implementation uses a simulated object detection for demonstration purposes
- For production use, you should integrate with ML Kit or another object detection service
- Performance may vary based on device capabilities and the complexity of the scene