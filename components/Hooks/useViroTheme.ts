import { useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type ViroThemeColors = {
  primary: string;
  background: string;
  text: string;
  surface: string;
  error: string;
};

export type ViroTheme = {
  colors: ViroThemeColors;
  isDark: boolean;
  colorScheme: ColorSchemeName;
};

const lightColors: ViroThemeColors = {
  primary: '#007AFF',
  background: '#FFFFFF',
  text: '#000000',
  surface: '#F2F2F7',
  error: '#FF3B30',
};

const darkColors: ViroThemeColors = {
  primary: '#0A84FF',
  background: '#000000',
  text: '#FFFFFF',
  surface: '#1C1C1E',
  error: '#FF453A',
};

/**
 * A hook to manage theme colors for Viro components
 * 
 * @param {Object} customLightColors - Optional custom light theme colors
 * @param {Object} customDarkColors - Optional custom dark theme colors
 * @returns {ViroTheme} The current theme
 */
export const useViroTheme = (
  customLightColors?: Partial<ViroThemeColors>,
  customDarkColors?: Partial<ViroThemeColors>
): ViroTheme => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isDark = colorScheme === 'dark';
  
  const mergedLightColors = {
    ...lightColors,
    ...customLightColors,
  };
  
  const mergedDarkColors = {
    ...darkColors,
    ...customDarkColors,
  };

  return {
    colors: isDark ? mergedDarkColors : mergedLightColors,
    isDark,
    colorScheme,
  };
};