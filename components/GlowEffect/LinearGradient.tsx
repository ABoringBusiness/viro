import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface GradientStop {
  color: string;
  location: number;
}

interface LinearGradientProps {
  gradientStops: GradientStop[];
  style?: ViewStyle;
}

export const LinearGradient: React.FC<LinearGradientProps> = ({ gradientStops, style }) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create a continuous rotation animation
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  // Calculate rotation for the gradient
  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // Create multiple gradient layers to simulate an angular gradient
  return (
    <View style={[styles.container, style]}>
      {gradientStops.map((stop, index) => {
        if (index === gradientStops.length - 1) return null;
        
        const nextStop = gradientStops[index + 1];
        const startColor = stop.color;
        const endColor = nextStop.color;
        
        return (
          <Animated.View
            key={`gradient-${index}`}
            style={[
              styles.gradientLayer,
              {
                backgroundColor: startColor,
                opacity: 0.7,
                transform: [{ rotate: spin }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  gradientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 55,
  },
});