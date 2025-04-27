# Viro AR Assistant

The AR Assistant is a comprehensive component that integrates speech recognition, text-to-speech, AR character visualization, natural language understanding, and enhanced AR interactions into a cohesive AR assistant experience.

## Features

- Voice-based interaction with speech recognition and text-to-speech
- Visual representation with customizable 3D character
- Natural language understanding for intent recognition
- Enhanced AR interactions with object detection
- Context-aware conversation management
- Configurable appearance and behavior
- React Context API integration for easy use in components
- Comprehensive event system for tracking interactions
- Debug mode for development and testing

## Usage

```jsx
import {
  ViroARAssistant,
  ARAssistantProvider,
  useARAssistant,
  ARAssistantState
} from '@reactvision/react-viro';
import { AssistantCharacterType } from '@reactvision/react-viro';

// Basic usage with the component directly
const MyARScene = () => {
  return (
    <ViroARScene>
      <ViroARAssistant
        config={{
          name: "AR Assistant",
          characterType: AssistantCharacterType.ROBOT,
          autoActivate: true,
          showUI: true
        }}
        onStateChange={(state) => console.log("Assistant state:", state)}
        onSpeechRecognized={(text) => console.log("Recognized speech:", text)}
        onIntentRecognized={(intent, params) => console.log("Recognized intent:", intent, params)}
        onSpeak={(text) => console.log("Assistant speaking:", text)}
        onAction={(action, params) => console.log("Assistant action:", action, params)}
        onError={(error) => console.error("Assistant error:", error)}
      />
    </ViroARScene>
  );
};

// Advanced usage with the Context API
const App = () => {
  return (
    <ARAssistantProvider
      config={{
        name: "AR Assistant",
        characterType: AssistantCharacterType.ROBOT,
        characterCustomization: {
          primaryColor: "#88CCFF",
          scale: 1.0,
          showShadow: true
        },
        autoActivate: true,
        showUI: true,
        debug: true
      }}
      onStateChange={(state) => console.log("Assistant state:", state)}
      onSpeechRecognized={(text) => console.log("Recognized speech:", text)}
      onIntentRecognized={(intent, params) => console.log("Recognized intent:", intent, params)}
      onSpeak={(text) => console.log("Assistant speaking:", text)}
      onAction={(action, params) => console.log("Assistant action:", action, params)}
      onError={(error) => console.error("Assistant error:", error)}
    >
      <ViroARSceneNavigator
        initialScene={{
          scene: MyARSceneWithAssistant,
        }}
        style={{ flex: 1 }}
      />
    </ARAssistantProvider>
  );
};

// Using the assistant in a component with the hook
const MyARSceneWithAssistant = () => {
  const {
    assistantState,
    characterState,
    recognizedSpeech,
    lastResponse,
    lastIntent,
    lastAction,
    activate,
    deactivate,
    startListening,
    stopListening,
    stopSpeaking,
    speak,
    processText
  } = useARAssistant();
  
  return (
    <ViroARScene>
      <ViroNode position={[0, 0, -2]}>
        <ViroText
          text={`Assistant State: ${assistantState}`}
          position={[0, 0.2, 0]}
          scale={[0.2, 0.2, 0.2]}
          style={{ color: '#FFFFFF' }}
        />
        
        {recognizedSpeech && (
          <ViroText
            text={`You said: "${recognizedSpeech}"`}
            position={[0, 0.1, 0]}
            scale={[0.2, 0.2, 0.2]}
            style={{ color: '#AAFFAA' }}
          />
        )}
        
        {lastResponse && (
          <ViroText
            text={`Assistant said: "${lastResponse}"`}
            position={[0, 0, 0]}
            scale={[0.2, 0.2, 0.2]}
            style={{ color: '#AAAAFF' }}
          />
        )}
        
        <ViroFlexView
          position={[0, -0.2, 0]}
          width={2}
          height={0.3}
          style={{ flexDirection: 'row', justifyContent: 'space-around' }}
        >
          <ViroText
            text="Listen"
            style={{ color: '#FFFFFF' }}
            onClick={startListening}
          />
          <ViroText
            text="Stop"
            style={{ color: '#FFFFFF' }}
            onClick={stopListening}
          />
          <ViroText
            text="Hello"
            style={{ color: '#FFFFFF' }}
            onClick={() => speak("Hello! How can I help you?")}
          />
        </ViroFlexView>
      </ViroNode>
    </ViroARScene>
  );
};
```

## API Reference

### ViroARAssistant

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `ARAssistantConfig` | Configuration options for the assistant |
| `onStateChange` | `(state: ARAssistantState) => void` | Callback when the assistant state changes |
| `onSpeechRecognized` | `(text: string) => void` | Callback when the assistant recognizes speech |
| `onIntentRecognized` | `(intent: string, params: any) => void` | Callback when the assistant processes an intent |
| `onSpeak` | `(text: string) => void` | Callback when the assistant speaks |
| `onAction` | `(action: string, params: any) => void` | Callback when the assistant performs an action |
| `onError` | `(error: any) => void` | Callback when the assistant encounters an error |
| `children` | `React.ReactNode` | Children components |

