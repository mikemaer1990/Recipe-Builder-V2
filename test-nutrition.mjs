/**
 * Test script for nutrition calculation
 * Run with: node test-nutrition.mjs
 */

// Sample test recipe
const testRecipe = {
  ingredients: [
    { name: "chicken breast", amount: "1 lb" },
    { name: "olive oil", amount: "2 tablespoons" },
    { name: "broccoli", amount: "2 cups" },
    { name: "rice", amount: "1 cup" },
    { name: "garlic", amount: "2 cloves" },
    { name: "soy sauce", amount: "1 tablespoon" },
  ],
  servings: 2,
};

console.log("🧪 Testing Nutrition Calculation API\n");
console.log("Test Recipe:");
console.log("- Servings:", testRecipe.servings);
console.log("- Ingredients:");
testRecipe.ingredients.forEach((ing) => {
  console.log(`  • ${ing.amount} ${ing.name}`);
});
console.log("\nCalling API...\n");

try {
  const response = await fetch("http://localhost:3000/api/nutrition/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testRecipe),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("❌ API Error:", errorData);
    process.exit(1);
  }

  const result = await response.json();

  console.log("✅ Nutrition Calculation Successful!\n");

  console.log("📊 TOTAL RECIPE:");
  console.log(`   Calories: ${result.nutritionTotal.calories} kcal`);
  console.log(`   Protein:  ${result.nutritionTotal.protein}g`);
  console.log(`   Carbs:    ${result.nutritionTotal.carbs}g`);
  console.log(`   Fat:      ${result.nutritionTotal.fat}g`);

  console.log("\n🍽️  PER SERVING:");
  console.log(`   Calories: ${result.nutritionPerServing.calories} kcal`);
  console.log(`   Protein:  ${result.nutritionPerServing.protein}g`);
  console.log(`   Carbs:    ${result.nutritionPerServing.carbs}g`);
  console.log(`   Fat:      ${result.nutritionPerServing.fat}g`);

  if (result.warnings && result.warnings.length > 0) {
    console.log("\n⚠️  WARNINGS:");
    result.warnings.forEach((warning) => {
      console.log(`   • ${warning}`);
    });
  }

  console.log("\n📋 INGREDIENT DETAILS:");
  result.details.forEach((detail) => {
    const source = detail.source === 'mapping' ? '📁 Mapping' :
                   detail.source === 'usda' ? '🌐 USDA API' :
                   detail.source === 'default' ? '⚙️  Default' : '❌ Failed';
    console.log(`   ${detail.ingredient} (${detail.amount})`);
    console.log(`     Source: ${source}`);
    if (detail.grams) {
      console.log(`     Grams: ${detail.grams.toFixed(1)}g`);
    }
    if (detail.nutrition) {
      console.log(`     Cal: ${detail.nutrition.calories}, P: ${detail.nutrition.protein}g, C: ${detail.nutrition.carbs}g, F: ${detail.nutrition.fat}g`);
    }
  });

  console.log("\n✅ Test completed successfully!");
} catch (error) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}
