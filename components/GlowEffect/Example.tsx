import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlowEffect } from './index';

const GlowEffectExample: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* The GlowEffect component will render behind other content */}
      <GlowEffect />
      
      <View style={styles.content}>
        <Text style={styles.title}>Apple Intelligence</Text>
        <Text style={styles.subtitle}>Glow Effect Example</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
  },
});

export default GlowEffectExample;