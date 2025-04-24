# Apple Intelligence Glow Effect for React Native

A React Native implementation of the Apple Intelligence Glow Effect, inspired by [jacobamobin/AppleIntelligenceGlowEffect](https://github.com/jacobamobin/AppleIntelligenceGlowEffect).

## Features

- 🌟 Pure React Native implementation - no native modules required
- 📱 Cross-platform support for iOS and Android
- 🎨 Fully customizable colors and animations
- ⚡️ Optimized performance with configurable parameters
- 🔄 Smooth, fluid animations
- 🎯 Easy to integrate into existing projects

## Installation

This component is included in the `@reactvision/react-viro` package.

## Usage

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlowEffect } from '@reactvision/react-viro';

const MyComponent = () => {
  return (
    <View style={styles.container}>
      {/* The GlowEffect component will render behind other content */}
      <GlowEffect />
      
      <View style={styles.content}>
        <Text style={styles.title}>Your Content Here</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black', // Dark background works best
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default MyComponent;
```

## Customization

You can customize the GlowEffect component by passing props:

```jsx
<GlowEffect 
  style={{ /* custom styles */ }}
  containerStyle={{ /* container styles */ }}
  cornerRadius={30} // Default is 55
/>
```

## How It Works

The GlowEffect component creates multiple layers of animated gradients with different blur effects to create a glowing effect similar to Apple's Intelligence UI design language. The effect is built entirely in React Native without requiring any native modules.

## Credits

This component is inspired by [jacobamobin/AppleIntelligenceGlowEffect](https://github.com/jacobamobin/AppleIntelligenceGlowEffect), a SwiftUI implementation of the Apple Intelligence Glow Effect.