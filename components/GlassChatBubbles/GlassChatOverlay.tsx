import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import GlassChatBubbleManager, { ChatMessage } from './GlassChatBubbleManager';

export interface GlassChatOverlayProps {
  /**
   * Whether the user is currently speaking
   */
  isSpeaking?: boolean;
  
  /**
   * The transcript of what the user said
   */
  userTranscript?: string;
  
  /**
   * The response from the assistant
   */
  assistantResponse?: string;
  
  /**
   * Custom style for the container
   */
  style?: ViewStyle;
  
  /**
   * Position of the chat bubbles (default: 'bottom')
   */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  
  /**
   * How long each bubble should stay visible in milliseconds (default: 5000)
   */
  bubbleDuration?: number;
  
  /**
   * Whether to show the "Listening..." bubble when the user is speaking (default: true)
   */
  showListeningBubble?: boolean;
  
  /**
   * Children components to render
   */
  children?: React.ReactNode;
}

/**
 * A component that overlays glass chat bubbles on top of camera content
 */
const GlassChatOverlay: React.FC<GlassChatOverlayProps> = ({
  isSpeaking = false,
  userTranscript,
  assistantResponse,
  style,
  position = 'bottom',
  bubbleDuration = 5000,
  showListeningBubble = true,
  children,
}) => {
  // State to track all messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Add listening message when user starts speaking
  useEffect(() => {
    if (isSpeaking && showListeningBubble) {
      const listeningMessage: ChatMessage = {
        id: `listening-${Date.now()}`,
        message: 'Listening...',
        role: 'assistant',
        timestamp: Date.now(),
      };
      
      setMessages((prev) => {
        // Remove any existing listening messages
        const filtered = prev.filter((msg) => !msg.id.startsWith('listening-'));
        return [listeningMessage, ...filtered];
      });
    } else {
      // Remove listening message when user stops speaking
      setMessages((prev) => 
        prev.filter((msg) => !msg.id.startsWith('listening-'))
      );
    }
  }, [isSpeaking, showListeningBubble]);
  
  // Add user transcript when it changes
  useEffect(() => {
    if (userTranscript) {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        message: userTranscript,
        role: 'user',
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [userMessage, ...prev]);
    }
  }, [userTranscript]);
  
  // Add assistant response when it changes
  useEffect(() => {
    if (assistantResponse) {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        message: assistantResponse,
        role: 'assistant',
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [assistantMessage, ...prev]);
    }
  }, [assistantResponse]);
  
  // Handle message removal
  const handleMessageRemoved = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);
  
  return (
    <View style={[styles.container, style]}>
      {children}
      
      <GlassChatBubbleManager
        messages={messages}
        position={position}
        bubbleDuration={bubbleDuration}
        onMessageRemoved={handleMessageRemoved}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GlassChatOverlay;