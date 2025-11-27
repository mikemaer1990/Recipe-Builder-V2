import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSavedRecipes, deleteRecipe } from '@/lib/db';

/**
 * GET /api/recipes
 * Fetch all saved recipes for the authenticated user
 */
export async function GET() {
  // Authenticate user
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Fetch user's saved recipes
    const recipes = await getSavedRecipes(session.user.id);

    return NextResponse.json({
      recipes,
      count: recipes.length,
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recipes?id=<recipe_id>
 * Delete a saved recipe
 */
export async function DELETE(request: Request) {
  // Authenticate user
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get recipe ID from query params
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('id');

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Delete recipe (includes ownership check)
    await deleteRecipe(recipeId, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
