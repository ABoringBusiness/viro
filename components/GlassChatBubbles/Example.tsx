import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import GlassChatOverlay from './GlassChatOverlay';

/**
 * Example component demonstrating how to use the GlassChatOverlay with a camera
 */
const GlassChatBubblesExample: React.FC = () => {
  // State to track speaking status
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // State to track transcript and response
  const [transcript, setTranscript] = useState<string | undefined>();
  const [response, setResponse] = useState<string | undefined>();
  
  // Simulate conversation when speaking starts/stops
  useEffect(() => {
    if (isSpeaking) {
      // Clear previous transcript and response
      setTranscript(undefined);
      setResponse(undefined);
      
      // Simulate a delay before getting the transcript
      const transcriptTimer = setTimeout(() => {
        setIsSpeaking(false);
        setTranscript('What can you tell me about this object?');
        
        // Simulate a delay before getting the response
        const responseTimer = setTimeout(() => {
          setResponse('This appears to be a camera view. I can see the scene you\'re looking at, but without more specific details about what object you\'re referring to, I can\'t provide more information.');
        }, 1000);
        
        return () => clearTimeout(responseTimer);
      }, 3000);
      
      return () => clearTimeout(transcriptTimer);
    }
  }, [isSpeaking]);
  
  // Toggle speaking state
  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <GlassChatOverlay
        isSpeaking={isSpeaking}
        userTranscript={transcript}
        assistantResponse={response}
        position="bottom"
      >
        {/* This would typically be your camera component */}
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.cameraText}>Camera View</Text>
          
          <TouchableOpacity
            style={[
              styles.speakButton,
              isSpeaking ? styles.speakingButton : null,
            ]}
            onPress={toggleSpeaking}
          >
            <Text style={styles.speakButtonText}>
              {isSpeaking ? 'Stop' : 'Speak'}
            </Text>
          </TouchableOpacity>
        </View>
      </GlassChatOverlay>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  speakButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    position: 'absolute',
    bottom: 30,
  },
  speakingButton: {
    backgroundColor: '#E53935',
  },
  speakButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GlassChatBubblesExample;