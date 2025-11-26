import { sql } from "@vercel/postgres";
import type {
  User,
  PantryItem,
  DietaryPreference,
  SavedRecipe,
  FullRecipe,
} from "@/types";

// User Queries
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql<User>`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

export async function getUserByGoogleId(googleId: string): Promise<User | null> {
  try {
    const result = await sql<User>`
      SELECT * FROM users WHERE google_id = ${googleId} LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching user by Google ID:", error);
    throw error;
  }
}

export async function createUser(
  email: string,
  name: string,
  googleId?: string,
  hashedPassword?: string
): Promise<User> {
  try {
    const result = await sql<User>`
      INSERT INTO users (email, name, google_id, hashed_password)
      VALUES (${email}, ${name}, ${googleId || null}, ${hashedPassword || null})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Pantry Queries
export async function getPantryItems(userId: string): Promise<PantryItem[]> {
  try {
    const result = await sql<PantryItem>`
      SELECT * FROM pantry_items
      WHERE user_id = ${userId}
      ORDER BY category, ingredient_name
    `;
    return result.rows;
  } catch (error) {
    console.error("Error fetching pantry items:", error);
    throw error;
  }
}

export async function addPantryItem(
  userId: string,
  ingredientName: string,
  category: string
): Promise<PantryItem> {
  try {
    const result = await sql<PantryItem>`
      INSERT INTO pantry_items (user_id, ingredient_name, category)
      VALUES (${userId}, ${ingredientName}, ${category})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error adding pantry item:", error);
    throw error;
  }
}

export async function removePantryItem(itemId: string, userId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM pantry_items
      WHERE id = ${itemId} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error("Error removing pantry item:", error);
    throw error;
  }
}

// Dietary Preferences Queries
export async function getDietaryPreferences(
  userId: string
): Promise<DietaryPreference | null> {
  try {
    const result = await sql<DietaryPreference>`
      SELECT * FROM dietary_preferences WHERE user_id = ${userId} LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching dietary preferences:", error);
    throw error;
  }
}

export async function upsertDietaryPreferences(
  userId: string,
  preferences: {
    isVegetarian: boolean;
    isVegan: boolean;
    isPescatarian: boolean;
    allergies: string[];
    customInstructions: string;
  }
): Promise<DietaryPreference> {
  try {
    const result = await sql<DietaryPreference>`
      INSERT INTO dietary_preferences (
        user_id, is_vegetarian, is_vegan, is_pescatarian,
        allergies, custom_instructions, updated_at
      )
      VALUES (
        ${userId}, ${preferences.isVegetarian}, ${preferences.isVegan},
        ${preferences.isPescatarian}, ${preferences.allergies},
        ${preferences.customInstructions}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        is_vegetarian = ${preferences.isVegetarian},
        is_vegan = ${preferences.isVegan},
        is_pescatarian = ${preferences.isPescatarian},
        allergies = ${preferences.allergies},
        custom_instructions = ${preferences.customInstructions},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error upserting dietary preferences:", error);
    throw error;
  }
}

// Saved Recipes Queries
export async function getSavedRecipes(userId: string): Promise<SavedRecipe[]> {
  try {
    const result = await sql<SavedRecipe>`
      SELECT * FROM saved_recipes
      WHERE user_id = ${userId}
      ORDER BY saved_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error("Error fetching saved recipes:", error);
    throw error;
  }
}

export async function getSavedRecipeById(
  recipeId: string,
  userId: string
): Promise<SavedRecipe | null> {
  try {
    const result = await sql<SavedRecipe>`
      SELECT * FROM saved_recipes
      WHERE id = ${recipeId} AND user_id = ${userId}
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching saved recipe:", error);
    throw error;
  }
}

export async function saveRecipe(
  userId: string,
  recipe: FullRecipe
): Promise<SavedRecipe> {
  try {
    const result = await sql<SavedRecipe>`
      INSERT INTO saved_recipes (
        user_id, recipe_name, description, ingredients, instructions,
        cook_time, difficulty, servings, nutrition_total, nutrition_per_serving,
        cuisine_type, recipe_style, tags
      )
      VALUES (
        ${userId}, ${recipe.name}, ${recipe.description},
        ${JSON.stringify(recipe.ingredients)}, ${JSON.stringify(recipe.instructions)},
        ${recipe.cookTime}, ${recipe.difficulty}, ${recipe.servings},
        ${JSON.stringify(recipe.nutritionTotal)}, ${JSON.stringify(recipe.nutritionPerServing)},
        ${recipe.cuisineType}, ${recipe.recipeStyle}, ${[]}
      )
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error saving recipe:", error);
    throw error;
  }
}

export async function deleteRecipe(recipeId: string, userId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM saved_recipes
      WHERE id = ${recipeId} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error("Error deleting recipe:", error);
    throw error;
  }
}

// Search and Filter Queries (Phase 2)
export async function searchRecipes(
  userId: string,
  searchTerm: string
): Promise<SavedRecipe[]> {
  try {
    const result = await sql<SavedRecipe>`
      SELECT * FROM saved_recipes
      WHERE user_id = ${userId}
      AND recipe_name ILIKE ${`%${searchTerm}%`}
      ORDER BY saved_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error("Error searching recipes:", error);
    throw error;
  }
}
