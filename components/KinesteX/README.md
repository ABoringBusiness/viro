# KinesteX SDK Integration for React Native

This component integrates the [KinesteX SDK](https://github.com/KinesteX/KinesteX-SDK-ReactNative) for motion tracking and analysis in React Native applications.

## Features

- Advanced motion tracking and analysis for health, fitness, and safety applications
- Real-time monitoring and feedback for user movements
- Customizable user experiences with flexible UI components
- Pre-built AI-powered experiences for engaging user interactions
- Data-driven insights with detailed analytics and performance metrics

## Installation

This component is included in the `@reactvision/react-viro` package. However, you'll need to install the required dependencies:

```bash
npm install react-native-webview
```

If you're using Expo, install with:

```bash
npx expo install react-native-webview
```

## Usage

```jsx
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { KinesteXSDK, IntegrationOption, PlanCategory, IPostData } from '@reactvision/react-viro';

const MyComponent = () => {
  const kinestexSDKRef = useRef(null);

  // Create initial postData object to communicate with KinesteX
  const postData: IPostData = {
    key: 'YOUR_API_KEY', // Your KinesteX API key
    userId: 'USER_ID', // Your unique user identifier
    company: 'YOUR_COMPANY', // Your company name
    customParameters: {
      style: 'dark', // dark or light theme
    },
  };

  // Handle messages from KinesteX SDK
  const handleMessage = (type, data) => {
    switch (type) {
      case 'exit_kinestex':
        console.log('User wishes to exit the app');
        break;
      case 'plan_unlocked':
        console.log('Workout plan unlocked:', data);
        break;
      default:
        console.log('Other message type:', type, data);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <KinesteXSDK
        ref={kinestexSDKRef}
        data={postData}
        integrationOption={IntegrationOption.MAIN}
        handleMessage={handleMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MyComponent;
```

## Integration Options

The KinesteX SDK supports several integration options:

- `MAIN`: Displays 3 workout plans for user to select based on category
- `PLAN`: Displays Individual Plan Component
- `WORKOUT`: Displays Individual Workout Component
- `CHALLENGE`: Displays Individual Exercise in a challenge form
- `LEADERBOARD`: Displays Leaderboard for individual challenge exercise
- `EXPERIENCE`: Displays AI Experience
- `CAMERA`: Integrate camera component with pose-analysis and feedback

## Required Permissions

### Android

Add the following permissions to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET"/>
<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.sensor.accelerometer" android:required="false" />
<uses-feature android:name="android.hardware.sensor.gyroscope" android:required="false" />
```

### iOS

Add the following keys to your `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Please grant access to camera to start AI Workout</string>
<key>NSMotionUsageDescription</key>
<string>We need access to your device's motion sensors to properly position your phone for the workout</string>
```

## API Reference

### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `IPostData` | Configuration data for the KinesteX SDK |
| `integrationOption` | `IntegrationOption` | The integration option to use |
| `handleMessage` | `(type: string, data: any) => void` | Callback function for handling messages from the SDK |
| `username` | `string` (optional) | Username for leaderboard |
| `plan` | `string` (optional) | Plan name for PLAN integration option |
| `workout` | `string` (optional) | Workout name for WORKOUT integration option |
| `experience` | `string` (optional) | Experience name for EXPERIENCE integration option |
| `style` | `ViewStyle` (optional) | Custom styles for the container |

### Methods

| Method | Description |
|--------|-------------|
| `changeExercise(exercise: string)` | Change the current exercise (for CAMERA integration option) |

## Credits

This component is an integration of the [KinesteX SDK](https://github.com/KinesteX/KinesteX-SDK-ReactNative) for React Native.