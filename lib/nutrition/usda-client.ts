/**
 * USDA FoodData Central API Client
 * https://fdc.nal.usda.gov/api-guide.html
 */

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = process.env.USDA_API_KEY;

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

export interface USDAFoodItem {
  fdcId: number;
  description: string;
  foodNutrients: USDANutrient[];
  dataType: string;
}

export interface USDASearchResult {
  foods: USDAFoodItem[];
  totalHits: number;
}

export interface NutritionPer100g {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Search for a food item in the USDA database
 */
export async function searchUSDAFood(query: string): Promise<USDAFoodItem | null> {
  if (!USDA_API_KEY) {
    console.error('USDA_API_KEY is not configured');
    return null;
  }

  try {
    const url = `${USDA_API_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=1&api_key=${USDA_API_KEY}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`USDA API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: USDASearchResult = await response.json();

    if (data.foods && data.foods.length > 0) {
      return data.foods[0];
    }

    return null;
  } catch (error) {
    console.error('Error searching USDA database:', error);
    return null;
  }
}

/**
 * Get detailed nutrition information for a specific food item by FDC ID
 */
export async function getUSDAFoodById(fdcId: number): Promise<USDAFoodItem | null> {
  if (!USDA_API_KEY) {
    console.error('USDA_API_KEY is not configured');
    return null;
  }

  try {
    const url = `${USDA_API_BASE}/food/${fdcId}?api_key=${USDA_API_KEY}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`USDA API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: USDAFoodItem = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching USDA food details:', error);
    return null;
  }
}

/**
 * Extract nutrition per 100g from USDA food item
 */
export function extractNutritionPer100g(food: USDAFoodItem): NutritionPer100g {
  const nutrients = food.foodNutrients;

  // USDA Nutrient IDs (standardized):
  // 1008 = Energy (calories)
  // 1003 = Protein
  // 1005 = Carbohydrate
  // 1004 = Total lipid (fat)

  const findNutrient = (id: number): number => {
    const nutrient = nutrients.find(n => n.nutrientId === id);
    return nutrient?.value || 0;
  };

  return {
    calories: findNutrient(1008),
    protein: findNutrient(1003),
    carbs: findNutrient(1005),
    fat: findNutrient(1004),
  };
}

/**
 * Get nutrition data with in-memory caching during calculation
 */
export class USDACache {
  private cache: Map<string, NutritionPer100g> = new Map();

  async getNutrition(ingredientName: string, fdcId?: number): Promise<NutritionPer100g | null> {
    // Check cache first
    const cacheKey = fdcId ? `fdc_${fdcId}` : ingredientName.toLowerCase();

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Fetch from USDA
    let food: USDAFoodItem | null = null;

    if (fdcId) {
      food = await getUSDAFoodById(fdcId);
    } else {
      food = await searchUSDAFood(ingredientName);
    }

    if (!food) {
      return null;
    }

    const nutrition = extractNutritionPer100g(food);

    // Cache the result
    this.cache.set(cacheKey, nutrition);

    return nutrition;
  }

  clear() {
    this.cache.clear();
  }
}
