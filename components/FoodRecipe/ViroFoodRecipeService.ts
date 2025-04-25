/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroFoodRecipeService
 */

import { NativeModules, Platform } from "react-native";

// This would be the actual native module in a real implementation
// const FoodRecipeModule = NativeModules.ViroFoodRecipeModule;

export type FoodRecipeConfig = {
  apiKey?: string;
  apiUrl?: string;
  useOpenAI?: boolean;
  openAIApiKey?: string;
  openAIModel?: string;
  nutritionAPIKey?: string;
};

export type FoodRecognitionResult = {
  foodItems: FoodItem[];
  confidence: number;
  imageUrl?: string;
};

export type FoodItem = {
  id: string;
  name: string;
  confidence: number;
  category: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type NutritionInfo = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  sodium: number;
  cholesterol: number;
  vitamins: {
    a?: number;
    c?: number;
    d?: number;
    e?: number;
    k?: number;
    b1?: number;
    b2?: number;
    b3?: number;
    b5?: number;
    b6?: number;
    b7?: number;
    b9?: number;
    b12?: number;
  };
  minerals: {
    calcium?: number;
    iron?: number;
    magnesium?: number;
    phosphorus?: number;
    potassium?: number;
    zinc?: number;
    copper?: number;
    manganese?: number;
    selenium?: number;
  };
  servingSize: string;
  servingWeight: number;
  unit: string;
};

export type Ingredient = {
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  substitutes?: string[];
};

export type RecipeStep = {
  number: number;
  description: string;
  timer?: number; // in seconds
  temperature?: {
    value: number;
    unit: "F" | "C";
  };
  imageUrl?: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  totalTime: number; // in minutes
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  cuisine: string;
  mealType: string[];
  dietaryRestrictions: string[];
  nutritionInfo?: NutritionInfo;
  imageUrl?: string;
  sourceUrl?: string;
  sourceName?: string;
  rating?: number;
  reviews?: number;
  tips?: string[];
  variations?: {
    title: string;
    description: string;
  }[];
};

export type RecipeSearchParams = {
  query?: string;
  ingredients?: string[];
  cuisine?: string;
  mealType?: string;
  dietaryRestrictions?: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
  maxTotalTime?: number;
  minRating?: number;
  limit?: number;
  offset?: number;
};

export type RecipeSearchResult = {
  recipes: Recipe[];
  total: number;
  limit: number;
  offset: number;
};

/**
 * Service class for handling food recognition and recipe extraction
 */
export class ViroFoodRecipeService {
  private static instance: ViroFoodRecipeService;
  private isInitialized: boolean = false;
  private config: FoodRecipeConfig | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of the service
   */
  public static getInstance(): ViroFoodRecipeService {
    if (!ViroFoodRecipeService.instance) {
      ViroFoodRecipeService.instance = new ViroFoodRecipeService();
    }
    return ViroFoodRecipeService.instance;
  }

  /**
   * Initialize the Food Recipe service
   * @param config Configuration for the Food Recipe service
   */
  public async initialize(config: FoodRecipeConfig): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      this.config = config;
      
      // In a real implementation, this would initialize the native module
      // await FoodRecipeModule.initialize(config);
      
