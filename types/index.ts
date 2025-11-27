// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  googleId?: string | null;
  hashedPassword?: string | null;
  createdAt: Date;
}

// Pantry and Dietary Preference Types
export interface PantryItem {
  id: string;
  userId: string;
  ingredientName: string;
  category: string;
  createdAt: Date;
}

export interface DietaryPreference {
  id: string;
  userId: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isPescatarian: boolean;
  allergies: string[];
  customInstructions: string;
  updatedAt: Date;
}

// Recipe Types
export interface Ingredient {
  name: string;
  amount: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecipeIdea {
  name: string;
  description: string;
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  keyIngredients: string[];
}

export interface FullRecipe {
  name: string;
  description: string;
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  cuisineType: string;
  recipeStyle: string;
  nutritionTotal: NutritionInfo;
  nutritionPerServing: NutritionInfo;
}

export interface SavedRecipe {
  id: string;
  userId: string;
  recipeName: string;
  description: string;
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  cuisineType: string;
  recipeStyle: string;
  nutritionTotal: NutritionInfo;
  nutritionPerServing: NutritionInfo;
  tags: string[];
  savedAt: Date;
}

// Recipe Builder Form Types
export interface RecipeBuilderParams {
  servings: number;
  protein: string;
  carb: string;
  vegetables: string;
  cuisine: string;
  recipeStyle: "healthy" | "low-cal" | "indulgent";
  includeSauce: boolean;
  sauceType?: "healthy" | "creamy" | "tangy" | "spicy" | "savory" | "sweet";
  customInstructions: string;
}

// Session Storage Types
export interface RecipeBuilderSession {
  params: RecipeBuilderParams;
  timestamp: number;
}

export interface RecipeIdeasSession {
  ideas: RecipeIdea[];
  params: RecipeBuilderParams;
  selectedRecipeName?: string;
  timestamp: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GeminiRecipeIdeasResponse {
  recipes: RecipeIdea[];
}

export interface GeminiFullRecipeResponse {
  name: string;
  description: string;
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
}

// USDA API Types
export interface USDAIngredientMapping {
  [ingredientName: string]: {
    fdcId: string;
    per100g: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
}

export interface USDAFoodSearchResult {
  fdcId: number;
  description: string;
  foodNutrients: {
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }[];
}

// Pantry Categories
export const PANTRY_CATEGORIES = {
  GRAINS: "Grains",
  PROTEINS: "Proteins",
  VEGETABLES: "Vegetables",
  SPICES: "Spices & Seasonings",
  OILS: "Oils & Condiments",
  DAIRY: "Dairy & Alternatives",
} as const;

export type PantryCategory = typeof PANTRY_CATEGORIES[keyof typeof PANTRY_CATEGORIES];

// Common Allergens
export const COMMON_ALLERGENS = [
  "Nuts",
  "Dairy",
  "Gluten",
  "Shellfish",
  "Soy",
  "Eggs",
] as const;

export type Allergen = typeof COMMON_ALLERGENS[number];

// Recipe Difficulty Levels
export const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

// Recipe Styles
export const RECIPE_STYLES = ["healthy", "low-cal", "indulgent"] as const;
export type RecipeStyle = typeof RECIPE_STYLES[number];

// Sauce Types
export const SAUCE_TYPES = [
  "healthy",
  "creamy",
  "tangy",
  "spicy",
  "savory",
  "sweet",
] as const;
export type SauceType = typeof SAUCE_TYPES[number];
