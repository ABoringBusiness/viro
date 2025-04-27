# Viro Text-to-Speech

This module provides text-to-speech capabilities for AR applications built with Viro.

## Features

- Cross-platform text-to-speech (iOS and Android)
- Support for multiple voices and languages
- Voice gender selection
- Speech rate, pitch, and volume control
- SSML support for advanced speech control
- Audio ducking to lower volume of other audio
- Utterance queueing
- Speech range events for text highlighting
- Synthesize to file capability

## Usage

```javascript
import { ViroTextToSpeech, TextToSpeechEngine, TextToSpeechVoiceGender, TextToSpeechState } from '@reactvision/react-viro';

// Get the text-to-speech instance
const textToSpeech = ViroTextToSpeech.getInstance({
  engine: TextToSpeechEngine.DEFAULT,
  languageCode: 'en-US',
  voiceGender: TextToSpeechVoiceGender.FEMALE,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  audioDucking: true,
  queueUtterances: false
});

// Add listeners for text-to-speech events
const stateListener = textToSpeech.onStateChange((state) => {
  console.log('Text-to-speech state changed to:', state);
  
  // Update UI based on state
  switch (state) {
    case TextToSpeechState.SPEAKING:
      // Show speaking indicator
      break;
    case TextToSpeechState.PAUSED:
      // Show paused indicator
      break;
    case TextToSpeechState.IDLE:
    case TextToSpeechState.STOPPED:
      // Hide indicators
      break;
    case TextToSpeechState.ERROR:
      // Show error state
      break;
  }
});

const startListener = textToSpeech.onStart((utterance) => {
  console.log('Started speaking:', utterance.text);
  console.log('Utterance ID:', utterance.id);
});

const endListener = textToSpeech.onEnd((utterance) => {
  console.log('Finished speaking:', utterance.text);
  console.log('Utterance ID:', utterance.id);
});

const errorListener = textToSpeech.onError((error) => {
  console.error('Text-to-speech error:', error.message);
  console.error('Error code:', error.code);
  
  if (error.utterance) {
    console.error('Error occurred while speaking:', error.utterance.text);
  }
});

const rangeListener = textToSpeech.onRange((range) => {
  console.log('Speaking range:', range.start, 'to', range.end);
  console.log('Utterance ID:', range.utteranceId);
  
  // Update UI to highlight the current word being spoken
});

// Speak text
const speakText = async (text) => {
  try {
    const utteranceId = await textToSpeech.speak(text, {
      rate: 0.8, // Slower than default
      pitch: 1.2, // Higher pitch
    });
    console.log('Speaking with utterance ID:', utteranceId);
  } catch (error) {
    console.error('Failed to speak text:', error);
  }
};

// Speak SSML
const speakSSML = async () => {
  try {
    const ssml = `
      <speak>
        Here's a <emphasis level="strong">very important</emphasis> message.
        <break time="500ms"/>
        The temperature is <say-as interpret-as="cardinal">10</say-as> degrees.
        <audio src="https://example.com/sound.mp3"/>
        <mark name="highlight_section"/>This text will trigger a marker event.
      </speak>
    `;
    
    const utteranceId = await textToSpeech.speakSsml(ssml);
    console.log('Speaking SSML with utterance ID:', utteranceId);
  } catch (error) {
    console.error('Failed to speak SSML:', error);
  }
};

// Stop speaking
const stopSpeaking = async () => {
  try {
    await textToSpeech.stop();
    console.log('Stopped speaking');
  } catch (error) {
    console.error('Failed to stop speaking:', error);
  }
};

// Pause speaking
const pauseSpeaking = async () => {
  try {
    await textToSpeech.pause();
    console.log('Paused speaking');
  } catch (error) {
    console.error('Failed to pause speaking:', error);
  }
};

// Resume speaking
const resumeSpeaking = async () => {
  try {
    await textToSpeech.resume();
    console.log('Resumed speaking');
  } catch (error) {
    console.error('Failed to resume speaking:', error);
  }
};

// Get available voices
const getVoices = async () => {
  try {
    const voices = await ViroTextToSpeech.getVoices();
    console.log('Available voices:', voices);
    
    // Filter voices by language
    const frenchVoices = await ViroTextToSpeech.getVoices('fr');
    console.log('French voices:', frenchVoices);
  } catch (error) {
    console.error('Failed to get voices:', error);
  }
};

// Synthesize to file
const synthesizeToFile = async (text, filePath) => {
  try {
    const outputPath = await ViroTextToSpeech.synthesizeToFile(text, filePath, {
      languageCode: 'en-US',
      voiceGender: TextToSpeechVoiceGender.MALE,
    });
    console.log('Synthesized speech to file:', outputPath);
  } catch (error) {
    console.error('Failed to synthesize to file:', error);
  }
};

// Clean up listeners when component unmounts
const cleanup = () => {
  stateListener();
  startListener();
  endListener();
  errorListener();
  rangeListener();
  // Or use:
  // textToSpeech.removeAllListeners();
};
```

## API Reference

### ViroTextToSpeech

#### Static Methods

##### `getInstance(options?: TextToSpeechOptions): ViroTextToSpeech`

Get the singleton instance of the text-to-speech module.

##### `getVoices(languageCode?: string): Promise<TextToSpeechVoice[]>`

Get a list of available voices, optionally filtered by language code.

##### `isSupported(engine?: TextToSpeechEngine): Promise<boolean>`

Check if text-to-speech is supported on the device.

##### `synthesizeToFile(text: string, filePath: string, options?: Partial<TextToSpeechOptions>): Promise<string>`

Synthesize speech to an audio file without playing it.

#### Instance Methods

##### `setOptions(options: Partial<TextToSpeechOptions>): void`

Update text-to-speech options.

