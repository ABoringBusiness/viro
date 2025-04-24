import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, ViewStyle } from 'react-native';
import { LinearGradient } from './LinearGradient';

// Define the color palette similar to Apple Intelligence Glow Effect
const COLORS = [
  '#BC82F3', // Purple
  '#F5B9EA', // Pink
  '#8D9FFF', // Blue
  '#FF6778', // Red
  '#FFBA71', // Orange
  '#C686FF', // Violet
];

interface GradientStop {
  color: string;
  location: number;
}

interface EffectProps {
  gradientStops: GradientStop[];
  width: number;
  blur?: number;
  style?: ViewStyle;
}

interface GlowEffectProps {
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  cornerRadius?: number;
}

// Component for effect with blur
const Effect: React.FC<EffectProps> = ({ gradientStops, width, blur = 0, style }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  return (
    <View style={[styles.effectContainer, style]}>
      <Animated.View 
        style={[
          styles.gradientContainer, 
          { 
            borderWidth: width,
            borderRadius: 55,
            width: screenWidth,
            height: screenHeight,
          },
          blur > 0 && { shadowOpacity: 0.8, shadowRadius: blur, shadowColor: '#FFFFFF' }
        ]}
      >
        <LinearGradient
          gradientStops={gradientStops}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
};

// Generate random gradient stops
const generateGradientStops = (): GradientStop[] => {
  return COLORS.map(color => ({
    color,
    location: Math.random(),
  })).sort((a, b) => a.location - b.location);
};

// Main GlowEffect component
const GlowEffect: React.FC<GlowEffectProps> = ({ 
  style, 
  containerStyle,
  cornerRadius = 55
}) => {
  const [gradientStops, setGradientStops] = useState<GradientStop[]>(generateGradientStops());
  const animationValue = useRef(new Animated.Value(0)).current;
  
  // Update gradient stops with animation
  const updateGradientStops = () => {
    const newStops = generateGradientStops();
    setGradientStops(newStops);
    
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start(() => {
      animationValue.setValue(0);
    });
  };
  
  useEffect(() => {
    // Set up timers for animation
    const timer1 = setInterval(() => {
      updateGradientStops();
    }, 400);
    
    return () => {
      clearInterval(timer1);
    };
  }, []);
  
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Layer 1: No blur */}
      <Effect 
        gradientStops={gradientStops} 
        width={6} 
        style={style}
      />
      
      {/* Layer 2: Light blur */}
      <Effect 
        gradientStops={gradientStops} 
        width={9} 
        blur={4}
        style={style}
      />
      
      {/* Layer 3: Medium blur */}
      <Effect 
        gradientStops={gradientStops} 
        width={11} 
        blur={12}
        style={style}
      />
      
      {/* Layer 4: Heavy blur */}
      <Effect 
        gradientStops={gradientStops} 
        width={15} 
        blur={15}
        style={style}
      />
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
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  effectContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientContainer: {
    borderColor: 'transparent',
    overflow: 'hidden',
  },
});

export default GlowEffect;