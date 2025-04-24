import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

// Define types for the KinesteX SDK
export enum IntegrationOption {
  MAIN = 'MAIN',
  PLAN = 'PLAN',
  WORKOUT = 'WORKOUT',
  CHALLENGE = 'CHALLENGE',
  EXPERIENCE = 'EXPERIENCE',
  CAMERA = 'CAMERA',
  LEADERBOARD = 'LEADERBOARD',
}

export enum PlanCategory {
  Cardio = 'Cardio',
  Strength = 'Strength',
  Flexibility = 'Flexibility',
  Balance = 'Balance',
  Endurance = 'Endurance',
}

export enum Lifestyle {
  Sedentary = 'Sedentary',
  LightlyActive = 'LightlyActive',
  ModeratelyActive = 'ModeratelyActive',
  VeryActive = 'VeryActive',
  ExtremelyActive = 'ExtremelyActive',
}

export interface IPostData {
  key: string;
  userId: string;
  company: string;
  planCategory?: PlanCategory;
  showLeaderboard?: boolean;
  countdown?: number;
  exercise?: string;
  currentExercise?: string;
  exercises?: string[];
  customParameters?: {
    style?: 'dark' | 'light';
    [key: string]: any;
  };
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  gender?: string | null;
  lifestyle?: Lifestyle | null;
}

export interface KinesteXSDKProps {
  data: IPostData;
  integrationOption: IntegrationOption;
  handleMessage: (type: string, data: { [key: string]: any }) => void;
  username?: string;
  plan?: string;
  workout?: string;
  experience?: string;
  style?: ViewStyle;
}

export interface KinesteXSDKRef {
  changeExercise: (exercise: string) => void;
}

/**
 * KinesteX SDK Component for React Native
 * 
 * This component integrates the KinesteX SDK for motion tracking and analysis
 * in React Native applications.
 */
const KinesteXSDK = forwardRef<KinesteXSDKRef, KinesteXSDKProps>((props, ref) => {
  const {
    data,
    integrationOption,
    handleMessage,
    username,
    plan,
    workout,
    experience,
    style,
  } = props;

  const webViewRef = useRef<WebView>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    changeExercise: (exercise: string) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: 'change_exercise',
            data: { exercise },
          })
        );
      }
    },
  }));

  // Handle messages from the WebView
  const onMessage = (event: any) => {
    try {
      const { type, data } = JSON.parse(event.nativeEvent.data);
      handleMessage(type, data);
    } catch (error) {
      console.error('Error parsing message from KinesteX SDK:', error);
    }
  };

  // Create the source URL with query parameters
  const getSourceUrl = () => {
    const baseUrl = 'https://app.kinestex.com';
    const queryParams = new URLSearchParams();

    // Add required parameters
    queryParams.append('key', data.key);
    queryParams.append('userId', data.userId);
    queryParams.append('company', data.company);
    queryParams.append('integration', integrationOption);

    // Add optional parameters
    if (username) queryParams.append('username', username);
    if (plan) queryParams.append('plan', plan);
    if (workout) queryParams.append('workout', workout);
    if (experience) queryParams.append('experience', experience);
    
    // Add plan category if provided
    if (data.planCategory) queryParams.append('planCategory', data.planCategory);
    
    // Add challenge parameters if provided
    if (data.showLeaderboard !== undefined) queryParams.append('showLeaderboard', data.showLeaderboard.toString());
    if (data.countdown) queryParams.append('countdown', data.countdown.toString());
    if (data.exercise) queryParams.append('exercise', data.exercise);
    
    // Add camera parameters if provided
    if (data.currentExercise) queryParams.append('currentExercise', data.currentExercise);
    if (data.exercises) queryParams.append('exercises', JSON.stringify(data.exercises));
    
    // Add user details if provided
    if (data.age) queryParams.append('age', data.age.toString());
    if (data.height) queryParams.append('height', data.height.toString());
    if (data.weight) queryParams.append('weight', data.weight.toString());
    if (data.gender) queryParams.append('gender', data.gender);
    if (data.lifestyle) queryParams.append('lifestyle', data.lifestyle);
    
    // Add custom parameters if provided
    if (data.customParameters) {
      Object.entries(data.customParameters).forEach(([key, value]) => {
        queryParams.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });
    }

    return `${baseUrl}?${queryParams.toString()}`;
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ uri: getSourceUrl() }}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        style={styles.webView}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
  },
});

export default KinesteXSDK;