##### `speak(text: string, options?: Partial<TextToSpeechOptions>): Promise<string>`

Speak the provided text. Returns a promise that resolves with the utterance ID.

##### `speakSsml(ssml: string, options?: Partial<TextToSpeechOptions>): Promise<string>`

Speak the provided SSML text. Returns a promise that resolves with the utterance ID.

##### `stop(): Promise<void>`

Stop speaking and clear the queue.

##### `pause(): Promise<void>`

Pause the current speech.

##### `resume(): Promise<void>`

Resume the paused speech.

##### `getState(): TextToSpeechState`

Get the current state of text-to-speech.

##### `getCurrentUtterance(): TextToSpeechUtterance | null`

Get the current utterance being spoken.

##### `getUtteranceQueue(): TextToSpeechUtterance[]`

Get the utterance queue.

##### `clearQueue(): void`

Clear the utterance queue without stopping current speech.

##### `onStateChange(callback: TextToSpeechStateChangeHandler): () => void`

Add a listener for text-to-speech state changes. Returns a function to remove the listener.

##### `onStart(callback: TextToSpeechStartHandler): () => void`

Add a listener for when speech starts. Returns a function to remove the listener.

##### `onEnd(callback: TextToSpeechEndHandler): () => void`

Add a listener for when speech ends. Returns a function to remove the listener.

##### `onError(callback: TextToSpeechErrorHandler): () => void`

Add a listener for text-to-speech errors. Returns a function to remove the listener.

##### `onMarker(callback: TextToSpeechMarkerHandler): () => void`

Add a listener for SSML markers. Returns a function to remove the listener.

##### `onRange(callback: TextToSpeechRangeHandler): () => void`

Add a listener for speech ranges (for highlighting text as it's spoken). Returns a function to remove the listener.

##### `removeAllListeners(): void`

Remove all event listeners.

### TextToSpeechOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `engine` | `TextToSpeechEngine` | `DEFAULT` | The text-to-speech engine to use |
| `languageCode` | `string` | `"en-US"` | The language code to use for speech (BCP-47 format) |
| `voiceId` | `string` | `undefined` | The voice to use for speech |
| `voiceGender` | `TextToSpeechVoiceGender` | `FEMALE` | The gender of the voice to use |
| `rate` | `number` | `1.0` | The speech rate (1.0 is normal speed) |
| `pitch` | `number` | `1.0` | The speech pitch (1.0 is normal pitch) |
| `volume` | `number` | `1.0` | The speech volume (0.0 is silent, 1.0 is maximum) |
| `apiKey` | `string` | `undefined` | API key for Google Cloud TTS (required if using Google engine) |
| `preferOnDevice` | `boolean` | `true` | Whether to use on-device synthesis when available |
| `useSsml` | `boolean` | `false` | Whether to use SSML markup in the text |
| `audioDucking` | `boolean` | `true` | Whether to use audio ducking (lower volume of other audio) |
| `queueUtterances` | `boolean` | `false` | Whether to queue utterances or interrupt current speech |

### TextToSpeechEngine

| Value | Description |
|-------|-------------|
| `GOOGLE` | Google's Cloud Text-to-Speech API |
| `APPLE` | Apple's AVSpeechSynthesizer (iOS only) |
| `ANDROID` | Android's TextToSpeech (Android only) |
| `DEFAULT` | Default engine based on platform (Apple on iOS, Android on Android) |

### TextToSpeechVoiceGender

| Value | Description |
|-------|-------------|
| `MALE` | Male voice |
| `FEMALE` | Female voice |
| `NEUTRAL` | Neutral voice |

### TextToSpeechState

| Value | Description |
|-------|-------------|
| `IDLE` | Text-to-speech is not active |
| `SPEAKING` | Text-to-speech is speaking |
| `PAUSED` | Text-to-speech is paused |
| `STOPPED` | Text-to-speech has been stopped |
| `ERROR` | Text-to-speech encountered an error |

### TextToSpeechVoice

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the voice |
| `name` | `string` | Display name of the voice |
| `languageCode` | `string` | Language code for the voice (BCP-47 format) |
| `gender` | `TextToSpeechVoiceGender` | Gender of the voice |
| `isOfflineAvailable` | `boolean` | Whether the voice is available for offline use |
| `isNeural` | `boolean` | Whether the voice is a neural voice (higher quality) |

### TextToSpeechUtterance

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | The text to speak |
| `id` | `string` | Unique identifier for the utterance |
| `options` | `Partial<TextToSpeechOptions>` | Options specific to this utterance |

### TextToSpeechMarker

| Property | Type | Description |
|----------|------|-------------|
| `utteranceId` | `string` | The utterance ID this marker belongs to |
| `charIndex` | `number` | The character index in the text where the marker occurs |
| `name` | `string` | The name of the marker (if using SSML mark tags) |

## SSML Support

The module supports Speech Synthesis Markup Language (SSML) for more advanced control over speech synthesis. To use SSML, set the `useSsml` option to `true` and provide SSML-formatted text to the `speak` method, or use the `speakSsml` method.

Example SSML:

```xml
<speak>
  Here's a <emphasis level="strong">very important</emphasis> message.
  <break time="500ms"/>
  The temperature is <say-as interpret-as="cardinal">10</say-as> degrees.
  <audio src="https://example.com/sound.mp3"/>
  <mark name="highlight_section"/>This text will trigger a marker event.
</speak>
```

## Platform-specific Notes

### iOS

- Uses Apple's AVSpeechSynthesizer for speech synthesis
- Supports SSML on iOS 10.0 and later
- Supports synthesizing to file on iOS 13.0 and later

### Android

- Uses Android's TextToSpeech for speech synthesis
- Limited SSML support depending on the device
- Resume functionality is limited on Android

## License

MIT