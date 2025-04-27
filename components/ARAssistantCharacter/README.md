# Viro AR Assistant Character

This module provides a customizable 3D character for AR applications that can be animated to show different states like idle, listening, thinking, and speaking.

## Features

- Multiple character types (robot, humanoid, abstract, animal)
- Different animation states (idle, listening, thinking, speaking, etc.)
- Customizable appearance (colors, materials, scale)
- Lip-syncing capabilities for speech
- Shadow and lighting effects
- Gesture animations (pointing, nodding, shaking head)
- Easy integration with speech recognition and text-to-speech

## Usage

```jsx
import {
  ViroARAssistantCharacter,
  AssistantCharacterState,
  AssistantCharacterType,
  ViroARAssistantLipSync
} from '@reactvision/react-viro';

// Basic usage
const MyARScene = () => {
  return (
    <ViroARScene>
      <ViroARAssistantCharacter
        type={AssistantCharacterType.ROBOT}
        state={AssistantCharacterState.IDLE}
        position={[0, 0, -1]}
        scale={[1, 1, 1]}
        onTap={() => console.log('Character tapped')}
      />
    </ViroARScene>
  );
};

// Advanced usage with customization and state management
const MyAdvancedARScene = () => {
  const [characterState, setCharacterState] = useState(AssistantCharacterState.IDLE);
  const lipSync = useRef(null);
  
  useEffect(() => {
    // Initialize lip sync
    lipSync.current = ViroARAssistantLipSync.getInstance({
      intensity: 0.8,
      smoothing: 0.3,
    });
    
    // Clean up on unmount
    return () => {
      if (lipSync.current) {
        lipSync.current.release();
      }
    };
  }, []);
  
  const handleSpeaking = async (text) => {
    // Set character to speaking state
    setCharacterState(AssistantCharacterState.SPEAKING);
    
    // Start lip sync
    if (lipSync.current) {
      lipSync.current.startLipSync(text);
    }
    
    // Use text-to-speech to speak the text
    // ...
    
    // After speaking is done, return to idle state
    setTimeout(() => {
      setCharacterState(AssistantCharacterState.IDLE);
      if (lipSync.current) {
        lipSync.current.stopLipSync();
      }
    }, 5000);
  };
  
  return (
    <ViroARScene>
      <ViroARAssistantCharacter
        type={AssistantCharacterType.HUMANOID}
        state={characterState}
        position={[0, 0, -1]}
        customization={{
          primaryColor: "#88CCFF",
          secondaryColor: "#FF8888",
          showShadow: true,
          scale: 1.2,
        }}
        onTap={() => handleSpeaking("Hello! I am your AR assistant.")}
        onStateChange={(state) => console.log("Character state changed:", state)}
      />
    </ViroARScene>
  );
};
```

## API Reference

### ViroARAssistantCharacter

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `AssistantCharacterType` | `ROBOT` | The type of character to display |
| `state` | `AssistantCharacterState` | `IDLE` | The current state of the character |
| `position` | `[number, number, number]` | `[0, 0, -1]` | The position of the character in 3D space |
| `rotation` | `[number, number, number]` | `[0, 0, 0]` | The rotation of the character in 3D space |
| `scale` | `[number, number, number]` | `[1, 1, 1]` | The scale of the character |
| `source` | `{ uri: string } \| number` | - | Path to a custom 3D model for the character |
| `type` | `string` | - | Type of the 3D model (OBJ, GLTF, etc.) |
| `customization` | `AssistantCharacterCustomization` | - | Customization options for the character |
| `lipSync` | `AssistantCharacterLipSyncConfig` | - | Lip sync configuration for the character |
| `pointingDirection` | `[number, number, number]` | - | Direction the character should point in |
| `castShadow` | `boolean` | `true` | Whether the character should cast a shadow |
| `receiveShadow` | `boolean` | `true` | Whether the character should receive shadows |
| `onTap` | `() => void` | - | Callback when the character is tapped |
| `onStateChange` | `(state: AssistantCharacterState) => void` | - | Callback when the character state changes |
| `onLoadEnd` | `() => void` | - | Callback when the character finishes loading |
| `onError` | `(error: NativeSyntheticEvent<any>) => void` | - | Callback when the character fails to load |

### AssistantCharacterType

| Value | Description |
|-------|-------------|
| `ROBOT` | A robot character |
| `HUMANOID` | A humanoid character |
| `ABSTRACT` | An abstract character |
| `ANIMAL` | An animal character |
| `CUSTOM` | A custom character |

### AssistantCharacterState

| Value | Description |
|-------|-------------|
| `IDLE` | Character is idle |
| `LISTENING` | Character is listening |
| `THINKING` | Character is thinking |
| `SPEAKING` | Character is speaking |
| `POINTING` | Character is pointing |
| `NODDING` | Character is nodding |
| `SHAKING_HEAD` | Character is shaking head |
| `HIDDEN` | Character is hidden |

### AssistantCharacterCustomization

| Property | Type | Description |
|----------|------|-------------|
| `primaryColor` | `string` | Primary color of the character |
| `secondaryColor` | `string` | Secondary color of the character |
| `accentColor` | `string` | Accent color of the character |
| `scale` | `number` | Scale of the character (1.0 is default size) |
| `showShadow` | `boolean` | Whether to show a shadow under the character |
| `materials` | `{ [key: string]: any }` | Custom materials to apply to the character |
| `animations` | `{ [key: string]: any }` | Custom animations to apply to the character |

### ViroARAssistantLipSync

#### Methods

| Method | Description |
|--------|-------------|
| `getInstance(options?: LipSyncOptions): ViroARAssistantLipSync` | Get the singleton instance of ViroARAssistantLipSync |
| `setOptions(options: Partial<LipSyncOptions>): void` | Update lip sync options |
| `initialize(): Promise<boolean>` | Initialize the lip sync system |
| `startLipSync(text: string, audioSource?: any): Promise<boolean>` | Start lip-syncing for the given text |
| `stopLipSync(): Promise<void>` | Stop lip-syncing |
| `getCurrentMouthShape(): AssistantCharacterMouthShape` | Get the current mouth shape |
| `release(): void` | Release resources |

### LipSyncOptions

| Property | Type | Description |
|----------|------|-------------|
| `intensity` | `number` | The intensity of the lip sync (0.0 - 1.0) |
| `smoothing` | `number` | The smoothing factor for lip sync transitions (0.0 - 1.0) |
| `phonemeMapping` | `{ [phoneme: string]: AssistantCharacterMouthShape }` | Mapping of phonemes to mouth shapes |

## Character Types

### Robot

A mechanical robot character with metallic materials and robotic movements.

### Humanoid

A human-like character with natural materials and fluid animations.

### Abstract

An abstract, geometric character with vibrant colors and unique animations.

### Animal

An animal character with fur materials and playful animations.

## Animation States

### Idle

The default state when the character is not actively doing anything. Features subtle movements to appear alive.

### Listening

Animated to show the character is listening to the user, with visual feedback like pulsing or glowing.

### Thinking

Shows the character is processing information, with animations like head tilting or spinning elements.

### Speaking

Animated to match speech, with mouth movements and gestures.

### Pointing

The character points in a specific direction, useful for directing user attention.

### Nodding

The character nods its head in agreement.

### Shaking Head

The character shakes its head in disagreement.

## Lip Sync

The lip sync system maps phonemes to mouth shapes to create realistic speech animation. It can be synchronized with text-to-speech output for a cohesive experience.

## Demo

The module includes a demo component `ViroARAssistantCharacterDemo` that showcases the different character types, states, and customization options.

## License

MIT