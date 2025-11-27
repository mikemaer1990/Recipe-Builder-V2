/**
 * Nutrition Calculator Service
 * Calculates nutritional information for recipes using USDA data
 */

import { convertToGrams } from './unit-converter';
import { USDACache, NutritionPer100g } from './usda-client';
import ingredientMappings from './ingredient-mappings.json';

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionResult {
  nutritionTotal: NutritionInfo;
  nutritionPerServing: NutritionInfo;
  warnings: string[];
  details: IngredientNutritionDetail[];
}

export interface IngredientNutritionDetail {
  ingredient: string;
  amount: string;
  grams: number | null;
  nutrition: NutritionInfo | null;
  source: 'mapping' | 'usda' | 'default' | 'failed';
}

// Generic default nutrition values for different food categories
const DEFAULT_NUTRITION: Record<string, NutritionPer100g> = {
  protein: { calories: 150, protein: 25, carbs: 0, fat: 5 },
  vegetable: { calories: 25, protein: 1.5, carbs: 5, fat: 0.2 },
  carb: { calories: 120, protein: 3, carbs: 25, fat: 0.5 },
  fat: { calories: 800, protein: 0, carbs: 0, fat: 90 },
  spice: { calories: 200, protein: 8, carbs: 40, fat: 5 },
  sauce: { calories: 100, protein: 2, carbs: 10, fat: 5 },
  generic: { calories: 50, protein: 2, carbs: 10, fat: 1 },
};

/**
 * Determine which default category an ingredient belongs to
 */
function categorizeIngredient(ingredientName: string): keyof typeof DEFAULT_NUTRITION {
  const name = ingredientName.toLowerCase();

  // Proteins
  if (name.match(/chicken|beef|pork|fish|salmon|tuna|turkey|lamb|tofu|tempeh|seitan|egg/)) {
    return 'protein';
  }

  // Vegetables
  if (name.match(/broccoli|carrot|spinach|kale|lettuce|tomato|pepper|onion|garlic|mushroom|zucchini|cucumber|celery|cauliflower|cabbage|asparagus|eggplant/)) {
    return 'vegetable';
  }

  // Carbs
  if (name.match(/rice|pasta|bread|potato|quinoa|oats|noodle|tortilla|pita|bagel|cereal/)) {
    return 'carb';
  }

  // Fats/Oils
  if (name.match(/oil|butter|margarine|lard|shortening|cream(?!.*cheese)/)) {
    return 'fat';
  }

  // Spices
  if (name.match(/pepper|salt|cumin|paprika|oregano|basil|thyme|rosemary|cinnamon|ginger|turmeric|cayenne|chili powder/)) {
    return 'spice';
  }

  // Sauces
  if (name.match(/sauce|dressing|marinade|salsa|pesto|mayo|mustard|ketchup|gravy/)) {
    return 'sauce';
  }

  return 'generic';
}

/**
 * Get nutrition data for an ingredient from the mapping file
 */
function getNutritionFromMapping(ingredientName: string): NutritionPer100g | null {
  const normalizedName = ingredientName.toLowerCase().trim();

  // Direct lookup
  if (normalizedName in ingredientMappings) {
    const mapping = ingredientMappings[normalizedName as keyof typeof ingredientMappings];
    return mapping.per100g;
  }

  // Partial match - check if mapping key is contained in ingredient name
  for (const [key, value] of Object.entries(ingredientMappings)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value.per100g;
    }
  }

  return null;
}

/**
 * Get default nutrition for an ingredient based on category
 */
function getDefaultNutrition(ingredientName: string): NutritionPer100g {
  const category = categorizeIngredient(ingredientName);
  return DEFAULT_NUTRITION[category];
}

/**
 * Scale nutrition from per-100g to actual grams
 */
function scaleNutrition(nutritionPer100g: NutritionPer100g, grams: number): NutritionInfo {
  const scaleFactor = grams / 100;
  return {
    calories: Math.round(nutritionPer100g.calories * scaleFactor),
    protein: Math.round(nutritionPer100g.protein * scaleFactor),
    carbs: Math.round(nutritionPer100g.carbs * scaleFactor),
    fat: Math.round(nutritionPer100g.fat * scaleFactor),
  };
}

/**
 * Calculate nutrition for a single ingredient
 */
async function calculateIngredientNutrition(
  ingredient: RecipeIngredient,
  cache: USDACache
): Promise<IngredientNutritionDetail> {
  const { name, amount } = ingredient;

  // Convert amount to grams
  const grams = convertToGrams(amount, name);

  if (grams === null || grams === 0) {
    return {
      ingredient: name,
      amount,
      grams: null,
      nutrition: null,
      source: 'failed',
    };
  }

  // Try mapping file first
  let nutritionPer100g = getNutritionFromMapping(name);
  let source: IngredientNutritionDetail['source'] = 'mapping';

  // If not in mapping, try USDA API
  if (!nutritionPer100g) {
    nutritionPer100g = await cache.getNutrition(name);
    source = nutritionPer100g ? 'usda' : 'default';
  }

  // If USDA also fails, use defaults
  if (!nutritionPer100g) {
    nutritionPer100g = getDefaultNutrition(name);
  }

  // Scale to actual grams
  const nutrition = scaleNutrition(nutritionPer100g, grams);

  return {
    ingredient: name,
    amount,
    grams,
    nutrition,
    source,
  };
}

/**
 * Calculate total nutrition for a recipe
 *
 * @param ingredients - Array of recipe ingredients with names and amounts
 * @param servings - Number of servings the recipe makes
 * @returns Complete nutrition information with totals and per-serving
 */
export async function calculateRecipeNutrition(
  ingredients: RecipeIngredient[],
  servings: number
): Promise<NutritionResult> {
  const cache = new USDACache();
  const warnings: string[] = [];
  const details: IngredientNutritionDetail[] = [];

  // Calculate nutrition for each ingredient
  for (const ingredient of ingredients) {
    const detail = await calculateIngredientNutrition(ingredient, cache);
    details.push(detail);

    // Track warnings for failed conversions
    if (detail.source === 'failed') {
      warnings.push(`Could not calculate nutrition for: ${detail.ingredient} (${detail.amount})`);
    } else if (detail.source === 'default') {
      warnings.push(`Using estimated nutrition for: ${detail.ingredient}`);
    }
  }

  // Sum up total nutrition
  const totals: NutritionInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  for (const detail of details) {
    if (detail.nutrition) {
      totals.calories += detail.nutrition.calories;
      totals.protein += detail.nutrition.protein;
      totals.carbs += detail.nutrition.carbs;
      totals.fat += detail.nutrition.fat;
    }
  }

  // Calculate per-serving nutrition
  const perServing: NutritionInfo = {
    calories: Math.round(totals.calories / servings),
    protein: Math.round(totals.protein / servings),
    carbs: Math.round(totals.carbs / servings),
    fat: Math.round(totals.fat / servings),
  };

  return {
    nutritionTotal: totals,
    nutritionPerServing: perServing,
    warnings,
    details,
  };
}
