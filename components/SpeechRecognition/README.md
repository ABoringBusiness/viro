# Viro Speech Recognition

This module provides speech recognition capabilities for AR applications built with Viro.

## Features

- Cross-platform speech recognition (iOS and Android)
- Support for multiple recognition engines (Apple, Google, ML Kit)
- Continuous listening mode
- Wake word detection
- Volume level monitoring for UI feedback
- Multiple language support
- On-device recognition option for privacy
- Configurable silence detection

## Usage

```javascript
import { ViroSpeechRecognition, SpeechRecognitionEngine, SpeechRecognitionState } from '@reactvision/react-viro';

// Get the speech recognition instance
const speechRecognition = ViroSpeechRecognition.getInstance({
  engine: SpeechRecognitionEngine.DEFAULT,
  languageCode: 'en-US',
  continuous: true,
  partialResults: true,
  preferOnDevice: true,
  stopOnSilence: true,
  silenceTimeout: 1500 // 1.5 seconds
});

// Add listeners for speech recognition events
const resultListener = speechRecognition.onResult((result) => {
  console.log('Speech recognized:', result.text);
  console.log('Is final result:', result.isFinal);
  console.log('Confidence:', result.confidence);
  
  if (result.alternatives) {
    console.log('Alternatives:', result.alternatives);
  }
});

const errorListener = speechRecognition.onError((error) => {
  console.error('Speech recognition error:', error.message);
});

const stateListener = speechRecognition.onStateChange((state) => {
  console.log('Speech recognition state changed to:', state);
  
  // Update UI based on state
  switch (state) {
    case SpeechRecognitionState.LISTENING:
      // Show listening indicator
      break;
    case SpeechRecognitionState.PROCESSING:
      // Show processing indicator
      break;
    case SpeechRecognitionState.INACTIVE:
    case SpeechRecognitionState.STOPPED:
      // Hide indicators
      break;
    case SpeechRecognitionState.ERROR:
      // Show error state
      break;
  }
});

const volumeListener = speechRecognition.onVolumeChange((volume) => {
  // Update UI based on volume level (0.0 - 1.0)
  console.log('Speech volume:', volume);
});

// Start listening
const startListening = async () => {
  try {
    await speechRecognition.start();
    console.log('Speech recognition started');
  } catch (error) {
    console.error('Failed to start speech recognition:', error);
  }
};

// Stop listening
const stopListening = async () => {
  try {
    await speechRecognition.stop();
    console.log('Speech recognition stopped');
  } catch (error) {
    console.error('Failed to stop speech recognition:', error);
  }
};

// Cancel listening and discard results
const cancelListening = async () => {
  try {
    await speechRecognition.cancel();
    console.log('Speech recognition canceled');
  } catch (error) {
    console.error('Failed to cancel speech recognition:', error);
  }
};

// Check if speech recognition is supported
const checkSupport = async () => {
  const isSupported = await ViroSpeechRecognition.isSupported();
  console.log('Speech recognition supported:', isSupported);
};

// Get available languages
const getLanguages = async () => {
  const languages = await ViroSpeechRecognition.getAvailableLanguages();
  console.log('Available languages:', languages);
};

// Clean up listeners when component unmounts
const cleanup = () => {
  resultListener();
  errorListener();
  stateListener();
  volumeListener();
  // Or use:
  // speechRecognition.removeAllListeners();
};
```

## API Reference

### ViroSpeechRecognition

#### Static Methods

##### `getInstance(options?: SpeechRecognitionOptions): ViroSpeechRecognition`

Get the singleton instance of the speech recognition module.

##### `isSupported(engine?: SpeechRecognitionEngine): Promise<boolean>`

Check if speech recognition is supported on the device.

##### `getAvailableLanguages(): Promise<string[]>`

Get a list of available language codes for speech recognition.

#### Instance Methods

##### `setOptions(options: Partial<SpeechRecognitionOptions>): void`

Update speech recognition options.

##### `start(): Promise<void>`

Start listening for speech.

##### `stop(): Promise<void>`

Stop listening for speech.

##### `cancel(): Promise<void>`

Cancel speech recognition and discard any partial results.

##### `getState(): SpeechRecognitionState`

Get the current state of speech recognition.

##### `onResult(callback: SpeechRecognitionEventHandler): () => void`

Add a listener for speech recognition results. Returns a function to remove the listener.

##### `onError(callback: SpeechRecognitionErrorHandler): () => void`

Add a listener for speech recognition errors. Returns a function to remove the listener.

##### `onStateChange(callback: SpeechRecognitionStateChangeHandler): () => void`

Add a listener for speech recognition state changes. Returns a function to remove the listener.

##### `onVolumeChange(callback: SpeechRecognitionVolumeChangeHandler): () => void`

Add a listener for speech volume changes. Returns a function to remove the listener.

##### `removeAllListeners(): void`

Remove all event listeners.

### SpeechRecognitionOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `engine` | `SpeechRecognitionEngine` | `DEFAULT` | The speech recognition engine to use |
| `languageCode` | `string` | `"en-US"` | The language code to use for recognition (BCP-47 format) |
| `maxDuration` | `number` | `10000` | Maximum duration in milliseconds to listen for speech |
| `continuous` | `boolean` | `false` | Whether to use continuous recognition (keeps listening after results) |
| `partialResults` | `boolean` | `true` | Whether to return partial results while speaking |
| `apiKey` | `string` | `undefined` | API key for Google Cloud Speech (required if using Google engine) |
| `preferOnDevice` | `boolean` | `true` | Whether to use on-device recognition when available |
| `enableWakeWord` | `boolean` | `false` | Whether to enable wake word detection |
| `wakeWord` | `string` | `"Hey Assistant"` | Custom wake word or phrase to listen for |
| `filterProfanity` | `boolean` | `false` | Whether to filter out profanity in results |
| `stopOnSilence` | `boolean` | `true` | Whether to automatically stop recognition on silence |
| `silenceTimeout` | `number` | `1500` | Duration of silence in milliseconds before automatically stopping |

### SpeechRecognitionEngine

| Value | Description |
|-------|-------------|
| `GOOGLE` | Google's Cloud Speech-to-Text API |
| `APPLE` | Apple's Speech Framework (iOS only) |
| `ML_KIT` | On-device ML Kit Speech Recognition |
| `DEFAULT` | Default engine based on platform (Apple on iOS, Google on Android) |

### SpeechRecognitionState

| Value | Description |
|-------|-------------|
| `INACTIVE` | Speech recognition is not active |
| `LISTENING` | Speech recognition is listening for audio |
| `PROCESSING` | Speech recognition is processing audio |
| `STOPPED` | Speech recognition has been stopped |
| `ERROR` | Speech recognition encountered an error |

### SpeechRecognitionResult

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | The recognized text |
| `isFinal` | `boolean` | Whether this is a final result or partial result |
| `confidence` | `number` | Confidence score between 0 and 1 |
| `alternatives` | `{ text: string, confidence: number }[]` | Alternative recognition results |

### SpeechRecognitionError

| Property | Type | Description |
|----------|------|-------------|
| `code` | `string` | Error code |
| `message` | `string` | Error message |

## Platform-specific Notes

### iOS

- Uses Apple's Speech Framework for recognition
- Requires microphone permission
- Add `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription` to your Info.plist

### Android

- Uses Android's built-in SpeechRecognizer
- Requires RECORD_AUDIO permission
- Add `<uses-permission android:name="android.permission.RECORD_AUDIO" />` to your AndroidManifest.xml

## License

MIT