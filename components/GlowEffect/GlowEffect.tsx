import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface GradientStop {
  hex: string;
  color: string;
  offset: number;
}

const hexToRgba = (hex: string, alpha = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const colors = [
  "#BC82F3",
  "#F5B9EA",
  "#8D9FFF",
  "#FF6778",
  "#FFBA71",
  "#C686FF",
];

const generateGradientStops = (
  prevStops: GradientStop[] | null = null
): GradientStop[] => {
  if (prevStops) {
    return prevStops.map((stop) => {
      const offsetShift = Math.random() * 0.05 - 0.025;
      const newOffset = Math.max(0, Math.min(1, stop.offset + offsetShift));

      const colorIndex = colors.indexOf(stop.hex);
      const direction = Math.random() > 0.5 ? 1 : -1;
      const newColorIndex =
        (colorIndex + direction + colors.length) % colors.length;

      const newHex = Math.random() > 0.8 ? colors[newColorIndex] : stop.hex;

      const alpha = 0.6 + Math.random() * 0.2;

      return {
        hex: newHex,
        color: hexToRgba(newHex, alpha),
        offset: newOffset,
      };
    });
  }

  return [
    { hex: "#F5B9EA", color: hexToRgba("#F5B9EA", 0.7), offset: 0 },
    { hex: "#BC82F3", color: hexToRgba("#BC82F3", 0.7), offset: 0.3 },
    { hex: "#8D9FFF", color: hexToRgba("#8D9FFF", 0.7), offset: 0.65 },
    { hex: "#F5B9EA", color: hexToRgba("#F5B9EA", 0.7), offset: 1 },
  ];
};

interface EffectProps {
  gradientStops: GradientStop[];
  strokeWidth: number;
  blurRadius: number;
  opacity: number;
}

const Effect: React.FC<EffectProps> = ({
  gradientStops,
  strokeWidth,
  blurRadius,
  opacity,
}) => {
  const topPadding = blurRadius ? -(blurRadius + 15) : -26;

  return (
    <View style={[styles.effectContainer, { paddingTop: topPadding, opacity }]}>
      <Svg width={width} height={height} style={{ position: "absolute" }}>
        <Defs>
          <LinearGradient
            id={`grad-${strokeWidth}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            {gradientStops.map((stop, index) => (
              <Stop
                key={index}
                offset={stop.offset.toString()}
                stopColor={stop.color}
                stopOpacity={0.8}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={width - strokeWidth}
          height={height - strokeWidth}
          rx={40}
          ry={40}
          strokeWidth={strokeWidth}
          stroke={`url(#grad-${strokeWidth})`}
          fill="transparent"
        />
      </Svg>
    </View>
  );
};

const GlowEffect: React.FC = () => {
  const [gradientStops, setGradientStops] = useState<GradientStop[]>(
    generateGradientStops()
  );
  const fadeValue = useRef<Animated.Value>(new Animated.Value(1)).current;

  const previousStopsRef = useRef<GradientStop[]>(gradientStops);

  useEffect(() => {
    const animateGradient = () => {
      const newStops = generateGradientStops(previousStopsRef.current);

      Animated.timing(fadeValue, {
        toValue: 0.4,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setGradientStops(newStops);
        previousStopsRef.current = newStops;

        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(animateGradient, 2000);
        });
      });
    };

    animateGradient();

    return () => {
      fadeValue.stopAnimation();
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeValue }]}>
      {/* Layer 1: Sharp edge - thinnest line */}
      <Effect
        gradientStops={gradientStops}
        strokeWidth={2}
        blurRadius={0}
        opacity={0.95}
      />

      {/* Layer 2: Very subtle initial blur */}
      <Effect
        gradientStops={gradientStops}
        strokeWidth={3}
        blurRadius={2}
        opacity={0.9}
      />

      {/* Layer 3: Very light blur */}
      <Effect
        gradientStops={gradientStops}
        strokeWidth={5}
        blurRadius={4}
        opacity={0.85}
      />

      {/* Layer 4: Light blur */}
      <Effect
        gradientStops={gradientStops}
        strokeWidth={8}
        blurRadius={8}
        opacity={0.8}
      />

      {/* Layer 5: Light-medium blur */}
      <Effect
        gradientStops={gradientStops}
        strokeWidth={10}
        blurRadius={12}
        opacity={0.75}
      />

      {/* Layer 6: Medium blur */}
      <Effect
        gradientStops={gradientStops}
        strokeWidth={13}
        blurRadius={16}
        opacity={0.7}
      />

      {/* Layer 7: Medium-heavy blur */}
      <Effect
        gradientStops={gradientStops}
        strokeWidth={16}
        blurRadius={22}
        opacity={0.65}
      />

      {/* Layer 8: Heavy blur */}
      <Effect
        gradientStops={gradientStops}
        strokeWidth={19}
        blurRadius={28}
        opacity={0.55}
      />

      {/* Layer 9: Very heavy blur */}
      <Effect
        gradientStops={gradientStops}
        strokeWidth={23}
        blurRadius={35}
        opacity={0.45}
      />

      {/* Layer 10: Extreme outer glow */}
      <Effect
        gradientStops={gradientStops}
        strokeWidth={28}
        blurRadius={45}
        opacity={0.35}
      />

      {/* Layer 11: Maximum diffusion */}
      <Effect
        gradientStops={gradientStops}
        strokeWidth={34}
        blurRadius={55}
        opacity={0.25}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  effectContainer: {
    position: "absolute",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GlowEffect;
