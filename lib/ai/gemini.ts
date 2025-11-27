import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export interface RecipeIdea {
  name: string;
  description: string;
  estimatedTime: string;
  difficulty: string;
}

export interface GenerateIdeasParams {
  ingredients: string[];
  cuisine: string;
  style?: string;
  mealType: string;
  servings: number;
  dietaryPreferences?: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isPescatarian?: boolean;
    allergies?: string[];
    customInstructions?: string;
  };
}

export async function generateRecipeIdeas(
  params: GenerateIdeasParams
): Promise<RecipeIdea[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const {
    ingredients,
    cuisine,
    style,
    mealType,
    servings,
    dietaryPreferences,
  } = params;

  // Build dietary restrictions string
  let dietaryRestrictions = "";
  if (dietaryPreferences) {
    const restrictions = [];
    if (dietaryPreferences.isVegetarian) restrictions.push("vegetarian");
    if (dietaryPreferences.isVegan) restrictions.push("vegan");
    if (dietaryPreferences.isPescatarian) restrictions.push("pescatarian");
    if (dietaryPreferences.allergies && dietaryPreferences.allergies.length > 0) {
      restrictions.push(
        `no ${dietaryPreferences.allergies.join(", ")}`
      );
    }
    if (dietaryPreferences.customInstructions) {
      restrictions.push(dietaryPreferences.customInstructions);
    }
    if (restrictions.length > 0) {
      dietaryRestrictions = `\nDietary restrictions: ${restrictions.join(", ")}`;
    }
  }

  const prompt = `You are a professional chef and recipe creator. Generate exactly 3 unique and creative ${cuisine} ${mealType.toLowerCase()} recipe ideas using the following ingredients: ${ingredients.join(
    ", "
  )}.
${style ? `Recipe style: ${style}` : ""}
Servings: ${servings}${dietaryRestrictions}

For each recipe idea, provide:
1. A creative and appetizing recipe name
2. A brief 2-3 sentence description highlighting what makes it special
3. Estimated cooking time (e.g., "30 minutes", "1 hour")
4. Difficulty level (Easy, Medium, or Hard)

Format your response as a JSON array with exactly 3 objects, each having these fields:
- name: string
- description: string
- estimatedTime: string
- difficulty: string

IMPORTANT: Return ONLY the JSON array, no other text or explanation.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    // Extract JSON from response (sometimes Gemini wraps it in markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }

    const ideas: RecipeIdea[] = JSON.parse(jsonMatch[0]);

    // Validate we got exactly 3 ideas
    if (ideas.length !== 3) {
      throw new Error("Did not receive exactly 3 recipe ideas");
    }

    return ideas;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    console.error("Raw response:", text);
    throw new Error("Failed to parse recipe ideas from AI response");
  }
}

export interface FullRecipeParams {
  recipeName: string;
  ingredients: string[];
  cuisine: string;
  style?: string;
  mealType: string;
  servings: number;
  estimatedTime: string;
  difficulty: string;
  dietaryPreferences?: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isPescatarian?: boolean;
    allergies?: string[];
    customInstructions?: string;
  };
}

export interface FullRecipeIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface FullRecipeResponse {
  name: string;
  description: string;
  ingredients: FullRecipeIngredient[];
  instructions: string[];
  cookTime: string;
  difficulty: string;
  servings: number;
  cuisineType: string;
  recipeStyle: string;
}

export async function generateFullRecipe(
  params: FullRecipeParams
): Promise<FullRecipeResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const {
    recipeName,
    ingredients,
    cuisine,
    style,
    mealType,
    servings,
    estimatedTime,
    difficulty,
    dietaryPreferences,
  } = params;

  // Build dietary restrictions string
  let dietaryRestrictions = "";
  if (dietaryPreferences) {
    const restrictions = [];
    if (dietaryPreferences.isVegetarian) restrictions.push("vegetarian");
    if (dietaryPreferences.isVegan) restrictions.push("vegan");
    if (dietaryPreferences.isPescatarian) restrictions.push("pescatarian");
    if (dietaryPreferences.allergies && dietaryPreferences.allergies.length > 0) {
      restrictions.push(
        `no ${dietaryPreferences.allergies.join(", ")}`
      );
    }
    if (dietaryPreferences.customInstructions) {
      restrictions.push(dietaryPreferences.customInstructions);
    }
    if (restrictions.length > 0) {
      dietaryRestrictions = `\nDietary restrictions: ${restrictions.join(", ")}`;
    }
  }

  const prompt = `You are a professional chef. Create a complete, detailed recipe for "${recipeName}".

Recipe requirements:
- Cuisine: ${cuisine}
${style ? `- Style: ${style}` : ""}
- Meal type: ${mealType}
- Servings: ${servings}
- Estimated time: ${estimatedTime}
- Difficulty: ${difficulty}
- Must use these ingredients: ${ingredients.join(", ")}${dietaryRestrictions}

Provide a detailed recipe with:
1. A compelling 2-3 sentence description
2. Complete ingredients list with specific amounts and units
3. Step-by-step cooking instructions (be detailed and clear)

Format your response as JSON with these fields:
{
  "name": string (the recipe name),
  "description": string,
  "ingredients": array of objects with { "name": string, "amount": string, "unit": string },
  "instructions": array of strings (each step as a separate string),
  "cookTime": string,
  "difficulty": string,
  "servings": number,
  "cuisineType": string,
  "recipeStyle": string
}

IMPORTANT:
- Be precise with ingredient amounts (e.g., "2", "1/2", "1.5")
- Use standard units (cup, tablespoon, teaspoon, ounce, pound, gram, whole, clove, etc.)
- Return ONLY the JSON object, no other text or explanation.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }

    const recipe: FullRecipeResponse = JSON.parse(jsonMatch[0]);
    return recipe;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    console.error("Raw response:", text);
    throw new Error("Failed to parse full recipe from AI response");
  }
}
