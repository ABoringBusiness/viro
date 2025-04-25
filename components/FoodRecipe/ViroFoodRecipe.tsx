/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroFoodRecipe
 */

"use strict";

import * as React from "react";
import {
  findNodeHandle,
  NativeModules,
  NativeSyntheticEvent,
  requireNativeComponent,
  ViewProps,
} from "react-native";
import { ViroAnimations, ViroAnimation } from "../Animation/ViroAnimations";
import { ViroNode } from "../ViroNode";
import { ViroSphere } from "../ViroSphere";
import { ViroText } from "../ViroText";
import { ViroFlexView } from "../ViroFlexView";
import { ViroImage } from "../ViroImage";
import { ViroARScene } from "../AR/ViroARScene";
import { Viro3DPoint } from "../Types/ViroUtils";
import { 
  ViroFoodRecipeService, 
  FoodRecipeConfig, 
  FoodRecognitionResult, 
  FoodItem,
  Recipe,
  NutritionInfo
} from "./ViroFoodRecipeService";

// Register animations for food recipe
ViroAnimations.registerAnimations({
  scaleUp: {
    properties: {
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
    },
    duration: 500,
    easing: "bounce",
  },
  scaleDown: {
    properties: {
      scaleX: 0.5,
      scaleY: 0.5,
      scaleZ: 0.5,
    },
    duration: 500,
    easing: "bounce",
  },
  pulse: [
    ["scaleUp", "scaleDown"],
  ],
  rotate: {
    properties: {
      rotateY: "+=90",
    },
    duration: 1000,
  },
  fadeIn: {
    properties: {
      opacity: 1.0,
    },
    duration: 500,
  },
  fadeOut: {
    properties: {
      opacity: 0.0,
    },
    duration: 500,
  },
  showRecipeCard: [
    ["fadeIn", "scaleUp"],
  ],
  hideRecipeCard: [
    ["fadeOut", "scaleDown"],
  ],
});

type Props = ViewProps & {
  /**
   * Food Recipe configuration
   */
  config: FoodRecipeConfig;

  /**
   * Flag to enable/disable food recognition
   */
  enabled?: boolean;

  /**
   * Callback when food is recognized
   */
  onFoodRecognized?: (result: FoodRecognitionResult) => void;

  /**
   * Callback when a recipe is extracted
   */
  onRecipeExtracted?: (recipe: Recipe) => void;

  /**
   * Callback when nutrition information is available
   */
  onNutritionInfo?: (nutritionInfo: NutritionInfo) => void;

  /**
   * Flag to show/hide visual indicators for recognized food
   */
  showFoodIndicators?: boolean;

  /**
   * Color of the food indicator
   */
  foodIndicatorColor?: string;

  /**
   * Size of the food indicator
   */
  foodIndicatorSize?: number;

  /**
   * Animation name for the food indicator
   */
  foodIndicatorAnimation?: string | ViroAnimation;

  /**
   * Custom renderer for food indicators
   */
  renderFoodIndicator?: (foodItem: FoodItem) => React.ReactNode;

  /**
   * Custom renderer for recipe details
   */
  renderRecipeDetails?: (recipe: Recipe, nutritionInfo?: NutritionInfo) => React.ReactNode;

  /**
   * Flag to automatically extract recipe after food recognition
   */
  autoExtractRecipe?: boolean;

  /**
   * Flag to automatically get nutrition information after food recognition
   */
  autoGetNutritionInfo?: boolean;

  /**
   * Callback when an image is captured
   */
  onImageCaptured?: (imageBase64: string) => void;

  /**
   * Flag to enable/disable automatic image capture
   */
  autoCaptureEnabled?: boolean;

  /**
   * Interval in milliseconds for capturing and analyzing images
   */
  captureInterval?: number;
};

type State = {
  recognizedFood: FoodRecognitionResult | null;
  recipe: Recipe | null;
  nutritionInfo: NutritionInfo | null;
  showRecipeDetails: boolean;
  isProcessing: boolean;
  capturedImageBase64: string | null;
  error: string | null;
};

/**
 * ViroFoodRecipe is a component that provides food recognition and recipe extraction
 * functionality in AR.
 */
export class ViroFoodRecipe extends React.Component<Props, State> {
  _captureInterval: NodeJS.Timeout | null = null;
  _arScene: ViroARScene | null = null;
  _foodRecipeService: ViroFoodRecipeService;

  constructor(props: Props) {
    super(props);
    this.state = {
      recognizedFood: null,
      recipe: null,
      nutritionInfo: null,
      showRecipeDetails: false,
      isProcessing: false,
      capturedImageBase64: null,
      error: null,
    };
    this._foodRecipeService = ViroFoodRecipeService.getInstance();
  }

