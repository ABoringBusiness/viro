import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import GlassChatOverlay from './GlassChatOverlay';
import { SwiftAI, SwiftAIClient, VoiceRecognition } from '../SwiftAI';

export interface SwiftAIWithChatBubblesProps {
  /**
   * Your Groq API key
   */
  groqApiKey: string;
  
  /**
   * Your Cartesia API key
   */
  cartesiaApiKey: string;
  
  /**
   * Custom system prompt for the AI
   */
  systemPrompt?: string;
  
  /**
   * Position of the chat bubbles (default: 'bottom')
   */
  bubblePosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  
  /**
   * How long each bubble should stay visible in milliseconds (default: 5000)
   */
  bubbleDuration?: number;
  
  /**
   * Children components to render (typically your camera component)
   */
  children?: React.ReactNode;
}

/**
 * A component that integrates SwiftAI with glass chat bubbles over a camera view
 */
const SwiftAIWithChatBubbles: React.FC<SwiftAIWithChatBubblesProps> = ({
  groqApiKey,
  cartesiaApiKey,
  systemPrompt,
  bubblePosition = 'bottom',
  bubbleDuration = 5000,
  children,
}) => {
  // State to track speaking status
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // State to track transcript and response
  const [transcript, setTranscript] = useState<string | undefined>();
  const [response, setResponse] = useState<string | undefined>();
  
  // Reference to the voice recognition
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  
  // Initialize voice recognition
  const initializeVoiceRecognition = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = new VoiceRecognition({
        onSpeechStart: () => {
          setIsSpeaking(true);
          // Clear previous transcript and response
          setTranscript(undefined);
          setResponse(undefined);
        },
        onSpeechEnd: async (audioData) => {
          setIsSpeaking(false);
          
          try {
            // Process the audio data with SwiftAI
            const client = new SwiftAIClient({
              groqApiKey,
              cartesiaApiKey,
            });
            
            // Transcribe the audio
            const transcription = await client.transcribeAudio(audioData);
            setTranscript(transcription.text);
            
            // Generate a response
            const defaultSystemPrompt = `
              - You are a helpful assistant that can see what the user is looking at through the camera.
              - Respond briefly to the user's request, and do not provide unnecessary information.
              - If you don't understand the user's request, ask for clarification.
              - The current time is ${new Date().toLocaleString()}.
            `;
            
            const completion = await client.generateCompletion(
              [{ role: 'user', content: transcription.text }],
              systemPrompt || defaultSystemPrompt
            );
            
            setResponse(completion.content);
            
            // Synthesize speech (in a real implementation, you would play this)
            await client.synthesizeSpeech(completion.content);
          } catch (error) {
            console.error('Error processing voice command:', error);
            setResponse('Sorry, I encountered an error processing your request.');
          }
        },
        onError: (error) => {
          console.error('Voice recognition error:', error);
          setIsSpeaking(false);
          setResponse('Sorry, there was an error with voice recognition.');
        },
      });
    }
  };
  
  // Toggle speaking state
  const toggleSpeaking = () => {
    initializeVoiceRecognition();
    
    if (isSpeaking) {
      // Stop speaking
      recognitionRef.current?.stop();
      setIsSpeaking(false);
    } else {
      // Start speaking
      recognitionRef.current?.start();
      // setIsSpeaking will be set to true in the onSpeechStart callback
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <GlassChatOverlay
        isSpeaking={isSpeaking}
        userTranscript={transcript}
        assistantResponse={response}
        position={bubblePosition}
        bubbleDuration={bubbleDuration}
      >
        {/* Render the children (typically your camera component) */}
        {children || (
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraText}>Camera View</Text>
          </View>
        )}
        
        {/* Speak button */}
        <TouchableOpacity
          style={[
            styles.speakButton,
            isSpeaking ? styles.speakingButton : null,
          ]}
          onPress={toggleSpeaking}
        >
          <Text style={styles.speakButtonText}>
            {isSpeaking ? 'Listening...' : 'Speak'}
          </Text>
        </TouchableOpacity>
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
  },
  speakButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    // Glass effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  speakingButton: {
    backgroundColor: 'rgba(229, 57, 53, 0.8)',
  },
  speakButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SwiftAIWithChatBubbles;