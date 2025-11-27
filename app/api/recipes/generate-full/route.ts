import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateFullRecipe, type FullRecipeParams } from "@/lib/ai/gemini";
import { getDietaryPreferences } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      recipeName,
      ingredients,
      cuisine,
      style,
      mealType,
      servings,
      estimatedTime,
      difficulty,
    } = body;

    // Validate required fields
    if (!recipeName || !ingredients || !cuisine || !mealType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user's dietary preferences from database
    const dietaryPreferences = await getDietaryPreferences(session.user.id);

    const params: FullRecipeParams = {
      recipeName,
      ingredients,
      cuisine,
      style,
      mealType,
      servings: servings || 4,
      estimatedTime: estimatedTime || "30 minutes",
      difficulty: difficulty || "Medium",
      dietaryPreferences: dietaryPreferences || undefined,
    };

    const recipe = await generateFullRecipe(params);

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Error generating full recipe:", error);
    return NextResponse.json(
      { error: "Failed to generate full recipe" },
      { status: 500 }
    );
  }
}
