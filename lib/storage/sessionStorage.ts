// SessionStorage utilities for managing recipe builder state

export interface RecipeBuilderState {
  ingredients: string[];
  cuisine: string;
  style: string;
  mealType: string;
  servings: number;
}

export interface RecipeIdea {
  name: string;
  description: string;
  estimatedTime: string;
  difficulty: string;
}

const BUILDER_STATE_KEY = "recipe_builder_state";
const RECIPE_IDEAS_KEY = "recipe_ideas";
const SELECTED_IDEA_KEY = "selected_recipe_idea";

// Recipe Builder State
export function saveBuilderState(state: RecipeBuilderState): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(BUILDER_STATE_KEY, JSON.stringify(state));
}

export function getBuilderState(): RecipeBuilderState | null {
  if (typeof window === "undefined") return null;
  const data = sessionStorage.getItem(BUILDER_STATE_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearBuilderState(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BUILDER_STATE_KEY);
}

// Recipe Ideas
export function saveRecipeIdeas(ideas: RecipeIdea[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RECIPE_IDEAS_KEY, JSON.stringify(ideas));
}

export function getRecipeIdeas(): RecipeIdea[] | null {
  if (typeof window === "undefined") return null;
  const data = sessionStorage.getItem(RECIPE_IDEAS_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearRecipeIdeas(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RECIPE_IDEAS_KEY);
}

// Selected Recipe Idea
export function saveSelectedIdea(idea: RecipeIdea): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SELECTED_IDEA_KEY, JSON.stringify(idea));
}

export function getSelectedIdea(): RecipeIdea | null {
  if (typeof window === "undefined") return null;
  const data = sessionStorage.getItem(SELECTED_IDEA_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearSelectedIdea(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SELECTED_IDEA_KEY);
}

// Clear all recipe-related session storage
export function clearAllRecipeData(): void {
  if (typeof window === "undefined") return;
  clearBuilderState();
  clearRecipeIdeas();
  clearSelectedIdea();
}
