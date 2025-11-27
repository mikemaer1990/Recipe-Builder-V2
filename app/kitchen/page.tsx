"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

interface PantryItem {
  id: string;
  ingredientName: string;
  category: string;
}

interface DietaryPreferences {
  isVegetarian: boolean;
  isVegan: boolean;
  isPescatarian: boolean;
  allergies: string[];
  customInstructions: string;
}

const CATEGORIES = [
  "Protein",
  "Vegetables",
  "Fruits",
  "Grains",
  "Dairy",
  "Spices & Herbs",
  "Oils & Condiments",
  "Baking",
  "Other",
];

export default function KitchenPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [preferences, setPreferences] = useState<DietaryPreferences>({
    isVegetarian: false,
    isVegan: false,
    isPescatarian: false,
    allergies: [],
    customInstructions: "",
  });
  const [newIngredient, setNewIngredient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Vegetables");
  const [newAllergy, setNewAllergy] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const addPantryItem = () => {
    if (!newIngredient.trim()) return;

    const item: PantryItem = {
      id: Date.now().toString(),
      ingredientName: newIngredient.trim(),
      category: selectedCategory,
    };

    setPantryItems([...pantryItems, item]);
    setNewIngredient("");
  };

  const removePantryItem = (id: string) => {
    setPantryItems(pantryItems.filter((item) => item.id !== id));
  };

  const addAllergy = () => {
    if (!newAllergy.trim() || preferences.allergies.includes(newAllergy.trim()))
      return;

    setPreferences({
      ...preferences,
      allergies: [...preferences.allergies, newAllergy.trim()],
    });
    setNewAllergy("");
  };

  const removeAllergy = (allergy: string) => {
    setPreferences({
      ...preferences,
      allergies: preferences.allergies.filter((a) => a !== allergy),
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveMessage("");

    // TODO: Make API calls to save pantry items and preferences
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSaveMessage("✅ Saved successfully!");
    setLoading(false);
    setTimeout(() => setSaveMessage(""), 3000);
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

  const itemsByCategory = pantryItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PantryItem[]>);

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
                  className="text-indigo-600 font-medium border-b-2 border-indigo-600 pb-1"
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Kitchen</h2>
          <p className="text-gray-600">
            Manage your pantry items and dietary preferences to get personalized
            recipe recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pantry Section */}
          <div>
            <Card>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  🥗 Pantry Items
                </h3>
                <p className="text-sm text-gray-600">
                  Add ingredients you have on hand
                </p>
              </div>

              {/* Add Ingredient */}
              <div className="mb-6 space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g., Chicken breast, Tomatoes..."
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addPantryItem()}
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={addPantryItem} fullWidth>
                  Add Ingredient
                </Button>
              </div>

              {/* Pantry Items List */}
              <div className="space-y-4">
                {Object.keys(itemsByCategory).length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">
                      No pantry items yet. Add some ingredients to get started!
                    </p>
                  </div>
                ) : (
                  Object.entries(itemsByCategory).map(([category, items]) => (
                    <div key={category}>
                      <h4 className="font-medium text-gray-700 mb-2 text-sm uppercase tracking-wide">
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200 hover:bg-indigo-100 transition-colors"
                          >
                            {item.ingredientName}
                            <button
                              onClick={() => removePantryItem(item.id)}
                              className="ml-1 hover:text-indigo-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Dietary Preferences Section */}
          <div>
            <Card>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  🍽️ Dietary Preferences
                </h3>
                <p className="text-sm text-gray-600">
                  Tell us about your dietary needs
                </p>
              </div>

              {/* Dietary Restrictions */}
              <div className="space-y-4 mb-6">
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.isVegetarian}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        isVegetarian: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Vegetarian
                    </span>
                    <p className="text-xs text-gray-500">
                      No meat, poultry, or seafood
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.isVegan}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        isVegan: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Vegan</span>
                    <p className="text-xs text-gray-500">
                      No animal products
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.isPescatarian}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        isPescatarian: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Pescatarian
                    </span>
                    <p className="text-xs text-gray-500">
                      Seafood but no meat
                    </p>
                  </div>
                </label>
              </div>

              {/* Allergies */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies & Food Restrictions
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    type="text"
                    placeholder="e.g., Peanuts, Shellfish..."
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addAllergy()}
                  />
                  <Button onClick={addAllergy} variant="outline">
                    Add
                  </Button>
                </div>
                {preferences.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferences.allergies.map((allergy) => (
                      <span
                        key={allergy}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200"
                      >
                        {allergy}
                        <button
                          onClick={() => removeAllergy(allergy)}
                          className="ml-1 hover:text-red-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Instructions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  value={preferences.customInstructions}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      customInstructions: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Any other preferences or restrictions we should know about?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
          >
            {loading ? "Saving..." : "Save Kitchen Settings"}
          </Button>
          {saveMessage && (
            <span className="text-green-600 font-medium">{saveMessage}</span>
          )}
        </div>

        {/* Next Step CTA */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 p-[2px] rounded-xl">
            <div className="bg-white rounded-xl px-8 py-6">
              <p className="text-gray-900 font-medium mb-3">
                Ready to build your perfect recipe?
              </p>
              <Button
                onClick={() => router.push("/builder")}
                variant="primary"
                className="shadow-lg"
              >
                Go to Recipe Builder →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
