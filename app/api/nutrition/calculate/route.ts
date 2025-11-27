import { NextRequest, NextResponse } from 'next/server';
import { calculateRecipeNutrition, RecipeIngredient } from '@/lib/nutrition/calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, servings } = body;

    // Validation
    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Ingredients array is required' },
        { status: 400 }
      );
    }

    if (!servings || servings < 1 || servings > 100) {
      return NextResponse.json(
        { error: 'Servings must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Validate ingredient format
    for (const ingredient of ingredients) {
      if (!ingredient.name || !ingredient.amount) {
        return NextResponse.json(
          { error: 'Each ingredient must have a name and amount' },
          { status: 400 }
        );
      }
    }

    // Calculate nutrition
    const result = await calculateRecipeNutrition(
      ingredients as RecipeIngredient[],
      servings
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating nutrition:', error);
    return NextResponse.json(
      { error: 'Failed to calculate nutrition' },
      { status: 500 }
    );
  }
}
