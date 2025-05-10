import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ViewStyle, TextStyle } from 'react-native';

export interface GlassChatBubbleProps {
  /**
   * The message text to display in the bubble
   */
  message: string;
  
  /**
   * The role of the message sender (user or assistant)
   */
  role: 'user' | 'assistant';
  
  /**
   * Whether the bubble is currently visible
   */
  visible: boolean;
  
  /**
   * Callback when the bubble animation completes
   */
  onAnimationComplete?: () => void;
  
  /**
   * Custom style for the bubble container
   */
  style?: ViewStyle;
  
  /**
   * Custom style for the message text
   */
  textStyle?: TextStyle;
  
  /**
   * Position of the bubble (default: 'bottom')
   */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  
  /**
   * Duration of the fade animation in milliseconds (default: 300)
   */
  animationDuration?: number;
}

/**
 * A glass-style chat bubble component for displaying messages
 */
const GlassChatBubble: React.FC<GlassChatBubbleProps> = ({
  message,
  role,
  visible,
  onAnimationComplete,
  style,
  textStyle,
  position = 'bottom',
  animationDuration = 300,
}) => {
  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  
  // Update animation when visibility changes
  useEffect(() => {
    if (visible) {
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]).start();
    } else {
      // Fade out and scale down
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: animationDuration,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ]).start(({ finished }) => {
        if (finished && onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [visible, opacity, scale, animationDuration, onAnimationComplete]);
  
  // Determine position styles
  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'top':
        return { top: 20, alignSelf: 'center' };
      case 'bottom':
        return { bottom: 20, alignSelf: 'center' };
      case 'left':
        return { left: 20, alignSelf: 'flex-start' };
      case 'right':
        return { right: 20, alignSelf: 'flex-end' };
      case 'center':
        return { alignSelf: 'center' };
      default:
        return { bottom: 20, alignSelf: 'center' };
    }
  };
  
  // Determine bubble style based on role
  const getBubbleStyle = (): ViewStyle => {
    return role === 'user'
      ? styles.userBubble
      : styles.assistantBubble;
  };
  
  // Determine text style based on role
  const getTextStyle = (): TextStyle => {
    return role === 'user'
      ? styles.userText
      : styles.assistantText;
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        getBubbleStyle(),
        getPositionStyle(),
        { opacity, transform: [{ scale }] },
        style,
      ]}
    >
      <Text style={[styles.text, getTextStyle(), textStyle]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1000,
  },
  userBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopRightRadius: 4,
    marginLeft: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    // Note: backdropFilter is not supported in React Native's StyleSheet
    // We would need to use a native module or a different approach for a true glass effect
  },
  assistantBubble: {
    backgroundColor: 'rgba(66, 133, 244, 0.7)',
    borderTopLeftRadius: 4,
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(66, 133, 244, 0.2)',
    // Note: backdropFilter is not supported in React Native's StyleSheet
    // We would need to use a native module or a different approach for a true glass effect
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#000',
  },
  assistantText: {
    color: '#fff',
  },
});

export default GlassChatBubble;