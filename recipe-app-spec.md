# AI Recipe Builder - Complete Specification

## Project Overview
A Next.js web application that uses AI to generate custom recipes based on user ingredients, preferences, and dietary needs. Users can manage their pantry staples, generate personalized recipes with detailed nutritional information, and save favorites to a recipe book.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Authentication**: NextAuth.js with Google OAuth AND Email/Password (separate accounts)
- **Database**: Vercel Postgres (or Supabase as alternative)
- **AI API**: Google Gemini API (Free Tier - 1.5 Flash)
- **Nutrition API**: USDA FoodData Central API (free, for accurate nutritional calculations)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Language**: TypeScript

## Core Features

### 1. Authentication & User Management
- **Two separate authentication methods** (no account linking):
  - Google OAuth sign-in/sign-up
  - Email/Password sign-in/sign-up
- User profile with name and email
- Session management with NextAuth.js

### 2. My Kitchen Page
**Purpose**: Manage pantry staples and set dietary preferences

**Features**:
- **Pantry Management**:
  - Searchable ingredient list (users can type to search)
  - Categorized common items with checkboxes:
    - Grains (rice, pasta, quinoa, oats, etc.)
    - Proteins (chicken, beef, tofu, eggs, etc.)
    - Vegetables (onions, garlic, tomatoes, etc.)
    - Spices & Seasonings (salt, pepper, cumin, etc.)
    - Oils & Condiments (olive oil, soy sauce, etc.)
    - Dairy & Alternatives (milk, cheese, etc.)
  - Custom ingredient input field for items not in the list
  - Visual display of selected staples with remove option

- **Dietary Preferences**:
  - Checkboxes for:
    - Vegetarian
    - Vegan
    - Pescatarian
  - Allergy selection (multi-select):
    - Nuts
    - Dairy
    - Gluten
    - Shellfish
    - Soy
    - Eggs

- **Custom Instructions**:
  - Text area for persistent preferences (e.g., "I hate cilantro", "always include garlic", "prefer low-sodium")
  - These apply to ALL future recipes

### 3. Recipe Builder Page
**Purpose**: Generate custom recipes based on selections

**Interface Elements**:

**Servings**:
- Number input (range: 1-6)
- Default: 2

**Protein Selection** (icons + custom field):
- Icons for common proteins:
  - Chicken
  - Beef
  - Pork
  - Fish
  - Tofu
  - Eggs
  - Beans/Legumes
  - None (vegetarian)
- Custom text field: "Or enter your own"

**Carb Selection** (icons + custom field):
- Icons for common carbs:
  - Rice
  - Pasta
  - Potatoes
  - Quinoa
  - Bread
  - None (low-carb)
- Custom text field: "Or enter your own"

**Vegetables** (icons + custom field):
- Icons for common vegetables:
  - Broccoli
  - Carrots
  - Bell Peppers
  - Spinach
  - Mushrooms
  - Tomatoes
  - Mixed Vegetables
- Custom text field: "Or enter your own"

**Cuisine Type** (icons + custom field):
- Icons for cuisines:
  - Italian
  - Mexican
  - Asian
  - Mediterranean
  - American
  - Indian
  - Thai
- Custom text field: "Or enter your own"

**Recipe Style**:
- Radio buttons:
  - Healthy (balanced, nutritious)
  - Low-cal (calorie-conscious)
  - Indulgent (comfort food, rich)

**Add a Sauce**:
- Checkbox: "Include a complementary sauce"
- If checked, dropdown appears with:
  - Healthy (light, oil-based, herb-based)
  - Creamy (alfredo, béchamel style)
  - Tangy (vinaigrette, citrus-based)
  - Spicy (hot sauce, chili-based)
  - Savory (gravy, reduction)
  - Sweet (teriyaki, glaze)

**Custom Instructions for This Recipe**:
- Text area for one-off requests (e.g., "make it extra spicy", "use whatever vegetables I have")

