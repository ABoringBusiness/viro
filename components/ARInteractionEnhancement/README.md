# Viro AR Interaction Enhancement

This module enhances AR interactions with object detection, gesture recognition, voice commands, and advanced interaction techniques.

## Features

- Object detection and recognition in AR scenes
- Gesture recognition for intuitive interactions
- Voice command integration for hands-free control
- Advanced object manipulation (move, rotate, scale, delete)
- Visual and haptic feedback for interactions
- Gaze-based interaction for hands-free selection
- Snapping and collision detection for precise placement
- Comprehensive event system for tracking interactions

## Usage

```javascript
import {
  ViroARInteractionManager,
  InteractionType,
  ViroARObjectInteraction,
  ObjectInteractionMode,
  ViroGestureRecognizer,
  GestureType,
  ViroVoiceInteraction
} from '@reactvision/react-viro';

// Basic usage in an AR scene
const MyARScene = () => {
  const handleObjectRecognized = (object) => {
    console.log('Recognized object:', object.type);
    console.log('Position:', object.position);
    console.log('Confidence:', object.confidence);
  };
  
  const handleInteraction = (event) => {
    console.log('Interaction type:', event.type);
    console.log('Interaction state:', event.state);
    console.log('Interaction source:', event.source);
    console.log('Interaction target:', event.target);
  };
  
  return (
    <ViroARScene>
      <ViroARInteractionManager
        enableObjectRecognition={true}
        objectRecognitionConfidence={0.7}
        enableGestureRecognition={true}
        enableVoiceCommands={false}
        showVisualFeedback={true}
        enableHapticFeedback={true}
        onInteraction={handleInteraction}
        onObjectRecognized={handleObjectRecognized}
      >
        {/* Your AR content here */}
      </ViroARInteractionManager>
    </ViroARScene>
  );
};

// Advanced usage with object interaction
const MyAdvancedARScene = () => {
  const [recognizedObjects, setRecognizedObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [interactionMode, setInteractionMode] = useState(ObjectInteractionMode.NONE);
  
  const handleObjectRecognized = (object) => {
    setRecognizedObjects(prev => [...prev, object]);
  };
  
  const handleObjectLost = (objectType) => {
    setRecognizedObjects(prev => prev.filter(obj => obj.type !== objectType));
  };
  
  const handleObjectSelect = (objectType) => {
    setSelectedObject(objectType);
  };
  
  const handleObjectDeselect = () => {
    setSelectedObject(null);
    setInteractionMode(ObjectInteractionMode.NONE);
  };
  
  return (
    <ViroARScene>
      <ViroARInteractionManager
        enableObjectRecognition={true}
        onObjectRecognized={handleObjectRecognized}
        onObjectLost={handleObjectLost}
      >
        {/* Render recognized objects */}
        {recognizedObjects.map((object, index) => (
          <ViroARObjectInteraction
            key={`object_${index}`}
            object={object}
            mode={selectedObject === object.type ? interactionMode : ObjectInteractionMode.NONE}
            showVisualFeedback={true}
            enableSnapping={true}
            onSelect={handleObjectSelect}
            onDeselect={handleObjectDeselect}
          />
        ))}
        
        {/* UI for changing interaction mode */}
        <ViroFlexView
          position={[0, -0.5, -1]}
          width={1}
          height={0.2}
          style={{ flexDirection: 'row', justifyContent: 'space-around' }}
        >
          <ViroText
            text="Move"
            style={{ color: interactionMode === ObjectInteractionMode.MOVE ? '#FFFF00' : '#FFFFFF' }}
            onClick={() => setInteractionMode(ObjectInteractionMode.MOVE)}
          />
          <ViroText
            text="Rotate"
            style={{ color: interactionMode === ObjectInteractionMode.ROTATE ? '#FFFF00' : '#FFFFFF' }}
            onClick={() => setInteractionMode(ObjectInteractionMode.ROTATE)}
          />
          <ViroText
            text="Scale"
            style={{ color: interactionMode === ObjectInteractionMode.SCALE ? '#FFFF00' : '#FFFFFF' }}
            onClick={() => setInteractionMode(ObjectInteractionMode.SCALE)}
          />
          <ViroText
            text="Delete"
            style={{ color: interactionMode === ObjectInteractionMode.DELETE ? '#FF0000' : '#FFFFFF' }}
            onClick={() => setInteractionMode(ObjectInteractionMode.DELETE)}
          />
        </ViroFlexView>
      </ViroARInteractionManager>
    </ViroARScene>
  );
};

// Using gesture recognition
const useGestureRecognition = () => {
  useEffect(() => {
    const gestureRecognizer = ViroGestureRecognizer.getInstance({
      enableSwipe: true,
      enableTap: true,
      enablePinch: true,
      enableRotation: true
    });
    
    const initialize = async () => {
      await gestureRecognizer.initialize();
      await gestureRecognizer.start();
    };
    
    const unregister = gestureRecognizer.registerCallback((gesture) => {
      console.log('Gesture type:', gesture.type);
      console.log('Gesture state:', gesture.state);
      console.log('Gesture position:', gesture.position);
      
      if (gesture.type === GestureType.SWIPE) {
        console.log('Swipe direction:', gesture.direction);
      } else if (gesture.type === GestureType.PINCH) {
        console.log('Pinch scale:', gesture.scale);
      } else if (gesture.type === GestureType.ROTATION) {
        console.log('Rotation angle:', gesture.rotation);
      }
    });
    
    initialize();
    
    return () => {
      unregister();
      gestureRecognizer.release();
    };
  }, []);
};

// Using voice interaction
const useVoiceInteraction = () => {
  const [voiceState, setVoiceState] = useState('idle');
  const [lastCommand, setLastCommand] = useState('');
  
  useEffect(() => {
    const voiceInteraction = ViroVoiceInteraction.getInstance({
      continuousListening: false,
      useNLU: true,
      showVisualFeedback: true
    });
    
    const stateUnregister = voiceInteraction.registerStateCallback((state) => {
      setVoiceState(state);
    });
    
    const resultUnregister = voiceInteraction.registerCallback((result) => {
      setLastCommand(result.text);
      
      if (result.action) {
        handleVoiceAction(result.action, result.params);
      }
    });
    
    return () => {
      stateUnregister();
      resultUnregister();
      voiceInteraction.release();
    };
  }, []);
  
  const startListening = async () => {
    const voiceInteraction = ViroVoiceInteraction.getInstance();
    await voiceInteraction.startListening();
  };
  
  const stopListening = async () => {
    const voiceInteraction = ViroVoiceInteraction.getInstance();
    await voiceInteraction.stopListening();
  };
  
  const handleVoiceAction = (action, params) => {
    switch (action) {
      case 'place_object':
        // Handle place object action
        break;
      case 'remove_object':
        // Handle remove object action
        break;
      // Handle other actions
    }
  };
  
  return { voiceState, lastCommand, startListening, stopListening };
};
```

