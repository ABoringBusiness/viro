/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroGestureRecognizer
 */

import { NativeModules, Platform, NativeEventEmitter } from "react-native";

export enum GestureType {
  /**
   * Swipe gesture
   */
  SWIPE = "swipe",
  
  /**
   * Tap gesture
   */
  TAP = "tap",
  
  /**
   * Long press gesture
   */
  LONG_PRESS = "long_press",
  
  /**
   * Pinch gesture
   */
  PINCH = "pinch",
  
  /**
   * Rotation gesture
   */
  ROTATION = "rotation",
  
  /**
   * Pan gesture
   */
  PAN = "pan",
  
  /**
   * Custom gesture
   */
  CUSTOM = "custom"
}

export enum GestureDirection {
  /**
   * Up direction
   */
  UP = "up",
  
  /**
   * Down direction
   */
  DOWN = "down",
  
  /**
   * Left direction
   */
  LEFT = "left",
  
  /**
   * Right direction
   */
  RIGHT = "right",
  
  /**
   * Forward direction (away from user)
   */
  FORWARD = "forward",
  
  /**
   * Backward direction (toward user)
   */
  BACKWARD = "backward"
}

export interface GestureEvent {
  /**
   * The type of gesture
   */
  type: GestureType;
  
  /**
   * The direction of the gesture (for directional gestures)
   */
  direction?: GestureDirection;
  
  /**
   * The position of the gesture in screen coordinates [x, y]
   */
  position: [number, number];
  
  /**
   * The velocity of the gesture
   */
  velocity?: [number, number];
  
  /**
   * The scale factor for pinch gestures
   */
  scale?: number;
  
  /**
   * The rotation angle for rotation gestures (in degrees)
   */
  rotation?: number;
  
  /**
   * The state of the gesture (began, changed, ended, cancelled)
   */
  state: "began" | "changed" | "ended" | "cancelled";
  
  /**
   * The number of touches involved in the gesture
   */
  numberOfTouches: number;
  
  /**
   * The timestamp of the gesture
   */
  timestamp: number;
}

export interface GestureRecognizerOptions {
  /**
   * Whether to enable swipe gestures
   * @default true
   */
  enableSwipe?: boolean;
  
  /**
   * Whether to enable tap gestures
   * @default true
   */
  enableTap?: boolean;
  
  /**
   * Whether to enable long press gestures
   * @default true
   */
  enableLongPress?: boolean;
  
  /**
   * Whether to enable pinch gestures
   * @default true
   */
  enablePinch?: boolean;
  
  /**
   * Whether to enable rotation gestures
   * @default true
   */
  enableRotation?: boolean;
  
  /**
   * Whether to enable pan gestures
   * @default true
   */
  enablePan?: boolean;
  
  /**
   * Minimum distance for swipe gestures (in pixels)
   * @default 10
   */
  swipeMinDistance?: number;
  
  /**
   * Minimum velocity for swipe gestures (in pixels per second)
   * @default 100
   */
  swipeMinVelocity?: number;
  
  /**
   * Duration for long press gestures (in milliseconds)
   * @default 500
   */
  longPressDuration?: number;
  
  /**
   * Minimum scale change for pinch gestures
   * @default 0.1
   */
  pinchMinScale?: number;
  
  /**
   * Minimum rotation change for rotation gestures (in degrees)
   * @default 5
   */
  rotationMinAngle?: number;
  
  /**
   * Custom gestures to recognize
   */
  customGestures?: {
    name: string;
    touchPoints: number;
    pattern: string;
  }[];
}

export type GestureRecognizerCallback = (gesture: GestureEvent) => void;

