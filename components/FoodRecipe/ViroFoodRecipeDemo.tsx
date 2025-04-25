/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroFoodRecipeDemo
 */

import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert, Modal, ScrollView, Image } from "react-native";
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroConstants,
  ViroARPlane,
  ViroMaterials,
  ViroNode,
  ViroAnimations,
  ViroFlexView,
  ViroImage,
  ViroButton,
} from "../..";
import { ViroFoodRecipe } from "./ViroFoodRecipe";
import { 
  ViroFoodRecipeService, 
  FoodRecognitionResult, 
  FoodItem,
  Recipe,
  NutritionInfo,
  Ingredient,
  RecipeStep
} from "./ViroFoodRecipeService";

// Register materials for the demo
ViroMaterials.createMaterials({
  recipeCard: {
    diffuseColor: "#FFFFFF",
    diffuseTexture: require("../Resources/card_texture.jpg"),
  },
  captureButton: {
    diffuseColor: "#2196F3",
  },
  recipeButton: {
    diffuseColor: "#4CAF50",
  },
  nutritionButton: {
    diffuseColor: "#FFC107",
  },
});

// Register animations for the demo
ViroAnimations.registerAnimations({
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
  showRecipeCard: [
    ["fadeIn", "scaleUp"],
  ],
  hideRecipeCard: [
    ["fadeOut", "scaleDown"],
  ],
});

type Props = {
  apiKey?: string;
  useOpenAI?: boolean;
  openAIApiKey?: string;
  openAIModel?: string;
  nutritionAPIKey?: string;
};

type State = {
  trackingInitialized: boolean;
  recognizedFood: FoodRecognitionResult | null;
  recipe: Recipe | null;
  nutritionInfo: NutritionInfo | null;
  showRecipeDetails: boolean;
  showNutritionDetails: boolean;
  showIngredientsDetails: boolean;
  showStepsDetails: boolean;
  capturedImageBase64: string | null;
};

/**
 * AR Scene component for Food Recipe demo
 */
class FoodRecipeARScene extends React.Component<Props, State> {
  private foodRecipeService = ViroFoodRecipeService.getInstance();
  private foodRecipeRef = React.createRef<ViroFoodRecipe>();

  constructor(props: Props) {
    super(props);
    this.state = {
      trackingInitialized: false,
      recognizedFood: null,
      recipe: null,
      nutritionInfo: null,
      showRecipeDetails: false,
      showNutritionDetails: false,
      showIngredientsDetails: false,
      showStepsDetails: false,
      capturedImageBase64: null,
    };
  }

  componentDidMount() {
    // Initialize the Food Recipe service
    this.foodRecipeService.initialize({
      apiKey: this.props.apiKey,
      useOpenAI: this.props.useOpenAI,
      openAIApiKey: this.props.openAIApiKey,
      openAIModel: this.props.openAIModel,
      nutritionAPIKey: this.props.nutritionAPIKey,
    });
  }

  _onInitialized = (state: string, reason: string) => {
    if (state === ViroConstants.TRACKING_NORMAL) {
      this.setState({
        trackingInitialized: true,
      });
    } else if (state === ViroConstants.TRACKING_NONE) {
      this.setState({
        trackingInitialized: false,
      });
    }
  };