  async componentDidMount() {
    // Initialize the Food Recipe service
    await this._foodRecipeService.initialize(this.props.config);

    if (this.props.enabled !== false) {
      this._startFoodRecognition();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.enabled !== this.props.enabled) {
      if (this.props.enabled) {
        this._startFoodRecognition();
      } else {
        this._stopFoodRecognition();
      }
    }

    if (prevProps.config !== this.props.config) {
      this._foodRecipeService.initialize(this.props.config);
    }

    if (prevProps.captureInterval !== this.props.captureInterval && this.props.autoCaptureEnabled) {
      this._stopFoodRecognition();
      this._startFoodRecognition();
    }
  }

  componentWillUnmount() {
    this._stopFoodRecognition();
    this._foodRecipeService.release();
  }

  _startFoodRecognition = () => {
    if (this.props.autoCaptureEnabled !== false) {
      const interval = this.props.captureInterval || 5000; // Default to 5 seconds
      this._captureInterval = setInterval(() => {
        if (this.state.isProcessing) {
          return;
        }
        this._captureAndAnalyzeImage();
      }, interval);
    }
  };

  _stopFoodRecognition = () => {
    if (this._captureInterval) {
      clearInterval(this._captureInterval);
      this._captureInterval = null;
    }
  };

  _captureAndAnalyzeImage = async () => {
    this.setState({ isProcessing: true });

    try {
      // In a real implementation, this would capture an image from the AR camera
      // const imageBase64 = await NativeModules.ViroARCameraModule.captureImage(findNodeHandle(this._arScene));
      
      // For demo purposes, we'll use a mock image
      const mockImageBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."; // This would be a real base64 image in production
      
      if (this.props.onImageCaptured) {
        this.props.onImageCaptured(mockImageBase64);
      }
      
      this.setState({ capturedImageBase64: mockImageBase64 });
      
      // Recognize food using the Food Recipe service
      const recognizedFood = await this._foodRecipeService.recognizeFood(mockImageBase64);
      
      this.setState({
        recognizedFood,
        isProcessing: false,
      });
      
      if (this.props.onFoodRecognized) {
        this.props.onFoodRecognized(recognizedFood);
      }
      
      // Automatically extract recipe if enabled
      if (this.props.autoExtractRecipe && recognizedFood.foodItems.length > 0) {
        this._extractRecipe(recognizedFood.foodItems);
      }
      
      // Automatically get nutrition information if enabled
      if (this.props.autoGetNutritionInfo && recognizedFood.foodItems.length > 0) {
        this._getNutritionInfo(recognizedFood.foodItems);
      }
    } catch (error) {
      console.error("Error in image capture and analysis:", error);
      this.setState({ 
        isProcessing: false,
        error: "Failed to capture and analyze image"
      });
    }
  };

  _extractRecipe = async (foodItems: FoodItem[]) => {
    this.setState({ isProcessing: true });

    try {
      const recipe = await this._foodRecipeService.extractRecipe(foodItems);
      
      this.setState({
        recipe,
        isProcessing: false,
        showRecipeDetails: true,
      });
      
      if (this.props.onRecipeExtracted) {
        this.props.onRecipeExtracted(recipe);
      }
      
      return recipe;
    } catch (error) {
      console.error("Error extracting recipe:", error);
      this.setState({ 
        isProcessing: false,
        error: "Failed to extract recipe"
      });
      throw error;
    }
  };

  _getNutritionInfo = async (foodItems: FoodItem[]) => {
    this.setState({ isProcessing: true });

    try {
      const nutritionInfo = await this._foodRecipeService.getNutritionInfo(foodItems);
      
      this.setState({
        nutritionInfo,
        isProcessing: false,
      });
      
      if (this.props.onNutritionInfo) {
        this.props.onNutritionInfo(nutritionInfo);
      }
      
      return nutritionInfo;
    } catch (error) {
      console.error("Error getting nutrition information:", error);
      this.setState({ 
        isProcessing: false,
        error: "Failed to get nutrition information"
      });
      throw error;
    }
  };

  _getPositionFromBoundingBox(boundingBox?: FoodItem["boundingBox"]): Viro3DPoint {
    if (!boundingBox) {
      // Default position if no bounding box is provided
      return [0, 0, -1];
    }
    
    // Convert normalized bounding box coordinates to 3D space
    // This is a simplified conversion and would need to be adjusted based on the AR scene
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    
    // Map from [0,1] to [-1,1] range for X and Y
    const x = (centerX - 0.5) * 2;
    const y = (centerY - 0.5) * -2; // Invert Y axis
    
    // Z position is fixed at a distance from the camera
    const z = -1.5;
    
    return [x, y, z];
  }

