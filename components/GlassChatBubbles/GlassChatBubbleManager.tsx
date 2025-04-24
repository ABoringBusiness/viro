import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import GlassChatBubble from './GlassChatBubble';

export interface ChatMessage {
  /**
   * Unique identifier for the message
   */
  id: string;
  
  /**
   * The message text
   */
  message: string;
  
  /**
   * The role of the message sender
   */
  role: 'user' | 'assistant';
  
  /**
   * Optional timestamp for the message
   */
  timestamp?: number;
}

export interface GlassChatBubbleManagerProps {
  /**
   * Array of messages to display
   */
  messages: ChatMessage[];
  
  /**
   * Maximum number of bubbles to display at once (default: 3)
   */
  maxBubbles?: number;
  
  /**
   * How long each bubble should stay visible in milliseconds (default: 5000)
   */
  bubbleDuration?: number;
  
  /**
   * Custom style for the container
   */
  style?: ViewStyle;
  
  /**
   * Position of the bubbles (default: 'bottom')
   */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  
  /**
   * Whether to automatically remove bubbles after duration (default: true)
   */
  autoRemove?: boolean;
  
  /**
   * Callback when a message is removed
   */
  onMessageRemoved?: (messageId: string) => void;
}

/**
 * A component to manage and display multiple glass chat bubbles
 */
const GlassChatBubbleManager: React.FC<GlassChatBubbleManagerProps> = ({
  messages,
  maxBubbles = 3,
  bubbleDuration = 5000,
  style,
  position = 'bottom',
  autoRemove = true,
  onMessageRemoved,
}) => {
  // State to track visible messages
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  
  // State to track messages that are fading out
  const [fadingMessages, setFadingMessages] = useState<string[]>([]);
  
  // Update visible messages when messages prop changes
  useEffect(() => {
    // Get the most recent messages up to maxBubbles
    const recentMessages = [...messages]
      .sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeB - timeA;
      })
      .slice(0, maxBubbles);
    
    setVisibleMessages(recentMessages);
  }, [messages, maxBubbles]);
  
  // Set up timers to remove messages after duration
  useEffect(() => {
    if (!autoRemove) return;
    
    const timers: NodeJS.Timeout[] = [];
    
    visibleMessages.forEach((message) => {
      if (!fadingMessages.includes(message.id)) {
        const timer = setTimeout(() => {
          setFadingMessages((prev) => [...prev, message.id]);
        }, bubbleDuration);
        
        timers.push(timer);
      }
    });
    
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [visibleMessages, bubbleDuration, autoRemove, fadingMessages]);
  
  // Handle animation complete
  const handleAnimationComplete = useCallback((messageId: string) => {
    setVisibleMessages((prev) => 
      prev.filter((msg) => msg.id !== messageId)
    );
    
    setFadingMessages((prev) => 
      prev.filter((id) => id !== messageId)
    );
    
    if (onMessageRemoved) {
      onMessageRemoved(messageId);
    }
  }, [onMessageRemoved]);
  
  // Calculate vertical offset for each bubble
  const getBubbleOffset = (index: number): number => {
    const baseOffset = 70; // Base offset between bubbles
    return index * baseOffset;
  };
  
  return (
    <View style={[styles.container, style]}>
      {visibleMessages.map((message, index) => (
        <GlassChatBubble
          key={message.id}
          message={message.message}
          role={message.role}
          visible={!fadingMessages.includes(message.id)}
          onAnimationComplete={() => handleAnimationComplete(message.id)}
          position={position}
          style={{
            ...(position === 'bottom' ? { bottom: getBubbleOffset(index) } : {}),
            ...(position === 'top' ? { top: getBubbleOffset(index) } : {}),
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none', // Allow touches to pass through
  },
});

export default GlassChatBubbleManager;