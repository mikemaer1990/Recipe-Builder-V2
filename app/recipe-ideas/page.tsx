"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface RecipeIdea {
  name: string;
  description: string;
  estimatedTime: string;
  difficulty: string;
}

export default function RecipeIdeasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ideas, setIdeas] = useState<RecipeIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<RecipeIdea | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Load ideas from sessionStorage
    if (typeof window !== "undefined") {
      const storedIdeas = sessionStorage.getItem("recipe_ideas");
      if (storedIdeas) {
        setIdeas(JSON.parse(storedIdeas));
      } else {
        // No ideas found, redirect back to builder
        router.push("/builder");
      }
    }
  }, [status, router]);

  const handleSelectIdea = (idea: RecipeIdea) => {
    setSelectedIdea(idea);
  };

  const handleGenerateFullRecipe = async () => {
    if (!selectedIdea) return;

    setLoading(true);

    try {
      // Get builder state from sessionStorage
      const builderState = sessionStorage.getItem("recipe_builder_state");
      if (!builderState) {
        throw new Error("Builder state not found");
      }

      const state = JSON.parse(builderState);

      const response = await fetch("/api/recipes/generate-full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeName: selectedIdea.name,
          ingredients: state.ingredients,
          cuisine: state.cuisine,
          style: state.style,
          mealType: state.mealType,
          servings: state.servings,
          estimatedTime: selectedIdea.estimatedTime,
          difficulty: selectedIdea.difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate full recipe");
      }

      const data = await response.json();

      // Save full recipe to sessionStorage
      sessionStorage.setItem("full_recipe", JSON.stringify(data.recipe));
      sessionStorage.setItem("selected_recipe_idea", JSON.stringify(selectedIdea));

      // Navigate to full recipe page
      router.push("/recipe");
    } catch (error) {
      console.error("Error generating full recipe:", error);
      alert("Failed to generate full recipe. Please try again.");
    } finally {
      setLoading(false);
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

  if (!session || ideas.length === 0) return null;

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
        <div className="mb-8">
          <button
            onClick={() => router.push("/builder")}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Back to Builder
          </button>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Your Recipe Ideas
          </h2>
          <p className="text-lg text-gray-600">
            AI generated 3 unique recipe ideas for you. Select one to see the full recipe!
          </p>
        </div>

        {/* Recipe Ideas Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {ideas.map((idea, index) => (
            <div
              key={index}
              onClick={() => handleSelectIdea(idea)}
              className={`cursor-pointer transition-all transform hover:scale-105 ${
                selectedIdea?.name === idea.name
                  ? "ring-4 ring-indigo-500 ring-offset-2"
                  : ""
              }`}
            >
              <Card className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {idea.name}
                    </h3>
                  </div>
                  {selectedIdea?.name === idea.name && (
                    <div className="bg-indigo-600 text-white rounded-full p-1">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {idea.description}
                </p>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">⏱️ {idea.estimatedTime}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                      idea.difficulty
                    )}`}
                  >
                    {idea.difficulty}
                  </span>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Generate Full Recipe Button */}
        <div className="text-center">
          <Button
            onClick={handleGenerateFullRecipe}
            disabled={!selectedIdea || loading}
            className="px-12 py-4 text-lg font-semibold shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Full Recipe...
              </span>
            ) : selectedIdea ? (
              `Generate Full Recipe for "${selectedIdea.name}"`
            ) : (
              "Select an idea above"
            )}
          </Button>
          {selectedIdea && (
            <p className="mt-3 text-sm text-gray-500">
              This will create a detailed recipe with ingredients, instructions, and nutrition info
            </p>
          )}
        </div>

        {/* Try Again */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Don't like these ideas?
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/builder")}
          >
            ← Try Different Ingredients
          </Button>
        </div>
      </div>
    </div>
  );
}