#### Methods

| Method | Description |
|--------|-------------|
| `activate()` | Activate the assistant |
| `deactivate()` | Deactivate the assistant |
| `startListening()` | Start listening for user input |
| `stopListening()` | Stop listening for user input |
| `stopSpeaking()` | Stop speaking |
| `speak(text: string)` | Speak a message |
| `processText(text: string)` | Process a text input directly (without speech recognition) |

### ARAssistantProvider

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `ARAssistantConfig` | Configuration options for the assistant |
| `onStateChange` | `(state: ARAssistantState) => void` | Callback when the assistant state changes |
| `onSpeechRecognized` | `(text: string) => void` | Callback when the assistant recognizes speech |
| `onIntentRecognized` | `(intent: string, params: any) => void` | Callback when the assistant processes an intent |
| `onSpeak` | `(text: string) => void` | Callback when the assistant speaks |
| `onAction` | `(action: string, params: any) => void` | Callback when the assistant performs an action |
| `onError` | `(error: any) => void` | Callback when the assistant encounters an error |
| `children` | `React.ReactNode` | Children components |

### useARAssistant

A hook that provides access to the AR Assistant context.

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `assistantState` | `ARAssistantState` | The current state of the assistant |
| `characterState` | `AssistantCharacterState` | The current state of the character |
| `recognizedSpeech` | `string` | The last recognized speech |
| `lastResponse` | `string` | The last response from the assistant |
| `lastIntent` | `string` | The last recognized intent |
| `lastAction` | `string` | The last action performed |
| `activate` | `() => void` | Activate the assistant |
| `deactivate` | `() => void` | Deactivate the assistant |
| `startListening` | `() => Promise<void>` | Start listening for user input |
| `stopListening` | `() => Promise<void>` | Stop listening for user input |
| `stopSpeaking` | `() => Promise<void>` | Stop speaking |
| `speak` | `(text: string) => Promise<void>` | Speak a message |
| `processText` | `(text: string) => Promise<void>` | Process a text input directly |
| `assistantRef` | `React.RefObject<ViroARAssistant>` | Reference to the assistant component |

### ARAssistantConfig

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The name of the assistant |
| `characterType` | `AssistantCharacterType` | The type of character to display |
| `characterCustomization` | `object` | Character customization options |
| `speechRecognition` | `object` | Speech recognition options |
| `textToSpeech` | `object` | Text-to-speech options |
| `nlu` | `object` | Natural language understanding options |
| `interaction` | `object` | AR interaction options |
| `debug` | `boolean` | Whether to enable debug mode |
| `initialPosition` | `[number, number, number]` | Initial position of the assistant character |
| `autoActivate` | `boolean` | Whether to auto-activate the assistant on mount |
| `showUI` | `boolean` | Whether to show the assistant UI |
| `customIntents` | `object[]` | Custom intents for the assistant |
| `customVoiceCommands` | `object[]` | Custom voice commands for the assistant |

### ARAssistantState

| Value | Description |
|-------|-------------|
| `IDLE` | Assistant is idle, waiting for activation |
| `LISTENING` | Assistant is listening to user input |
| `PROCESSING` | Assistant is processing user input |
| `RESPONDING` | Assistant is responding to user |
| `ACTING` | Assistant is performing an action |
| `ERROR` | Assistant has encountered an error |

## Integration with Other Modules

The AR Assistant integrates the following modules:

### Speech Recognition

Used for converting user speech to text. The assistant can be configured to use different speech recognition engines and supports wake word detection.

### Text-to-Speech

Used for converting assistant responses to speech. The assistant can be configured to use different voices and speech parameters.

### AR Assistant Character

Provides a visual representation of the assistant in AR. The character can be customized with different types, colors, and animations.

### Natural Language Understanding

Processes user input to understand intents and extract entities. The assistant can be configured to use different NLU engines and supports custom intents.

### AR Interaction Enhancement

Enhances AR interactions with object detection and advanced interaction techniques. The assistant can interact with the real world and virtual objects.

## Default Intents

The AR Assistant comes with several default intents:

- `greeting`: Recognizes greetings like "hello" or "hi"
- `farewell`: Recognizes farewells like "goodbye" or "bye"
- `help`: Recognizes help requests like "what can you do"
- `place_object`: Recognizes commands to place objects like "place a cube here"
- `remove_object`: Recognizes commands to remove objects like "remove this cube"

## Custom Intents

You can add custom intents to the assistant by providing them in the configuration:

```javascript
const config = {
  // ... other config options
  customIntents: [
    {
      name: "take_photo",
      examples: [
        "take a photo",
        "take a picture",
        "capture this",
        "screenshot"
      ],
      action: "take_photo",
      response: "Taking a photo now."
    },
    {
      name: "change_color",
      examples: [
        "change color to {color}",
        "make it {color}",
        "set color to {color}"
      ],
      entities: ["color"],
      action: "change_color",
      response: "Changing the color."
    }
  ]
};
```

## Demo

The module includes a demo component `ViroARAssistantDemo` that showcases the AR Assistant capabilities.

## License

MIT