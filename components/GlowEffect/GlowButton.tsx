import React, { useEffect, useRef, useState } from "react";
import {
  ButtonProps,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface GlowButtonProps extends ButtonProps {}

const GlowButton = ({ title, ...props }: GlowButtonProps) => {
  // Static color arrays for the gradient animation
  const colorSets = [
    [
      "#ff0000",
      "#ff7300",
      "#fffb00",
      "#48ff00",
      "#00ffd5",
      "#002bff",
      "#7a00ff",
      "#ff00c8",
    ],
    [
      "#ff7300",
      "#fffb00",
      "#48ff00",
      "#00ffd5",
      "#002bff",
      "#7a00ff",
      "#ff00c8",
      "#ff0000",
    ],
    [
      "#fffb00",
      "#48ff00",
      "#00ffd5",
      "#002bff",
      "#7a00ff",
      "#ff00c8",
      "#ff0000",
      "#ff7300",
    ],
    [
      "#48ff00",
      "#00ffd5",
      "#002bff",
      "#7a00ff",
      "#ff00c8",
      "#ff0000",
      "#ff7300",
      "#fffb00",
    ],
    [
      "#00ffd5",
      "#002bff",
      "#7a00ff",
      "#ff00c8",
      "#ff0000",
      "#ff7300",
      "#fffb00",
      "#48ff00",
    ],
    [
      "#002bff",
      "#7a00ff",
      "#ff00c8",
      "#ff0000",
      "#ff7300",
      "#fffb00",
      "#48ff00",
      "#00ffd5",
    ],
  ];

  // State to hold current colors
  const [currentColors, setCurrentColors] = useState(colorSets[0]);
  const colorIndexRef = useRef(0);

  // Animation timing
  useEffect(() => {
    const interval = setInterval(() => {
      colorIndexRef.current = (colorIndexRef.current + 1) % colorSets.length;
      setCurrentColors(colorSets[colorIndexRef.current]);
    }, 50); // Change colors every 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.buttonWrapper}>
      {/* Create the outer gradient container with animated colors */}
      <View style={styles.gradientContainer}>
        <View style={styles.gradient}>
          <LinearGradient
            colors={currentColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientStyle}
          />
        </View>
      </View>

      {/* White inner button that covers most of the gradient */}
      <View style={styles.innerButtonContainer}>
        <TouchableOpacity activeOpacity={0.8} style={styles.button} {...props}>
          <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  buttonWrapper: {
    position: "relative",
    width: 200,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 15,
    overflow: "hidden",
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
  gradientStyle: {
    flex: 1,
  },
  innerButtonContainer: {
    width: "94%",
    height: "85%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  button: {
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  buttonText: {
    color: "#8A2BE2",
    fontWeight: "bold",
    fontSize: 18,
  },
  hint: {
    marginTop: 20,
    color: "#666",
    fontSize: 14,
  },
});

export default GlowButton;
