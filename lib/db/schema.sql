-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  hashed_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT email_provider_unique UNIQUE (email, google_id)
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;

-- Pantry Items table
CREATE TABLE IF NOT EXISTS pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ingredient_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for user's pantry lookups
CREATE INDEX IF NOT EXISTS idx_pantry_user_id ON pantry_items(user_id);

-- Dietary Preferences table
CREATE TABLE IF NOT EXISTS dietary_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_pescatarian BOOLEAN DEFAULT FALSE,
  allergies TEXT[] DEFAULT '{}',
  custom_instructions TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Saved Recipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  cook_time VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  servings INTEGER NOT NULL,
  nutrition_total JSONB NOT NULL,
  nutrition_per_serving JSONB NOT NULL,
  cuisine_type VARCHAR(100) NOT NULL,
  recipe_style VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for saved recipes (Performance optimization for Phase 2)
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_name ON saved_recipes(recipe_name);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_cuisine ON saved_recipes(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_style ON saved_recipes(recipe_style);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_saved_at ON saved_recipes(saved_at DESC);

-- GIN index for JSON ingredient search (Phase 2 feature)
CREATE INDEX IF NOT EXISTS idx_saved_recipes_ingredients_gin ON saved_recipes USING GIN (ingredients);
