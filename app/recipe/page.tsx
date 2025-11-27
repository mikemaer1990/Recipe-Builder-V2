"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { formatIngredientDisplay } from "@/lib/nutrition/display-formatter";

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface IngredientNutritionDetail {
  ingredient: string;
  amount: string;
  grams: number | null;
  nutrition: NutritionInfo | null;
  source: 'mapping' | 'usda' | 'default' | 'failed';
}

interface FullRecipe {
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookTime: string;
  difficulty: string;
  servings: number;
  cuisineType: string;
  recipeStyle: string;
  nutritionTotal?: NutritionInfo;
  nutritionPerServing?: NutritionInfo;
}

export default function RecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recipe, setRecipe] = useState<FullRecipe | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [calculatingNutrition, setCalculatingNutrition] = useState(false);
  const [nutritionWarnings, setNutritionWarnings] = useState<string[]>([]);
  const [nutritionDetails, setNutritionDetails] = useState<IngredientNutritionDetail[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Load recipe from sessionStorage
    if (typeof window !== "undefined") {
      const storedRecipe = sessionStorage.getItem("full_recipe");
      if (storedRecipe) {
        const loadedRecipe = JSON.parse(storedRecipe);
        setRecipe(loadedRecipe);

        // Calculate nutrition if not already present
        if (!loadedRecipe.nutritionTotal) {
          calculateNutrition(loadedRecipe);
        }
      } else {
        // No recipe found, redirect to builder
        router.push("/builder");
      }
    }
  }, [status, router]);

  const calculateNutrition = async (recipeData: FullRecipe) => {
    setCalculatingNutrition(true);
    try {
      // Transform ingredients to the format expected by the API
      const ingredientsForAPI = recipeData.ingredients.map((ing) => ({
        name: ing.name,
        amount: `${ing.amount} ${ing.unit}`.trim(),
      }));

      const response = await fetch("/api/nutrition/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients: ingredientsForAPI,
          servings: recipeData.servings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate nutrition");
      }

      const data = await response.json();

      // Update recipe with nutrition data
      const updatedRecipe = {
        ...recipeData,
        nutritionTotal: data.nutritionTotal,
        nutritionPerServing: data.nutritionPerServing,
      };

      setRecipe(updatedRecipe);
      setNutritionWarnings(data.warnings || []);
      setNutritionDetails(data.details || []);

      // Update sessionStorage with nutrition data
      sessionStorage.setItem("full_recipe", JSON.stringify(updatedRecipe));
    } catch (error) {
      console.error("Error calculating nutrition:", error);
      setNutritionWarnings(["Failed to calculate nutrition. Please try again later."]);
    } finally {
      setCalculatingNutrition(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;

    // Check if nutrition is still calculating
    if (calculatingNutrition) {
      const confirmSave = window.confirm(
        'Nutrition information is still calculating. Do you want to wait for it to finish before saving?'
      );
      if (confirmSave) {
        return; // User chose to wait
      }
      // User chose to save anyway
    }

    setSaving(true);
    setSaveSuccess(false); // Reset success state
    try {
      const response = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save recipe');
      }

      const data = await response.json();

      // Success feedback - stay on page
      setSaveSuccess(true);

    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (status === "loading" || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Recipe Builder
              </h1>
              <nav className="hidden md:flex gap-6">
                <a
                  href="/kitchen"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  My Kitchen
                </a>
                <a
                  href="/builder"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Recipe Builder
                </a>
                <a
                  href="/recipes"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Recipe Book
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {session?.user?.name}
              </span>
              <Button
                variant="outline"
                onClick={() => router.push("/api/auth/signout")}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/recipe-ideas")}
          className="text-indigo-600 hover:text-indigo-700 font-medium mb-6 flex items-center gap-2"
        >
          ← Back to Recipe Ideas
        </button>

        {/* Recipe Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {recipe.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">{recipe.description}</p>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium border border-indigo-200">
              🍽️ {recipe.servings} servings
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium border border-purple-200">
              ⏱️ {recipe.cookTime}
            </span>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium border ${getDifficultyColor(
                recipe.difficulty
              )}`}
            >
              📊 {recipe.difficulty}
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium border border-gray-200">
              🌍 {recipe.cuisineType}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📝 Ingredients
              </h2>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => {
                  // Find matching nutrition detail for gram conversion
                  const detail = nutritionDetails.find(d =>
                    d.ingredient.toLowerCase() === ingredient.name.toLowerCase()
                  );

                  const displayText = formatIngredientDisplay(
                    ingredient.name,
                    ingredient.amount,
                    ingredient.unit,
                    detail?.grams || null
                  );

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="flex-1 text-gray-700">
                        {displayText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Nutrition Panel */}
            <Card className="mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📊 Nutrition Facts
              </h2>

              {calculatingNutrition ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                  <p className="text-gray-600">Calculating nutrition...</p>
                </div>
              ) : recipe.nutritionTotal && recipe.nutritionPerServing ? (
                <>
                  {/* Per Serving */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Per Serving
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                        <p className="text-2xl font-bold text-indigo-900">
                          {recipe.nutritionPerServing.calories}
                        </p>
                        <p className="text-xs text-indigo-600 font-medium">
                          Calories
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <p className="text-2xl font-bold text-purple-900">
                          {recipe.nutritionPerServing.protein}g
                        </p>
                        <p className="text-xs text-purple-600 font-medium">
                          Protein
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-2xl font-bold text-blue-900">
                          {recipe.nutritionPerServing.carbs}g
                        </p>
                        <p className="text-xs text-blue-600 font-medium">
                          Carbs
                        </p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <p className="text-2xl font-bold text-amber-900">
                          {recipe.nutritionPerServing.fat}g
                        </p>
                        <p className="text-xs text-amber-600 font-medium">
                          Fat
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total Recipe */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Total Recipe
                    </h3>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {recipe.nutritionTotal.calories}
                        </p>
                        <p className="text-xs text-gray-500">Cal</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {recipe.nutritionTotal.protein}g
                        </p>
                        <p className="text-xs text-gray-500">Protein</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {recipe.nutritionTotal.carbs}g
                        </p>
                        <p className="text-xs text-gray-500">Carbs</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {recipe.nutritionTotal.fat}g
                        </p>
                        <p className="text-xs text-gray-500">Fat</p>
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {nutritionWarnings.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">
                        ℹ️ Nutrition Notes:
                      </p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        {nutritionWarnings.map((warning, idx) => (
                          <li key={idx}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-600 mb-2">
                    Unable to calculate nutrition
                  </p>
                  <button
                    onClick={() => calculateNutrition(recipe)}
                    className="text-sm text-red-700 underline hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              )}
            </Card>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                👨‍🍳 Instructions
              </h2>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">
                        {instruction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                onClick={handleSaveRecipe}
                disabled={saving}
                className="flex-1 sm:flex-none px-8 py-3 shadow-lg shadow-indigo-500/30"
              >
                {saving ? "Saving..." : "💾 Save to Recipe Book"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/builder")}
                className="flex-1 sm:flex-none"
              >
                🔄 Create Another Recipe
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 sm:flex-none"
              >
                🖨️ Print Recipe
              </Button>
            </div>

            {/* Success Feedback */}
            {saveSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✓ Recipe saved to your Recipe Book!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <Card className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            💡 Cooking Tips
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Read through all instructions before starting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Prepare and measure all ingredients beforehand (mise en place)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>
                Adjust seasoning to taste - every palate is different!
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