  _onFoodRecognized = (result: FoodRecognitionResult) => {
    this.setState({
      recognizedFood: result,
    });
    
    Alert.alert(
      "Food Recognized",
      `Recognized ${result.foodItems.length} food items. Would you like to see the recipe?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            if (this.foodRecipeRef.current) {
              this.foodRecipeRef.current._extractRecipe(result.foodItems);
            }
          },
        },
      ]
    );
  };

  _onRecipeExtracted = (recipe: Recipe) => {
    this.setState({
      recipe,
      showRecipeDetails: true,
    });
  };

  _onNutritionInfo = (nutritionInfo: NutritionInfo) => {
    this.setState({
      nutritionInfo,
    });
  };

  _onImageCaptured = (imageBase64: string) => {
    this.setState({
      capturedImageBase64: imageBase64,
    });
  };

  _captureImage = () => {
    if (this.foodRecipeRef.current) {
      // Manually trigger image capture
      this.foodRecipeRef.current._captureAndAnalyzeImage();
    }
  };

  _showRecipeDetails = () => {
    this.setState({
      showRecipeDetails: true,
    });
  };

  _showNutritionDetails = () => {
    this.setState({
      showNutritionDetails: true,
    });
  };

  _showIngredientsDetails = () => {
    this.setState({
      showIngredientsDetails: true,
    });
  };

  _showStepsDetails = () => {
    this.setState({
      showStepsDetails: true,
    });
  };

  _renderRecipeDetailsModal() {
    const { recipe, showRecipeDetails } = this.state;
    
    if (!recipe) {
      return null;
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRecipeDetails}
        onRequestClose={() => this.setState({ showRecipeDetails: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{recipe.title}</Text>
            
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
            
            <View style={styles.recipeInfoRow}>
              <View style={styles.recipeInfoItem}>
                <Text style={styles.recipeInfoValue}>{recipe.prepTime}</Text>
                <Text style={styles.recipeInfoLabel}>Prep (min)</Text>
              </View>
              
              <View style={styles.recipeInfoItem}>
                <Text style={styles.recipeInfoValue}>{recipe.cookTime}</Text>
                <Text style={styles.recipeInfoLabel}>Cook (min)</Text>
              </View>
              
              <View style={styles.recipeInfoItem}>
                <Text style={styles.recipeInfoValue}>{recipe.totalTime}</Text>
                <Text style={styles.recipeInfoLabel}>Total (min)</Text>
              </View>
              
              <View style={styles.recipeInfoItem}>
                <Text style={styles.recipeInfoValue}>{recipe.servings}</Text>
                <Text style={styles.recipeInfoLabel}>Servings</Text>
              </View>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                  this.setState({ 
                    showRecipeDetails: false,
                    showIngredientsDetails: true,
                  });
                }}
              >
                <Text style={styles.detailButtonText}>Ingredients</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                  this.setState({ 
                    showRecipeDetails: false,
                    showStepsDetails: true,
                  });
                }}
              >
                <Text style={styles.detailButtonText}>Steps</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                  this.setState({ 
                    showRecipeDetails: false,
                    showNutritionDetails: true,
                  });
                }}
              >
                <Text style={styles.detailButtonText}>Nutrition</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => this.setState({ showRecipeDetails: false })}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  _renderNutritionDetailsModal() {
    const { recipe, nutritionInfo, showNutritionDetails } = this.state;
    
    if (!recipe || !nutritionInfo) {
      return null;
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNutritionDetails}
        onRequestClose={() => this.setState({ showNutritionDetails: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nutrition Information</Text>
            
            <Text style={styles.nutritionTitle}>{recipe.title}</Text>
            
            <Text style={styles.nutritionSubtitle}>Per {nutritionInfo.servingSize} ({nutritionInfo.servingWeight} {nutritionInfo.unit})</Text>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <Text style={styles.nutritionValue}>{nutritionInfo.calories}</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionValue}>{nutritionInfo.protein} g</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Fat</Text>
              <Text style={styles.nutritionValue}>{nutritionInfo.fat} g</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Carbs</Text>
              <Text style={styles.nutritionValue}>{nutritionInfo.carbs} g</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Sugar</Text>
              <Text style={styles.nutritionValue}>{nutritionInfo.sugar} g</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Fiber</Text>
              <Text style={styles.nutritionValue}>{nutritionInfo.fiber} g</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Sodium</Text>
              <Text style={styles.nutritionValue}>{nutritionInfo.sodium} mg</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Cholesterol</Text>
              <Text style={styles.nutritionValue}>{nutritionInfo.cholesterol} mg</Text>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => this.setState({ showNutritionDetails: false })}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  _renderIngredientsDetailsModal() {
    const { recipe, showIngredientsDetails } = this.state;
    
    if (!recipe) {
      return null;
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showIngredientsDetails}
        onRequestClose={() => this.setState({ showIngredientsDetails: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ingredients</Text>
            
            <Text style={styles.ingredientsTitle}>{recipe.title}</Text>
            
            <ScrollView style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={`ingredient-${index}`} style={styles.ingredientItem}>
                  <Text style={styles.ingredientText}>
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    {ingredient.notes ? ` (${ingredient.notes})` : ""}
                  </Text>
                  
                  {ingredient.substitutes && ingredient.substitutes.length > 0 && (
                    <Text style={styles.ingredientSubstitutes}>
                      Substitutes: {ingredient.substitutes.join(", ")}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => this.setState({ showIngredientsDetails: false })}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  _renderStepsDetailsModal() {
    const { recipe, showStepsDetails } = this.state;
    
    if (!recipe) {
      return null;
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showStepsDetails}
        onRequestClose={() => this.setState({ showStepsDetails: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Steps</Text>
            
            <Text style={styles.stepsTitle}>{recipe.title}</Text>
            
            <ScrollView style={styles.stepsList}>
              {recipe.steps.map((step, index) => (
                <View key={`step-${index}`} style={styles.stepItem}>
                  <Text style={styles.stepNumber}>{step.number}</Text>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepText}>{step.description}</Text>
                    
                    {step.timer && (
                      <Text style={styles.stepTimer}>
                        Timer: {Math.floor(step.timer / 60)} min {step.timer % 60} sec
                      </Text>
                    )}
                    
                    {step.temperature && (
                      <Text style={styles.stepTemperature}>
                        Temperature: {step.temperature.value}°{step.temperature.unit}
                      </Text>
                    )}
                    
                    {step.imageUrl && (
                      <Image
                        source={{ uri: step.imageUrl }}
                        style={styles.stepImage}
                        resizeMode="cover"
                      />
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => this.setState({ showStepsDetails: false })}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  _renderControlButtons() {
    const { recipe, nutritionInfo } = this.state;
    
    return (
      <View style={styles.controlButtonsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={this._captureImage}
        >
          <Text style={styles.controlButtonText}>Capture</Text>
        </TouchableOpacity>
        
        {recipe && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={this._showRecipeDetails}
          >
            <Text style={styles.controlButtonText}>Recipe</Text>
          </TouchableOpacity>
        )}
        
        {nutritionInfo && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={this._showNutritionDetails}
          >
            <Text style={styles.controlButtonText}>Nutrition</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  _renderStatusBar() {
    const { recognizedFood } = this.state;
    
    return (
      <View style={styles.statusBarContainer}>
        <Text style={styles.statusBarText}>
          {recognizedFood
            ? `Recognized ${recognizedFood.foodItems.length} food items`
            : "No food recognized yet"}
        </Text>
      </View>
    );
  }

  _onSceneTap = () => {
    // Handle scene tap if needed
  };

  render() {
    return (
      <View style={styles.container}>
        <ViroARScene onTrackingUpdated={this._onInitialized} onClick={this._onSceneTap}>
          {/* Show loading text if tracking not initialized */}
          {!this.state.trackingInitialized && (
            <ViroText
              text="Initializing AR..."
              position={[0, 0, -1]}
              style={{
                fontSize: 20,
                color: "#ffffff",
                textAlignVertical: "center",
                textAlign: "center",
              }}
            />
          )}
          
          {/* Food Recipe component */}
          <ViroFoodRecipe
            ref={this.foodRecipeRef}
            config={{
              apiKey: this.props.apiKey,
              useOpenAI: this.props.useOpenAI,
              openAIApiKey: this.props.openAIApiKey,
              openAIModel: this.props.openAIModel,
              nutritionAPIKey: this.props.nutritionAPIKey,
            }}
            enabled={this.state.trackingInitialized}
            showFoodIndicators={true}
            foodIndicatorColor="#4CAF50"
            foodIndicatorSize={0.1}
            foodIndicatorAnimation="pulse"
            onFoodRecognized={this._onFoodRecognized}
            onRecipeExtracted={this._onRecipeExtracted}
            onNutritionInfo={this._onNutritionInfo}
            onImageCaptured={this._onImageCaptured}
            autoExtractRecipe={false}
            autoGetNutritionInfo={true}
            autoCaptureEnabled={false}
            captureInterval={5000}
          />
        </ViroARScene>
        
        {this._renderControlButtons()}
        {this._renderStatusBar()}
        {this._renderRecipeDetailsModal()}
        {this._renderNutritionDetailsModal()}
        {this._renderIngredientsDetailsModal()}
        {this._renderStepsDetailsModal()}
      </View>
    );
  }
}

/**
 * Main component for the Food Recipe demo
 */
export class ViroFoodRecipeDemo extends React.Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <ViroARSceneNavigator
          initialScene={{
            scene: FoodRecipeARScene,
          }}
          viroAppProps={this.props}
          autofocus={true}
          style={styles.arView}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  controlButtonsContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
  },
  controlButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  statusBarText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  recipeDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 15,
    textAlign: 'center',
  },
  recipeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  recipeInfoItem: {
    alignItems: 'center',
  },
  recipeInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  recipeInfoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  nutritionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
    textAlign: 'center',
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 10,
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#333333',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  ingredientsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  ingredientItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 10,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333333',
  },
  ingredientSubstitutes: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  stepsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 10,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    width: 30,
    textAlign: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
    color: '#333333',
  },
  stepTimer: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 5,
  },
  stepTemperature: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 5,
  },
  stepImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginTop: 10,
  },
});