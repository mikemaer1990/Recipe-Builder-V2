import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveRecipe } from '@/lib/db';

export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // 2. Parse request body
    const recipe = await request.json();

    // 3. Validate required fields
    if (!recipe.name || !recipe.ingredients || !recipe.instructions) {
      return NextResponse.json(
        { error: 'Missing required recipe fields' },
        { status: 400 }
      );
    }

    // 4. Save to database
    const savedRecipe = await saveRecipe(session.user.id, recipe);

    // 5. Return success with saved recipe
    return NextResponse.json({
      success: true,
      recipe: savedRecipe,
    });

  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json(
      { error: 'Failed to save recipe' },
      { status: 500 }
    );
  }
}
