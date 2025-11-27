"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const CUISINES = [
  "Italian",
  "Mexican",
  "Chinese",
  "Japanese",
  "Indian",
  "Thai",
  "Mediterranean",
  "French",
  "American",
  "Korean",
  "Vietnamese",
  "Greek",
];

const RECIPE_STYLES = [
  "Quick & Easy",
  "Gourmet",
  "Comfort Food",
  "Healthy",
  "One-Pot",
  "Slow Cooker",
  "Grilled",
  "Baked",
];

const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Dessert",
  "Appetizer",
];

export default function BuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("");
  const [servings, setServings] = useState(4);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const addCustomIngredient = () => {
    if (!customIngredient.trim()) return;
    if (selectedIngredients.includes(customIngredient.trim())) return;

    setSelectedIngredients([...selectedIngredients, customIngredient.trim()]);
    setCustomIngredient("");
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i !== ingredient));
  };

  const handleGenerateIdeas = async () => {
    if (selectedIngredients.length === 0) {
      alert("Please add at least one ingredient!");
      return;
    }
    if (!selectedCuisine) {
      alert("Please select a cuisine type!");
      return;
    }
    if (!selectedMealType) {
      alert("Please select a meal type!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/recipes/generate-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          cuisine: selectedCuisine,
          style: selectedStyle,
          mealType: selectedMealType,
          servings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recipe ideas");
      }

      const data = await response.json();

      // Save to sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("recipe_builder_state", JSON.stringify({
          ingredients: selectedIngredients,
          cuisine: selectedCuisine,
          style: selectedStyle,
          mealType: selectedMealType,
          servings,
        }));
        sessionStorage.setItem("recipe_ideas", JSON.stringify(data.ideas));
      }

      // Navigate to recipe ideas page
      router.push("/recipe-ideas");
    } catch (error) {
      console.error("Error generating ideas:", error);
      alert("Failed to generate recipe ideas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

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
                  className="text-indigo-600 font-medium border-b-2 border-indigo-600 pb-1"
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
                {session.user?.name}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Build Your Perfect Recipe
          </h2>
          <p className="text-lg text-gray-600">
            Select ingredients, choose your style, and let AI create amazing recipes for you
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Step 1: Ingredients */}
          <Card>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Ingredients
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                What ingredients do you want to use?
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customIngredient}
                  onChange={(e) => setCustomIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomIngredient()}
                  placeholder="Add ingredient..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Button onClick={addCustomIngredient}>Add</Button>
              </div>

              <Button
                variant="outline"
                fullWidth
                onClick={() => router.push("/kitchen")}
                className="text-sm"
              >
                📦 Use My Pantry Items
              </Button>
            </div>

            {selectedIngredients.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Selected ({selectedIngredients.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200"
                    >
                      {ingredient}
                      <button
                        onClick={() => removeIngredient(ingredient)}
                        className="ml-1 hover:text-indigo-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Step 2: Cuisine & Style */}
          <Card>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Cuisine & Style
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Choose your preferred cuisine type
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type *
                </label>
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select cuisine...</option>
                  {CUISINES.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Style
                </label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Any style...</option>
                  {RECIPE_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Step 3: Preferences */}
          <Card>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Preferences
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Customize your recipe details
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type *
                </label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select meal type...</option>
                  {MEAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Servings
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="pt-2">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <p className="text-xs text-indigo-700 font-medium">
                    💡 Tip: Your dietary preferences from My Kitchen will be automatically applied!
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <Button
            onClick={handleGenerateIdeas}
            disabled={loading || selectedIngredients.length === 0 || !selectedCuisine || !selectedMealType}
            className="px-12 py-4 text-lg font-semibold shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Ideas...
              </span>
            ) : (
              "✨ Generate Recipe Ideas"
            )}
          </Button>
          <p className="mt-3 text-sm text-gray-500">
            AI will create 3 unique recipe ideas based on your selections
          </p>
        </div>

        {/* Info Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🤖</div>
            <h4 className="font-semibold text-gray-900 mb-2">AI-Powered</h4>
            <p className="text-sm text-gray-600">
              Recipes generated by Google's Gemini AI
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="font-semibold text-gray-900 mb-2">Nutrition Tracked</h4>
            <p className="text-sm text-gray-600">
              Automatic nutrition calculation using USDA data
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">💾</div>
            <h4 className="font-semibold text-gray-900 mb-2">Save & Organize</h4>
            <p className="text-sm text-gray-600">
              Build your personal recipe collection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
