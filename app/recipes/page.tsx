"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

interface SavedRecipe {
  id: string;
  recipeName: string;
  description: string;
  cookTime: string;
  difficulty: string;
  servings: number;
  cuisineType: string;
  recipeStyle: string;
  savedAt: string;
}

export default function RecipeBookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; recipeId: string; recipeName: string }>({
    show: false,
    recipeId: "",
    recipeName: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchRecipes();
    }
  }, [status, router]);

  useEffect(() => {
    filterAndSortRecipes();
  }, [recipes, searchTerm, cuisineFilter, sortBy]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/recipes");
      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }
      const data = await response.json();
      setRecipes(data.recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRecipes = () => {
    let filtered = [...recipes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((recipe) =>
        recipe.recipeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Cuisine filter
    if (cuisineFilter !== "all") {
      filtered = filtered.filter(
        (recipe) => recipe.cuisineType.toLowerCase() === cuisineFilter.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      } else if (sortBy === "name") {
        return a.recipeName.localeCompare(b.recipeName);
      } else if (sortBy === "cookTime") {
        return parseInt(a.cookTime) - parseInt(b.cookTime);
      }
      return 0;
    });

    setFilteredRecipes(filtered);
  };

  const handleDeleteClick = (recipeId: string, recipeName: string) => {
    setDeleteConfirm({ show: true, recipeId, recipeName });
  };

  const handleDeleteConfirm = async () => {
    const { recipeId } = deleteConfirm;
    setDeleteConfirm({ show: false, recipeId: "", recipeName: "" });

    try {
      const response = await fetch(`/api/recipes?id=${recipeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete recipe");
      }

      // Remove from local state
      setRecipes(recipes.filter((r) => r.id !== recipeId));
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe. Please try again.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, recipeId: "", recipeName: "" });
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

  // Get unique cuisines for filter
  const uniqueCuisines = Array.from(
    new Set(recipes.map((r) => r.cuisineType))
  ).sort();

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your recipes...</p>
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
                  className="text-indigo-600 font-medium"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            My Recipe Book
          </h2>
          <p className="text-gray-600">
            {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} saved
          </p>
        </div>

        {/* Search and Filters */}
        {recipes.length > 0 && (
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Recipes
                </label>
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Cuisine Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type
                </label>
                <select
                  value={cuisineFilter}
                  onChange={(e) => setCuisineFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Cuisines</option>
                  {uniqueCuisines.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="date">Date Saved (Newest)</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="cookTime">Cook Time</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <Card className="text-center py-12">
            {recipes.length === 0 ? (
              <>
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No recipes yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start building your recipe collection!
                </p>
                <Button onClick={() => router.push("/builder")}>
                  Create Your First Recipe
                </Button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No recipes found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters
                </p>
              </>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div onClick={() => router.push(`/recipe/${recipe.id}`)}>
                  {/* Recipe Image Placeholder */}
                  <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-6xl">🍽️</span>
                  </div>

                  {/* Recipe Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {recipe.recipeName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">
                      ⏱️ {recipe.cookTime}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                        recipe.difficulty
                      )}`}
                    >
                      {recipe.difficulty}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                      {recipe.cuisineType}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    onClick={() => router.push(`/recipe/${recipe.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    className="text-sm text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(recipe.id, recipe.recipeName);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Recipe?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "<strong>{deleteConfirm.recipeName}</strong>"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
