import { NativeModules, Platform } from 'react-native';

const { VRTARSceneNavigatorModule } = NativeModules;

export type ViroDeviceCapabilities = {
  /**
   * Whether the device supports AR
   */
  hasAR: boolean;
  
  /**
   * Whether the device supports VR
   */
  hasVR: boolean;
  
  /**
   * Whether the device has a LiDAR sensor
   */
  hasLiDAR: boolean;
  
  /**
   * Whether the device supports scene reconstruction
   */
  hasSceneReconstruction: boolean;
  
  /**
   * Whether the device supports people occlusion
   */
  hasPeopleOcclusion: boolean;
  
  /**
   * Whether the device supports face tracking
   */
  hasFaceTracking: boolean;
  
  /**
   * Whether the device supports body tracking
   */
  hasBodyTracking: boolean;
  
  /**
   * Whether the device supports image tracking
   */
  hasImageTracking: boolean;
  
  /**
   * Whether the device supports object tracking
   */
  hasObjectTracking: boolean;
};

/**
 * Get the AR/VR capabilities of the current device
 * 
 * @returns {Promise<ViroDeviceCapabilities>} A promise that resolves to the device capabilities
 */
export const getViroDeviceCapabilities = async (): Promise<ViroDeviceCapabilities> => {
  // Default capabilities (assume nothing is supported)
  const defaultCapabilities: ViroDeviceCapabilities = {
    hasAR: false,
    hasVR: false,
    hasLiDAR: false,
    hasSceneReconstruction: false,
    hasPeopleOcclusion: false,
    hasFaceTracking: false,
    hasBodyTracking: false,
    hasImageTracking: false,
    hasObjectTracking: false,
  };
  
  // If the module doesn't exist, return default capabilities
  if (!VRTARSceneNavigatorModule) {
    return defaultCapabilities;
  }
  
  try {
    // Check if AR is supported
    const arSupport = await VRTARSceneNavigatorModule.isARSupported();
    
    // If we're on iOS, we can check for more specific capabilities
    if (Platform.OS === 'ios') {
      // These capabilities are only available on iOS
      const iosCapabilities = await VRTARSceneNavigatorModule.getARCapabilities?.() || {};
      
      return {
        ...defaultCapabilities,
        hasAR: arSupport.isARSupported,
        hasVR: Platform.OS === 'android', // VR is primarily supported on Android
        hasLiDAR: iosCapabilities.hasLiDAR || false,
        hasSceneReconstruction: iosCapabilities.hasSceneReconstruction || false,
        hasPeopleOcclusion: iosCapabilities.hasPeopleOcclusion || false,
        hasFaceTracking: iosCapabilities.hasFaceTracking || false,
        hasBodyTracking: iosCapabilities.hasBodyTracking || false,
        hasImageTracking: true, // Assume image tracking is supported if AR is supported
        hasObjectTracking: iosCapabilities.hasObjectTracking || false,
      };
    }
    
    // For Android, we have more limited information
    return {
      ...defaultCapabilities,
      hasAR: arSupport.isARSupported,
      hasVR: true, // VR is supported on Android
      hasImageTracking: arSupport.isARSupported, // Assume image tracking is supported if AR is supported
    };
  } catch (error) {
    console.error('Error getting device capabilities:', error);
    return defaultCapabilities;
  }
};