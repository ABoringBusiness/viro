# ViroFoodRecipe

The ViroFoodRecipe component provides food recognition and recipe extraction functionality in AR. It allows users to scan food items, extract recipes, and view nutrition information.

## Features

- **Food Recognition**: Recognize food items in the camera view
- **Recipe Extraction**: Extract recipes based on recognized food items
- **Nutrition Information**: Get nutrition information for recognized food
- **Visual Indicators**: Display visual indicators for recognized food items
- **Recipe Details**: View detailed recipe information including ingredients and steps
- **Meal Planning**: Generate meal plans based on dietary preferences

## Usage

```jsx
import { 
  ViroARScene, 
  ViroARSceneNavigator, 
  ViroFoodRecipe 
} from '@reactvision/react-viro';

// Inside your AR scene component
<ViroFoodRecipe
  config={{
    apiKey: "your-api-key",
    useOpenAI: true,
    openAIApiKey: "your-openai-api-key",
    openAIModel: "gpt-4-vision-preview",
    nutritionAPIKey: "your-nutrition-api-key",
  }}
  enabled={true}
  showFoodIndicators={true}
  foodIndicatorColor="#4CAF50"
  foodIndicatorSize={0.1}
  foodIndicatorAnimation="pulse"
  onFoodRecognized={(result) => {
    console.log('Recognized food:', result);
  }}
  onRecipeExtracted={(recipe) => {
    console.log('Extracted recipe:', recipe);
  }}
  onNutritionInfo={(nutritionInfo) => {
    console.log('Nutrition information:', nutritionInfo);
  }}
  autoExtractRecipe={true}
  autoGetNutritionInfo={true}
  autoCaptureEnabled={true}
  captureInterval={5000}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | object | Food Recipe configuration |
| `enabled` | boolean | Flag to enable/disable food recognition |
| `onFoodRecognized` | function | Callback when food is recognized |
| `onRecipeExtracted` | function | Callback when a recipe is extracted |
| `onNutritionInfo` | function | Callback when nutrition information is available |
| `showFoodIndicators` | boolean | Flag to show/hide visual indicators for recognized food |
| `foodIndicatorColor` | string | Color of the food indicator |
| `foodIndicatorSize` | number | Size of the food indicator |
| `foodIndicatorAnimation` | string | Animation name for the food indicator |
| `renderFoodIndicator` | function | Custom renderer for food indicators |
| `renderRecipeDetails` | function | Custom renderer for recipe details |
| `autoExtractRecipe` | boolean | Flag to automatically extract recipe after food recognition |
| `autoGetNutritionInfo` | boolean | Flag to automatically get nutrition information after food recognition |
| `onImageCaptured` | function | Callback when an image is captured |
| `autoCaptureEnabled` | boolean | Flag to enable/disable automatic image capture |
| `captureInterval` | number | Interval in milliseconds for capturing and analyzing images |

## Food Recognition Result

The `onFoodRecognized` callback provides food recognition results with the following structure:

```typescript
type FoodRecognitionResult = {
  foodItems: FoodItem[];
  confidence: number;
  imageUrl?: string;
};

type FoodItem = {
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
```

## Recipe Data

The `onRecipeExtracted` callback provides recipe information with the following structure:

```typescript
type Recipe = {
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

type Ingredient = {
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  substitutes?: string[];
};

type RecipeStep = {
  number: number;
  description: string;
  timer?: number; // in seconds
  temperature?: {
    value: number;
    unit: "F" | "C";
  };
  imageUrl?: string;
};
```

## Nutrition Information

The `onNutritionInfo` callback provides nutrition information with the following structure:

```typescript
type NutritionInfo = {
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
```

## Demo

Check out the `ViroFoodRecipeDemo` component for a complete example of how to use the Food Recipe integration.

```jsx
import { ViroFoodRecipeDemo } from '@reactvision/react-viro';

// In your app
<ViroFoodRecipeDemo
  apiKey="your-api-key"
  useOpenAI={true}
  openAIApiKey="your-openai-api-key"
  openAIModel="gpt-4-vision-preview"
  nutritionAPIKey="your-nutrition-api-key"
/>
```

## Additional Services

The `ViroFoodRecipeService` provides additional methods for working with food recognition and recipes:

- `recognizeFood(imageBase64)`: Recognize food items in an image
- `getNutritionInfo(foodItems)`: Get nutrition information for recognized food items
- `extractRecipe(foodItems)`: Extract recipe from recognized food items
- `searchRecipes(params)`: Search for recipes based on parameters
- `getSimilarRecipes(recipeId, limit)`: Get similar recipes to a given recipe
- `getRecipeById(recipeId)`: Get recipe by ID
- `generateMealPlan(params)`: Generate meal plan based on dietary preferences

## Requirements

- React Native 0.63+
- Viro React 2.20+
- iOS 11+ or Android API Level 24+
- API keys for food recognition and nutrition information (optional)
- OpenAI API key for enhanced recipe extraction (optional)

## Notes

- The current implementation uses simulated data for demonstration purposes
- For production use, you would need to integrate with real food recognition and recipe APIs
- OpenAI integration provides more accurate recipe extraction and nutrition information