  _renderFoodIndicators() {
    const { showFoodIndicators = true, foodIndicatorColor = "#4CAF50", foodIndicatorSize = 0.1 } = this.props;
    const { recognizedFood } = this.state;
    
    if (!showFoodIndicators || !recognizedFood) {
      return null;
    }
    
    return recognizedFood.foodItems.map((foodItem, index) => {
      // If custom renderer is provided, use it
      if (this.props.renderFoodIndicator) {
        return (
          <ViroNode
            key={`food-indicator-${index}`}
            position={this._getPositionFromBoundingBox(foodItem.boundingBox)}
            onClick={() => this._extractRecipe([foodItem])}
          >
            {this.props.renderFoodIndicator(foodItem)}
          </ViroNode>
        );
      }
      
      // Default indicator is a green sphere with pulse animation
      const animation = this.props.foodIndicatorAnimation || "pulse";
      
      return (
        <ViroNode
          key={`food-indicator-${index}`}
          position={this._getPositionFromBoundingBox(foodItem.boundingBox)}
          onClick={() => this._extractRecipe([foodItem])}
        >
          <ViroSphere
            radius={foodIndicatorSize}
            materials={["foodIndicator"]}
            animation={{
              name: typeof animation === "string" ? animation : animation.name,
              run: true,
              loop: true,
            }}
            physicsBody={{
              type: "Kinematic",
            }}
          />
          
          <ViroText
            text={foodItem.name}
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#FFFFFF",
              textAlignVertical: "center",
              textAlign: "center",
            }}
            position={[0, foodIndicatorSize + 0.05, 0]}
            width={0.5}
            height={0.1}
          />
          
          <ViroText
            text={`${Math.round(foodItem.confidence * 100)}%`}
            style={{
              fontFamily: "Arial",
              fontSize: 10,
              color: "#CCCCCC",
              textAlignVertical: "center",
              textAlign: "center",
            }}
            position={[0, foodIndicatorSize + 0.15, 0]}
            width={0.5}
            height={0.1}
          />
        </ViroNode>
      );
    });
  }

  _renderRecipeDetails() {
    const { recipe, nutritionInfo, showRecipeDetails } = this.state;
    
    if (!recipe || !showRecipeDetails) {
      return null;
    }
    
    // If custom renderer is provided, use it
    if (this.props.renderRecipeDetails) {
      return (
        <ViroNode
          position={[0, 0, -2]}
          animation={{
            name: "showRecipeCard",
            run: showRecipeDetails,
            loop: false,
          }}
        >
          {this.props.renderRecipeDetails(recipe, nutritionInfo || undefined)}
        </ViroNode>
      );
    }
    
    // Default recipe details card
    return (
      <ViroNode
        position={[0, 0, -2]}
        animation={{
          name: "showRecipeCard",
          run: showRecipeDetails,
          loop: false,
        }}
      >
        <ViroFlexView
          style={{
            padding: 0.1,
            backgroundColor: "#FFFFFF",
            borderRadius: 0.05,
          }}
          width={2.5}
          height={2}
          materials={["recipeCard"]}
        >
          <ViroText
            text={recipe.title}
            style={{
              fontFamily: "Arial",
              fontSize: 20,
              color: "#000000",
              textAlignVertical: "center",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
          
          <ViroText
            text={recipe.description}
            style={{
              fontFamily: "Arial",
              fontSize: 14,
              color: "#666666",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
          
          <ViroText
            text={`Prep: ${recipe.prepTime} min | Cook: ${recipe.cookTime} min | Total: ${recipe.totalTime} min`}
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#999999",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
          
          <ViroText
            text="Ingredients"
            style={{
              fontFamily: "Arial",
              fontSize: 16,
              color: "#000000",
              textAlignVertical: "center",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
          
          <ViroFlexView
            style={{
              padding: 0.05,
              backgroundColor: "#F5F5F5",
              borderRadius: 0.05,
            }}
            width={2.3}
            height={0.5}
          >
            <ViroText
              text={recipe.ingredients.slice(0, 5).map(ingredient => 
                `• ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
              ).join("\n")}
              style={{
                fontFamily: "Arial",
                fontSize: 12,
                color: "#333333",
                textAlignVertical: "center",
                textAlign: "left",
              }}
            />
          </ViroFlexView>
          
          {nutritionInfo && (
            <>
              <ViroText
                text="Nutrition"
                style={{
                  fontFamily: "Arial",
                  fontSize: 16,
                  color: "#000000",
                  textAlignVertical: "center",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
              
              <ViroText
                text={`Calories: ${nutritionInfo.calories} | Protein: ${nutritionInfo.protein}g | Carbs: ${nutritionInfo.carbs}g | Fat: ${nutritionInfo.fat}g`}
                style={{
                  fontFamily: "Arial",
                  fontSize: 12,
                  color: "#333333",
                  textAlignVertical: "center",
                  textAlign: "center",
                }}
              />
            </>
          )}
          
          <ViroText
            text="Tap anywhere to dismiss"
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#999999",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
        </ViroFlexView>
      </ViroNode>
    );
  }

  _onSceneTap = () => {
    if (this.state.showRecipeDetails) {
      this.setState({
        showRecipeDetails: false,
      });
    }
  };

  render() {
    return (
      <>
        {this._renderFoodIndicators()}
        {this._renderRecipeDetails()}
      </>
    );
  }
}