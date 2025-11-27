/**
 * Display Formatter for Recipe Ingredients
 * Smart formatting that shows grams based on ingredient type
 */

/**
 * Check if unit indicates a countable item
 */
function isCountable(unit: string): boolean {
  const countableUnits = [
    'clove',
    'cloves',
    'whole',
    'medium',
    'large',
    'small',
    'sprig',
    'sprigs',
    'bunch',
    'bunches',
  ];
  return countableUnits.includes(unit.toLowerCase());
}

/**
 * Check if ingredient is an oil or fat
 */
function isOil(name: string): boolean {
  const oilKeywords = ['oil', 'butter', 'ghee', 'margarine', 'lard', 'shortening'];
  const lowerName = name.toLowerCase();
  return oilKeywords.some((keyword) => lowerName.includes(keyword));
}

/**
 * Check if ingredient is a grain
 */
function isGrain(name: string): boolean {
  const grainKeywords = [
    'rice',
    'pasta',
    'quinoa',
    'oats',
    'couscous',
    'barley',
    'bulgur',
    'farro',
    'noodle',
    'noodles',
    'spaghetti',
    'macaroni',
    'penne',
  ];
  const lowerName = name.toLowerCase();
  return grainKeywords.some((keyword) => lowerName.includes(keyword));
}

/**
 * Check if ingredient is a protein
 */
function isProtein(name: string): boolean {
  const proteinKeywords = [
    'chicken',
    'beef',
    'pork',
    'fish',
    'salmon',
    'tuna',
    'turkey',
    'lamb',
    'duck',
    'tofu',
    'tempeh',
    'seitan',
    'steak',
    'thigh',
    'breast',
    'ground meat',
  ];
  const lowerName = name.toLowerCase();
  return proteinKeywords.some((keyword) => lowerName.includes(keyword));
}

/**
 * Format ingredient display with smart gram conversion
 *
 * Rules:
 * - Countable items (cloves, whole vegetables, eggs): "2 cloves garlic (6g)"
 * - Oils: "2 tbsp olive oil (27g)"
 * - Grains (when measured in cups): "1 cup rice (185g)"
 * - Proteins: "454g chicken breast"
 * - Default: original format with optional grams in parentheses
 *
 * @param name - Ingredient name
 * @param amount - Numeric amount (e.g., "2", "1.5")
 * @param unit - Unit of measurement (e.g., "cups", "cloves", "lb")
 * @param grams - Converted weight in grams (if available)
 * @returns Formatted display string
 */
export function formatIngredientDisplay(
  name: string,
  amount: string,
  unit: string,
  grams: number | null
): string {
  const unitKey = unit.toLowerCase();

  // Countable items: show both count and grams
  // Example: "2 cloves garlic (6g)"
  if (isCountable(unitKey)) {
    if (grams) {
      return `${amount} ${unit} ${name} (${Math.round(grams)}g)`;
    }
    return `${amount} ${unit} ${name}`;
  }

  // Oils: show both measurement and grams
  // Example: "2 tbsp olive oil (27g)"
  if (isOil(name)) {
    if (grams) {
      return `${amount} ${unit} ${name} (${Math.round(grams)}g)`;
    }
    return `${amount} ${unit} ${name}`;
  }

  // Grains with cups: show both cups and grams
  // Example: "1 cup rice (185g)"
  if (isGrain(name) && (unitKey === 'cup' || unitKey === 'cups')) {
    if (grams) {
      return `${amount} ${unit} ${name} (${Math.round(grams)}g)`;
    }
    return `${amount} ${unit} ${name}`;
  }

  // Proteins: show only grams
  // Example: "454g chicken breast"
  if (isProtein(name)) {
    if (grams) {
      return `${Math.round(grams)}g ${name}`;
    }
    // Fallback to original if grams not available
    return `${amount} ${unit} ${name}`;
  }

  // Default: show original with optional grams in parentheses
  // Example: "2 cups broccoli (473g)"
  if (grams) {
    return `${amount} ${unit} ${name} (${Math.round(grams)}g)`;
  }
  return `${amount} ${unit} ${name}`;
}

/**
 * Format ingredient for display with just amount and unit (no grams)
 * Useful for fallback when gram conversion is unavailable
 */
export function formatIngredientSimple(
  name: string,
  amount: string,
  unit: string
): string {
  return `${amount} ${unit} ${name}`;
}
