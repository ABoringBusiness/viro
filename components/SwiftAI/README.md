# SwiftAI Voice Assistant for React Native

A React Native implementation of the [Swift AI Voice Assistant](https://github.com/ai-ng/swift), providing voice-based interaction capabilities powered by Groq and Cartesia.

## Features

- 🎙️ Voice recognition for capturing user speech
- 🧠 AI-powered text generation using Groq's LLM API (Llama 3)
- 🔊 High-quality speech synthesis using Cartesia's Sonic API
- ⚡ Fast response times for natural conversation flow
- 🔄 Seamless integration with React Native applications

## Installation

This component is included in the `@reactvision/react-viro` package. However, you'll need to obtain API keys for the required services:

1. Get a Groq API key from [groq.com](https://groq.com)
2. Get a Cartesia API key from [cartesia.ai](https://cartesia.ai)

## Usage

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SwiftAI } from '@reactvision/react-viro';

const MyComponent = () => {
  const handleTranscript = (text) => {
    console.log('User said:', text);
  };

  const handleResponse = (text) => {
    console.log('AI responded:', text);
  };

  const handleError = (error) => {
    console.error('Error:', error.message);
  };

  return (
    <View style={styles.container}>
      <SwiftAI
        groqApiKey="YOUR_GROQ_API_KEY"
        cartesiaApiKey="YOUR_CARTESIA_API_KEY"
        onTranscript={handleTranscript}
        onResponse={handleResponse}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyComponent;
```

## API Reference

### SwiftAI Component

| Prop | Type | Description |
|------|------|-------------|
| `groqApiKey` | `string` | Your Groq API key |
| `cartesiaApiKey` | `string` | Your Cartesia API key |
| `systemPrompt` | `string` (optional) | Custom system prompt for the AI |
| `onTranscript` | `(text: string) => void` (optional) | Callback when user speech is transcribed |
| `onResponse` | `(text: string) => void` (optional) | Callback when AI generates a response |
| `onError` | `(error: Error) => void` (optional) | Callback when an error occurs |

### SwiftAIClient

The `SwiftAIClient` class provides direct access to the underlying AI services:

```jsx
import { SwiftAIClient } from '@reactvision/react-viro';

const client = new SwiftAIClient({
  groqApiKey: 'YOUR_GROQ_API_KEY',
  cartesiaApiKey: 'YOUR_CARTESIA_API_KEY',
});

// Transcribe audio
const transcription = await client.transcribeAudio(audioBlob);

// Generate text completion
const completion = await client.generateCompletion(messages, systemPrompt);

// Synthesize speech
const voice = await client.synthesizeSpeech(text);

// Process a voice command end-to-end
const result = await client.processVoiceCommand(audioBlob, messages, systemPrompt);
```

### AudioPlayer

The `AudioPlayer` class provides utilities for playing audio:

```jsx
import { AudioPlayer } from '@reactvision/react-viro';

const player = new AudioPlayer({
  onPlaybackComplete: () => console.log('Playback complete'),
});

// Play from ArrayBuffer
await player.playFromArrayBuffer(audioData);

// Play from stream
await player.playFromStream(audioStream);

// Stop playback
player.stop();
```

### VoiceRecognition

The `VoiceRecognition` class provides utilities for voice recognition:

```jsx
import { VoiceRecognition } from '@reactvision/react-viro';

const recognition = new VoiceRecognition({
  onSpeechStart: () => console.log('Speech started'),
  onSpeechEnd: (audioData) => console.log('Speech ended'),
  onError: (error) => console.error('Error:', error),
});

// Start recognition
recognition.start();

// Stop recognition
recognition.stop();
```

## Credits

This component is adapted from the [Swift AI Voice Assistant](https://github.com/ai-ng/swift) project, which is a Next.js implementation of a voice assistant powered by Groq, Cartesia, and Vercel.