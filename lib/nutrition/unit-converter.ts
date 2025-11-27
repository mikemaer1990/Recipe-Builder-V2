/**
 * Unit Conversion Utilities for Recipe Ingredients
 * Converts various cooking measurements to grams for USDA nutrition calculation
 */

// Conversion factors to grams
const CONVERSIONS: Record<string, number> = {
  // Weight units (direct conversion)
  'g': 1,
  'gram': 1,
  'grams': 1,
  'kg': 1000,
  'kilogram': 1000,
  'kilograms': 1000,
  'oz': 28.35,
  'ounce': 28.35,
  'ounces': 28.35,
  'lb': 453.592,
  'lbs': 453.592,
  'pound': 453.592,
  'pounds': 453.592,

  // Count-based units (approximations for common items)
  'clove': 3, // 1 garlic clove ≈ 3g
  'cloves': 3,
  'piece': 50, // generic piece
  'pieces': 50,
  'slice': 25, // generic slice
  'slices': 25,
  'whole': 100, // generic whole item
  'medium': 150, // medium vegetable/fruit
  'large': 200, // large vegetable/fruit
  'small': 75, // small vegetable/fruit

  // Volume to weight (approximations - varies by ingredient)
  // Using water density as baseline: 1 ml = 1 g
  'ml': 1,
  'milliliter': 1,
  'milliliters': 1,
  'l': 1000,
  'liter': 1000,
  'liters': 1000,
  'cup': 236.588, // 1 US cup ≈ 236.588 ml
  'cups': 236.588,
  'tablespoon': 14.787, // 1 tbsp ≈ 14.787 ml
  'tablespoons': 14.787,
  'tbsp': 14.787,
  'teaspoon': 4.929, // 1 tsp ≈ 4.929 ml
  'teaspoons': 4.929,
  'tsp': 4.929,
  'pint': 473.176,
  'pints': 473.176,
  'quart': 946.353,
  'quarts': 946.353,
  'gallon': 3785.41,
  'gallons': 3785.41,
  'fluid ounce': 29.574,
  'fluid ounces': 29.574,
  'fl oz': 29.574,
};

// Special conversions for specific ingredients (overrides general volume conversions)
const INGREDIENT_SPECIFIC_CONVERSIONS: Record<string, Record<string, number>> = {
  'flour': {
    'cup': 120,
    'tablespoon': 8,
    'teaspoon': 2.5,
  },
  'sugar': {
    'cup': 200,
    'tablespoon': 12.5,
    'teaspoon': 4,
  },
  'brown sugar': {
    'cup': 220,
    'tablespoon': 14,
    'teaspoon': 4.5,
  },
  'butter': {
    'cup': 227,
    'tablespoon': 14,
    'stick': 113,
  },
  'oil': {
    'cup': 218,
    'tablespoon': 13.6,
    'teaspoon': 4.5,
  },
  'olive oil': {
    'cup': 216,
    'tablespoon': 13.5,
    'teaspoon': 4.5,
  },
  'honey': {
    'cup': 340,
    'tablespoon': 21,
    'teaspoon': 7,
  },
  'milk': {
    'cup': 244,
    'tablespoon': 15,
    'teaspoon': 5,
  },
  'water': {
    'cup': 236.588,
    'tablespoon': 14.787,
    'teaspoon': 4.929,
  },
  'rice': {
    'cup': 185,
    'tablespoon': 12,
  },
  'pasta': {
    'cup': 105,
  },
  'oats': {
    'cup': 80,
  },
};

/**
 * Parse a fraction string to decimal
 * Examples: "1/2" -> 0.5, "1 1/2" -> 1.5, "2" -> 2
 */
function parseFraction(value: string): number {
  value = value.trim();

  // Handle mixed numbers like "1 1/2"
  const mixedMatch = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const numerator = parseInt(mixedMatch[2]);
    const denominator = parseInt(mixedMatch[3]);
    return whole + (numerator / denominator);
  }

  // Handle simple fractions like "1/2"
  const fractionMatch = value.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1]);
    const denominator = parseInt(fractionMatch[2]);
    return numerator / denominator;
  }

  // Handle decimal or whole numbers
  const number = parseFloat(value);
  return isNaN(number) ? 0 : number;
}

/**
 * Extract quantity and unit from an amount string
 * Examples:
 *   "2 cups" -> { quantity: 2, unit: "cups" }
 *   "1.5 lbs" -> { quantity: 1.5, unit: "lbs" }
 *   "1/2 cup" -> { quantity: 0.5, unit: "cup" }
 *   "3 tablespoons" -> { quantity: 3, unit: "tablespoons" }
 */
export function parseAmount(amount: string): { quantity: number; unit: string } {
  amount = amount.toLowerCase().trim();

  // Remove common words
  amount = amount.replace(/^(about|approximately|roughly)\s+/i, '');

  // Match patterns like "2 cups", "1.5 oz", "1/2 teaspoon"
  const match = amount.match(/^([\d\s\/\.]+)\s*([a-z]+)?$/i);

  if (!match) {
    // If no match, try to extract just a number
    const numMatch = amount.match(/([\d\s\/\.]+)/);
    if (numMatch) {
      return {
        quantity: parseFraction(numMatch[1]),
        unit: '',
      };
    }
    return { quantity: 0, unit: '' };
  }

  const quantity = parseFraction(match[1]);
  const unit = match[2] ? match[2].trim() : '';

  return { quantity, unit };
}

/**
 * Convert an ingredient amount to grams
 *
 * @param amount - The amount string (e.g., "2 cups", "1.5 lbs", "1/2 cup")
 * @param ingredientName - The ingredient name (for specific conversions)
 * @returns Weight in grams, or null if conversion not possible
 */
export function convertToGrams(amount: string, ingredientName: string = ''): number | null {
  const { quantity, unit } = parseAmount(amount);

  if (quantity === 0) {
    return null;
  }

  // If no unit specified, assume it's already in grams or is a count (return as-is)
  if (!unit) {
    return quantity;
  }

  // Normalize ingredient name
  const normalizedIngredient = ingredientName.toLowerCase().trim();

  // Check for ingredient-specific conversion first
  for (const [key, conversions] of Object.entries(INGREDIENT_SPECIFIC_CONVERSIONS)) {
    if (normalizedIngredient.includes(key)) {
      const conversionFactor = conversions[unit];
      if (conversionFactor) {
        return quantity * conversionFactor;
      }
    }
  }

  // Fall back to general conversions
  const conversionFactor = CONVERSIONS[unit];
  if (conversionFactor) {
    return quantity * conversionFactor;
  }

  // If unit not recognized, return null
  console.warn(`Unknown unit: ${unit} for ingredient: ${ingredientName}`);
  return null;
}

/**
 * Get a human-friendly description of what conversion was applied
 */
export function getConversionInfo(amount: string, ingredientName: string = ''): string {
  const grams = convertToGrams(amount, ingredientName);
  if (grams === null) {
    return `Could not convert "${amount}"`;
  }
  return `${amount} ≈ ${grams.toFixed(1)}g`;
}
