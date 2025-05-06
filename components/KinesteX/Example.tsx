import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import KinesteXSDK, { IntegrationOption, PlanCategory, IPostData, KinesteXSDKRef } from './KinesteXSDK';

/**
 * Example component demonstrating how to use the KinesteX SDK
 */
const KinesteXExample: React.FC = () => {
  const [showSDK, setShowSDK] = useState(false);
  const kinestexSDKRef = useRef<KinesteXSDKRef>(null);

  // Create initial postData object to communicate with KinesteX
  const postData: IPostData = {
    key: 'YOUR_API_KEY', // Replace with your actual API key
    userId: 'USER_ID', // Replace with your user ID
    company: 'YOUR_COMPANY', // Replace with your company name
    planCategory: PlanCategory.Cardio,
    customParameters: {
      style: 'dark', // dark or light theme
    },
  };

  // Handle messages from KinesteX SDK
  const handleMessage = (type: string, data: { [key: string]: any }) => {
    switch (type) {
      case 'exit_kinestex':
        console.log('User wishes to exit the app');
        setShowSDK(false);
        break;
      case 'plan_unlocked':
        console.log('Workout plan unlocked:', data);
        break;
      case 'finished_workout':
        console.log('Workout finished:', data);
        break;
      case 'kinestex_launched':
        console.log('KinesteX launched');
        break;
      case 'error_occured':
        console.error('Error occurred:', data);
        break;
      default:
        console.log('Other message type:', type, data);
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        {!showSDK ? (
          <View style={styles.startScreen}>
            <Text style={styles.title}>KinesteX SDK Example</Text>
            <Text style={styles.subtitle}>
              Advanced motion tracking and analysis for health, fitness, and safety applications
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowSDK(true)}
            >
              <Text style={styles.buttonText}>Start AI Coach</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <KinesteXSDK
            ref={kinestexSDKRef}
            data={postData}
            integrationOption={IntegrationOption.MAIN}
            handleMessage={handleMessage}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  startScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default KinesteXExample;