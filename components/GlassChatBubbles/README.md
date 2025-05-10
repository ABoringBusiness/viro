# Glass Chat Bubbles for React Native

A set of components for displaying glass-style chat bubbles over camera views in React Native applications. Perfect for AR/VR applications, voice assistants, and camera-based interactions.

## Features

- 🫧 Beautiful glass-style chat bubbles with blur effects
- 🎙️ Integration with voice recognition and AI assistants
- 🎬 Overlay on camera views for AR-like experiences
- ✨ Smooth animations for bubble appearance and disappearance
- 🎨 Customizable styles, positions, and durations

## Installation

This component is included in the `@reactvision/react-viro` package.

## Usage

### Basic Usage

```jsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { GlassChatOverlay } from '@reactvision/react-viro';

const MyComponent = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState();
  const [response, setResponse] = useState();

  const handleSpeak = () => {
    setIsSpeaking(true);
    
    // Simulate speech recognition
    setTimeout(() => {
      setIsSpeaking(false);
      setTranscript('What is this object?');
      
      // Simulate AI response
      setTimeout(() => {
        setResponse('This appears to be a camera view. I can see what you\'re looking at.');
      }, 1000);
    }, 3000);
  };

  return (
    <GlassChatOverlay
      isSpeaking={isSpeaking}
      userTranscript={transcript}
      assistantResponse={response}
      position="bottom"
    >
      {/* Your camera component here */}
      <View style={{ flex: 1, backgroundColor: '#333' }}>
        <Button title="Speak" onPress={handleSpeak} />
      </View>
    </GlassChatOverlay>
  );
};

export default MyComponent;
```

### Integration with SwiftAI

```jsx
import React from 'react';
import { View } from 'react-native';
import { SwiftAIWithChatBubbles } from '@reactvision/react-viro';

const MyComponent = () => {
  return (
    <SwiftAIWithChatBubbles
      groqApiKey="YOUR_GROQ_API_KEY"
      cartesiaApiKey="YOUR_CARTESIA_API_KEY"
      bubblePosition="bottom"
      bubbleDuration={5000}
    >
      {/* Your camera component here */}
      <View style={{ flex: 1, backgroundColor: '#333' }} />
    </SwiftAIWithChatBubbles>
  );
};

export default MyComponent;
```

## Components

### GlassChatBubble

A single glass-style chat bubble.

```jsx
<GlassChatBubble
  message="Hello, world!"
  role="user" // or "assistant"
  visible={true}
  position="bottom"
  onAnimationComplete={() => console.log('Animation complete')}
/>
```

### GlassChatBubbleManager

Manages multiple chat bubbles, handling their appearance, disappearance, and positioning.

```jsx
<GlassChatBubbleManager
  messages={[
    { id: '1', message: 'Hello', role: 'user', timestamp: Date.now() },
    { id: '2', message: 'Hi there!', role: 'assistant', timestamp: Date.now() - 1000 }
  ]}
  maxBubbles={3}
  bubbleDuration={5000}
  position="bottom"
  autoRemove={true}
  onMessageRemoved={(id) => console.log(`Message ${id} removed`)}
/>
```

### GlassChatOverlay

Overlays chat bubbles on top of camera content, handling the display of user transcripts and assistant responses.

```jsx
<GlassChatOverlay
  isSpeaking={isSpeaking}
  userTranscript="What is this object?"
  assistantResponse="This is a camera view."
  position="bottom"
  bubbleDuration={5000}
  showListeningBubble={true}
>
  {/* Your camera component here */}
</GlassChatOverlay>
```

### SwiftAIWithChatBubbles

Integrates the SwiftAI voice assistant with glass chat bubbles over a camera view.

```jsx
<SwiftAIWithChatBubbles
  groqApiKey="YOUR_GROQ_API_KEY"
  cartesiaApiKey="YOUR_CARTESIA_API_KEY"
  systemPrompt="You are a helpful assistant that can see what the user is looking at."
  bubblePosition="bottom"
  bubbleDuration={5000}
>
  {/* Your camera component here */}
</SwiftAIWithChatBubbles>
```

## Customization

All components accept style props for customizing their appearance:

```jsx
<GlassChatBubble
  message="Hello, world!"
  role="user"
  visible={true}
  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
  textStyle={{ color: '#fff', fontWeight: 'bold' }}
/>
```

## Notes

- The glass effect works best on dark backgrounds
- For optimal performance, limit the number of simultaneous bubbles
- The backdropFilter property may not be supported on all React Native platforms