## API Reference

### ViroARInteractionManager

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableObjectRecognition` | `boolean` | `true` | Whether to enable object recognition |
| `objectRecognitionConfidence` | `number` | `0.7` | Minimum confidence threshold for object recognition |
| `objectTypes` | `string[]` | - | Types of objects to recognize |
| `enableGestureRecognition` | `boolean` | `true` | Whether to enable gesture recognition |
| `enableVoiceCommands` | `boolean` | `false` | Whether to enable voice command recognition |
| `enableGazeInteraction` | `boolean` | `false` | Whether to enable gaze interaction |
| `gazeDuration` | `number` | `2000` | Duration in milliseconds for gaze interaction to trigger |
| `showVisualFeedback` | `boolean` | `true` | Whether to show visual feedback for interactions |
| `enableHapticFeedback` | `boolean` | `true` | Whether to enable haptic feedback for interactions |
| `debug` | `boolean` | `false` | Whether to enable debug mode |
| `onInteraction` | `(event: InteractionEvent) => void` | - | Callback when an interaction occurs |
| `onObjectRecognized` | `(object: RecognizedObject) => void` | - | Callback when an object is recognized |
| `onObjectLost` | `(objectType: string) => void` | - | Callback when an object is no longer recognized |
| `onGestureRecognized` | `(gesture: string, params: any) => void` | - | Callback when a gesture is recognized |
| `onVoiceCommandRecognized` | `(command: string, params: any) => void` | - | Callback when a voice command is recognized |

### ViroARObjectInteraction

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `object` | `RecognizedObject` | - | The recognized object to interact with |
| `mode` | `ObjectInteractionMode` | `NONE` | The current interaction mode |
| `showVisualFeedback` | `boolean` | `true` | Whether to show visual feedback during interaction |
| `enableSnapping` | `boolean` | `false` | Whether to enable snapping to grid |
| `gridSize` | `number` | `0.1` | Grid size for snapping (in meters) |
| `enableCollision` | `boolean` | `true` | Whether to enable collision detection |
| `enablePhysics` | `boolean` | `false` | Whether to enable physics |
| `enableShadows` | `boolean` | `true` | Whether to enable shadows |
| `onInteractionStart` | `(event: ObjectInteractionEvent) => void` | - | Callback when interaction starts |
| `onInteractionUpdate` | `(event: ObjectInteractionEvent) => void` | - | Callback when interaction updates |
| `onInteractionEnd` | `(event: ObjectInteractionEvent) => void` | - | Callback when interaction ends |
| `onSelect` | `(object: string) => void` | - | Callback when object is selected |
| `onDeselect` | `(object: string) => void` | - | Callback when object is deselected |

### ViroGestureRecognizer

#### Methods

| Method | Description |
|--------|-------------|
| `getInstance(options?: GestureRecognizerOptions): ViroGestureRecognizer` | Get the singleton instance of the gesture recognizer |
| `setOptions(options: Partial<GestureRecognizerOptions>): void` | Update gesture recognizer options |
| `initialize(): Promise<boolean>` | Initialize the gesture recognizer |
| `registerCallback(callback: GestureRecognizerCallback): () => void` | Register a callback for gesture events |
| `start(): Promise<boolean>` | Start gesture recognition |
| `stop(): Promise<boolean>` | Stop gesture recognition |
| `release(): void` | Release resources |

### ViroVoiceInteraction

#### Methods

| Method | Description |
|--------|-------------|
| `getInstance(options?: VoiceInteractionOptions): ViroVoiceInteraction` | Get the singleton instance of voice interaction |
| `setOptions(options: Partial<VoiceInteractionOptions>): void` | Update voice interaction options |
| `startListening(): Promise<boolean>` | Start listening for voice commands |
| `stopListening(): Promise<boolean>` | Stop listening for voice commands |
| `registerCallback(callback: VoiceInteractionCallback): () => void` | Register a callback for voice interaction results |
| `registerStateCallback(callback: VoiceStateChangeCallback): () => void` | Register a callback for voice interaction state changes |
| `getState(): VoiceInteractionState` | Get the current state of voice interaction |
| `addCommand(command: VoiceCommand): void` | Add a custom voice command |
| `removeCommand(commandName: string): void` | Remove a voice command |
| `getCommands(): VoiceCommand[]` | Get all voice commands |
| `release(): void` | Release resources |

## Interaction Types

### InteractionType

| Value | Description |
|-------|-------------|
| `TAP` | Tap interaction |
| `PINCH` | Pinch interaction (for scaling) |
| `ROTATION` | Rotation interaction |
| `DRAG` | Drag interaction |
| `VOICE` | Voice command interaction |
| `GAZE` | Gaze interaction |
| `GESTURE` | Gesture interaction |
| `OBJECT_DETECTION` | Object detection interaction |

### InteractionState

| Value | Description |
|-------|-------------|
| `IDLE` | Interaction is idle |
| `IN_PROGRESS` | Interaction is in progress |
| `COMPLETED` | Interaction has completed |
| `CANCELLED` | Interaction has been cancelled |
| `FAILED` | Interaction has failed |

### ObjectInteractionMode

| Value | Description |
|-------|-------------|
| `NONE` | No interaction |
| `MOVE` | Move the object |
| `ROTATE` | Rotate the object |
| `SCALE` | Scale the object |
| `DELETE` | Delete the object |

### GestureType

| Value | Description |
|-------|-------------|
| `SWIPE` | Swipe gesture |
| `TAP` | Tap gesture |
| `LONG_PRESS` | Long press gesture |
| `PINCH` | Pinch gesture |
| `ROTATION` | Rotation gesture |
| `PAN` | Pan gesture |
| `CUSTOM` | Custom gesture |

### VoiceInteractionState

| Value | Description |
|-------|-------------|
| `IDLE` | Voice interaction is idle |
| `LISTENING` | Voice interaction is listening |
| `PROCESSING` | Voice interaction is processing |
| `RESPONDING` | Voice interaction is responding |
| `ERROR` | Voice interaction has encountered an error |

## Object Recognition

The module uses object recognition to identify objects in the real world. Recognized objects include:

- Common household items (chairs, tables, cups, etc.)
- Electronic devices (phones, laptops, TVs, etc.)
- People and animals
- Vehicles and transportation
- Food and beverages
- Custom objects (can be trained with your own models)

## Gesture Recognition

The module supports various gestures for interacting with AR content:

- Tap: Single tap for selection
- Long press: Press and hold for context menus
- Swipe: Swipe in different directions for navigation
- Pinch: Pinch to scale objects
- Rotation: Two-finger rotation to rotate objects
- Pan: Drag to move objects

## Voice Commands

The module supports voice commands for hands-free interaction:

- "Place object": Place a new object in the scene
- "Remove object": Remove the selected object
- "Move object": Enter move mode for the selected object
- "Rotate object": Enter rotate mode for the selected object
- "Scale object": Enter scale mode for the selected object
- "Take photo": Capture the current AR view
- "Help": Show available commands

## Demo

The module includes a demo component `ViroARInteractionDemo` that showcases the AR interaction enhancement capabilities.

## License

MIT