**Action Buttons**:
- "Generate Recipes" - Primary CTA button

### 4. Recipe Ideas Display
**After user submits**, show 3 AI-generated recipe ideas:

**Each recipe card shows**:
- Recipe name
- Brief description (1-2 sentences)
- Estimated cook time
- Key ingredients list (5-6 main items)
- Difficulty level (Easy/Medium/Hard)
- Preview image placeholder or AI-generated food emoji

**Actions**:
- "View Full Recipe" button on each card
- "Generate 3 More" button at the bottom

**Important**: Recipe ideas are NOT saved to the database. Only the full final recipe can be saved.

### 5. Full Recipe Page
**Modern, clean layout showing**:

**Header Section**:
- Recipe name (large, bold)
- Hero image placeholder or food icon
- Cook time, difficulty, servings

**Nutritional Information Panel** (prominent box):
- **Total per recipe**:
  - Calories
  - Protein (g)
  - Carbs (g)
  - Fat (g)
- **Per serving**:
  - Calories
  - Protein (g)
  - Carbs (g)
  - Fat (g)

**Ingredients Section**:
- Clean, scannable list
- Quantities clearly marked
- Organized by type if applicable

**Instructions Section**:
- Numbered steps
- Clear, concise directions
- Estimated time per step if relevant

**Actions**:
- "Save to Recipe Book" button (saves the full recipe to database)
- "Back to Results" link (returns to the 3 recipe ideas)
- "Generate Similar" option

### 6. Recipe Book Page
**Purpose**: View and manage saved recipes

**Features**:
- Grid/list view of saved recipes
- Each shows: thumbnail, name, cook time, saved date
- **Search & Filter**:
  - Search bar (by recipe name)
  - Filter by ingredient (search within recipe ingredients)
  - Filter by cuisine type
  - Filter by recipe style (healthy/low-cal/indulgent)
  - Filter by cook time
- **Sort options**:
  - Date saved (newest/oldest)
  - Alphabetical
  - Cook time
- Tag system (users can add custom tags)
- Click to open full recipe page

## Database Schema

```typescript
// Users table
User {
  id: string (UUID)
  email: string (unique)
  name: string
  googleId: string (nullable, unique when present)
  hashedPassword: string (nullable - only for email/password users)
  createdAt: timestamp
}

// Pantry Staples table
PantryItem {
  id: string (UUID)
  userId: string (FK to User)
  ingredientName: string
  category: string
  createdAt: timestamp
}

// Dietary Preferences table
DietaryPreference {
  id: string (UUID)
  userId: string (FK to User, unique)
  isVegetarian: boolean
  isVegan: boolean
  isPescatarian: boolean
  allergies: string[] (array of allergy names)
  customInstructions: text
  updatedAt: timestamp
}

// Saved Recipes table
SavedRecipe {
  id: string (UUID)
  userId: string (FK to User)
  recipeName: string (indexed for search)
  description: text
  ingredients: json (array of ingredient objects with name and amount)
  instructions: json (array of instruction strings)
  cookTime: string
  difficulty: string
  servings: number
  nutritionTotal: json (calories, protein, carbs, fat)
  nutritionPerServing: json (calories, protein, carbs, fat)
  cuisineType: string (indexed for filtering)
  recipeStyle: string (indexed for filtering)
  tags: string[] (user-defined tags)
  savedAt: timestamp (indexed for sorting)
}

// Note: Indexes added for:
// - recipeName: B-tree index for name-based search
// - cuisineType: B-tree index for filtering
// - recipeStyle: B-tree index for filtering
// - savedAt: B-tree index for date sorting
// - ingredients JSON: GIN index for ingredient search within JSON
```

## AI Integration Details

### Gemini API Setup
```bash
# Install dependencies
npm install @google/generative-ai

# Environment variables needed
GOOGLE_GEMINI_API_KEY=your_key_here
```

