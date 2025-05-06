import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SwiftAIClient, Message } from './SwiftAIClient';
import { AudioPlayer } from './AudioPlayer';
import { VoiceRecognition } from './VoiceRecognition';

export interface SwiftAIProps {
  groqApiKey: string;
  cartesiaApiKey: string;
  systemPrompt?: string;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  onError?: (error: Error) => void;
}

/**
 * SwiftAI - A voice assistant component for React Native
 * Adapted from https://github.com/ai-ng/swift
 */
const SwiftAI: React.FC<SwiftAIProps> = ({
  groqApiKey,
  cartesiaApiKey,
  systemPrompt,
  onTranscript,
  onResponse,
  onError,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const clientRef = useRef<SwiftAIClient | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const recognitionRef = useRef<VoiceRecognition | null>(null);

  // Initialize the client, player, and recognition on mount
  useEffect(() => {
    clientRef.current = new SwiftAIClient({
      groqApiKey,
      cartesiaApiKey,
    });

    playerRef.current = new AudioPlayer({
      onPlaybackComplete: () => {
        // Resume listening after playback completes
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      },
    });

    recognitionRef.current = new VoiceRecognition({
      onSpeechStart: () => {
        setIsListening(true);
      },
      onSpeechEnd: async (audioData) => {
        setIsListening(false);
        setIsProcessing(true);
        
        try {
          await processVoiceCommand(audioData);
        } catch (error) {
          console.error('Error processing voice command:', error);
          if (onError) {
            onError(error instanceof Error ? error : new Error(String(error)));
          }
        } finally {
          setIsProcessing(false);
        }
      },
      onError: (error) => {
        console.error('Voice recognition error:', error);
        if (onError) {
          onError(error);
        }
      },
    });

    // Clean up on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [groqApiKey, cartesiaApiKey, onError]);

  // Process a voice command
  const processVoiceCommand = async (audioData: Blob) => {
    if (!clientRef.current) return;

    try {
      // Stop any ongoing playback
      if (playerRef.current) {
        playerRef.current.stop();
      }

      // Default system prompt if not provided
      const defaultSystemPrompt = `
        - You are Swift, a friendly and helpful voice assistant.
        - Respond briefly to the user's request, and do not provide unnecessary information.
        - If you don't understand the user's request, ask for clarification.
        - You do not have access to up-to-date information, so you should not provide real-time data.
        - You are not capable of performing actions other than responding to the user.
        - Do not use markdown, emojis, or other formatting in your responses. Respond in a way easily spoken by text-to-speech software.
        - The current time is ${new Date().toLocaleString()}.
      `;

      // Process the voice command
      const result = await clientRef.current.processVoiceCommand(
        audioData,
        messages,
        systemPrompt || defaultSystemPrompt
      );

      // Update state with the results
      setTranscript(result.transcript);
      setResponse(result.responseText);
      
      // Update messages
      const updatedMessages: Message[] = [
        ...messages,
        { role: 'user', content: result.transcript },
        { role: 'assistant', content: result.responseText },
      ];
      setMessages(updatedMessages);

      // Call callbacks
      if (onTranscript) {
        onTranscript(result.transcript);
      }
      if (onResponse) {
        onResponse(result.responseText);
      }

      // Play the response audio
      if (playerRef.current) {
        await playerRef.current.playFromArrayBuffer(result.audioData);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  // Toggle listening state
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (recognitionRef.current.isActive()) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Display the transcript and response */}
      {transcript ? (
        <View style={styles.messageContainer}>
          <Text style={styles.transcriptText}>You: {transcript}</Text>
          <Text style={styles.responseText}>Swift: {response}</Text>
        </View>
      ) : (
        <View style={styles.messageContainer}>
          <Text style={styles.instructionText}>
            Tap the button and start speaking
          </Text>
        </View>
      )}

      {/* Microphone button */}
      <TouchableOpacity
        style={[
          styles.micButton,
          isListening ? styles.micButtonActive : null,
          isProcessing ? styles.micButtonProcessing : null,
        ]}
        onPress={toggleListening}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="large" color="#FFFFFF" />
        ) : (
          <Text style={styles.micButtonText}>
            {isListening ? 'Listening...' : 'Tap to Speak'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageContainer: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: '100%',
    maxWidth: 400,
  },
  transcriptText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  responseText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  micButtonActive: {
    backgroundColor: '#FF5252',
    transform: [{ scale: 1.1 }],
  },
  micButtonProcessing: {
    backgroundColor: '#FFA000',
  },
  micButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default SwiftAI;