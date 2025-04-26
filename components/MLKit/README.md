# Viro ML Kit

This module provides integration with Google ML Kit for React Native Viro applications.

## Features

### Object Detection and Tracking

Detect and track objects in images with Google ML Kit's object detection API.

```javascript
import { ViroObjectDetection } from '@reactvision/react-viro';

// Detect objects in an image
const detectObjects = async (imageURL) => {
  try {
    const objects = await ViroObjectDetection.detect(
      imageURL,
      {
        performanceMode: 'fast', // or 'accurate'
        multipleObjects: true,
        trackingEnabled: true,
        classificationThreshold: 0.7,
        maxObjectsToDetect: 10
      }
    );
    
    console.log('Detected objects:', objects);
    // Each object contains:
    // - frame: { left, top, width, height }
    // - trackingID (if tracking is enabled)
    // - labels: [{ text, confidence, index }, ...]
    
  } catch (error) {
    console.error('Object detection failed:', error);
  }
};
```

### Digital Ink Recognition

Convert handwritten strokes to text with Google ML Kit's digital ink recognition API.

```javascript
import { ViroDigitalInkRecognition } from '@reactvision/react-viro';

// Example of collecting strokes from a drawing canvas
const strokes = [
  {
    points: [
      { x: 100, y: 100, t: 1000 }, // x, y coordinates and timestamp
      { x: 120, y: 110, t: 1100 },
      { x: 140, y: 120, t: 1200 },
      // ... more points
    ]
  },
  // ... more strokes
];

// Check if a language model is available
const checkLanguageModel = async () => {
  try {
    const isAvailable = await ViroDigitalInkRecognition.isLanguageModelAvailable('en');
    console.log('English model available:', isAvailable);
    
    if (!isAvailable) {
      // Download the model if not available
      await ViroDigitalInkRecognition.downloadLanguageModel('en');
      console.log('English model downloaded successfully');
    }
  } catch (error) {
    console.error('Error checking/downloading model:', error);
  }
};

// Recognize handwritten text
const recognizeHandwriting = async () => {
  try {
    const results = await ViroDigitalInkRecognition.recognize(
      strokes,
      {
        languageCode: 'en',
        maxResultCount: 3,
        autoDownloadModel: true
      }
    );
    
    console.log('Recognition results:', results);
    // Each result contains:
    // - text: The recognized text
    // - score: Confidence score
    
  } catch (error) {
    console.error('Recognition failed:', error);
  }
};
```

### Smart Replies

Generate contextual reply suggestions for conversations with Google ML Kit's smart reply API.

```javascript
import { ViroSmartReplies } from '@reactvision/react-viro';

// Example conversation
const conversation = [
  {
    text: "Hey, how's it going?",
    isLocalUser: false,
    timestamp: Date.now() - 60000 // 1 minute ago
  },
  {
    text: "I'm planning to go to the movies tonight.",
    isLocalUser: false,
    timestamp: Date.now() - 30000 // 30 seconds ago
  }
];

// Generate smart reply suggestions
const generateSmartReplies = async () => {
  try {
    const suggestions = await ViroSmartReplies.suggestReplies(conversation);
    
    console.log('Smart reply suggestions:', suggestions);
    // Example output: [{ text: "What movie?" }, { text: "Have fun!" }, { text: "Sounds good!" }]
    
    // You can use these suggestions in your UI as quick reply buttons
    
  } catch (error) {
    console.error('Smart replies generation failed:', error);
  }
};
```

## Installation

The ML Kit modules are included in the Viro package. However, you need to ensure that the required dependencies are installed in your project.

### iOS

Add the following dependencies to your Podfile:

```ruby
pod 'GoogleMLKit/ObjectDetection', '6.0.0'
pod 'GoogleMLKit/DigitalInkRecognition', '6.0.0'
pod 'GoogleMLKit/SmartReply', '6.0.0'
```

Then run:

```bash
cd ios && pod install
```

### Android

Add the following dependencies to your app's build.gradle:

```gradle
dependencies {
    // ML Kit dependencies
    implementation 'com.google.mlkit:object-detection:17.0.0'
    implementation 'com.google.mlkit:object-detection-custom:17.0.0'
    implementation 'com.google.mlkit:digital-ink-recognition:18.0.0'
    implementation 'com.google.mlkit:smart-reply:17.0.2'
}
```

## License

MIT