### USDA FoodData Central API Setup
```bash
# Get free API key from: https://fdc.nal.usda.gov/api-key-signup.html
# Environment variable needed
USDA_API_KEY=your_usda_api_key

# API Endpoint
# Search: https://api.nal.usda.gov/fdc/v1/foods/search
# Details: https://api.nal.usda.gov/fdc/v1/food/{fdcId}
```

### Recipe Generation Prompt Structure

**System Context** (combine user's persistent preferences):
```
You are a professional chef and nutritionist creating custom recipes.

USER'S PANTRY STAPLES: [list from database]
USER'S DIETARY RESTRICTIONS: [vegetarian/vegan/pescatarian + allergies]
USER'S PERSISTENT PREFERENCES: [custom instructions from My Kitchen]
```

**Recipe Generation Request**:
```
Generate 3 unique, creative recipes based on these requirements:

SERVINGS: {servings}
PROTEIN: {protein}
CARB: {carb}
VEGETABLES: {vegetables}
CUISINE: {cuisine}
STYLE: {healthy/low-cal/indulgent}
SAUCE: {sauce type if selected}
ADDITIONAL INSTRUCTIONS: {custom instructions for this recipe}

For each recipe, provide:
1. Creative recipe name
2. Brief description (1-2 sentences)
3. Estimated cook time
4. Difficulty level (Easy/Medium/Hard)
5. 5-6 key ingredients

Respond in JSON format:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "cookTime": "30 minutes",
      "difficulty": "Medium",
      "keyIngredients": ["ingredient1", "ingredient2", ...]
    },
    // ... 2 more recipes
  ]
}

IMPORTANT: Ensure recipes align with the user's dietary preferences and avoid all listed allergens. Use pantry staples when possible.
```

**Full Recipe Generation Request** (when user selects one):
```
Generate a complete, detailed recipe for: "{selected recipe name}"

Based on original parameters:
SERVINGS: {servings}
PROTEIN: {protein}
CARB: {carb}
VEGETABLES: {vegetables}
CUISINE: {cuisine}
STYLE: {healthy/low-cal/indulgent}
SAUCE: {sauce type if selected}

Provide the complete recipe with:
1. Full ingredients list with PRECISE measurements (use standard units: cups, tablespoons, grams, oz, etc.)
2. Step-by-step cooking instructions (numbered)
3. Cook time
4. Difficulty level

CRITICAL FORMATTING FOR INGREDIENTS:
- Each ingredient must have a quantity (e.g., "2 cups", "1 lb", "3 tablespoons")
- Use common names that can be matched to USDA database (e.g., "chicken breast" not "free-range organic chicken")
- Be specific about preparation (e.g., "diced", "raw", "cooked")

Respond in JSON format:
{
  "name": "Recipe Name",
  "description": "Detailed description",
  "cookTime": "30 minutes",
  "difficulty": "Medium",
  "servings": {servings},
  "ingredients": [
    {"name": "chicken breast, raw", "amount": "1 lb"},
    {"name": "olive oil", "amount": "2 tablespoons"},
    ...
  ],
  "instructions": [
    "Step 1...",
    "Step 2...",
    ...
  ]
}

CRITICAL: Avoid ALL allergens: {user allergens}. Respect dietary preference: {preference}.
DO NOT include nutritional information - this will be calculated separately using USDA data.
```

### Nutritional Calculation Workflow

**Process** (happens after AI generates full recipe):

1. **Parse Ingredients**: Extract ingredient name and amount from AI response
2. **Match to USDA Database**:
   - Search USDA FoodData Central API for each ingredient
   - Use fuzzy matching to find closest match
   - Maintain a local mapping file (`/lib/nutrition/ingredient-mappings.json`) for common ingredients to avoid repeated API calls
3. **Convert Units**: Convert recipe amounts to grams (USDA uses per 100g)
4. **Calculate Nutrition**:
   - For each ingredient: `(USDA nutrition per 100g) × (ingredient grams / 100)`
   - Sum all ingredients for total recipe nutrition
   - Divide by servings for per-serving nutrition
5. **Handle Errors**:
   - If ingredient not found in USDA, use reasonable defaults or skip with warning
   - Show user which ingredients couldn't be calculated

**Implementation Details**:
```typescript
// Example USDA ingredient mapping structure
{
  "chicken breast, raw": {
    "fdcId": "171477",
    "per100g": {
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6
    }
  },
  // ... more common ingredients
}
```

**API Route**: `/api/nutrition/calculate`
- Takes: array of ingredients with amounts
- Returns: nutritionTotal and nutritionPerServing objects

### State Management Strategy

**Recipe Generation Flow** (using sessionStorage):

1. **Builder Page (`/builder`)**:
   - User fills out recipe parameters
   - On submit → store params in sessionStorage
   - Navigate to `/recipe-ideas`

2. **Recipe Ideas Page (`/recipe-ideas`)**:
   - Read params from sessionStorage
   - Call Gemini API to generate 3 ideas
   - Store ideas in component state (not persisted)
   - On "Generate 3 More" → re-call API with same params
   - On "View Full Recipe" → store selected recipe name + params in sessionStorage, navigate to `/recipe/new`

3. **Full Recipe Page (`/recipe/new`)**:
   - Read selected recipe name + params from sessionStorage
   - Call Gemini API to generate full recipe
   - Call USDA nutrition calculation
   - Display complete recipe
   - On "Save" → save to database with generated UUID
   - On "Back to Results" → navigate to `/recipe-ideas` (ideas still in memory)

4. **Saved Recipe Page (`/recipe/[id]`)**:
   - Fetch recipe from database by UUID
   - Display saved recipe (already has nutrition calculated)

**Why sessionStorage**:
- No database overhead for temporary data
- Fresh recipe ideas every time (no caching)
- Data persists during page refresh within same session
- Simple implementation for personal project
- Data automatically cleared when browser closes

**Fallback**: If sessionStorage is empty (user navigated directly), redirect to `/builder`

### JSON Parsing & Error Handling

**Gemini API Response Parsing**:

```typescript
// Robust JSON parser with retry logic
async function parseGeminiResponse(response: string, retries = 2) {
  try {
    // Try direct JSON parse
    return JSON.parse(response);
  } catch (error) {
    // Extract JSON from markdown code blocks if wrapped
    const jsonMatch = response.match(/```json\n?(.*?)\n?```/s);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {}
    }

    // Retry with same prompt if parsing failed and retries remaining
    if (retries > 0) {
      console.warn(`JSON parse failed, retrying... (${retries} retries left)`);
      // Re-call Gemini API and retry
      return parseGeminiResponse(newResponse, retries - 1);
    }

    throw new Error("Failed to parse AI response after retries");
  }
}
```

**Rate Limiting** (for development/testing):
- Implement simple client-side rate limiting (e.g., max 10 requests per minute)
- Show toast notification if limit reached: "Slow down! Try again in a moment."
- Can be disabled via environment variable for testing

## UI/UX Design Guidelines

### Design System
- **Color Palette**:
  - Primary: Modern green (#10b981 or similar - represents fresh, healthy)
  - Secondary: Warm orange (#f59e0b - appetite-stimulating)
  - Neutral: Clean grays for text and backgrounds
  - Success: Green for saved items
  - Warning: Yellow for dietary alerts

- **Typography**:
  - Headers: Bold, modern sans-serif (Inter, DM Sans)
  - Body: Clean, readable (System font stack)
  - Recipe names: Large, attention-grabbing
  - Instructions: Clear, scannable

- **Layout**:
  - Modern card-based design
  - Generous white space
  - Mobile-first responsive design
  - Sticky navigation
  - Smooth transitions and hover states

### Component Design Patterns

**Icon Buttons** (for protein, carb, vegetable, cuisine selection):
- Square or rounded cards
- Large, clear icons (use emoji or icon library like Lucide)
- Label below icon
- Border highlight when selected
- Hover state with slight elevation
- Grid layout (responsive: 3-4 columns on desktop, 2 on mobile)

**Recipe Cards**:
- Clean white background with subtle shadow
- Rounded corners
- Hover: slight elevation increase
- Image at top (if available)
- Content: name, description, metadata
- CTA button at bottom

**Nutritional Info Display**:
- Prominent panel/card
- Grid layout: 2x2 for Total vs Per Serving
- Large numbers for calories
- Color-coded bars or indicators optional
- Clear labels

## Navigation Structure

```
├── Home (redirect to /builder if authenticated, /login if not)
├── /login (Google OAuth + Email/Password sign-in)
├── /signup (Email/Password registration)
├── /my-kitchen (Pantry & preferences management)
├── /builder (Recipe generation interface)
├── /recipe-ideas (3 AI-generated ideas - uses sessionStorage)
├── /recipe/new (Full recipe view for newly generated recipe - uses sessionStorage)
├── /recipe/[id] (Full recipe view for saved recipe - fetches from DB)
└── /recipe-book (Saved recipes library)
```

**Note on State Flow**:
- `/builder` → stores params in sessionStorage → `/recipe-ideas`
- `/recipe-ideas` → stores selected recipe + params in sessionStorage → `/recipe/new`
- `/recipe/new` → saves to DB → `/recipe/[id]` (with real UUID)
- Direct navigation to `/recipe-ideas` or `/recipe/new` without sessionStorage → redirect to `/builder`

**Nav Bar** (sticky, shown when authenticated):
- Logo/App name (left)
- Links: My Kitchen | Recipe Builder | Recipe Book
- User avatar/name (right) with dropdown:
  - Settings
  - Sign Out

## Error Handling & Edge Cases

1. **API Rate Limits**:
   - Client-side rate limiting: max 10 Gemini API calls per minute
   - Show toast: "Slow down! Try again in a moment."
   - Can be disabled via `DISABLE_RATE_LIMIT=true` env variable for testing

2. **No Pantry Items**:
   - Show prompt: "Add some pantry staples in My Kitchen to get better recipe suggestions!"
   - Still allow recipe generation with selected ingredients

3. **API Errors**:
   - **Gemini API failure**: Show "Unable to generate recipes right now. Please try again."
   - **USDA API failure**: Show "Nutritional information unavailable. Recipe saved without nutrition data."
   - **JSON parsing failure**: Retry up to 2 times, then show error
   - Log all errors for debugging

4. **Empty States**:
   - Recipe Book empty: Show illustration + "Generate your first recipe to get started!"
   - No search results: "No recipes found. Try adjusting your filters."
   - sessionStorage empty on `/recipe-ideas` or `/recipe/new`: Redirect to `/builder`

5. **Validation**:
   - Require at least one selection (protein, carb, or vegetable) before generating
   - Validate servings input (1-6 only)

6. **Nutritional Calculation Errors**:
   - If ingredient not found in USDA database: Use default values or skip
   - Display warning: "Nutrition data unavailable for: [ingredient names]"
   - Still save recipe with partial nutrition data

## Development Priorities

### Phase 1 (MVP):
1. Set up Next.js project with TypeScript, Tailwind
2. Implement authentication (Google OAuth + Email/Password) with NextAuth.js
3. Set up Vercel Postgres database and schema with indexes
4. Build My Kitchen page (pantry + preferences)
5. Build Recipe Builder page (all selections)
6. Integrate Gemini API for recipe generation (3 ideas)
7. Implement sessionStorage state management
8. Display 3 recipe ideas page
9. Generate full recipe from selected idea
10. **Integrate USDA FoodData Central API**:
    - Create ingredient mapping file
    - Build nutrition calculation service
    - Implement unit conversion utilities
11. Display full recipe with calculated nutrition
12. Implement save functionality (saves full recipe with nutrition to DB)
13. Build Recipe Book page with basic list view

### Phase 2 (Enhancements):
1. Add search and filter to Recipe Book (name, ingredient, cuisine)
2. Add database indexes for search performance
3. Implement tags system
4. Add "Generate Similar" feature
5. Improve UI animations and transitions
6. Add loading states and skeletons
7. Implement error boundaries
8. Add JSON parsing retry logic
9. Implement client-side rate limiting

### Phase 3 (Polish):
1. Add recipe images (AI-generated or placeholder)
2. Implement recipe rating/notes
3. Add share functionality
4. Optimize performance
5. Improve mobile experience
6. Enhance USDA ingredient matching with fuzzy search

## Environment Variables Required

```bash
# .env.local

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Gemini AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# USDA FoodData Central API
USDA_API_KEY=your_usda_api_key

# Optional: Rate limiting (set to true to disable for testing)
DISABLE_RATE_LIMIT=false

# Database (Vercel Postgres)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
```

## File Structure Suggestion

```
/app
  /api
    /auth/[...nextauth]/route.ts
    /recipes
      /generate-ideas/route.ts
      /generate-full/route.ts
      /save/route.ts
    /nutrition
      /calculate/route.ts
  /login/page.tsx
  /signup/page.tsx
  /my-kitchen/page.tsx
  /builder/page.tsx
  /recipe-ideas/page.tsx
  /recipe
    /new/page.tsx (for newly generated recipe)
    /[id]/page.tsx (for saved recipe)
  /recipe-book/page.tsx
  layout.tsx
  page.tsx
/components
  /ui (button, input, card, etc.)
  /auth (LoginButton, SignupForm, UserNav)
  /recipe (RecipeCard, RecipeIdea, NutritionPanel)
  /pantry (PantryManager, IngredientSelector)
  /builder (IconSelector, CustomInstructionsInput)
/lib
  /db (database queries)
  /ai (Gemini API integration, JSON parsing)
  /nutrition
    /usda-client.ts (USDA API client)
    /calculator.ts (nutrition calculation logic)
    /unit-converter.ts (unit conversion utilities)
    /ingredient-mappings.json (common ingredients → USDA IDs)
  /auth (NextAuth configuration)
  /utils (helper functions, sessionStorage utilities)
/types
  index.ts (TypeScript types for Recipe, Nutrition, etc.)
/public
  /icons
```

## Testing Checklist

### Authentication
- [ ] User can sign in with Google OAuth
- [ ] User can sign up with email/password
- [ ] User can sign in with email/password
- [ ] Sessions persist correctly

### My Kitchen
- [ ] User can add/remove pantry items
- [ ] User can set dietary preferences (vegetarian, vegan, pescatarian)
- [ ] User can select allergies
- [ ] User can save custom instructions
- [ ] All settings persist to database

### Recipe Builder
- [ ] User can select recipe parameters with icons
- [ ] User can enter custom ingredients/instructions
- [ ] Form validation works (require at least one selection)
- [ ] Servings validation (1-6 only)
- [ ] Data persists to sessionStorage on submit

### Recipe Generation
- [ ] Recipe generation returns 3 valid ideas
- [ ] JSON parsing handles malformed responses
- [ ] Retry logic works for failed parses
- [ ] "Generate 3 More" creates new ideas
- [ ] User can navigate back to builder

### Full Recipe & Nutrition
- [ ] User can view full recipe with all details
- [ ] USDA API calculates nutrition accurately
- [ ] Unit conversion works correctly
- [ ] Nutritional information displays (total + per serving)
- [ ] Missing ingredients handled gracefully
- [ ] Error messages show for failed nutrition calculation

### Saving & Recipe Book
- [ ] User can save full recipes to database
- [ ] Saved recipes appear in Recipe Book
- [ ] User can search recipes by name
- [ ] User can filter by ingredient
- [ ] User can filter by cuisine type
- [ ] User can filter by recipe style
- [ ] Sorting works (date, alphabetical, cook time)
- [ ] Database indexes improve search performance

### State Management
- [ ] sessionStorage persists across page refreshes
- [ ] Direct navigation to /recipe-ideas redirects to /builder
- [ ] Direct navigation to /recipe/new redirects to /builder
- [ ] "Back to Results" maintains recipe ideas state

### Error Handling
- [ ] All navigation works correctly
- [ ] Mobile responsive design works
- [ ] Error states display properly
- [ ] Loading states show during API calls
- [ ] Rate limiting prevents spam (if enabled)
- [ ] Gemini API errors show user-friendly messages
- [ ] USDA API errors handled gracefully

## Success Metrics

- Recipe generation success rate > 95%
- Average time to generate ideas < 10 seconds
- User saves at least 1 recipe in first session
- Mobile usability score > 90
- Zero critical bugs in production

## Future Enhancements (Post-MVP)

1. Meal planning calendar
2. Shopping list generation from recipes
3. Recipe scaling (adjust servings after generation)
4. Recipe sharing with friends
5. Community recipe ratings
6. Integration with smart home devices
7. Voice input for recipe searches
8. Ingredient substitution suggestions
9. Wine/drink pairing recommendations
10. Cooking timer integration

---

## Notes for Implementation

- Use server actions for database operations where appropriate
- Implement optimistic UI updates for better UX
- Add proper loading and error states for all async operations
- Use React Server Components where possible for better performance
- Implement proper form validation with Zod or similar
- Add proper TypeScript types for all data structures
- Use Tailwind's @apply for commonly repeated style patterns
- Implement proper image optimization with Next.js Image component
- Add proper SEO metadata to all pages

## Key Implementation Details (Updated)

### Authentication
- Use NextAuth.js v5 (if available) or v4 with both providers
- Email/password users: hash passwords with bcrypt
- Google OAuth users: store googleId, leave hashedPassword as null
- Separate accounts: same email can exist twice (once for each provider)

### Nutrition Calculation
- **Priority**: Get a starter ingredient mapping file with ~50 common ingredients
- Use USDA FoodData Central "SR Legacy" database for consistency
- Implement basic unit conversions first (cups → grams, oz → grams, etc.)
- Create reusable utilities for parsing amounts (e.g., "1 1/2 cups" → 1.5)
- Store USDA fdcId in mapping file to avoid repeated searches

### State Management
- Create utility functions: `saveToSession()`, `getFromSession()`, `clearSession()`
- Use TypeScript interfaces for sessionStorage data structure
- Implement route guards on `/recipe-ideas` and `/recipe/new` pages

### Database Indexes (Critical for Performance)
```sql
-- Add these indexes in Phase 2
CREATE INDEX idx_recipe_name ON SavedRecipe(recipeName);
CREATE INDEX idx_cuisine_type ON SavedRecipe(cuisineType);
CREATE INDEX idx_recipe_style ON SavedRecipe(recipeStyle);
CREATE INDEX idx_saved_at ON SavedRecipe(savedAt DESC);
CREATE INDEX idx_ingredients_gin ON SavedRecipe USING GIN (ingredients);
```

### JSON Parsing Strategy
- Always request `"Respond ONLY with valid JSON"` in prompts
- Test prompts early to ensure consistent JSON formatting
- Build comprehensive error logging for failed parses
- Consider adding JSON schema validation with Zod

### USDA API Best Practices
- Cache USDA responses in-memory during same recipe calculation
- Log ingredients that fail to match for future mapping improvements
- Use fuzzy matching library (like `fuse.js`) for ingredient name matching in Phase 3

---

**This specification is comprehensive and ready to be implemented with all technical decisions finalized:**
- ✅ Email/Password + Google OAuth (separate accounts)
- ✅ USDA API for accurate nutrition calculation
- ✅ sessionStorage for state management
- ✅ Database indexing strategy for search performance
- ✅ JSON parsing with retry logic
- ✅ No caching (fresh recipes every time)
- ✅ Rate limiting (optional, for testing flexibility)

**All features, flows, and technical details are clearly defined. Ready to build!**