const LINKING_ERROR =
  `The package 'ViroGestureRecognizer' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const NativeGestureRecognizer = NativeModules.ViroGestureRecognizer
  ? NativeModules.ViroGestureRecognizer
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
 * ViroGestureRecognizer provides gesture recognition capabilities for AR applications.
 */
export class ViroGestureRecognizer {
  private static instance: ViroGestureRecognizer;
  private options: GestureRecognizerOptions;
  private isInitialized: boolean = false;
  private eventEmitter: NativeEventEmitter | null = null;
  private listeners: { [key: string]: any } = {};
  private callbacks: GestureRecognizerCallback[] = [];
  
  private constructor(options: GestureRecognizerOptions = {}) {
    this.options = {
      enableSwipe: true,
      enableTap: true,
      enableLongPress: true,
      enablePinch: true,
      enableRotation: true,
      enablePan: true,
      swipeMinDistance: 10,
      swipeMinVelocity: 100,
      longPressDuration: 500,
      pinchMinScale: 0.1,
      rotationMinAngle: 5,
      ...options
    };
    
    // Set up event emitter if native module is available
    if (NativeModules.ViroGestureRecognizer) {
      this.eventEmitter = new NativeEventEmitter(NativeModules.ViroGestureRecognizer);
    }
  }
  
  /**
   * Get the singleton instance of ViroGestureRecognizer
   */
  public static getInstance(options?: GestureRecognizerOptions): ViroGestureRecognizer {
    if (!ViroGestureRecognizer.instance) {
      ViroGestureRecognizer.instance = new ViroGestureRecognizer(options);
    } else if (options) {
      ViroGestureRecognizer.instance.setOptions(options);
    }
    return ViroGestureRecognizer.instance;
  }
  
  /**
   * Update gesture recognizer options
   */
  public setOptions(options: Partial<GestureRecognizerOptions>): void {
    this.options = { ...this.options, ...options };
    
    if (this.isInitialized && NativeGestureRecognizer.setOptions) {
      NativeGestureRecognizer.setOptions(this.options);
    }
  }
  
  /**
   * Initialize the gesture recognizer
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // Initialize native module if available
      if (NativeGestureRecognizer.initialize) {
        await NativeGestureRecognizer.initialize(this.options);
        
        // Set up event listeners
        if (this.eventEmitter) {
          this.listeners.gesture = this.eventEmitter.addListener(
            'onGestureRecognized',
            this.handleGestureEvent
          );
        }
        
        this.isInitialized = true;
        return true;
      }
      
      // Fallback to JavaScript-based gesture recognition
      this.setupJSGestureRecognition();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize gesture recognizer:", error);
      
      // Fallback to JavaScript-based gesture recognition
      this.setupJSGestureRecognition();
      this.isInitialized = true;
      return true;
    }
  }
  
  /**
   * Register a callback for gesture events
   * @param callback The callback function to register
   * @returns A function to unregister the callback
   */
  public registerCallback(callback: GestureRecognizerCallback): () => void {
    this.callbacks.push(callback);
    
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Start gesture recognition
   */
  public async start(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      if (NativeGestureRecognizer.start) {
        await NativeGestureRecognizer.start();
      }
      return true;
    } catch (error) {
      console.error("Failed to start gesture recognition:", error);
      return false;
    }
  }
  
  /**
   * Stop gesture recognition
   */
  public async stop(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }
    
    try {
      if (NativeGestureRecognizer.stop) {
        await NativeGestureRecognizer.stop();
      }
      return true;
    } catch (error) {
      console.error("Failed to stop gesture recognition:", error);
      return false;
    }
  }
  
  /**
   * Release resources
   */
  public release(): void {
    // Remove event listeners
    if (this.listeners.gesture) {
      this.listeners.gesture.remove();
      this.listeners.gesture = null;
    }
    
    // Release native resources
    if (this.isInitialized && NativeGestureRecognizer.release) {
      NativeGestureRecognizer.release();
    }
    
    this.isInitialized = false;
    this.callbacks = [];
  }
  
  /**
   * Handle gesture events from native module
   */
  private handleGestureEvent = (event: GestureEvent) => {
    // Notify all registered callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in gesture callback:", error);
      }
    });
  };
  
  /**
   * Set up JavaScript-based gesture recognition (fallback)
   */
  private setupJSGestureRecognition = () => {
    // This is a simplified implementation for fallback purposes
    // In a real implementation, this would use React Native's PanResponder
    // or a similar system to recognize gestures
    
    console.warn("Using JavaScript-based gesture recognition (fallback)");
    
    // For now, we'll just simulate some basic gestures for testing
    if (Platform.OS === 'web') {
      // Set up event listeners for web
      document.addEventListener('click', this.handleWebTap);
      document.addEventListener('touchstart', this.handleWebTouchStart);
      document.addEventListener('touchmove', this.handleWebTouchMove);
      document.addEventListener('touchend', this.handleWebTouchEnd);
    }
  };
  
  /**
   * Clean up JavaScript-based gesture recognition
   */
  private cleanupJSGestureRecognition = () => {
    if (Platform.OS === 'web') {
      // Remove event listeners for web
      document.removeEventListener('click', this.handleWebTap);
      document.removeEventListener('touchstart', this.handleWebTouchStart);
      document.removeEventListener('touchmove', this.handleWebTouchMove);
      document.removeEventListener('touchend', this.handleWebTouchEnd);
    }
  };
  
  // Web event handlers (for fallback)
  private handleWebTap = (event: MouseEvent) => {
    const gestureEvent: GestureEvent = {
      type: GestureType.TAP,
      position: [event.clientX, event.clientY],
      state: "ended",
      numberOfTouches: 1,
      timestamp: Date.now()
    };
    
    this.handleGestureEvent(gestureEvent);
  };
  
  private touchStartPosition: [number, number] | null = null;
  private touchStartTime: number = 0;
  
  private handleWebTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      this.touchStartPosition = [event.touches[0].clientX, event.touches[0].clientY];
      this.touchStartTime = Date.now();
    }
  };
  
  private handleWebTouchMove = (event: TouchEvent) => {
    // Handle touch move events
  };
  
  private handleWebTouchEnd = (event: TouchEvent) => {
    if (this.touchStartPosition) {
      const endPosition: [number, number] = [
        event.changedTouches[0].clientX,
        event.changedTouches[0].clientY
      ];
      
      const deltaX = endPosition[0] - this.touchStartPosition[0];
      const deltaY = endPosition[1] - this.touchStartPosition[1];
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = Date.now() - this.touchStartTime;
      
      // Check for swipe
      if (distance > (this.options.swipeMinDistance || 10)) {
        const velocity = distance / (duration / 1000);
        
        if (velocity > (this.options.swipeMinVelocity || 100)) {
          // Determine swipe direction
          let direction: GestureDirection;
          
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? GestureDirection.RIGHT : GestureDirection.LEFT;
          } else {
            direction = deltaY > 0 ? GestureDirection.DOWN : GestureDirection.UP;
          }
          
          const gestureEvent: GestureEvent = {
            type: GestureType.SWIPE,
            direction,
            position: endPosition,
            velocity: [deltaX / (duration / 1000), deltaY / (duration / 1000)],
            state: "ended",
            numberOfTouches: 1,
            timestamp: Date.now()
          };
          
          this.handleGestureEvent(gestureEvent);
        }
      }
      // Check for long press
      else if (distance < 10 && duration > (this.options.longPressDuration || 500)) {
        const gestureEvent: GestureEvent = {
          type: GestureType.LONG_PRESS,
          position: endPosition,
          state: "ended",
          numberOfTouches: 1,
          timestamp: Date.now()
        };
        
        this.handleGestureEvent(gestureEvent);
      }
      // Check for tap
      else if (distance < 10) {
        const gestureEvent: GestureEvent = {
          type: GestureType.TAP,
          position: endPosition,
          state: "ended",
          numberOfTouches: 1,
          timestamp: Date.now()
        };
        
        this.handleGestureEvent(gestureEvent);
      }
      
      this.touchStartPosition = null;
    }
  };
}

export default ViroGestureRecognizer;