      this.isInitialized = true;
      console.log("Food Recipe service initialized");
      return true;
    } catch (error) {
      console.error("Failed to initialize Food Recipe service:", error);
      return false;
    }
  }

  /**
   * Recognize food items in an image
   * @param imageBase64 Base64 encoded image data
   */
  public async recognizeFood(imageBase64: string): Promise<FoodRecognitionResult> {
    if (!this.isInitialized) {
      throw new Error("Food Recipe service not initialized");
    }

    try {
      // In a real implementation, this would call the food recognition API
      // const result = await FoodRecipeModule.recognizeFood(imageBase64);
      // return result;
      
      // For demo purposes, return mock data
      return this._generateMockFoodRecognitionResult();
    } catch (error) {
      console.error("Failed to recognize food:", error);
      throw error;
    }
  }

  /**
   * Get nutrition information for recognized food items
   * @param foodItems Food items to get nutrition information for
   */
  public async getNutritionInfo(foodItems: FoodItem[]): Promise<NutritionInfo> {
    if (!this.isInitialized) {
      throw new Error("Food Recipe service not initialized");
    }

    try {
      // In a real implementation, this would call the nutrition API
      // const result = await FoodRecipeModule.getNutritionInfo(foodItems);
      // return result;
      
      // For demo purposes, return mock data
      return this._generateMockNutritionInfo(foodItems);
    } catch (error) {
      console.error("Failed to get nutrition information:", error);
      throw error;
    }
  }

  /**
   * Extract recipe from recognized food items
   * @param foodItems Food items to extract recipe from
   */
  public async extractRecipe(foodItems: FoodItem[]): Promise<Recipe> {
    if (!this.isInitialized) {
      throw new Error("Food Recipe service not initialized");
    }

    try {
      // In a real implementation, this would call the recipe extraction API
      // const result = await FoodRecipeModule.extractRecipe(foodItems);
      // return result;
      
      // For demo purposes, return mock data
      return this._generateMockRecipe(foodItems);
    } catch (error) {
      console.error("Failed to extract recipe:", error);
      throw error;
    }
  }

  /**
   * Search for recipes based on parameters
   * @param params Search parameters
   */
  public async searchRecipes(params: RecipeSearchParams): Promise<RecipeSearchResult> {
    if (!this.isInitialized) {
      throw new Error("Food Recipe service not initialized");
    }

    try {
      // In a real implementation, this would call the recipe search API
      // const result = await FoodRecipeModule.searchRecipes(params);
      // return result;
      
      // For demo purposes, return mock data
      return this._generateMockRecipeSearchResult(params);
    } catch (error) {
      console.error("Failed to search recipes:", error);
      throw error;
    }
  }

  /**
   * Get similar recipes to a given recipe
   * @param recipeId ID of the recipe to find similar recipes for
   * @param limit Maximum number of results
   */
  public async getSimilarRecipes(recipeId: string, limit: number = 5): Promise<Recipe[]> {
    if (!this.isInitialized) {
      throw new Error("Food Recipe service not initialized");
    }

    try {
      // In a real implementation, this would call the similar recipes API
      // const result = await FoodRecipeModule.getSimilarRecipes(recipeId, limit);
      // return result;
      
      // For demo purposes, return mock data
      return this._generateMockSimilarRecipes(recipeId, limit);
    } catch (error) {
      console.error("Failed to get similar recipes:", error);
      throw error;
    }
  }

  /**
   * Get recipe by ID
   * @param recipeId ID of the recipe to get
   */
  public async getRecipeById(recipeId: string): Promise<Recipe> {
    if (!this.isInitialized) {
      throw new Error("Food Recipe service not initialized");
    }

    try {
      // In a real implementation, this would call the recipe API
      // const result = await FoodRecipeModule.getRecipeById(recipeId);
      // return result;
      
      // For demo purposes, return mock data
      return this._generateMockRecipeById(recipeId);
    } catch (error) {
      console.error("Failed to get recipe by ID:", error);
      throw error;
    }
  }

  /**
   * Generate meal plan based on dietary preferences
   * @param params Meal plan parameters
   */
  public async generateMealPlan(params: {
    days: number;
    meals: number;
    dietaryRestrictions?: string[];
    calorieTarget?: number;
    excludeIngredients?: string[];
  }): Promise<{
    days: {
      date: string;
      meals: {
        type: string;
        recipe: Recipe;
      }[];
    }[];
    totalNutrition: NutritionInfo;
  }> {
    if (!this.isInitialized) {
      throw new Error("Food Recipe service not initialized");
    }

    try {
      // In a real implementation, this would call the meal plan API
      // const result = await FoodRecipeModule.generateMealPlan(params);
      // return result;
      
      // For demo purposes, return mock data
      return this._generateMockMealPlan(params);
    } catch (error) {
      console.error("Failed to generate meal plan:", error);
      throw error;
    }
  }

  /**
   * Release resources when the service is no longer needed
   */
  public release(): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // In a real implementation, this would release resources
      // FoodRecipeModule.release();
      
      this.isInitialized = false;
      this.config = null;
      console.log("Food Recipe service released");
    } catch (error) {
      console.error("Failed to release Food Recipe service:", error);
    }
  }

  /**
   * Generate mock food recognition result for testing
   */
  private _generateMockFoodRecognitionResult(): FoodRecognitionResult {
    const foodItems: FoodItem[] = [
      {
        id: "food-1",
        name: "Pasta",
        confidence: 0.95,
        category: "Grains",
        boundingBox: {
          x: 0.2,
          y: 0.3,
          width: 0.6,
          height: 0.4,
        },
      },
      {
        id: "food-2",
        name: "Tomato Sauce",
        confidence: 0.92,
        category: "Sauce",
        boundingBox: {
          x: 0.3,
          y: 0.4,
          width: 0.4,
          height: 0.3,
        },
      },
      {
        id: "food-3",
        name: "Parmesan Cheese",
        confidence: 0.88,
        category: "Dairy",
        boundingBox: {
          x: 0.5,
          y: 0.2,
          width: 0.3,
          height: 0.2,
        },
      },
      {
        id: "food-4",
        name: "Basil",
        confidence: 0.85,
        category: "Herbs",
        boundingBox: {
          x: 0.6,
          y: 0.1,
          width: 0.2,
          height: 0.1,
        },
      },
    ];

    return {
      foodItems,
      confidence: 0.9,
      imageUrl: "https://example.com/food-image.jpg",
    };
  }

  /**
   * Generate mock nutrition information for testing
   * @param foodItems Food items to generate nutrition information for
   */
  private _generateMockNutritionInfo(foodItems: FoodItem[]): NutritionInfo {
    // Calculate mock nutrition values based on food items
    let calories = 0;
    let protein = 0;
    let fat = 0;
    let carbs = 0;
    let sugar = 0;
    let fiber = 0;
    let sodium = 0;
    let cholesterol = 0;

    for (const item of foodItems) {
      switch (item.category) {
        case "Grains":
          calories += 200;
          protein += 7;
          fat += 1;
          carbs += 40;
          fiber += 2;
          sodium += 10;
          break;
        case "Sauce":
          calories += 50;
          protein += 1;
          fat += 2;
          carbs += 10;
          sugar += 5;
          fiber += 1;
          sodium += 400;
          break;
        case "Dairy":
          calories += 100;
          protein += 10;
          fat += 7;
          carbs += 1;
          sodium += 200;
          cholesterol += 20;
          break;
        case "Herbs":
          calories += 5;
          fiber += 0.5;
          break;
        case "Meat":
          calories += 250;
          protein += 25;
          fat += 15;
          sodium += 100;
          cholesterol += 70;
          break;
        case "Vegetables":
          calories += 30;
          protein += 1;
          carbs += 5;
          fiber += 2;
          sugar += 2;
          break;
        case "Fruits":
          calories += 60;
          carbs += 15;
          fiber += 2;
          sugar += 10;
          break;
        default:
          calories += 50;
          protein += 2;
          fat += 2;
          carbs += 5;
          break;
      }
    }

    return {
      calories,
      protein,
      fat,
      carbs,
      sugar,
      fiber,
      sodium,
      cholesterol,
      vitamins: {
        a: 10,
        c: 15,
        d: 5,
        e: 8,
        k: 12,
        b1: 10,
        b2: 15,
        b3: 20,
        b5: 10,
        b6: 15,
        b7: 5,
        b9: 10,
        b12: 15,
      },
      minerals: {
        calcium: 10,
        iron: 15,
        magnesium: 10,
        phosphorus: 15,
        potassium: 10,
        zinc: 15,
        copper: 10,
        manganese: 15,
        selenium: 10,
      },
      servingSize: "1 plate",
      servingWeight: 350,
      unit: "g",
    };
  }

  /**
   * Generate mock recipe for testing
   * @param foodItems Food items to generate recipe for
   */
  private _generateMockRecipe(foodItems: FoodItem[]): Recipe {
    // Generate a recipe based on the food items
    const foodNames = foodItems.map(item => item.name.toLowerCase());
    
    // Determine the type of recipe based on the food items
    let recipeType = "pasta";
    if (foodNames.includes("rice")) {
      recipeType = "rice";
    } else if (foodNames.includes("chicken")) {
      recipeType = "chicken";
    } else if (foodNames.includes("beef")) {
      recipeType = "beef";
    } else if (foodNames.includes("fish") || foodNames.includes("salmon")) {
      recipeType = "fish";
    } else if (foodNames.includes("salad") || (foodNames.includes("lettuce") && foodNames.includes("tomato"))) {
      recipeType = "salad";
    } else if (foodNames.includes("soup")) {
      recipeType = "soup";
    }
    
    // Generate recipe based on type
    switch (recipeType) {
      case "pasta":
        return {
          id: "recipe-pasta-1",
          title: "Classic Pasta with Tomato Sauce",
          description: "A simple and delicious pasta dish with homemade tomato sauce, topped with fresh basil and parmesan cheese.",
          ingredients: [
            {
              name: "Pasta",
              quantity: "8",
              unit: "oz",
              notes: "Any type of pasta works well",
            },
            {
              name: "Tomato Sauce",
              quantity: "2",
              unit: "cups",
              notes: "Homemade or store-bought",
            },
            {
              name: "Parmesan Cheese",
              quantity: "1/4",
              unit: "cup",
              notes: "Freshly grated",
            },
            {
              name: "Basil",
              quantity: "1/4",
              unit: "cup",
              notes: "Fresh leaves, torn",
            },
            {
              name: "Olive Oil",
              quantity: "2",
              unit: "tbsp",
            },
            {
              name: "Garlic",
              quantity: "2",
              unit: "cloves",
              notes: "Minced",
            },
            {
              name: "Salt",
              quantity: "1/2",
              unit: "tsp",
            },
            {
              name: "Black Pepper",
              quantity: "1/4",
              unit: "tsp",
              notes: "Freshly ground",
            },
          ],
          steps: [
            {
              number: 1,
              description: "Bring a large pot of salted water to a boil.",
            },
            {
              number: 2,
              description: "Add pasta to the boiling water and cook according to package instructions until al dente.",
              timer: 600, // 10 minutes
            },
            {
              number: 3,
              description: "While pasta is cooking, heat olive oil in a large skillet over medium heat.",
            },
            {
              number: 4,
              description: "Add minced garlic to the skillet and cook until fragrant, about 30 seconds.",
              timer: 30,
            },
            {
              number: 5,
              description: "Add tomato sauce to the skillet and bring to a simmer. Season with salt and pepper.",
              timer: 300, // 5 minutes
            },
            {
              number: 6,
              description: "Drain the pasta and add it to the skillet with the sauce. Toss to coat.",
            },
            {
              number: 7,
              description: "Serve pasta topped with fresh basil and grated parmesan cheese.",
            },
          ],
          prepTime: 10,
          cookTime: 15,
          totalTime: 25,
          servings: 4,
          difficulty: "easy",
          cuisine: "Italian",
          mealType: ["dinner", "lunch"],
          dietaryRestrictions: ["vegetarian"],
          nutritionInfo: this._generateMockNutritionInfo(foodItems),
          imageUrl: "https://example.com/pasta-recipe.jpg",
          sourceUrl: "https://example.com/pasta-recipe",
          sourceName: "Example Recipes",
          rating: 4.8,
          reviews: 245,
          tips: [
            "For a spicier sauce, add red pepper flakes.",
            "You can add cooked chicken or shrimp for extra protein.",
            "Fresh tomatoes can be used instead of tomato sauce for a lighter version.",
          ],
          variations: [
            {
              title: "Pasta with Pesto",
              description: "Replace tomato sauce with basil pesto for a different flavor profile.",
            },
            {
              title: "Creamy Pasta",
              description: "Add 1/2 cup of heavy cream to the sauce for a creamier texture.",
            },
          ],
        };
      case "rice":
        return {
          id: "recipe-rice-1",
          title: "Simple Fried Rice",
          description: "A quick and easy fried rice dish that's perfect for using up leftover rice and vegetables.",
          ingredients: [
            {
              name: "Rice",
              quantity: "3",
              unit: "cups",
              notes: "Cooked and cooled",
            },
            {
              name: "Eggs",
              quantity: "2",
              unit: "",
              notes: "Beaten",
            },
            {
              name: "Carrots",
              quantity: "1",
              unit: "cup",
              notes: "Diced",
            },
            {
              name: "Peas",
              quantity: "1",
              unit: "cup",
              notes: "Frozen or fresh",
            },
            {
              name: "Green Onions",
              quantity: "3",
              unit: "",
              notes: "Sliced",
            },
            {
              name: "Soy Sauce",
              quantity: "2",
              unit: "tbsp",
            },
            {
              name: "Sesame Oil",
              quantity: "1",
              unit: "tsp",
            },
            {
              name: "Vegetable Oil",
              quantity: "2",
              unit: "tbsp",
            },
            {
              name: "Garlic",
              quantity: "2",
              unit: "cloves",
              notes: "Minced",
            },
            {
              name: "Ginger",
              quantity: "1",
              unit: "tsp",
              notes: "Grated",
            },
          ],
          steps: [
            {
              number: 1,
              description: "Heat 1 tablespoon of vegetable oil in a large skillet or wok over medium-high heat.",
            },
            {
              number: 2,
              description: "Add beaten eggs and scramble until cooked through. Remove from skillet and set aside.",
              timer: 60, // 1 minute
            },
            {
              number: 3,
              description: "Add remaining tablespoon of oil to the skillet. Add garlic and ginger and cook until fragrant, about 30 seconds.",
              timer: 30,
            },
            {
              number: 4,
              description: "Add carrots and cook for 2 minutes until slightly softened.",
              timer: 120, // 2 minutes
            },
            {
              number: 5,
              description: "Add peas and cook for 1 minute.",
              timer: 60, // 1 minute
            },
            {
              number: 6,
              description: "Add cooked rice to the skillet and break up any clumps. Cook for 3 minutes, stirring occasionally.",
              timer: 180, // 3 minutes
            },
            {
              number: 7,
              description: "Add scrambled eggs back to the skillet. Add soy sauce and sesame oil and stir to combine.",
            },
            {
              number: 8,
              description: "Stir in green onions and cook for 1 more minute.",
              timer: 60, // 1 minute
            },
            {
              number: 9,
              description: "Serve hot.",
            },
          ],
          prepTime: 10,
          cookTime: 10,
          totalTime: 20,
          servings: 4,
          difficulty: "easy",
          cuisine: "Asian",
          mealType: ["dinner", "lunch"],
          dietaryRestrictions: [],
          nutritionInfo: this._generateMockNutritionInfo(foodItems),
          imageUrl: "https://example.com/fried-rice-recipe.jpg",
          sourceUrl: "https://example.com/fried-rice-recipe",
          sourceName: "Example Recipes",
          rating: 4.6,
          reviews: 189,
          tips: [
            "Day-old rice works best for fried rice as it's drier and less sticky.",
            "You can add cooked chicken, shrimp, or tofu for extra protein.",
            "Feel free to use any vegetables you have on hand.",
          ],
          variations: [
            {
              title: "Kimchi Fried Rice",
              description: "Add 1 cup of chopped kimchi for a spicy Korean-inspired version.",
            },
            {
              title: "Pineapple Fried Rice",
              description: "Add 1 cup of diced pineapple and 1/4 cup of cashews for a Thai-inspired version.",
            },
          ],
        };
      case "chicken":
        return {
          id: "recipe-chicken-1",
          title: "Simple Roasted Chicken",
          description: "A classic roasted chicken with herbs and lemon, perfect for a Sunday dinner.",
          ingredients: [
            {
              name: "Whole Chicken",
              quantity: "1",
              unit: "",
              notes: "About 4-5 pounds",
            },
            {
              name: "Lemon",
              quantity: "1",
              unit: "",
              notes: "Quartered",
            },
            {
              name: "Garlic",
              quantity: "1",
              unit: "head",
              notes: "Cut in half crosswise",
            },
            {
              name: "Fresh Rosemary",
              quantity: "2",
              unit: "sprigs",
            },
            {
              name: "Fresh Thyme",
              quantity: "2",
              unit: "sprigs",
            },
            {
              name: "Olive Oil",
              quantity: "2",
              unit: "tbsp",
            },
            {
              name: "Salt",
              quantity: "1",
              unit: "tbsp",
            },
            {
              name: "Black Pepper",
              quantity: "1",
              unit: "tsp",
              notes: "Freshly ground",
            },
            {
              name: "Butter",
              quantity: "2",
              unit: "tbsp",
              notes: "Softened",
            },
          ],
          steps: [
            {
              number: 1,
              description: "Preheat oven to 425°F (220°C).",
              temperature: {
                value: 425,
                unit: "F",
              },
            },
            {
              number: 2,
              description: "Remove giblets from chicken cavity and pat chicken dry with paper towels.",
            },
            {
              number: 3,
              description: "Place lemon quarters, garlic halves, rosemary, and thyme inside the chicken cavity.",
            },
            {
              number: 4,
              description: "Rub the outside of the chicken with softened butter, then drizzle with olive oil.",
            },
            {
              number: 5,
              description: "Season the chicken generously with salt and pepper, making sure to season the cavity as well.",
            },
            {
              number: 6,
              description: "Tie the legs together with kitchen twine and tuck the wing tips under the body.",
            },
            {
              number: 7,
              description: "Place the chicken in a roasting pan and roast for 1 hour and 15 minutes, or until the internal temperature reaches 165°F (74°C) in the thickest part of the thigh.",
              timer: 4500, // 1 hour and 15 minutes
              temperature: {
                value: 165,
                unit: "F",
              },
            },
            {
              number: 8,
              description: "Remove from oven and let rest for 15 minutes before carving.",
              timer: 900, // 15 minutes
            },
            {
              number: 9,
              description: "Carve the chicken and serve with the pan juices.",
            },
          ],
          prepTime: 15,
          cookTime: 75,
          totalTime: 90,
          servings: 4,
          difficulty: "medium",
          cuisine: "American",
          mealType: ["dinner"],
          dietaryRestrictions: ["gluten-free", "dairy-free"],
          nutritionInfo: this._generateMockNutritionInfo(foodItems),
          imageUrl: "https://example.com/roasted-chicken-recipe.jpg",
          sourceUrl: "https://example.com/roasted-chicken-recipe",
          sourceName: "Example Recipes",
          rating: 4.9,
          reviews: 312,
          tips: [
            "For crispy skin, make sure to pat the chicken completely dry before roasting.",
            "Let the chicken come to room temperature for 30 minutes before roasting for more even cooking.",
            "Save the bones to make homemade chicken stock.",
          ],
          variations: [
            {
              title: "Herb Butter Chicken",
              description: "Mix herbs into the butter before rubbing on the chicken for more flavor.",
            },
            {
              title: "Spicy Roasted Chicken",
              description: "Add 1 tablespoon of paprika and 1/2 teaspoon of cayenne pepper to the seasoning for a spicy version.",
            },
          ],
        };
      default:
        return {
          id: "recipe-default-1",
          title: "Simple Mixed Dish",
          description: "A versatile dish made with the ingredients you have on hand.",
          ingredients: foodItems.map(item => ({
            name: item.name,
            quantity: "1",
            unit: "serving",
          })),
          steps: [
            {
              number: 1,
              description: "Prepare all ingredients according to your preference.",
            },
            {
              number: 2,
              description: "Combine ingredients in a suitable dish.",
            },
            {
              number: 3,
              description: "Cook until done to your liking.",
              timer: 600, // 10 minutes
            },
            {
              number: 4,
              description: "Serve and enjoy!",
            },
          ],
          prepTime: 10,
          cookTime: 15,
          totalTime: 25,
          servings: 2,
          difficulty: "easy",
          cuisine: "Fusion",
          mealType: ["dinner", "lunch"],
          dietaryRestrictions: [],
          nutritionInfo: this._generateMockNutritionInfo(foodItems),
          imageUrl: "https://example.com/mixed-dish-recipe.jpg",
          sourceUrl: "https://example.com/mixed-dish-recipe",
          sourceName: "Example Recipes",
          rating: 4.0,
          reviews: 42,
          tips: [
            "Adjust seasoning to taste.",
            "Add your favorite herbs and spices for extra flavor.",
          ],
          variations: [
            {
              title: "Spicy Version",
              description: "Add chili flakes or hot sauce for a spicy kick.",
            },
          ],
        };
    }
  }

  /**
   * Generate mock recipe search result for testing
   * @param params Search parameters
   */
  private _generateMockRecipeSearchResult(params: RecipeSearchParams): RecipeSearchResult {
    const limit = params.limit || 10;
    const offset = params.offset || 0;
    
    const recipes: Recipe[] = [];
    
    // Generate mock recipes based on search parameters
    for (let i = 0; i < limit; i++) {
      const id = `recipe-search-${offset + i + 1}`;
      const cuisines = ["Italian", "Asian", "American", "Mexican", "Indian", "French", "Mediterranean", "Thai", "Japanese", "Greek"];
      const mealTypes = ["breakfast", "lunch", "dinner", "snack", "dessert"];
      const difficulties = ["easy", "medium", "hard"];
      
      const cuisine = params.cuisine || cuisines[Math.floor(Math.random() * cuisines.length)];
      const mealType = params.mealType ? [params.mealType] : [mealTypes[Math.floor(Math.random() * mealTypes.length)]];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)] as "easy" | "medium" | "hard";
      
      const prepTime = Math.floor(Math.random() * 30) + 5;
      const cookTime = Math.floor(Math.random() * 60) + 10;
      const totalTime = prepTime + cookTime;
      
      // Skip if it doesn't meet time constraints
      if (
        (params.maxPrepTime && prepTime > params.maxPrepTime) ||
        (params.maxCookTime && cookTime > params.maxCookTime) ||
        (params.maxTotalTime && totalTime > params.maxTotalTime)
      ) {
        continue;
      }
      
      const rating = Math.floor(Math.random() * 10) / 2 + 2.5; // 2.5 to 5.0
      
      // Skip if it doesn't meet rating constraint
      if (params.minRating && rating < params.minRating) {
        continue;
      }
      
      const title = params.query
        ? `${params.query} Recipe ${i + 1}`
        : params.ingredients && params.ingredients.length > 0
        ? `${params.ingredients[0]} Recipe ${i + 1}`
        : `${cuisine} Recipe ${i + 1}`;
      
      recipes.push({
        id,
        title,
        description: `A delicious ${cuisine} recipe perfect for ${mealType.join(" or ")}.`,
        ingredients: [
          {
            name: "Ingredient 1",
            quantity: "1",
            unit: "cup",
          },
          {
            name: "Ingredient 2",
            quantity: "2",
            unit: "tbsp",
          },
          {
            name: "Ingredient 3",
            quantity: "3",
            unit: "oz",
          },
        ],
        steps: [
          {
            number: 1,
            description: "Prepare ingredients.",
          },
          {
            number: 2,
            description: "Cook according to instructions.",
            timer: 600, // 10 minutes
          },
          {
            number: 3,
            description: "Serve and enjoy!",
          },
        ],
        prepTime,
        cookTime,
        totalTime,
        servings: Math.floor(Math.random() * 4) + 2, // 2 to 6
        difficulty,
        cuisine,
        mealType,
        dietaryRestrictions: params.dietaryRestrictions || [],
        nutritionInfo: {
          calories: Math.floor(Math.random() * 500) + 200,
          protein: Math.floor(Math.random() * 30) + 10,
          fat: Math.floor(Math.random() * 20) + 5,
          carbs: Math.floor(Math.random() * 50) + 20,
          sugar: Math.floor(Math.random() * 10) + 2,
          fiber: Math.floor(Math.random() * 5) + 1,
          sodium: Math.floor(Math.random() * 500) + 100,
          cholesterol: Math.floor(Math.random() * 100) + 10,
          vitamins: {},
          minerals: {},
          servingSize: "1 serving",
          servingWeight: 250,
          unit: "g",
        },
        imageUrl: `https://example.com/recipe-${id}.jpg`,
        sourceUrl: `https://example.com/recipe-${id}`,
        sourceName: "Example Recipes",
        rating,
        reviews: Math.floor(Math.random() * 200) + 10,
      });
    }
    
    return {
      recipes,
      total: 100,
      limit,
      offset,
    };
  }

  /**
   * Generate mock similar recipes for testing
   * @param recipeId ID of the recipe to find similar recipes for
   * @param limit Maximum number of results
   */
  private _generateMockSimilarRecipes(recipeId: string, limit: number): Recipe[] {
    const recipes: Recipe[] = [];
    
    // Generate mock similar recipes
    for (let i = 0; i < limit; i++) {
      const id = `recipe-similar-${i + 1}`;
      
      recipes.push({
        id,
        title: `Similar Recipe ${i + 1}`,
        description: `A recipe similar to ${recipeId}.`,
        ingredients: [
          {
            name: "Ingredient 1",
            quantity: "1",
            unit: "cup",
          },
          {
            name: "Ingredient 2",
            quantity: "2",
            unit: "tbsp",
          },
          {
            name: "Ingredient 3",
            quantity: "3",
            unit: "oz",
          },
        ],
        steps: [
          {
            number: 1,
            description: "Prepare ingredients.",
          },
          {
            number: 2,
            description: "Cook according to instructions.",
            timer: 600, // 10 minutes
          },
          {
            number: 3,
            description: "Serve and enjoy!",
          },
        ],
        prepTime: 10,
        cookTime: 20,
        totalTime: 30,
        servings: 4,
        difficulty: "easy",
        cuisine: "Italian",
        mealType: ["dinner"],
        dietaryRestrictions: [],
        nutritionInfo: {
          calories: 400,
          protein: 20,
          fat: 15,
          carbs: 40,
          sugar: 5,
          fiber: 3,
          sodium: 300,
          cholesterol: 50,
          vitamins: {},
          minerals: {},
          servingSize: "1 serving",
          servingWeight: 250,
          unit: "g",
        },
        imageUrl: `https://example.com/recipe-${id}.jpg`,
        sourceUrl: `https://example.com/recipe-${id}`,
        sourceName: "Example Recipes",
        rating: 4.5,
        reviews: 100,
      });
    }
    
    return recipes;
  }

  /**
   * Generate mock recipe by ID for testing
   * @param recipeId ID of the recipe to get
   */
  private _generateMockRecipeById(recipeId: string): Recipe {
    // Check if it's one of our predefined recipes
    if (recipeId === "recipe-pasta-1") {
      return this._generateMockRecipe([{ id: "food-1", name: "Pasta", confidence: 0.95, category: "Grains" }]);
    } else if (recipeId === "recipe-rice-1") {
      return this._generateMockRecipe([{ id: "food-1", name: "Rice", confidence: 0.95, category: "Grains" }]);
    } else if (recipeId === "recipe-chicken-1") {
      return this._generateMockRecipe([{ id: "food-1", name: "Chicken", confidence: 0.95, category: "Meat" }]);
    }
    
    // Otherwise, generate a generic recipe
    return {
      id: recipeId,
      title: `Recipe ${recipeId}`,
      description: `A delicious recipe with ID ${recipeId}.`,
      ingredients: [
        {
          name: "Ingredient 1",
          quantity: "1",
          unit: "cup",
        },
        {
          name: "Ingredient 2",
          quantity: "2",
          unit: "tbsp",
        },
        {
          name: "Ingredient 3",
          quantity: "3",
          unit: "oz",
        },
      ],
      steps: [
        {
          number: 1,
          description: "Prepare ingredients.",
        },
        {
          number: 2,
          description: "Cook according to instructions.",
          timer: 600, // 10 minutes
        },
        {
          number: 3,
          description: "Serve and enjoy!",
        },
      ],
      prepTime: 10,
      cookTime: 20,
      totalTime: 30,
      servings: 4,
      difficulty: "medium",
      cuisine: "International",
      mealType: ["dinner"],
      dietaryRestrictions: [],
      nutritionInfo: {
        calories: 400,
        protein: 20,
        fat: 15,
        carbs: 40,
        sugar: 5,
        fiber: 3,
        sodium: 300,
        cholesterol: 50,
        vitamins: {},
        minerals: {},
        servingSize: "1 serving",
        servingWeight: 250,
        unit: "g",
      },
      imageUrl: `https://example.com/recipe-${recipeId}.jpg`,
      sourceUrl: `https://example.com/recipe-${recipeId}`,
      sourceName: "Example Recipes",
      rating: 4.0,
      reviews: 50,
    };
  }

  /**
   * Generate mock meal plan for testing
   * @param params Meal plan parameters
   */
  private _generateMockMealPlan(params: {
    days: number;
    meals: number;
    dietaryRestrictions?: string[];
    calorieTarget?: number;
    excludeIngredients?: string[];
  }): {
    days: {
      date: string;
      meals: {
        type: string;
        recipe: Recipe;
      }[];
    }[];
    totalNutrition: NutritionInfo;
  } {
    const days: {
      date: string;
      meals: {
        type: string;
        recipe: Recipe;
      }[];
    }[] = [];
    
    const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalSugar = 0;
    let totalFiber = 0;
    let totalSodium = 0;
    let totalCholesterol = 0;
    
    // Generate meal plan for each day
    for (let i = 0; i < params.days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const meals: {
        type: string;
        recipe: Recipe;
      }[] = [];
      
      // Generate meals for each day
      for (let j = 0; j < params.meals; j++) {
        const mealType = mealTypes[j % mealTypes.length];
        
        // Generate a recipe for this meal
        const recipe = this._generateMockRecipeById(`meal-plan-${i + 1}-${j + 1}`);
        
        // Update recipe properties based on meal type
        recipe.mealType = [mealType];
        
        if (mealType === "breakfast") {
          recipe.title = `Breakfast Recipe ${i + 1}-${j + 1}`;
          recipe.prepTime = 5;
          recipe.cookTime = 10;
          recipe.totalTime = 15;
          if (recipe.nutritionInfo) {
            recipe.nutritionInfo.calories = 300;
            recipe.nutritionInfo.protein = 15;
            recipe.nutritionInfo.fat = 10;
            recipe.nutritionInfo.carbs = 35;
          }
        } else if (mealType === "lunch") {
          recipe.title = `Lunch Recipe ${i + 1}-${j + 1}`;
          recipe.prepTime = 10;
          recipe.cookTime = 15;
          recipe.totalTime = 25;
          if (recipe.nutritionInfo) {
            recipe.nutritionInfo.calories = 500;
            recipe.nutritionInfo.protein = 25;
            recipe.nutritionInfo.fat = 20;
            recipe.nutritionInfo.carbs = 50;
          }
        } else if (mealType === "dinner") {
          recipe.title = `Dinner Recipe ${i + 1}-${j + 1}`;
          recipe.prepTime = 15;
          recipe.cookTime = 30;
          recipe.totalTime = 45;
          if (recipe.nutritionInfo) {
            recipe.nutritionInfo.calories = 700;
            recipe.nutritionInfo.protein = 35;
            recipe.nutritionInfo.fat = 25;
            recipe.nutritionInfo.carbs = 70;
          }
        } else if (mealType === "snack") {
          recipe.title = `Snack Recipe ${i + 1}-${j + 1}`;
          recipe.prepTime = 5;
          recipe.cookTime = 0;
          recipe.totalTime = 5;
          if (recipe.nutritionInfo) {
            recipe.nutritionInfo.calories = 200;
            recipe.nutritionInfo.protein = 5;
            recipe.nutritionInfo.fat = 10;
            recipe.nutritionInfo.carbs = 20;
          }
        }
        
        // Apply dietary restrictions if specified
        if (params.dietaryRestrictions && params.dietaryRestrictions.length > 0) {
          recipe.dietaryRestrictions = params.dietaryRestrictions;
        }
        
        // Add to meals
        meals.push({
          type: mealType,
          recipe,
        });
        
        // Update total nutrition
        if (recipe.nutritionInfo) {
          totalCalories += recipe.nutritionInfo.calories;
          totalProtein += recipe.nutritionInfo.protein;
          totalFat += recipe.nutritionInfo.fat;
          totalCarbs += recipe.nutritionInfo.carbs;
          totalSugar += recipe.nutritionInfo.sugar;
          totalFiber += recipe.nutritionInfo.fiber;
          totalSodium += recipe.nutritionInfo.sodium;
          totalCholesterol += recipe.nutritionInfo.cholesterol;
        }
      }
      
      // Add day to meal plan
      days.push({
        date: date.toISOString().split("T")[0],
        meals,
      });
    }
    
    // Calculate average daily nutrition
    const totalDays = params.days;
    
    return {
      days,
      totalNutrition: {
        calories: Math.round(totalCalories / totalDays),
        protein: Math.round(totalProtein / totalDays),
        fat: Math.round(totalFat / totalDays),
        carbs: Math.round(totalCarbs / totalDays),
        sugar: Math.round(totalSugar / totalDays),
        fiber: Math.round(totalFiber / totalDays),
        sodium: Math.round(totalSodium / totalDays),
        cholesterol: Math.round(totalCholesterol / totalDays),
        vitamins: {},
        minerals: {},
        servingSize: "Daily average",
        servingWeight: 0,
        unit: "g",
      },
    };
  }
}