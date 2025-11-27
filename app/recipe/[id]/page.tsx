"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { SavedRecipe } from "@/types";

export default function SavedRecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetchRecipe();
    }
  }, [status, params.id]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch recipe");
      }
      const data = await response.json();
      setRecipe(data.recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      setError("Failed to load recipe");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Card className="max-w-md text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipe Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "This recipe doesn't exist or you don't have access to it."}</p>
          <Button onClick={() => router.push("/recipes")}>Back to Recipe Book</Button>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-lg bg-white/90">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="outline" onClick={() => router.push("/recipes")}>
              ← Back to Recipe Book
            </Button>
            <Button variant="outline" onClick={() => router.push("/api/auth/signout")}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Header */}
        <Card className="mb-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{recipe.recipeName}</h1>
            <p className="text-lg text-gray-600 mb-4">{recipe.description}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200">
                ⏱️ {recipe.cookTime}
              </span>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                🍽️ {recipe.servings} servings
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200">
                {recipe.cuisineType}
              </span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Ingredients & Nutrition */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ingredients */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🛒 Ingredients
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span className="text-gray-700">
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Nutrition */}
            {recipe.nutritionPerServing && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📊 Nutrition (per serving)
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{recipe.nutritionPerServing.calories}</div>
                    <div className="text-sm text-gray-600">Calories</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{recipe.nutritionPerServing.protein}g</div>
                    <div className="text-sm text-gray-600">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{recipe.nutritionPerServing.carbs}g</div>
                    <div className="text-sm text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{recipe.nutritionPerServing.fat}g</div>
                    <div className="text-sm text-gray-600">Fat</div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Instructions */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                👨‍🍳 Instructions
              </h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction: string, index: number) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 pt-1">{instruction}</p>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
