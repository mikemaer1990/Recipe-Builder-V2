import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateRecipeIdeas, type GenerateIdeasParams } from "@/lib/ai/gemini";
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
    const { ingredients, cuisine, style, mealType, servings } = body;

    // Validate required fields
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Ingredients are required" },
        { status: 400 }
      );
    }

    if (!cuisine || !mealType) {
      return NextResponse.json(
        { error: "Cuisine and meal type are required" },
        { status: 400 }
      );
    }

    // Get user's dietary preferences from database
    const dietaryPreferences = await getDietaryPreferences(session.user.id);

    const params: GenerateIdeasParams = {
      ingredients,
      cuisine,
      style,
      mealType,
      servings: servings || 4,
      dietaryPreferences: dietaryPreferences || undefined,
    };

    const ideas = await generateRecipeIdeas(params);

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error("Error generating recipe ideas:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe ideas" },
      { status: 500 }
    );
  }
}
