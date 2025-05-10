import React, { useState } from 'react';
import { View, StyleSheet, Text, SafeAreaView, ScrollView, Alert } from 'react-native';
import SwiftAI from './SwiftAI';

/**
 * Example component demonstrating how to use the SwiftAI component
 */
const SwiftAIExample: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Handle transcript from SwiftAI
  const handleTranscript = (text: string) => {
    setTranscript(text);
  };

  // Handle response from SwiftAI
  const handleResponse = (text: string) => {
    setResponse(text);
  };

  // Handle errors from SwiftAI
  const handleError = (error: Error) => {
    setError(error.message);
    Alert.alert('Error', error.message);
  };

  // Custom system prompt for the AI
  const systemPrompt = `
    - You are Swift, a friendly and helpful voice assistant integrated with a React Native application.
    - You can help users understand what they're seeing in the camera view.
    - Respond briefly to the user's request, and do not provide unnecessary information.
    - If you don't understand the user's request, ask for clarification.
    - The current time is ${new Date().toLocaleString()}.
  `;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Swift AI Voice Assistant</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <ScrollView style={styles.conversationContainer}>
          {transcript && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>You said:</Text>
              <Text style={styles.messageText}>{transcript}</Text>
            </View>
          )}
          
          {response && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Swift responded:</Text>
              <Text style={styles.messageText}>{response}</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.assistantContainer}>
          <SwiftAI
            groqApiKey="YOUR_GROQ_API_KEY" // Replace with your actual API key
            cartesiaApiKey="YOUR_CARTESIA_API_KEY" // Replace with your actual API key
            systemPrompt={systemPrompt}
            onTranscript={handleTranscript}
            onResponse={handleResponse}
            onError={handleError}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: '#D32F2F',
  },
  conversationContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#666',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  assistantContainer: {
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SwiftAIExample;